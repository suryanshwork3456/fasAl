# # ==========================================================
# # File: app/api/v1/endpoints/dashboard_live.py
# # ==========================================================
# """
# Live-computed dashboard metrics. No database table involved.
# Uses get_field_overall_ndvi() (1 API call per field) rather than
# the full 15-cell grid — dashboard only needs one number per field,
# not per-cell detail, so this is 15x cheaper per field.
# """

# from fastapi import APIRouter, Depends
# from sqlalchemy.orm import Session

# from app.db.session import get_db
# from app.models.field_form import FieldForm
# from app.services.ndvi import get_field_overall_ndvi

# router = APIRouter()


# @router.get("/dashboard-live", tags=["dashboard"])
# def get_dashboard_live(db: Session = Depends(get_db)):
#     all_fields = db.query(FieldForm).all()

#     if not all_fields:
#         return {"crop_health": 0, "total_fields": 0, "active_alerts": 0, "next_irrigation": None}

#     ndvi_values = []
#     alert_count = 0

#     for field in all_fields:
#         if not field.boundary:
#             continue
#         try:
#             data = get_field_overall_ndvi(field.id, boundary=field.boundary)
#             ndvi_values.append(data["overall_ndvi"])
#             # Trade-off: no per-cell detail here, so "alert" means the
#             # WHOLE field's average is low, not just one stressed patch.
#             # Good enough for a dashboard summary badge.
#             if data["overall_ndvi"] < 0.4:
#                 alert_count += 1
#         except Exception:
#             continue

#     avg_ndvi = sum(ndvi_values) / len(ndvi_values) if ndvi_values else 0
#     crop_health_score = round((avg_ndvi + 1) / 2 * 100) if ndvi_values else 0

#     return {
#         "crop_health": crop_health_score,
#         "total_fields": len(all_fields),
#         "active_alerts": alert_count,
#         "next_irrigation": 2,
#     }


# from fastapi import APIRouter, HTTPException, status, Depends
# from sqlalchemy.orm import Session
# from sqlalchemy import text

# from app.db.session import get_db
# from app.models.user import User
# from app.models.field_form import FieldForm
# from app.models.dashboard import Dashboard  # Import the Dashboard model
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


# def _compute_live_dashboard_data(db: Session, user_id: int) -> dict:
#     """Compute dashboard data live from field_form table"""
#     fields = db.query(FieldForm).filter(
#         FieldForm.user_id == user_id
#     ).all()

#     if not fields:
#         return {
#             "total_fields": 0,
#             "crop_health": None,
#             "active_alerts": 0,
#             "next_irrigation": None,
#         }

#     # Compute health scores
#     scores = []
#     alert_count = 0

#     for field in fields:
#         score = _compute_field_health(db, field)
#         if score is not None:
#             scores.append(score)

#         # Check for alerts (low NDVI)
#         if field.boundary:
#             try:
#                 ndvi_data = get_field_overall_ndvi(
#                     field.id, boundary=field.boundary)
#                 if ndvi_data and ndvi_data.get("overall_ndvi", 1) < 0.4:
#                     alert_count += 1
#             except Exception:
#                 continue

#     avg_health = round(sum(scores) / len(scores)) if scores else None

#     return {
#         "total_fields": len(fields),
#         "crop_health": avg_health,
#         "active_alerts": alert_count,
#         "next_irrigation": 2,  # Example value - you can make this dynamic
#     }


# @router.get("/dashboard")
# def dashboard(
#     db: Session = Depends(get_db),
#     current_user: User = Depends(get_current_user),
# ):
#     try:
#         # Try to get cached dashboard data from the table
#         cached_dashboard = db.query(Dashboard).filter(
#             Dashboard.user_id == current_user.id
#         ).first()

#         # If cache exists and is recent, use it
#         if cached_dashboard:
#             # Optional: Check if cache is stale (e.g., older than 1 hour)
#             # For now, just use it
#             dashboard_data = {
#                 "total_fields": cached_dashboard.total_fields or 0,
#                 "crop_health": cached_dashboard.crop_health,
#                 "active_alerts": cached_dashboard.active_alerts or 0,
#                 "next_irrigation": cached_dashboard.next_irrigation,
#             }
#         else:
#             # No cache found - compute live data
#             dashboard_data = _compute_live_dashboard_data(db, current_user.id)

#             # Optional: Save to cache for next time
#             try:
#                 new_cache = Dashboard(
#                     user_id=current_user.id,
#                     crop_health=dashboard_data["crop_health"],
#                     total_fields=dashboard_data["total_fields"],
#                     active_alerts=dashboard_data["active_alerts"],
#                     next_irrigation=dashboard_data["next_irrigation"],
#                 )
#                 db.add(new_cache)
#                 db.commit()
#             except Exception as e:
#                 print(f"Failed to cache dashboard data: {e}")
#                 db.rollback()

#         # Get fields for additional data
#         fields = db.query(FieldForm).filter(
#             FieldForm.user_id == current_user.id
#         ).all()

#         # Get satellite data for primary field
#         primary_field = fields[0] if fields else None
#         satellite_data = None
#         if primary_field and primary_field.boundary:
#             ndvi_data = get_field_overall_ndvi(
#                 primary_field.id,
#                 boundary=primary_field.boundary
#             )
#             satellite_data = {
#                 "field_id": primary_field.id,
#                 "field_name": primary_field.field_name,
#                 "ndvi": ndvi_data["overall_ndvi"] if ndvi_data else None,
#                 "moisture": getattr(primary_field, "moisture", None),
#             }

#         # Add satellite data and user info
#         dashboard_data["satellite"] = satellite_data
#         dashboard_data["user_name"] = getattr(
#             current_user, "full_name", None) or getattr(current_user, "email", "Farmer")
#         dashboard_data["fields"] = [
#             {
#                 "id": f.id,
#                 "field_name": f.field_name,
#                 "field_area": f.field_area,
#                 "location": f.location,
#                 "crop_type": f.crop_type.value if f.crop_type else None,
#                 "soil_type": f.soil_type.value if f.soil_type else None,
#             }
#             for f in fields
#         ]

#         return {"status": "success", "data": [dashboard_data]}

#     except Exception as e:
#         print(f"Dashboard error: {str(e)}")
#         raise HTTPException(
#             status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
#             detail=f"Failed to load dashboard data: {str(e)}"
#         )


# # Optional: Endpoint to refresh/update the dashboard cache
# @router.post("/dashboard/refresh")
# def refresh_dashboard_cache(
#     db: Session = Depends(get_db),
#     current_user: User = Depends(get_current_user),
# ):
#     """Force refresh the dashboard cache with live data"""
#     try:
#         dashboard_data = _compute_live_dashboard_data(db, current_user.id)

#         # Update or create cache
#         cached = db.query(Dashboard).filter(
#             Dashboard.user_id == current_user.id
#         ).first()

#         if cached:
#             cached.crop_health = dashboard_data["crop_health"]
#             cached.total_fields = dashboard_data["total_fields"]
#             cached.active_alerts = dashboard_data["active_alerts"]
#             cached.next_irrigation = dashboard_data["next_irrigation"]
#         else:
#             new_cache = Dashboard(
#                 user_id=current_user.id,
#                 crop_health=dashboard_data["crop_health"],
#                 total_fields=dashboard_data["total_fields"],
#                 active_alerts=dashboard_data["active_alerts"],
#                 next_irrigation=dashboard_data["next_irrigation"],
#             )
#             db.add(new_cache)

#         db.commit()
#         return {"status": "success", "message": "Dashboard cache refreshed", "data": dashboard_data}

#     except Exception as e:
#         db.rollback()
#         raise HTTPException(
#             status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
#             detail=f"Failed to refresh dashboard: {str(e)}"
#         )

from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.db.session import get_db
from app.models.user import User
from app.models.field_form import FieldForm
from app.api.v1.endpoints.deps_auth import get_current_user
from app.services.ndvi import get_field_overall_ndvi, get_soil_score, ndvi_to_health_score
from app.weather.get_location import get_field_coords
from app.weather.get_weather import fetch_weather_by_coords, get_weather_score

router = APIRouter()

# NDVI is the dominant, ground-truth signal — soil and weather are
# secondary context, not equal-weight votes. This matches how real
# vegetation-health assessments work (e.g. FAO's VHI gives vegetation
# condition the primary role, weather/temperature a supporting one).
WEIGHTS = {"ndvi": 0.65, "soil": 0.20, "weather": 0.15}


def _compute_field_health(db: Session, field: FieldForm) -> int | None:
    if not field.boundary:
        return None

    try:
        ndvi_data = get_field_overall_ndvi(field.id, boundary=field.boundary)
        if not ndvi_data:
            return None
        ndvi_score = ndvi_to_health_score(ndvi_data["overall_ndvi"])
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
            # Weather unavailable — reweight NDVI/soil proportionally
            # so they still sum to 100%, rather than silently losing
            # 15% of the total score to a missing factor.
            ndvi_weight = WEIGHTS["ndvi"] / (WEIGHTS["ndvi"] + WEIGHTS["soil"])
            soil_weight = WEIGHTS["soil"] / (WEIGHTS["ndvi"] + WEIGHTS["soil"])
            return round(ndvi_score * ndvi_weight + soil_score * soil_weight)
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
            "active_alerts": 0,  # You can calculate this from fields with low NDVI
            "next_irrigation": 2,  # Example value
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
