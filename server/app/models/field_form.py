from sqlalchemy import String, Float, Date, JSON, Enum as SQLEnum
from sqlalchemy.orm import mapped_column, Mapped
from datetime import date
from app.db.session import Base
from enum import Enum


class CropType(str, Enum):
    WHEAT = "Wheat"
    RICE = "Rice"
    COTTON = "Cotton"
    MAIZE = "Maize"
    VEGETABLES = "Vegetables"


class SoilType(str, Enum):
    LOAMY = "Loamy"
    CLAYLOAM = "Clayloam"
    SANDYLOAM = "Sandyloam"
    ALLUVIAL = "Alluvial"
    BLACKSOIL = "Blacksoil"


class FieldForm(Base):
    __tablename__ = "field_form"

    id: Mapped[int] = mapped_column(primary_key=True)
    field_name: Mapped[str] = mapped_column(String, nullable=False)
    field_area: Mapped[float] = mapped_column(Float, nullable=False)
    location: Mapped[str] = mapped_column(String, nullable=False)
    date_of_sowing: Mapped[date] = mapped_column(Date, nullable=False)
    date_of_harvest: Mapped[date] = mapped_column(Date, nullable=False)
    crop_type: Mapped[CropType] = mapped_column(SQLEnum(CropType), nullable=False)
    soil_type: Mapped[SoilType] = mapped_column(SQLEnum(SoilType), nullable=False)
    boundary: Mapped[dict | None] = mapped_column(JSON, nullable=True)