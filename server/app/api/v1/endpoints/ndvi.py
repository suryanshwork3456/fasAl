# ==========================================================
# File: app/api/v1/endpoints/ndvi.py
# ==========================================================
"""
NDVI/satellite route.

Route layer only — no logic lives here. get_field_ndvi() internally
decides mock vs. live satellite data, with automatic fallback to
mock if the live call fails. No prefix here — router.py adds
"/fields" when registering this router, matching the pattern used
by home.py, user.py, and field_form.py.
"""

from fastapi import APIRouter
from datetime import datetime, UTC

from app.services.ndvi import get_field_ndvi
from app.schemas.ndvi import NDVIResponse

router = APIRouter()


@router.get("/{field_id}/ndvi", response_model=NDVIResponse, tags=["ndvi"])
def read_field_ndvi(field_id: int):
    data = get_field_ndvi(field_id)
    data["last_updated"] = datetime.now(UTC)
    return data
