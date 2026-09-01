from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.field_form import FieldForm
from app.models.user import User
from app.api.v1.endpoints.deps_auth import get_current_user
from app.services.ndvi import get_field_overall_ndvi, get_soil_score, ndvi_to_health_score
from app.services.whatsapp import maybe_send_health_alert
from app.weather.get_location import get_field_coords
from app.weather.get_weather import fetch_weather_by_coords, get_weather_score

router = APIRouter()

# NDVI is the dominant, ground-truth signal — soil and weather are
# secondary context, not equal-weight votes. This matches how real
# vegetation-health assessments work (e.g. FAO's VHI gives vegetation
# condition the primary role, weather/temperature a supporting one).
WEIGHTS = {"ndvi": 0.65, "soil": 0.20, "weather": 0.15}

# If raw NDVI is below this, there's essentially no vegetation present
# (bare soil, water, or built-up land) — no amount of good weather or
# soil type should be able to push the score into "healthy" territory.
NO_VEGETATION_THRESHOLD = 0.15
NO_VEGETATION_CAP = 25


@router.get("/{field_id}/health-score", tags=["ndvi"])
def get_health_score(
    field_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    field = (
        db.query(FieldForm)
        .filter(FieldForm.id == field_id, FieldForm.user_id == current_user.id)
        .first()
    )

    if not field:
        raise HTTPException(status_code=404, detail="Field not found")
    if not field.boundary:
        raise HTTPException(
            status_code=422, detail="This field has no saved boundary.")

    ndvi_data = get_field_overall_ndvi(field_id, boundary=field.boundary)
    raw_ndvi = ndvi_data["overall_ndvi"]
    ndvi_score = ndvi_to_health_score(raw_ndvi)
    soil_score = get_soil_score(
        field.soil_type.value if field.soil_type else None)

    try:
        lat, lon = get_field_coords(db, field_id, field.user_id)
        current_weather, _ = fetch_weather_by_coords(lat, lon)
        weather_score = get_weather_score(current_weather)
        weather_available = True
    except Exception:
        weather_score = None
        weather_available = False

    if weather_available:
        combined = round(
            ndvi_score * WEIGHTS["ndvi"] + soil_score *
            WEIGHTS["soil"] + weather_score * WEIGHTS["weather"]
        )
    else:
        # redistribute weather's share proportionally between ndvi/soil
        combined = round(ndvi_score * 0.76 + soil_score * 0.24)

    # Vegetation gate: if there's essentially no crop here at all,
    # cap the score low regardless of soil/weather — a farm health
    # score is meaningless without an actual crop to measure.
    low_vegetation = raw_ndvi < NO_VEGETATION_THRESHOLD
    if low_vegetation:
        combined = min(combined, NO_VEGETATION_CAP)

    maybe_send_health_alert(
        field_id=field.id,
        field_name=field.field_name,
        soil_type=field.soil_type.value if field.soil_type else "Unknown",
        health_score=combined,
        mobile_number=current_user.mobile_number,
    )

    return {
        "field_id": field_id,
        "health_score": combined,
        "ndvi_score": ndvi_score,
        "soil_score": soil_score,
        "weather_score": weather_score,
        "data_source": ndvi_data["data_source"],
        "weather_available": weather_available,
        "low_vegetation_detected": low_vegetation,
    }
