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
