from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    DEBUG: bool = True

    # Database
    DATABASE_URL: str = "sqlite:///./travelmate.db"

    # AI Model (Ollama)
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    GRANITE_MODEL: str = "granite3.2:4b"
    OLLAMA_TIMEOUT: int = 120

    # Weather API
    OPENWEATHER_API_KEY: str = ""

    # CORS
    ALLOWED_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173"

    # Demo Mode
    DEMO_MODE: bool = False

    model_config = {
        "env_file": ".env",
        "case_sensitive": True,
        "extra": "ignore",
    }

    @property
    def allowed_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]


settings = Settings()