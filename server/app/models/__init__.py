# app/models/__init__.py
from app.models.user import User
from app.models.field import Field
from app.models.dashboard import Dashboard
from app.models.field_form import FieldForm
from app.models.crop_health import StressZone, CropHealthMetric
from app.models.crop import CropAnalysis  # <--- Add this import

__all__ = [
    "User",
    "Field",
    "Dashboard",
    "FieldForm",
    "StressZone",
    "CropHealthMetric",
    "CropAnalysis",  # <--- Add this to __all__
]