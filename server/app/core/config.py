from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Environment / App Variables
    DATABASE_URL: str
    SECRET_KEY: str
    PORT: int = 8000
    NEXT_PUBLIC_API_URL: str
    copernicus_client_id: str | None = None
    copernicus_client_secret: str | None = None
    use_live_satellite: bool = False
    GEMINI_API_KEY: str

    # Gemini Models
    GENERATION_MODEL: str = "gemini-2.5-flash"
    EMBEDDING_MODEL: str = "gemini-embedding-001"

    # Knowledge Base / Vector Store
    KNOWLEDGE_BASE_DIR: str = "app/knowledge_base/docs"
    VECTOR_DB_DIR: str = "data/chroma_db"
    COLLECTION_NAME: str = "crop_knowledge"

    # Chunking Configuration
    CHUNK_SIZE: int = 150
    CHUNK_OVERLAP: int = 20

    # Retrieval Configuration
    TOP_K_RESULTS: int = 4

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()

# Backwards compatibility aliases
GEMINI_API_KEY = settings.GEMINI_API_KEY
GENERATION_MODEL = settings.GENERATION_MODEL
EMBEDDING_MODEL = settings.EMBEDDING_MODEL
KNOWLEDGE_BASE_DIR = settings.KNOWLEDGE_BASE_DIR
VECTOR_DB_DIR = settings.VECTOR_DB_DIR
COLLECTION_NAME = settings.COLLECTION_NAME
CHUNK_SIZE = settings.CHUNK_SIZE
CHUNK_OVERLAP = settings.CHUNK_OVERLAP
TOP_K_RESULTS = settings.TOP_K_RESULTS
