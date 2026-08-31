# ==========================================================
# File: app/api/v1/endpoints/dashboard_live.py
# ==========================================================
"""
Live-computed dashboard metrics. No database table involved.
Uses get_field_overall_ndvi() (1 API call per field) rather than
the full 15-cell grid — dashboard only needs one number per field,
not per-cell detail, so this is 15x cheaper per field.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.field_form import FieldForm
from app.services.ndvi import get_field_overall_ndvi

router = APIRouter()


@router.get("/dashboard-live", tags=["dashboard"])
def get_dashboard_live(db: Session = Depends(get_db)):
    all_fields = db.query(FieldForm).all()

    if not all_fields:
        return {"crop_health": 0, "total_fields": 0, "active_alerts": 0, "next_irrigation": None}

    ndvi_values = []
    alert_count = 0

    for field in all_fields:
        if not field.boundary:
            continue
        try:
            data = get_field_overall_ndvi(field.id, boundary=field.boundary)
            ndvi_values.append(data["overall_ndvi"])
            # Trade-off: no per-cell detail here, so "alert" means the
            # WHOLE field's average is low, not just one stressed patch.
            # Good enough for a dashboard summary badge.
            if data["overall_ndvi"] < 0.4:
                alert_count += 1
        except Exception:
            continue

    avg_ndvi = sum(ndvi_values) / len(ndvi_values) if ndvi_values else 0
    crop_health_score = round((avg_ndvi + 1) / 2 * 100) if ndvi_values else 0

    return {
        "crop_health": crop_health_score,
        "total_fields": len(all_fields),
        "active_alerts": alert_count,
        "next_irrigation": 2,
    }
