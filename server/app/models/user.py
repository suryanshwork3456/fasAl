from typing import TYPE_CHECKING
from sqlalchemy import String, Integer, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.session import Base

if TYPE_CHECKING:
    from app.models.dashboard import Dashboard
    from app.models.field import Field
    from app.models.field_form import FieldForm
    from app.models.crop_analysis import CropAnalysis

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    mobile_number: Mapped[str] = mapped_column(String(15), unique=True, index=True, nullable=False)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False)

    fields: Mapped[list["Field"]] = relationship("Field", back_populates="owner", cascade="all, delete-orphan")
    dashboards: Mapped[list["Dashboard"]] = relationship("Dashboard", back_populates="owner", cascade="all, delete-orphan")
    
    # Linked explicitly to match FieldForm.owner
    field_forms: Mapped[list["FieldForm"]] = relationship("FieldForm", back_populates="owner", cascade="all, delete-orphan")
    
    crop_analyses: Mapped[list["CropAnalysis"]] = relationship("CropAnalysis", back_populates="owner", cascade="all, delete-orphan")