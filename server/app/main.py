from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.router import api_v1_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    yield

app = FastAPI(title="fasAI", lifespan=lifespan)

# Add CORS Middleware (Note: origins must be strings)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Router
app.include_router(api_v1_router, prefix="/api/v1")


@app.get("/")
def root():
    return {"message": "Welcome to fasAI"}
