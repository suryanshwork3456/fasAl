from fastapi import APIRouter,HTTPException,status,Depends
from pydantic import BaseModel
from app.db.session import get_db
from sqlalchemy.orm import Session
from sqlalchemy import text


router = APIRouter()

@router.get("/dashboard")
def dashboard(db: Session = Depends(get_db)):
    try:
        query = text("SELECT * FROM dashboard;")
        result = db.execute(query)
        data = [dict(row) for row in result.mappings()]
        return {"status": "success", "data": data}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database query failed: {str(e)}"
        )

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