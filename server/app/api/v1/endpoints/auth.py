# # app/api/v1/endpoints/auth.py
# from datetime import datetime, timedelta, timezone
# from fastapi import APIRouter, Depends, HTTPException, status
# from sqlalchemy.orm import Session
# from sqlalchemy import select

# from app.api.v1.endpoints.deps_auth import get_db
# from app.core.config import settings
# from app.core.security import create_access_token, generate_otp
# from app.models.user import User
# from app.models.otp import OTPVerification
# from app.schemas.user import UserCreate, UserResponse
# from app.schemas.otp import MobileRequest, OTPVerifyRequest, OTPSentResponse
# from app.schemas.token import Token

# router = APIRouter()


# def _normalize_mobile(raw_number: str) -> str:
#     cleaned = raw_number.strip().replace(" ", "").replace("-", "")
#     if cleaned.startswith("+"):
#         cleaned = cleaned[1:]
#     if len(cleaned) == 10 and cleaned.isdigit():
#         cleaned = "91" + cleaned
#     return cleaned


# def _issue_otp(db: Session, mobile_number: str) -> str:
#     db.query(OTPVerification).filter(
#         OTPVerification.mobile_number == mobile_number,
#         OTPVerification.is_used == False,
#     ).update({"is_used": True})

#     otp_code = generate_otp()
#     otp_entry = OTPVerification(mobile_number=mobile_number, otp_code=otp_code)
#     db.add(otp_entry)
#     db.commit()
#     return otp_code


# @router.post("/register", response_model=OTPSentResponse, status_code=status.HTTP_201_CREATED)
# def register(user_in: UserCreate, db: Session = Depends(get_db)):
#     user_in.mobile_number = _normalize_mobile(user_in.mobile_number)

#     existing_user = db.scalar(select(User).where(
#         User.mobile_number == user_in.mobile_number))
#     if existing_user and existing_user.is_verified:
#         raise HTTPException(
#             status_code=status.HTTP_400_BAD_REQUEST,
#             detail="User with this mobile number already exists."
#         )

#     if not existing_user:
#         existing_user = User(
#             full_name=user_in.full_name,
#             mobile_number=user_in.mobile_number,
#             is_verified=False,
#         )
#         db.add(existing_user)
#         db.commit()

#     otp_code = _issue_otp(db, user_in.mobile_number)

#     return OTPSentResponse(
#         message="OTP sent to your mobile number.",
#         mobile_number=user_in.mobile_number,
#         demo_otp=otp_code,
#     )


# @router.post("/login", response_model=OTPSentResponse)
# def login(payload: MobileRequest, db: Session = Depends(get_db)):
#     payload.mobile_number = _normalize_mobile(payload.mobile_number)

#     user = db.scalar(select(User).where(
#         User.mobile_number == payload.mobile_number))
#     if not user or not user.is_verified:
#         raise HTTPException(
#             status_code=status.HTTP_404_NOT_FOUND,
#             detail="No account found with this mobile number. Please register first."
#         )

#     otp_code = _issue_otp(db, payload.mobile_number)

#     return OTPSentResponse(
#         message="OTP sent to your mobile number.",
#         mobile_number=payload.mobile_number,
#         demo_otp=otp_code,
#     )


# @router.post("/verify-otp", response_model=Token)
# def verify_otp(payload: OTPVerifyRequest, db: Session = Depends(get_db)):
#     otp_entry = db.scalar(
#         select(OTPVerification)
#         .where(
#             OTPVerification.mobile_number == payload.mobile_number,
#             OTPVerification.otp_code == payload.otp,
#             OTPVerification.is_used == False,
#         )
#         .order_by(OTPVerification.id.desc())
#     )

#     if not otp_entry:
#         raise HTTPException(
#             status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid OTP.")

#     if otp_entry.expires_at < datetime.now(timezone.utc):
#         raise HTTPException(
#             status_code=status.HTTP_400_BAD_REQUEST, detail="OTP has expired.")

#     otp_entry.is_used = True

#     user = db.scalar(select(User).where(
#         User.mobile_number == payload.mobile_number))
#     if not user:
#         raise HTTPException(
#             status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

#     user.is_verified = True
#     db.commit()

#     access_token_expires = timedelta(
#         minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
#     access_token = create_access_token(
#         subject=user.id, expires_delta=access_token_expires)

#     return {"access_token": access_token, "token_type": "bearer"}


# @router.post("/resend-otp", response_model=OTPSentResponse)
# def resend_otp(payload: MobileRequest, db: Session = Depends(get_db)):
#     payload.mobile_number = _normalize_mobile(payload.mobile_number)

#     user = db.scalar(select(User).where(
#         User.mobile_number == payload.mobile_number))
#     if not user:
#         raise HTTPException(
#             status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

#     otp_code = _issue_otp(db, payload.mobile_number)

#     return OTPSentResponse(
#         message="OTP resent to your mobile number.",
#         mobile_number=payload.mobile_number,
#         demo_otp=otp_code,
#     )


# app/api/v1/endpoints/auth.py
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.api.v1.endpoints.deps_auth import get_db
from app.core.config import settings
from app.core.security import create_access_token, generate_otp
from app.models.user import User
from app.models.otp import OTPVerification
from app.schemas.user import UserCreate, UserResponse
from app.schemas.otp import MobileRequest, OTPVerifyRequest, OTPSentResponse
from app.schemas.token import Token

router = APIRouter()


def _normalize_mobile(raw_number: str) -> str:
    """
    Ensures every mobile number saved/looked-up has a country code,
    so WhatsApp/SMS alerts (Twilio) always build a valid international
    number, and so lookups always match regardless of how a number
    was originally typed. "7217259221" -> "917217259221". Already-
    correct numbers pass through unchanged.
    """
    cleaned = raw_number.strip().replace(" ", "").replace("-", "")
    if cleaned.startswith("+"):
        cleaned = cleaned[1:]
    if len(cleaned) == 10 and cleaned.isdigit():
        cleaned = "91" + cleaned
    return cleaned


def _issue_otp(db: Session, mobile_number: str) -> str:
    db.query(OTPVerification).filter(
        OTPVerification.mobile_number == mobile_number,
        OTPVerification.is_used == False,
    ).update({"is_used": True})

    otp_code = generate_otp()
    otp_entry = OTPVerification(mobile_number=mobile_number, otp_code=otp_code)
    db.add(otp_entry)
    db.commit()
    return otp_code


@router.post("/register", response_model=OTPSentResponse, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    user_in.mobile_number = _normalize_mobile(user_in.mobile_number)

    existing_user = db.scalar(select(User).where(
        User.mobile_number == user_in.mobile_number))
    if existing_user and existing_user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this mobile number already exists."
        )

    if not existing_user:
        existing_user = User(
            full_name=user_in.full_name,
            mobile_number=user_in.mobile_number,
            is_verified=False,
        )
        db.add(existing_user)
        db.commit()

    otp_code = _issue_otp(db, user_in.mobile_number)

    return OTPSentResponse(
        message="OTP sent to your mobile number.",
        mobile_number=user_in.mobile_number,
        demo_otp=otp_code,
    )


@router.post("/login", response_model=OTPSentResponse)
def login(payload: MobileRequest, db: Session = Depends(get_db)):
    payload.mobile_number = _normalize_mobile(payload.mobile_number)

    user = db.scalar(select(User).where(
        User.mobile_number == payload.mobile_number))
    if not user or not user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No account found with this mobile number. Please register first."
        )

    otp_code = _issue_otp(db, payload.mobile_number)

    return OTPSentResponse(
        message="OTP sent to your mobile number.",
        mobile_number=payload.mobile_number,
        demo_otp=otp_code,
    )


@router.post("/verify-otp", response_model=Token)
def verify_otp(payload: OTPVerifyRequest, db: Session = Depends(get_db)):
    payload.mobile_number = _normalize_mobile(payload.mobile_number)

    otp_entry = db.scalar(
        select(OTPVerification)
        .where(
            OTPVerification.mobile_number == payload.mobile_number,
            OTPVerification.otp_code == payload.otp,
            OTPVerification.is_used == False,
        )
        .order_by(OTPVerification.id.desc())
    )

    if not otp_entry:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid OTP.")

    if otp_entry.expires_at < datetime.now(timezone.utc):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="OTP has expired.")

    otp_entry.is_used = True

    user = db.scalar(select(User).where(
        User.mobile_number == payload.mobile_number))
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    user.is_verified = True
    db.commit()

    access_token_expires = timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        subject=user.id, expires_delta=access_token_expires)

    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/resend-otp", response_model=OTPSentResponse)
def resend_otp(payload: MobileRequest, db: Session = Depends(get_db)):
    payload.mobile_number = _normalize_mobile(payload.mobile_number)

    user = db.scalar(select(User).where(
        User.mobile_number == payload.mobile_number))
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    otp_code = _issue_otp(db, payload.mobile_number)

    return OTPSentResponse(
        message="OTP resent to your mobile number.",
        mobile_number=payload.mobile_number,
        demo_otp=otp_code,
    )
