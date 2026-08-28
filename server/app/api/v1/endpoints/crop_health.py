from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

# Import your database session dependency, models, and schemas
from app.db.session import get_db
from app.models.crop_health import CropHealthMetric
from app.schemas.crop_health import CropHealthResponse

router = APIRouter()

@router.get("/{field_id}", response_model=CropHealthResponse)
def get_crop_health_metrics(field_id: int, db: Session = Depends(get_db)):
    """
    Fetch the latest Crop Health dashboard data for a specific field.
    """
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