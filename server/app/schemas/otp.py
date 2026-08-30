# app/schemas/otp.py
from pydantic import BaseModel

class MobileRequest(BaseModel):
    mobile_number: str

class OTPVerifyRequest(BaseModel):
    mobile_number: str
    otp: str

class OTPSentResponse(BaseModel):
    message: str
    mobile_number: str
    demo_otp: str  # ⚠️ demo mode only — remove this field once you wire up a real SMS provider