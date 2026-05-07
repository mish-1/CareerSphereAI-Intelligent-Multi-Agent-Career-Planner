from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_name: str = "CareerSphere AI"
    app_env: str = Field(default="development", alias="APP_ENV")
    app_host: str = Field(default="0.0.0.0", alias="APP_HOST")
    app_port: int = Field(default=8000, alias="APP_PORT")
    frontend_url: str = Field(default="http://localhost:3000", alias="FRONTEND_URL")

    database_url: str = Field(default="sqlite:///./careersphere.db", alias="DATABASE_URL")
    qdrant_url: str = Field(default="http://localhost:6333", alias="QDRANT_URL")
    qdrant_api_key: str | None = Field(default=None, alias="QDRANT_API_KEY")
    qdrant_collection: str = Field(default="careersphere_documents", alias="QDRANT_COLLECTION")

    openrouter_api_key: str | None = Field(default=None, alias="OPENROUTER_API_KEY")
    openrouter_base_url: str = Field(default="https://openrouter.ai/api/v1", alias="OPENROUTER_BASE_URL")
    openrouter_model: str = Field(default="deepseek/deepseek-chat-v3-0324", alias="OPENROUTER_MODEL")

    jina_api_key: str | None = Field(default=None, alias="JINA_API_KEY")
    jina_embeddings_url: str = Field(default="https://api.jina.ai/v1/embeddings", alias="JINA_EMBEDDINGS_URL")
    jina_embeddings_model: str = Field(default="jina-embeddings-v3", alias="JINA_EMBEDDINGS_MODEL")

    firebase_project_id: str | None = Field(default=None, alias="FIREBASE_PROJECT_ID")
    firebase_private_key_id: str | None = Field(default=None, alias="FIREBASE_PRIVATE_KEY_ID")
    firebase_client_email: str | None = Field(default=None, alias="FIREBASE_CLIENT_EMAIL")
    firebase_private_key: str | None = Field(default=None, alias="FIREBASE_PRIVATE_KEY")

    redis_url: str = Field(default="redis://localhost:6379/0", alias="REDIS_URL")
    log_level: str = Field(default="INFO", alias="LOG_LEVEL")


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
