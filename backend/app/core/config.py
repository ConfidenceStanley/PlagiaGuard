from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # App Settings
    APP_NAME: str = "PlagiaGuard"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True

    # Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours

    # Database
    MONGODB_URI: str

    # Cloudinary
    CLOUDINARY_CLOUD_NAME: str = ""
    CLOUDINARY_API_KEY: str = ""
    CLOUDINARY_API_SECRET: str = ""

    # Search API
    BING_SEARCH_API_KEY: str = ""

    # CORS
    ALLOWED_ORIGINS: str = "http://localhost:5173"

    def get_allowed_origins(self) -> List[str]:
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]

    class Config:
        env_file = ".env"
        extra = "ignore"


# Create single instance used throughout app
settings = Settings()