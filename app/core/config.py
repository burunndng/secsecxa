from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    APP_NAME: str = "CyberSec Toolkit Backend"
    VERSION: str = "1.0.0"
    DEBUG: bool = True
    
    DATABASE_URL: str = "sqlite:///./cybersec_toolkit.db"
    
    MAX_EXECUTION_TIME: int = 300
    MAX_CONCURRENT_EXECUTIONS: int = 10
    
    ALLOWED_HOSTS: list[str] = ["*"]
    CORS_ORIGINS: list[str] = ["http://localhost:5173", "http://localhost:3000"]
    
    REDACT_SENSITIVE_DATA: bool = True
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
