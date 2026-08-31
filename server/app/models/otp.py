from datetime import datetime, timedelta, timezone
from sqlalchemy import String, Integer, DateTime, Boolean
from sqlalchemy.orm import Mapped, mapped_column
from app.db.session import Base

def get_otp_expiry() -> datetime:
    """Generates an expiration timestamp 5 minutes from the current time."""
    return datetime.now(timezone.utc) + timedelta(minutes=5)

class OTPVerification(Base):
    __tablename__ = "otp_verifications"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    mobile_number: Mapped[str] = mapped_column(String(15), index=True, nullable=False)
    otp_code: Mapped[str] = mapped_column(String(6), nullable=False)
    
    # Pass callable function without calling it () so it executes on every record insert
    expires_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        default=get_otp_expiry, 
        nullable=False
    )
    
    is_used: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)