from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str
    gemini_api_key: str = ""
    encryption_key: str = ""
    redis_url: str = "redis://localhost:6379/0"
    frontend_url: str = "http://localhost:5173"
    environment: str = "development"
    jwt_secret: str = "changeme-use-a-long-random-secret"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60 * 24 * 7  # 7 days
    supabase_url: str = ""
    supabase_service_key: str = ""
    supabase_storage_bucket: str = "documents"

    class Config:
        env_file = ".env"

settings = Settings()
