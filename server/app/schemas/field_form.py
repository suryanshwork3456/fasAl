from pydantic import BaseModel, ConfigDict
from datetime import date
from typing import Optional
from app.models.field_form import CropType, SoilType


class FieldFormCreate(BaseModel):
    field_name: str
    field_area: float
    location: str
    date_of_sowing: date
    date_of_harvest: date
    crop_type: CropType
    soil_type: SoilType
    boundary: Optional[dict] = None


class FieldFormOut(FieldFormCreate):
    model_config = ConfigDict(from_attributes=True)  # lets Pydantic read from the ORM object
    id: int