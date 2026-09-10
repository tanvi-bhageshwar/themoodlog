import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "MoodLog"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    ENVIRONMENT: str = "development"

    # Security & Auth
    SECRET_KEY: str = "moodlog-super-secret-key-change-in-production-2025"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    # Database
    DATABASE_URL: str = "sqlite:///./moodlog.db"

    # AI Service Keys
    GROQ_API_KEY: str = ""
    GEMINI_API_KEY: str = ""

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()

# Support reading GEMINI_API_KEY directly from environment if not loaded from file
if not settings.GEMINI_API_KEY and "GEMINI_API_KEY" in os.environ:
    settings.GEMINI_API_KEY = os.environ["GEMINI_API_KEY"]

if not settings.GROQ_API_KEY and "GROQ_API_KEY" in os.environ:
    settings.GROQ_API_KEY = os.environ["GROQ_API_KEY"]
