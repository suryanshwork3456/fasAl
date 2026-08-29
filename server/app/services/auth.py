import secrets

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from auth_database import get_db
from security import create_access_token, get_current_user
from auth_models import User
from redis import redis
from auth_schemas import PhoneRequest, TokenResponse, VerifyOTPRequest

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)

OTP_EXPIRY = 300


def normalize_phone(phone: str) -> str:
    return phone.strip().replace(" ", "").replace("-", "")


@router.post("/send_otp")
def send_otp(data: PhoneRequest):
    phone = normalize_phone(data.phone)

    otp = str(secrets.randbelow(10000)).zfill(4)

    key = f"otp:{phone}"

    redis.set(key, otp, ex=OTP_EXPIRY)

    return {
        "message": "Otp Generated Successfully",
        "otp": otp,
        "expires in ": OTP_EXPIRY,
    }


@router.post("/verify_otp", response_model=TokenResponse)
def verify_otp(data: VerifyOTPRequest, db: Session = Depends(get_db)):
    phone = normalize_phone(data.phone)
    otp = data.otp

    key = f"otp:{phone}"

    stored_otp = redis.get(key)

    if stored_otp is None:
        raise HTTPException(status_code=400, detail="OTP expired or not found")

    if stored_otp != otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")

    redis.delete(key)

    result = db.execute(select(User).where(User.phone == phone))
    user = result.scalar_one_or_none()

    if user is None:
        user = User(phone=phone)
        db.add(user)
        db.commit()
        db.refresh(user)

    access_token = create_access_token(user_id=user.id, phone=user.phone)

    return {
        "message": "Authentication successful",
        "user_id": user.id,
        "phone": user.phone,
        "access_token": access_token,
        "token_type": "bearer",
    }


@router.get("/me")
def read_current_user(current_user: dict = Depends(get_current_user)):
    """Example protected route - requires 'Authorization: Bearer <token>'."""
    return {
        "user_id": current_user["sub"],
        "phone": current_user["phone"],
    }
