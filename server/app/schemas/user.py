# app/schemas/user.py
from pydantic import BaseModel, ConfigDict, field_validator

class UserCreate(BaseModel):
    full_name: str
    mobile_number: str

    @field_validator("mobile_number")
    @classmethod
    def validate_mobile(cls, v: str) -> str:
        digits = v.strip()
        if not digits.isdigit() or len(digits) != 10:
            raise ValueError("Mobile number must be exactly 10 digits")
        return digits

class UserResponse(BaseModel):
    id: int
    full_name: str
    mobile_number: str
    is_verified: bool

    model_config = ConfigDict(from_attributes=True)