from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.router import api_v1_router
from auth import auth_router
from redis import redis
@asynccontextmanager
async def lifespan(app: FastAPI):
    yield
    redis.close()
app = FastAPI(title="fasAI", lifespan=lifespan)

# Add CORS Middleware (Note: origins must be strings)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Router
app.include_router(api_v1_router, prefix="/api/v1")
app.include_router(auth_router,prefix="/api/v1/auth",tags=["Auth"])

@app.get("/")
def root():
    return {"message": "Welcome to fasAI"}
