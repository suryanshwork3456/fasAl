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

@router.get("/get_started")
def get_started():
    return "This is get_started page"

@router.get("/learn_works")
def learn_works():
    return "This is learn how video works page"