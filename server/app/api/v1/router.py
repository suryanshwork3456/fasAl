from fastapi import APIRouter, File, UploadFile
from app.api.v1.endpoints import auth, home, user, field_form, crop_health, ndvi, auth, weather, analyze
# from app.api.v1.endpoints.crop_analysis import analyze_crop_image

api_v1_router = APIRouter()

# Register authentication router
api_v1_router.include_router(auth.router, prefix="/auth", tags=["auth"])

# Register standard endpoint routers
api_v1_router.include_router(home.router, prefix="/home", tags=["home"])
api_v1_router.include_router(user.router, prefix="/user", tags=["user"])
api_v1_router.include_router(field_form.router, prefix="/field-form", tags=["field-form"]) 
api_v1_router.include_router(crop_health.router, prefix="/crop-health", tags=["crop-health"])
api_v1_router.include_router(ndvi.router, prefix="/fields", tags=["ndvi"])
api_v1_router.include_router(weather.router, prefix="/weather",tags=["weather"])

api_v1_router.include_router(analyze.router, prefix="/crop", tags=["Crop Analysis"])