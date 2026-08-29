from sqlalchemy.orm import Session
from app.models.field_form import FieldForm  # Adjust path to where your model is saved

def get_first_field_location(db: Session) -> str:
    first_field = db.query(FieldForm).order_by(FieldForm.id.asc()).first()
    
    if not first_field or not first_field.location:
        raise ValueError("No fields found in database.")
    
    return first_field.location