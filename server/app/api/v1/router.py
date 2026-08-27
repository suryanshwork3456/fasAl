from fastapi import APIRouter
from app.api.v1.endpoints import home, user, field_form

api_v1_router = APIRouter()

api_v1_router.include_router(home.router, prefix="/home", tags=["home"])
api_v1_router.include_router(user.router, prefix="/user", tags=["user"]) 
api_v1_router.include_router(field_form.router, prefix="/field-form", tags=["field-form"]) 