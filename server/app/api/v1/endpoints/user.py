from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.db.session import get_db
from app.models.user import User
from app.api.v1.endpoints.deps_auth import get_current_user

router = APIRouter()


@router.get("/dashboard")
def dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        query = text("SELECT * FROM dashboard WHERE user_id = :user_id;")
        result = db.execute(query, {"user_id": current_user.id})
        data = [dict(row) for row in result.mappings()]
        return {"status": "success", "data": data}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database query failed: {str(e)}"
        )