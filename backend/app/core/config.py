# backend/app/core/config.py

from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):

    # ── App ───────────────────────────────────────────────
    APP_NAME: str = "PlagiaGuard"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    # ── Database ──────────────────────────────────────────
    MONGODB_URI: str
    DATABASE_NAME: str = "plagiarism_db"

    # ── JWT ───────────────────────────────────────────────
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_HOURS: int = 24

    # ── File Upload ───────────────────────────────────────
    MAX_FILE_SIZE_MB: int = 10
    ALLOWED_FILE_TYPES: List[str] = ["pdf", "docx", "txt"]

    # ── Cloudinary ────────────────────────────────────────
    CLOUDINARY_CLOUD_NAME: str = ""
    CLOUDINARY_API_KEY: str = ""
    CLOUDINARY_API_SECRET: str = ""

    # ── Search APIs (Phase 6) ─────────────────────────────
    BING_SEARCH_API_KEY: str = ""
    GOOGLE_API_KEY: str = ""
    GOOGLE_SEARCH_ENGINE_ID: str = ""

    # ── CORS ──────────────────────────────────────────────
    ALLOWED_ORIGINS: str                # ← Reads from .env, NO default

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "allow"

    def get_allowed_origins(self) -> List[str]:
        """
        Parse the ALLOWED_ORIGINS string from .env into a list.

        .env value:
            ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

        Returns:
            ["http://localhost:5173", "http://localhost:3000"]
        """
        return [
            origin.strip()
            for origin in self.ALLOWED_ORIGINS.split(",")
            if origin.strip()           # Skip empty strings
        ]


settings = Settings()