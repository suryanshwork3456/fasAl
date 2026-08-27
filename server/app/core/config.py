from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    database_url: str
    SECRET_KEY: str
    PORT: int = 8000
    NEXT_PUBLIC_API_URL : str 
    GEMINI_API_KEY : str

    model_config = SettingsConfigDict(env_file=".env",env_file_encoding="utf-8")

settings = Settings()