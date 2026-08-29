from pydantic import BaseModel, ConfigDict

class FieldCreate(BaseModel):
    name: str
    location: str

class FieldResponse(BaseModel):
    id: int
    name: str
    location: str
    owner_id: int

    model_config = ConfigDict(from_attributes=True)