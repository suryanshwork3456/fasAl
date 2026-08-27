from fastapi import APIRouter, File, UploadFile
from app.api.v1.endpoints import home, user, field_form, crop_health, ndvi
from app.api.v1.endpoints.crop_analysis import analyze_crop_image

api_v1_router = APIRouter()

# Register standard endpoint routers
api_v1_router.include_router(home.router, prefix="/home", tags=["home"])
api_v1_router.include_router(user.router, prefix="/user", tags=["user"])
api_v1_router.include_router(field_form.router, prefix="/field-form", tags=["field-form"]) 
api_v1_router.include_router(crop_health.router, prefix="/crop-health", tags=["crop-health"])
api_v1_router.include_router(ndvi.router, prefix="/fields", tags=["ndvi"])

# Register Crop Analysis route directly onto api_v1_router
@api_v1_router.post("/crop/analyze", tags=["Crop Analysis"])
async def analyze_crop(file: UploadFile = File(...)):
    return await analyze_crop_image(file)