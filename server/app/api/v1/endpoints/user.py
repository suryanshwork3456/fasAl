from fastapi import APIRouter,HTTPException,status,Depends
from pydantic import BaseModel
from app.db.session import get_db
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.db.session import get_db
from app.models.user import User
from app.models.field_form import FieldForm
from app.api.v1.endpoints.deps_auth import get_current_user
from app.services.ndvi import get_field_overall_ndvi, get_soil_score
from app.weather.get_location import get_field_coords
from app.weather.get_weather import fetch_weather_by_coords, get_weather_score

router = APIRouter()

WEIGHTS = {"ndvi": 0.5, "soil": 0.25, "weather": 0.25}


def _compute_field_health(db: Session, field: FieldForm) -> int | None:
    if not field.boundary:
        return None

    ndvi_data = get_field_overall_ndvi(field.id, boundary=field.boundary)
    ndvi_score = round((ndvi_data["overall_ndvi"] + 1) / 2 * 100)
    soil_score = get_soil_score(
        field.soil_type.value if field.soil_type else None)

    try:
        lat, lon = get_field_coords(db, field.id, field.user_id)
        current_weather, _ = fetch_weather_by_coords(lat, lon)
        weather_score = get_weather_score(current_weather)
        return round(
            ndvi_score * WEIGHTS["ndvi"] + soil_score *
            WEIGHTS["soil"] + weather_score * WEIGHTS["weather"]
        )
    except Exception:
        return round(ndvi_score * 0.65 + soil_score * 0.35)


@router.get("/dashboard")
def dashboard(db: Session = Depends(get_db)):
    try:
        query = text("SELECT * FROM dashboard;")
        result = db.execute(query)
        data = [dict(row) for row in result.mappings()]

        fields = db.query(FieldForm).filter(
            FieldForm.user_id == current_user.id).all()
        scores = [s for s in (_compute_field_health(db, f)
                              for f in fields) if s is not None]

        # --- NEW: satellite panel data for the dashboard ---
        primary_field = min(fields, key=lambda f: f.id) if fields else None
        satellite_data = None
        if primary_field:
            ndvi_data = (
                get_field_overall_ndvi(
                    primary_field.id, boundary=primary_field.boundary)
                if primary_field.boundary else None
            )
            satellite_data = {
                "field_id": primary_field.id,
                "field_name": primary_field.field_name,
                "ndvi": ndvi_data["overall_ndvi"] if ndvi_data else None,
                "moisture": getattr(primary_field, "moisture", None),
            }
        # --- END NEW ---

        if data:
            data[0]["crop_health"] = round(
                sum(scores) / len(scores)) if scores else data[0].get("crop_health")
            data[0]["total_fields"] = len(fields)
            data[0]["satellite"] = satellite_data  # NEW

        return {"status": "success", "data": data}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database query failed: {str(e)}"
        )
