# app/models/user.py
from sqlalchemy import String, Integer, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.session import Base

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    mobile_number: Mapped[str] = mapped_column(String(15), unique=True, index=True, nullable=False)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False)

    fields: Mapped[list["Field"]] = relationship("Field", back_populates="owner", cascade="all, delete-orphan")
    dashboards: Mapped[list["Dashboard"]] = relationship("Dashboard", back_populates=None, cascade="all, delete-orphan")
    field_forms: Mapped[list["FieldForm"]] = relationship("FieldForm", cascade="all, delete-orphan")
    crop_analyses: Mapped[list["CropAnalysis"]] = relationship("CropAnalysis", cascade="all, delete-orphan")