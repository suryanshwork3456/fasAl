# # ==========================================================
# # File: app/services/ndvi.py
# # ==========================================================
# """
# NDVI Service — Level 1 (Mock Data) + Level 3 dispatch (Live Data)

# Generates realistic-looking NDVI values for a field without touching
# any real satellite data. This is the permanent fallback: every other
# feature (dashboard, map, fusion, alerts) can build against this and
# keep working even if live satellite integration (satellite.py) or
# raster processing (raster.py) isn't ready yet.

# get_field_ndvi() now accepts a real field boundary (GeoJSON) fetched
# from the field_form table by the route layer — when live mode is on,
# this real polygon replaces satellite.py's hardcoded placeholder, so
# each field returns its own genuine NDVI grid instead of Bangalore's.
# """

# import random
# import math

# from app.services import satellite


# def get_field_ndvi(field_id: int, boundary: dict | None = None, rows: int = 3, cols: int = 5) -> dict:
#     """
#     Single entry point for NDVI data. Tries live satellite data if
#     enabled, falls back to mock automatically on any failure. Callers
#     (routes, other services) never need to know which source they got —
#     they just check data_source in the response if they care.

#     boundary: real GeoJSON Polygon for this field, if known. If None
#     (or live mode is off), mock data is used instead.
#     """
#     from app.core.config import settings

#     if settings.use_live_satellite:
#         try:
#             polygon = boundary or satellite.SAMPLE_FIELD_BOUNDARY
#             return satellite.get_live_ndvi_grid(field_id, polygon=polygon, rows=rows, cols=cols)
#         except Exception as e:
#             print(
#                 f"Live satellite fetch failed for field {field_id}, falling back to mock: {e}")
#             return get_mock_ndvi(field_id, rows, cols)

#     return get_mock_ndvi(field_id, rows, cols)


# def get_mock_ndvi(field_id: int, rows: int = 3, cols: int = 5) -> dict:
#     """
#     Generate a mock NDVI grid for a field.

#     Deterministic: the same field_id always produces the same grid,
#     so a farmer refreshing their dashboard never sees health values
#     randomly flicker between requests.
#     """
#     rng = random.Random(field_id)
#     baseline = rng.uniform(0.65, 0.75)

#     num_stress_zones = rng.choice([1, 1, 2])
#     stress_centers = [
#         (rng.randint(0, rows - 1), rng.randint(0, cols - 1))
#         for _ in range(num_stress_zones)
#     ]

#     grid = []
#     for r in range(rows):
#         row_values = []
#         for c in range(cols):
#             value = baseline + rng.uniform(-0.03, 0.03)
#             for (sr, sc) in stress_centers:
#                 distance = math.sqrt((r - sr) ** 2 + (c - sc) ** 2)
#                 influence = max(0.0, 1 - distance / 2.0)
#                 if influence > 0:
#                     stressed_value = rng.uniform(0.25, 0.35)
#                     value = value * (1 - influence) + \
#                         stressed_value * influence
#             value = max(0.0, min(1.0, value))
#             row_values.append(round(value, 2))
#         grid.append(row_values)

#     overall = round(sum(sum(row) for row in grid) / (rows * cols), 2)

#     return {
#         "field_id": field_id,
#         "grid": grid,
#         "overall_ndvi": overall,
#         "data_source": "mock",
#     }
# ==========================================================
# File: app/services/ndvi.py
# ==========================================================
"""
NDVI Service — Level 1 (Mock Data) + Level 3 dispatch (Live Data)

Generates realistic-looking NDVI values for a field without touching
any real satellite data. This is the permanent fallback: every other
feature (dashboard, map, fusion, alerts) can build against this and
keep working even if live satellite integration (satellite.py) or
raster processing (raster.py) isn't ready yet.

get_field_ndvi() now accepts a real field boundary (GeoJSON) fetched
from the field_form table by the route layer — when live mode is on,
this real polygon replaces satellite.py's hardcoded placeholder, so
each field returns its own genuine 3x5 NDVI grid instead of Bangalore's.

get_field_overall_ndvi() is a lighter-weight alternative: 1 API call
instead of 15, for callers (like the dashboard) that only need one
number per field, not the full per-cell grid.
"""

import random
import math

from app.services import satellite


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
            return satellite.get_live_ndvi_grid(field_id, polygon=polygon, rows=rows, cols=cols)
        except Exception as e:
            print(
                f"Live satellite fetch failed for field {field_id}, falling back to mock: {e}")
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
                    value = value * (1 - influence) + \
                        stressed_value * influence
            value = max(0.0, min(1.0, value))
            row_values.append(round(value, 2))
        grid.append(row_values)

    overall = round(sum(sum(row) for row in grid) / (rows * cols), 2)

    return {
        "field_id": field_id,
        "grid": grid,
        "overall_ndvi": overall,
        "data_source": "mock",
    }
