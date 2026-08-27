from contextlib import asynccontextmanager
from os import close

from fastapi import FastAPI

from database import engine
from models import Base
from redis_client import redis
from auth import router

@asynccontextmanager
async def lifespan(app:FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    yield
    await redis.close()
    await engine.dispose()

app = FastAPI(
    title="OTP Authentication API"
)

app.include_router(router)

@app.get("/")
async def root():
    return {"message": "Welcome to the OTP Authentication API"}