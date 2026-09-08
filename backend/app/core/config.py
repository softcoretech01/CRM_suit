from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "B2B SaaS CRM"
    PORT: int = 5000
    
    DB_HOST: str
    DB_PORT: int
    DB_USER: str
    DB_PASSWORD: str
    
    DB_NAME_MASTERS: str = "masters_crm"
    DB_NAME_ADMIN: str = "admin_crm"
    DB_NAME_CRM: str = "crm"
    
    SECRET_KEY: str = "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 days
    
    CORS_ORIGINS: List[str] = ["*"]
    
    MEDIA_ROOT: str = "uploads"
    MEDIA_URL: str = "/uploads"
    
    model_config = SettingsConfigDict(env_file=".env")

settings = Settings()
