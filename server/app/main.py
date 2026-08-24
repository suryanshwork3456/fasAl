from fastapi import FastAPI
from app.api.v1.router import api_v1_router

app = FastAPI(title="fasAI")

app.include_router(api_v1_router)

@app.get("/")
def root():
    return {"message": "Welcome to fasAI"}