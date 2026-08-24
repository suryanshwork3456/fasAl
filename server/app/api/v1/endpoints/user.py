from fastapi import APIRouter,HTTPException,status
from pydantic import BaseModel

router = APIRouter()

@router.get("/dashboard")
def dashboard():
    return "It is the homepage"

@router.get("/fields")
def fields():
    return "It is field page"

@router.get("/satellite_monitor")
def satellite_monitor():
    return "It is satellite_monitor page"

@router.get("/weather")
def weather():
    return "This is weather page"

@router.get("/crop_health")
def crop_health():
    return "This is crop_health page"

@router.get("/alerts")
def alerts():
    return "This is alerts page"

@router.get("/ai_assitant")
def ai_assitant():
    return "This is ai_assitant page"

@router.get("/reports")
def reports():
    return "This is reports page"

@router.get("/settings")
def settings():
    return "This is settings page"