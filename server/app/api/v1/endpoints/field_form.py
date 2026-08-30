from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.field_form import FieldForm
from app.schemas.field_form import FieldFormCreate, FieldFormOut

router = APIRouter()

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.field_form import FieldForm
from app.models.user import User
from app.api.v1.endpoints.deps_auth import get_current_user
from app.schemas.field_form import FieldFormCreate, FieldFormOut  # adjust import path if different

router = APIRouter()


@router.post("/", response_model=FieldFormOut, status_code=201)
def create_field(
    payload: FieldFormCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    new_field = FieldForm(**payload.model_dump(), user_id=current_user.id)
    db.add(new_field)
    db.commit()
    db.refresh(new_field)
    return new_field


@router.get("/", response_model=list[FieldFormOut])
def list_fields(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return db.query(FieldForm).filter(FieldForm.user_id == current_user.id).all()


@router.get("/{field_id}", response_model=FieldFormOut)
def get_field(
    field_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    field = (
        db.query(FieldForm)
        .filter(FieldForm.id == field_id, FieldForm.user_id == current_user.id)
        .first()
    )
    if not field:
        raise HTTPException(status_code=404, detail="Field not found")
    return field