# backend/app/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.config import settings
from app.database.connection import connect_to_database, disconnect_from_database
from app.routers import auth, documents


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

# ── CORS ──────────────────────────────────────────────────────
# Hardcode during development to rule out parsing issues
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",    # Vite dev server
        "http://localhost:3000",    # Alternative port
        "http://127.0.0.1:5173",   # Some systems use 127.0.0.1
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(documents.router)


@app.get("/")
async def root():
    return {
        "message": f"Welcome to {settings.APP_NAME} API",
        "version": settings.APP_VERSION,
        "status": "running"
    }


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION
    }