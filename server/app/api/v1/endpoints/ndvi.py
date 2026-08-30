# ==========================================================
# File: app/api/v1/endpoints/ndvi.py
# ==========================================================
"""
NDVI/satellite route.

Fetches the real field boundary from field_form (created via
POST /field-form/) and uses it for the satellite query instead of
the hardcoded placeholder — this is what makes each created field
show its own real NDVI data.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, UTC

from app.db.session import get_db
from app.models.field_form import FieldForm
from app.models.user import User
from app.api.v1.endpoints.deps_auth import get_current_user
from app.services.ndvi import get_field_ndvi
from app.schemas.ndvi import NDVIResponse

router = APIRouter()


@router.get("/{field_id}/ndvi", response_model=NDVIResponse, tags=["ndvi"])
def read_field_ndvi(
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
            status_code=422,
            detail="This field has no saved boundary — cannot compute NDVI for it."
        )

    data = get_field_ndvi(field_id, boundary=field.boundary)
    data["last_updated"] = datetime.now(UTC)
    return data