from fastapi import APIRouter,HTTPException,status
from pydantic import BaseModel

router = APIRouter()

@router.get("/home")
def home():
    return "It is the homepage"

@router.get("/about")
def about():
    return "It is about page"

@router.get("/how_it_works")
def how_it_works():
    return "It is how it works page"

@router.get("/contact")
def contact():
    return "This is contacts page"