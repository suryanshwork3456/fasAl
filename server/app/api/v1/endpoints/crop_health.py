from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.crop_health import CropHealthMetric
from app.models.field_form import FieldForm
from app.models.user import User
from app.api.v1.endpoints.deps_auth import get_current_user
from app.schemas.crop_health import CropHealthResponse

router = APIRouter()

@router.get("/{field_id}", response_model=CropHealthResponse)
def get_crop_health_metrics(
    field_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Fetch the latest Crop Health dashboard data for a specific field.
    """
    # First confirm this field actually belongs to the logged-in user
    field = (
        db.query(FieldForm)
        .filter(FieldForm.id == field_id, FieldForm.user_id == current_user.id)
        .first()
    )
    if not field:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Field not found")

    metrics = (
        db.query(CropHealthMetric)
        .filter(CropHealthMetric.field_id == field_id)
        .order_by(CropHealthMetric.created_at.desc())
        .first()
    )

    if not metrics:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No crop health metrics found for field_id {field_id}"
        )

    return metrics