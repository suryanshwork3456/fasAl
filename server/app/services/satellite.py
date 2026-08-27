# ==========================================================
# File: app/services/satellite.py
# ==========================================================
"""
Satellite service — Level 3 (Live Copernicus/Sentinel Hub integration).

Handles OAuth2 authentication with Copernicus Data Space Ecosystem,
subdivides a field into a grid and queries REAL per-cell NDVI from
the Statistical API (not a single field-wide average), and caches
results in memory so we don't re-query more often than Sentinel-2
actually revisits a location (~5 days).

Grid sizing note: Sentinel-2's red/NIR bands are captured at 10m
resolution — cells smaller than that add API calls without adding
real detail. Default 3x5 grid matches ndvi.py's mock shape and keeps
per-field load time to a handful of seconds.
"""

import requests
from datetime import datetime, timedelta, UTC

from app.core.config import settings

TOKEN_URL = "https://identity.dataspace.copernicus.eu/auth/realms/CDSE/protocol/openid-connect/token"
STATISTICS_URL = "https://sh.dataspace.copernicus.eu/api/v1/statistics"

# Temporary placeholder — replace with a real field.boundary from the
# database once Step 4's models are fully wired up.
SAMPLE_FIELD_BOUNDARY = {
    "type": "Polygon",
    "coordinates": [[
        [77.5946, 12.9716],
        [77.5960, 12.9716],
        [77.5960, 12.9730],
        [77.5946, 12.9730],
        [77.5946, 12.9716]
    ]]
}

NDVI_EVALSCRIPT = """
function setup() {
  return {
    input: [{ bands: ["B04", "B08", "dataMask"] }],
    output: [
      { id: "ndvi", bands: 1 },
      { id: "dataMask", bands: 1 }
    ]
  };
}

function evaluatePixel(samples) {
  let ndvi = (samples.B08 - samples.B04) / (samples.B08 + samples.B04);
  return {
    ndvi: [ndvi],
    dataMask: [samples.dataMask]
  };
}
"""

# Single-value cache (whole-field average — kept for quick sanity checks)
_ndvi_cache: dict[int, dict] = {}
# Per-cell grid cache (the one actually used by the app)
_ndvi_grid_cache: dict[int, dict] = {}
CACHE_DURATION = timedelta(days=5)


def get_access_token() -> str:
    """
    Authenticate with Copernicus using client credentials and return
    a short-lived access token to use in subsequent API calls.
    """
    response = requests.post(
        TOKEN_URL,
        data={
            "grant_type": "client_credentials",
            "client_id": settings.copernicus_client_id,
            "client_secret": settings.copernicus_client_secret,
        },
    )
    response.raise_for_status()
    token_data = response.json()
    return token_data["access_token"]


def get_ndvi_stats(polygon: dict = SAMPLE_FIELD_BOUNDARY, days_back: int = 30) -> dict:
    """
    Query Copernicus Statistical API for mean/min/max NDVI over a
    single polygon, using the most recent available imagery in the
    last `days_back` days.
    """
    token = get_access_token()

    date_to = datetime.now(UTC)
    date_from = date_to - timedelta(days=days_back)

    request_body = {
        "input": {
            "bounds": {
                "geometry": polygon,
                "properties": {"crs": "http://www.opengis.net/def/crs/EPSG/0/4326"}
            },
            "data": [{"type": "sentinel-2-l2a"}]
        },
        "aggregation": {
            "timeRange": {
                "from": date_from.strftime("%Y-%m-%dT00:00:00Z"),
                "to": date_to.strftime("%Y-%m-%dT23:59:59Z"),
            },
            "aggregationInterval": {"of": "P30D"},
            "evalscript": NDVI_EVALSCRIPT,
            "resx": 0.0001,
            "resy": 0.0001,
        }
    }

    response = requests.post(
        STATISTICS_URL,
        headers={"Authorization": f"Bearer {token}"},
        json=request_body,
    )
    response.raise_for_status()
    return response.json()


def get_cached_or_live_ndvi(field_id: int, polygon: dict = SAMPLE_FIELD_BOUNDARY) -> dict:
    """
    Whole-field single-value NDVI, with caching. Useful for quick
    tests, but the app uses get_live_ndvi_grid() for the real map.
    """
    cached = _ndvi_cache.get(field_id)
    now = datetime.now(UTC)

    if cached and (now - cached["fetched_at"]) < CACHE_DURATION:
        return {**cached["data"], "from_cache": True}

    fresh_data = get_ndvi_stats(polygon)
    _ndvi_cache[field_id] = {"data": fresh_data, "fetched_at": now}
    return {**fresh_data, "from_cache": False}


def _get_bounding_box(polygon: dict) -> tuple[float, float, float, float]:
    """Extract (min_lon, min_lat, max_lon, max_lat) from a GeoJSON polygon."""
    coords = polygon["coordinates"][0]
    lons = [c[0] for c in coords]
    lats = [c[1] for c in coords]
    return min(lons), min(lats), max(lons), max(lats)


def _make_cell_polygon(min_lon, min_lat, max_lon, max_lat) -> dict:
    return {
        "type": "Polygon",
        "coordinates": [[
            [min_lon, min_lat], [max_lon, min_lat],
            [max_lon, max_lat], [min_lon, max_lat],
            [min_lon, min_lat],
        ]]
    }


def get_live_ndvi_grid(field_id: int, polygon: dict = SAMPLE_FIELD_BOUNDARY,
                       rows: int = 3, cols: int = 5) -> dict:
    """
    Subdivide the field into rows x cols cells and query REAL,
    independently-measured NDVI for each one — a genuine per-zone
    grid for the map feature, not a repeated field-wide average.

    Default 3x5 matches ndvi.py's mock grid shape. See module
    docstring for sizing reasoning if you need to change this.
    """
    cached = _ndvi_grid_cache.get(field_id)
    now = datetime.now(UTC)
    if cached and (now - cached["fetched_at"]) < CACHE_DURATION:
        return {**cached["data"], "from_cache": True}

    min_lon, min_lat, max_lon, max_lat = _get_bounding_box(polygon)
    lon_step = (max_lon - min_lon) / cols
    lat_step = (max_lat - min_lat) / rows

    grid = []
    for r in range(rows):
        row_values = []
        for c in range(cols):
            cell = _make_cell_polygon(
                min_lon + c * lon_step,
                max_lat - (r + 1) * lat_step,
                min_lon + (c + 1) * lon_step,
                max_lat - r * lat_step,
            )
            stats = get_ndvi_stats(cell)
            mean = stats["data"][0]["outputs"]["ndvi"]["bands"]["B0"]["stats"]["mean"]
            row_values.append(round(mean, 4))
        grid.append(row_values)

    overall = round(sum(sum(row) for row in grid) / (rows * cols), 4)
    result = {
        "field_id": field_id,
        "grid": grid,
        "overall_ndvi": overall,
        "data_source": "satellite",
    }
    _ndvi_grid_cache[field_id] = {"data": result, "fetched_at": now}
    return {**result, "from_cache": False}


if __name__ == "__main__":
    import json

    print("Fetching live per-cell NDVI grid (first call, hits API 15 times)...")
    result = get_live_ndvi_grid(1)
    print(json.dumps(result, indent=2))

    print("\nSecond call (should hit cache, instant):")
    print(json.dumps(get_live_ndvi_grid(1), indent=2))
