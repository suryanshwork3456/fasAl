from sqlalchemy import String, Float
from sqlalchemy.orm import Mapped, mapped_column
from app.db.session import Base

class Dashboard(Base):

    __tablename__ = "dashboard"

    id: Mapped[int] = mapped_column(primary_key=True)
    crop_health: Mapped[float] = mapped_column(Float, nullable=True)
    total_fields: Mapped[float] = mapped_column(Float, nullable=True)
    active_alerts: Mapped[float] = mapped_column(Float, nullable=True)
    next_irrigation: Mapped[float] = mapped_column(Float, nullable=True)
    recent_alerts: Mapped[float] = mapped_column(Float, nullable=True)