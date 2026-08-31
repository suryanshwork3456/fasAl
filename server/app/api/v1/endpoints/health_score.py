from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.field_form import FieldForm
from app.services.ndvi import get_field_overall_ndvi, get_soil_score
from app.weather.get_location import get_field_coords
from app.weather.get_weather import fetch_weather_by_coords, get_weather_score

router = APIRouter()

WEIGHTS = {"ndvi": 0.5, "soil": 0.25, "weather": 0.25}


@router.get("/{field_id}/health-score", tags=["ndvi"])
def get_health_score(
    field_id: int,
    db: Session = Depends(get_db),
):
    # TEMPORARY: no auth dependency yet — filtering by field_id only.
    # Once real login/auth exists, add back: .filter(FieldForm.user_id == current_user.id)
    field = db.query(FieldForm).filter(FieldForm.id == field_id).first()

    if not field:
        raise HTTPException(status_code=404, detail="Field not found")
    if not field.boundary:
        raise HTTPException(
            status_code=422, detail="This field has no saved boundary.")

    ndvi_data = get_field_overall_ndvi(field_id, boundary=field.boundary)
    ndvi_score = round((ndvi_data["overall_ndvi"] + 1) / 2 * 100)
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
        combined = round(ndvi_score * 0.65 + soil_score * 0.35)

    return {
        "field_id": field_id,
        "health_score": combined,
        "ndvi_score": ndvi_score,
        "soil_score": soil_score,
        "weather_score": weather_score,
        "data_source": ndvi_data["data_source"],
        "weather_available": weather_available,
    }
