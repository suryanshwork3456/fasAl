from datetime import datetime
from typing import List, Optional
from sqlalchemy import String, Integer, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.session import Base


class CropHealthMetric(Base):
    __tablename__ = "crop_health_metrics"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    field_id: Mapped[int] = mapped_column(Integer, index=True)  # Links to user's field
    
    # Top Metric Cards
    health_score: Mapped[int] = mapped_column(Integer)          # e.g., 82
    ndvi: Mapped[float] = mapped_column(Float)                  # e.g., 0.72
    stressed_area_percentage: Mapped[float] = mapped_column(Float) # e.g., 8.0
    status: Mapped[str] = mapped_column(String(50))             # e.g., "Healthy"
    
    # Health Trend Chart (Stores history array like [64, 68, 70, 74, 73, 79, 82])
    health_trend: Mapped[List[int]] = mapped_column(JSON)
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relationship to localized stress zones
    stress_zones: Mapped[List["StressZone"]] = relationship(
        "StressZone", back_populates="crop_health_metric", cascade="all, delete-orphan"
    )


class StressZone(Base):
    __tablename__ = "stress_zones"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    crop_health_id: Mapped[int] = mapped_column(Integer, ForeignKey("crop_health_metrics.id"))
    
    name: Mapped[str] = mapped_column(String(100))               # e.g., "North-West", "South-East"
    status: Mapped[str] = mapped_column(String(50))             # e.g., "normal", "warning", "critical"
    
    crop_health_metric: Mapped["CropHealthMetric"] = relationship(
        "CropHealthMetric", back_populates="stress_zones"
    )