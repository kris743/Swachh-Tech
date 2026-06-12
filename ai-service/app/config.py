from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    AI_PORT: int = 8000
    AI_DATABASE_URL: str = "postgresql://swachh_user:swachh_pass@localhost:5432/swachh_tech_db"
    AI_REDIS_URL: str = "redis://localhost:6379/1"
    AI_MODEL_PATH: str = "./models"
    AI_LOG_LEVEL: str = "info"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

settings = Settings()
