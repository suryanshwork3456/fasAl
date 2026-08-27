import secrets

from fastapi import FastAPI, HTTPException,APIRouter
from sqlalchemy import select

from database import SessionLocal
from models import User
from redis_client import redis
from schemas import PhoneRequest, VerifyOTPRequest


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

OTP_EXPIRY = 300

def normalize_phone(phone: str) -> str:
    return phone.strip().replace(" ", "").replace("-", "")

@router.post("/send_otp")
def send_otp(data: PhoneRequest):
    phone=normalize_phone(data.phone)

    otp=str(secrets.randbelow(10000)).zfill(4)

    key=f"otp:{phone}"

    redis.set(key, 
            otp, 
            ex=OTP_EXPIRY
            )
    return {"message": "Otp Generated Successfully", 
            "otp": otp,
            "expires in ": OTP_EXPIRY
            }

@router.post("/verify_otp")
def verify_otp(data: VerifyOTPRequest):
    phone=normalize_phone(data.phone)
    otp=data.otp

    key=f"otp:{phone}"

    stored_otp=redis.get(key)

    if stored_otp is None:
        raise HTTPException(status_code=400, 
                            detail="OTP expired or not found"
                            )
    
    if stored_otp != otp:
        raise HTTPException(
            status_code=400, 
            detail="Invalid OTP"
                            )
    redis.delete(key)
    with SessionLocal() as db:
        result = db.execute(
        select(User).where(User.phone == phone)
        )
        
        user = result.scalar_one_or_none()

        if user is None:
            user = User(phone=phone,
                        )
            db.add(user)
            db.commit()
            db.refresh(user)
            return {
            "message": "Authentication successful",
            "user_id": user.id,
            "phone": user.phone
        }