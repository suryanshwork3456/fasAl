import json
from sqlalchemy.orm import Session
from app.models.field_form import FieldForm


def _polygon_centroid(ring: list[list[float]]) -> tuple[float, float]:
    """
    Compute the centroid of a simple polygon using the area-weighted
    centroid formula. `ring` is a list of [lon, lat] pairs (GeoJSON order).
    GeoJSON rings are closed (first point == last point) — that duplicate
    is stripped before computing.

    Falls back to a simple average of vertices if the ring is degenerate
    (zero area — e.g. fewer than 3 distinct points, or a straight line).
    Returns (lat, lon).
    """
    coords = ring[:-1] if len(ring) > 1 and ring[0] == ring[-1] else ring

    if len(coords) < 3:
        lons = [c[0] for c in coords]
        lats = [c[1] for c in coords]
        return sum(lats) / len(lats), sum(lons) / len(lons)

    area = 0.0
    cx = 0.0
    cy = 0.0
    n = len(coords)
    for i in range(n):
        x0, y0 = coords[i]
        x1, y1 = coords[(i + 1) % n]
        cross = x0 * y1 - x1 * y0
        area += cross
        cx += (x0 + x1) * cross
        cy += (y0 + y1) * cross

    area *= 0.5

    if abs(area) < 1e-12:
        lons = [c[0] for c in coords]
        lats = [c[1] for c in coords]
        return sum(lats) / len(lats), sum(lons) / len(lons)

    cx /= (6 * area)
    cy /= (6 * area)

    # coords are [lon, lat] -> cx is centroid longitude, cy is centroid latitude
    return cy, cx

def get_first_field_coords(db: Session, user_id: int) -> tuple[float, float]:
    """
    Fetch the boundary polygon from this user's first registered field and
    return the centroid as (lat, lon) for a weather API lookup.
    """
    first_field = (
        db.query(FieldForm)
        .filter(FieldForm.user_id == user_id)
        .order_by(FieldForm.id.asc())
        .first()
    )

    if not first_field:
        raise ValueError("No fields found for this user.")

    boundary = first_field.boundary

    # Defensive: if the JSON column ever comes back as a raw string
    # (e.g. from a raw SQL query path) rather than a parsed dict, parse it.
    if isinstance(boundary, str):
        boundary = json.loads(boundary)

    if not boundary or "coordinates" not in boundary or "type" not in boundary:
        raise ValueError(
            f"Field '{first_field.field_name}' has no boundary data to determine location."
        )

    geom_type = boundary["type"]

    if geom_type == "Polygon":
        exterior_ring = boundary["coordinates"][0]
    elif geom_type == "MultiPolygon":
        exterior_ring = boundary["coordinates"][0][0]
    else:
        raise ValueError(f"Unsupported boundary geometry type: '{geom_type}'.")

    if not exterior_ring or len(exterior_ring) < 1:
        raise ValueError(
            f"Field '{first_field.field_name}' has an empty boundary polygon."
        )

    return _polygon_centroid(exterior_ring)