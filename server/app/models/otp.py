# app/models/otp.py
from datetime import datetime, timedelta, timezone
from sqlalchemy import String, Integer, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from app.db.session import Base

def default_expiry():
    return datetime.now(timezone.utc) + timedelta(minutes=5)

class OTPVerification(Base):
    __tablename__ = "otp_verifications"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    mobile_number: Mapped[str] = mapped_column(String(15), index=True, nullable=False)
    otp_code: Mapped[str] = mapped_column(String(6), nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=default_expiry)
    is_used: Mapped[bool] = mapped_column(default=False)