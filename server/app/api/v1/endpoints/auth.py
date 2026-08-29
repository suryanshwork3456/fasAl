# import secrets

# from fastapi import APIRouter, Depends, HTTPException
# from sqlalchemy import select
# from sqlalchemy.orm import Session

# from app.db.auth_database import get_db
# from app.core.security import create_access_token, get_current_user
# from app.models.auth_models import User
# from app.db.redis import redis
# from app.schemas.schema_auth import PhoneRequest, TokenResponse, VerifyOTPRequest

# auth_router = APIRouter(
#     prefix="/auth",
#     tags=["Authentication"],
# )

# OTP_EXPIRY = 300


# def normalize_phone(phone: str) -> str:
#     return phone.strip().replace(" ", "").replace("-", "")


# @auth_router.post("/send_otp")
# def send_otp(data: PhoneRequest):
#     phone = normalize_phone(data.phone)

#     otp = str(secrets.randbelow(10000)).zfill(4)

#     key = f"otp:{phone}"

#     redis.set(key, otp, ex=OTP_EXPIRY)

#     return {
#         "message": "Otp Generated Successfully",
#         "otp": otp,
#         "expires in ": OTP_EXPIRY,
#     }


# @auth_router.post("/verify_otp", response_model=TokenResponse)
# def verify_otp(data: VerifyOTPRequest, db: Session = Depends(get_db)):
#     phone = normalize_phone(data.phone)
#     otp = data.otp

#     key = f"otp:{phone}"

#     stored_otp = redis.get(key)

#     if stored_otp is None:
#         raise HTTPException(status_code=400, detail="OTP expired or not found")

#     if stored_otp != otp:
#         raise HTTPException(status_code=400, detail="Invalid OTP")

#     redis.delete(key)

#     result = db.execute(select(User).where(User.phone == phone))
#     user = result.scalar_one_or_none()

#     if user is None:
#         user = User(phone=phone)
#         db.add(user)
#         db.commit()
#         db.refresh(user)

#     access_token = create_access_token(user_id=user.id, phone=user.phone)

#     return {
#         "message": "Authentication successful",
#         "user_id": user.id,
#         "phone": user.phone,
#         "access_token": access_token,
#         "token_type": "bearer",
#     }


# @auth_router.get("/me")
# def read_current_user(current_user: dict = Depends(get_current_user)):
#     """Example protected route - requires 'Authorization: Bearer <token>'."""
#     return {
#         "user_id": current_user["sub"],
#         "phone": current_user["phone"],
#     }



from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.api.v1.endpoints.deps import get_db
from app.core.config import settings
from app.core.security import get_password_hash, verify_password, create_access_token
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse
from app.schemas.token import Token

router = APIRouter()

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.scalar(select(User).where(User.email == user_in.email))
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists."
        )
    
    hashed_password = get_password_hash(user_in.password)
    new_user = User(email=user_in.email, hashed_password=hashed_password)
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/login", response_model=Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = db.scalar(select(User).where(User.email == form_data.username))
    
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        subject=user.id, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}