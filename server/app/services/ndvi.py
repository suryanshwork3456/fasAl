import random
import math

from app.services import satellite


# ==========================================================
# Soil Score
# ==========================================================

SOIL_SCORES = {
    "Loamy": 90,      # ideal balance of drainage, nutrient retention, aeration
    "Alluvial": 85,   # highly fertile, common in river plains — very good for most crops
    "Blacksoil": 78,  # good moisture retention, well-suited to cotton/wheat
    "Clayloam": 68,   # retains water well but drainage can be a limiting factor
    "Sandyloam": 62,  # drains fast, lower nutrient retention
}


def get_soil_score(soil_type: str) -> int:
    # neutral fallback if an unknown value ever appears
    return SOIL_SCORES.get(soil_type, 70)


# ==========================================================
# NDVI -> Health Score conversion
# ==========================================================

def ndvi_to_health_score(raw_ndvi: float) -> int:
    """
    Converts raw NDVI (-1 to 1) into a 0-100 score using real-world
    vegetation classification thresholds (NASA Earth Observatory /
    standard remote-sensing NDVI interpretation), NOT a naive linear
    scale. A linear (-1,1)->(0,100) mapping incorrectly scores
    non-vegetated land (water, bare soil, urban/built-up — raw NDVI
    near 0) as "50/100 healthy", when it should score near zero
    since there is effectively no crop present at all.

    Anchor points (raw_ndvi, score) are interpolated linearly between
    each pair, giving a smooth curve that still respects real
    vegetation science at every threshold.
    """
    anchors = [
        (-1.0, 0),
        (0.0, 5),
        (0.1, 15),   # upper edge of "bare/urban/water" zone
        (0.2, 30),   # sparse/stressed vegetation
        (0.4, 55),   # moderate vegetation
        (0.6, 78),   # healthy vegetation
        (0.8, 92),
        (1.0, 100),
    ]

    raw_ndvi = max(-1.0, min(1.0, raw_ndvi))

    for i in range(len(anchors) - 1):
        x0, y0 = anchors[i]
        x1, y1 = anchors[i + 1]
        if x0 <= raw_ndvi <= x1:
            t = (raw_ndvi - x0) / (x1 - x0) if x1 != x0 else 0
            return round(y0 + t * (y1 - y0))

    return 0  # unreachable given the clamp above, but safe fallback


def get_field_ndvi(field_id: int, boundary: dict | None = None, rows: int = 3, cols: int = 5) -> dict:
    """
    Full 3x5 grid — one entry point for per-cell NDVI data (used by
    the field map). Tries live satellite data if enabled, falls back
    to mock automatically on any failure.

    boundary: real GeoJSON Polygon for this field, if known. If None
    (or live mode is off), mock data is used instead.
    """
    from app.core.config import settings

    if settings.use_live_satellite:
        try:
            polygon = boundary or satellite.SAMPLE_FIELD_BOUNDARY
            return satellite.get_live_ndvi_grid(
                field_id,
                polygon=polygon,
                rows=rows,
                cols=cols
            )
        except Exception as e:
            print(
                f"Live satellite fetch failed for field {field_id}, falling back to mock: {e}"
            )
            return get_mock_ndvi(field_id, rows, cols)

    return get_mock_ndvi(field_id, rows, cols)


def get_field_overall_ndvi(field_id: int, boundary: dict | None = None) -> dict:
    """
    Whole-field single-value NDVI — 1 API call instead of 15.
    Use this for aggregate views (dashboard) where per-cell detail
    isn't needed. Use get_field_ndvi() when the actual grid/map is
    being rendered.
    """
    from app.core.config import settings

    if settings.use_live_satellite:
        try:
            polygon = boundary or satellite.SAMPLE_FIELD_BOUNDARY
            result = satellite.get_cached_or_live_ndvi(
                field_id, polygon=polygon)
            mean = result["data"][0]["outputs"]["ndvi"]["bands"]["B0"]["stats"]["mean"]
            return {"field_id": field_id, "overall_ndvi": round(mean, 4), "data_source": "satellite"}
        except Exception as e:
            print(
                f"Live satellite fetch failed for field {field_id}, falling back to mock: {e}")

    mock = get_mock_ndvi(field_id)
    return {"field_id": field_id, "overall_ndvi": mock["overall_ndvi"], "data_source": "mock"}


def get_mock_ndvi(field_id: int, rows: int = 3, cols: int = 5) -> dict:
    """
    Generate a mock NDVI grid for a field.

    Deterministic: the same field_id always produces the same grid,
    so a farmer refreshing their dashboard never sees health values
    randomly flicker between requests.
    """
    rng = random.Random(field_id)
    baseline = rng.uniform(0.65, 0.75)

    num_stress_zones = rng.choice([1, 1, 2])
    stress_centers = [
        (rng.randint(0, rows - 1), rng.randint(0, cols - 1))
        for _ in range(num_stress_zones)
    ]

    grid = []

    for r in range(rows):
        row_values = []

        for c in range(cols):
            value = baseline + rng.uniform(-0.03, 0.03)

            for (sr, sc) in stress_centers:
                distance = math.sqrt((r - sr) ** 2 + (c - sc) ** 2)
                influence = max(0.0, 1 - distance / 2.0)

                if influence > 0:
                    stressed_value = rng.uniform(0.25, 0.35)
                    value = (
                        value * (1 - influence)
                        + stressed_value * influence
                    )

            value = max(0.0, min(1.0, value))
            row_values.append(round(value, 2))

        grid.append(row_values)

    overall = round(
        sum(sum(row) for row in grid) / (rows * cols),
        2
    )

    return {
        "field_id": field_id,
        "grid": grid,
        "overall_ndvi": overall,
        "data_source": "mock",
    }


# def get_field_overall_ndvi(field_id: int, boundary: dict | None = None) -> dict:
#     """
#     Thin wrapper around get_field_ndvi for callers (like health_score.py)
#     that only care about the overall score + data_source, not the grid.
#     """
#     return get_field_ndvi(field_id, boundary=boundary)
