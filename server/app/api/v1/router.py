from fastapi import APIRouter
from app.api.v1.endpoints import home

api_v1_router = APIRouter()

api_v1_router.include_router(home.router,prefix="/home",tags=["home"])
api_v1_router.include_router(home.router,prefix="/about",tags=["about"])
api_v1_router.include_router(home.router,prefix="/how_it_works",tags=["how_it_works"])
api_v1_router.include_router(home.router,prefix="/contact",tags=["contact"])