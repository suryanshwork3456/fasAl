# ==========================================================
# File: app/schemas/ndvi.py
# ==========================================================
"""
Pydantic schema for the satellite/NDVI grid endpoint.

Named separately from schemas/crop_health.py (the team's DB-backed
health-score/stress-zone feature) since the two model completely
different shapes of data — this avoids a filename collision.
"""

from pydantic import BaseModel, Field
from datetime import datetime


class NDVIResponse(BaseModel):
    field_id: int
    grid: list[list[float]] = Field(
        ..., description="Rows x cols NDVI values, one per field zone"
    )
    overall_ndvi: float = Field(..., ge=-1.0, le=1.0)
    data_source: str = Field(
        ..., description='Either "mock", "raster", or "satellite"'
    )
    last_updated: datetime

    class Config:
        json_schema_extra = {
            "example": {
                "field_id": 1,
                "grid": [[0.48, 0.57, 0.64], [0.33, 0.46, 0.68]],
                "overall_ndvi": 0.59,
                "data_source": "mock",
                "last_updated": "2026-08-24T10:30:00Z",
            }
        }
