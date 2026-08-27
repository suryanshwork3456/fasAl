# ==========================================================
# File: app/services/ndvi.py
# ==========================================================
"""
NDVI Service — Level 1 (Mock Data)

Generates realistic-looking NDVI values for a field without touching
any real satellite data. This is the permanent fallback: every other
feature (dashboard, map, fusion, alerts) can build against this and
keep working even if live satellite integration (satellite.py) or
raster processing (raster.py) isn't ready yet.
"""

import random
import math

from app.services import satellite


def get_field_ndvi(field_id: int, rows: int = 3, cols: int = 5) -> dict:
    """
    Single entry point for NDVI data. Tries live satellite data if
    enabled, falls back to mock automatically on any failure. Callers
    (routes, other services) never need to know which source they got —
    they just check data_source in the response if they care.
    """
    from app.core.config import settings

    if settings.use_live_satellite:
        try:
            return satellite.get_live_ndvi_grid(field_id, rows=rows, cols=cols)
        except Exception as e:
            print(
                f"Live satellite fetch failed for field {field_id}, falling back to mock: {e}")
            return get_mock_ndvi(field_id, rows, cols)

    return get_mock_ndvi(field_id, rows, cols)


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
