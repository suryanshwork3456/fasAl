from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from datetime import datetime

# --- Stress Zone Schemas ---
class StressZoneBase(BaseModel):
    name: str
    status: str  # "normal", "warning", "critical"

class StressZoneCreate(StressZoneBase):
    pass

class StressZoneResponse(StressZoneBase):
    id: int
    model_config = ConfigDict(from_attributes=True)


# --- Crop Health Schemas ---
class CropHealthBase(BaseModel):
    health_score: int
    ndvi: float
    stressed_area_percentage: float
    status: str
    health_trend: List[int]

class CropHealthCreate(CropHealthBase):
    field_id: int
    stress_zones: List[StressZoneCreate]

class CropHealthResponse(CropHealthBase):
    id: int
    field_id: int
    created_at: datetime
    stress_zones: List[StressZoneResponse]

    model_config = ConfigDict(from_attributes=True)