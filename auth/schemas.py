from pydantic import BaseModel, Field

class PhoneRequest(BaseModel):
    phone: str = Field(..., example="1234567890")

class VerifyOTPRequest(BaseModel):
    phone: str = Field(..., example="1234567890")
    otp: str = Field(..., example="1234")
