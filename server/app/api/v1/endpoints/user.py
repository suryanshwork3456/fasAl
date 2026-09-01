# from fastapi import APIRouter, HTTPException, status, Depends
# from sqlalchemy.orm import Session
# from sqlalchemy import text

# from app.db.session import get_db
# from app.models.user import User
# from app.models.field_form import FieldForm
# from app.api.v1.endpoints.deps_auth import get_current_user
# from app.services.ndvi import get_field_overall_ndvi, get_soil_score
# from app.weather.get_location import get_field_coords
# from app.weather.get_weather import fetch_weather_by_coords, get_weather_score

# router = APIRouter()

# WEIGHTS = {"ndvi": 0.5, "soil": 0.25, "weather": 0.25}


# def _compute_field_health(db: Session, field: FieldForm) -> int | None:
#     if not field.boundary:
#         return None

#     ndvi_data = get_field_overall_ndvi(field.id, boundary=field.boundary)
#     ndvi_score = round((ndvi_data["overall_ndvi"] + 1) / 2 * 100)
#     soil_score = get_soil_score(
#         field.soil_type.value if field.soil_type else None)

#     try:
#         lat, lon = get_field_coords(db, field.id, field.user_id)
#         current_weather, _ = fetch_weather_by_coords(lat, lon)
#         weather_score = get_weather_score(current_weather)
#         return round(
#             ndvi_score * WEIGHTS["ndvi"] + soil_score *
#             WEIGHTS["soil"] + weather_score * WEIGHTS["weather"]
#         )
#     except Exception:
#         return round(ndvi_score * 0.65 + soil_score * 0.35)


# @router.get("/dashboard")
# def dashboard(
#     db: Session = Depends(get_db),
#     current_user: User = Depends(get_current_user),
# ):
#     try:
#         query = text("SELECT * FROM dashboard WHERE user_id = :user_id;")
#         result = db.execute(query, {"user_id": current_user.id})
#         data = [dict(row) for row in result.mappings()]

#         fields = db.query(FieldForm).filter(
#             FieldForm.user_id == current_user.id).all()
#         scores = [s for s in (_compute_field_health(db, f)
#                               for f in fields) if s is not None]

#         # --- NEW: satellite panel data for the dashboard ---
#         primary_field = min(fields, key=lambda f: f.id) if fields else None
#         satellite_data = None
#         if primary_field:
#             ndvi_data = (
#                 get_field_overall_ndvi(
#                     primary_field.id, boundary=primary_field.boundary)
#                 if primary_field.boundary else None
#             )
#             satellite_data = {
#                 "field_id": primary_field.id,
#                 "field_name": primary_field.field_name,
#                 "ndvi": ndvi_data["overall_ndvi"] if ndvi_data else None,
#                 "moisture": getattr(primary_field, "moisture", None),
#             }
#         # --- END NEW ---

#         if data:
#             data[0]["crop_health"] = round(
#                 sum(scores) / len(scores)) if scores else data[0].get("crop_health")
#             data[0]["total_fields"] = len(fields)
#             data[0]["satellite"] = satellite_data  # NEW

#         return {"status": "success", "data": data}
#     except Exception as e:
#         raise HTTPException(
#             status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
#             detail=f"Database query failed: {str(e)}"
#         )


from fastapi import APIRouter, HTTPException, status, Depends
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

    try:
        ndvi_data = get_field_overall_ndvi(field.id, boundary=field.boundary)
        if not ndvi_data:
            return None
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
    except Exception as e:
        print(f"Error computing health for field {field.id}: {e}")
        return None


@router.get("/dashboard")
def dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        # Get all fields for the user
        fields = db.query(FieldForm).filter(
            FieldForm.user_id == current_user.id
        ).all()

        # Compute health scores for fields
        scores = []
        for f in fields:
            score = _compute_field_health(db, f)
            if score is not None:
                scores.append(score)

        # Calculate average health
        avg_health = round(sum(scores) / len(scores)) if scores else None

        # Count alerts (fields with low NDVI)
        active_alerts = 0
        for f in fields:
            if f.boundary:
                try:
                    ndvi_data = get_field_overall_ndvi(
                        f.id, boundary=f.boundary)
                    if ndvi_data and ndvi_data.get("overall_ndvi", 1) < 0.4:
                        active_alerts += 1
                except Exception:
                    pass

        # Get satellite data for primary field
        primary_field = fields[0] if fields else None
        satellite_data = None
        if primary_field and primary_field.boundary:
            try:
                ndvi_data = get_field_overall_ndvi(
                    primary_field.id,
                    boundary=primary_field.boundary
                )
                if ndvi_data:
                    satellite_data = {
                        "field_id": primary_field.id,
                        "field_name": primary_field.field_name,
                        "ndvi": ndvi_data.get("overall_ndvi"),
                        "moisture": getattr(primary_field, "moisture", None),
                    }
            except Exception as e:
                print(f"Error getting NDVI for field {primary_field.id}: {e}")

        # Build dashboard data
        dashboard_data = {
            "crop_health": avg_health,
            "total_fields": len(fields),
            "active_alerts": active_alerts,
            "next_irrigation": 2,
            "satellite": satellite_data,
            "user_name": getattr(current_user, "full_name", None) or getattr(current_user, "email", "Farmer"),
        }

        return {"status": "success", "data": [dashboard_data]}

    except Exception as e:
        print(f"Dashboard error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to load dashboard data: {str(e)}"
        )
