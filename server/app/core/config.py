from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str
    SECRET_KEY: str
    PORT: int = 8000
    NEXT_PUBLIC_API_URL: str

    copernicus_client_id: str | None = None
    copernicus_client_secret: str | None = None
    use_live_satellite: bool = False

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
