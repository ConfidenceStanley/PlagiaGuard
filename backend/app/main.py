from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.config import settings
from app.database.connection import connect_to_database, disconnect_from_database
from app.routers import auth

# ADD THESE TWO LINES TEMPORARILY TO DEBUG
import os
from dotenv import load_dotenv
load_dotenv()
print("MONGODB_URI loaded:", os.getenv("MONGODB_URI") is not None)
print("SECRET_KEY loaded:", os.getenv("SECRET_KEY") is not None)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Handle startup and shutdown events"""
    print(f"🚀 Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    connect_to_database()
    yield
    disconnect_from_database()
    print(f"👋 {settings.APP_NAME} shut down")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Intelligent Plagiarism Detection System for Academic Documents",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.get_allowed_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)


@app.get("/")
async def root():
    return {
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running",
        "message": "PlagiaGuard API is live 🚀"
    }


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION
    }