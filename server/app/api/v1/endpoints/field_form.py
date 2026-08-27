from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.field_form import FieldForm
from app.schemas.field_form import FieldFormCreate, FieldFormOut

router = APIRouter()


@router.post("/", response_model=FieldFormOut, status_code=201)
def create_field(payload: FieldFormCreate, db: Session = Depends(get_db)):
    new_field = FieldForm(**payload.model_dump())
    db.add(new_field)
    db.commit()
    db.refresh(new_field)
    return new_field


@router.get("/", response_model=list[FieldFormOut])
def list_fields(db: Session = Depends(get_db)):
    return db.query(FieldForm).all()


from fastapi import HTTPException

@router.get("/{field_id}", response_model=FieldFormOut)
def get_field(field_id: int, db: Session = Depends(get_db)):
    field = db.query(FieldForm).filter(FieldForm.id == field_id).first()
    if not field:
        raise HTTPException(status_code=404, detail="Field not found")
    return field