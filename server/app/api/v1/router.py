from fastapi import APIRouter
from app.api.v1.endpoints import home, user

api_v1_router = APIRouter()

api_v1_router.include_router(home.router, prefix="/home", tags=["home"])
api_v1_router.include_router(user.router, prefix="/user", tags=["user"]) 