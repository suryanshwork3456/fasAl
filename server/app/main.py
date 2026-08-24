from contextlib import asynccontextmanager
from fastapi import FastAPI
from app.api.v1.router import api_v1_router
from app.db.session import init_db
import app.models  # registers all models with Base.metadata

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield

app = FastAPI(title="fasAI", lifespan=lifespan)

app.include_router(api_v1_router)

@app.get("/")
def root():
    return {"message": "Welcome to fasAI"}