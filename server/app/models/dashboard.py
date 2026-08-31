from typing import TYPE_CHECKING
from sqlalchemy import Integer, Float, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.session import Base

if TYPE_CHECKING:
    from app.models.user import User

class Dashboard(Base):
    __tablename__ = "dashboard"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), index=True, nullable=False)
    crop_health: Mapped[float] = mapped_column(Float, nullable=True)
    
    # Updated with back_populates
    owner: Mapped["User"] = relationship("User", back_populates="dashboards")
    
    total_fields: Mapped[float] = mapped_column(Float, nullable=True)
    active_alerts: Mapped[float] = mapped_column(Float, nullable=True)
    next_irrigation: Mapped[float] = mapped_column(Float, nullable=True)