from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import model_validator
from typing import List, Optional
from urllib.parse import quote_plus

class Settings(BaseSettings):
    DATABASE_URL: Optional[str] = None
    POSTGRES_USER: Optional[str] = None
    POSTGRES_PASSWORD: Optional[str] = None
    POSTGRES_SERVER: Optional[str] = None
    POSTGRES_PORT: Optional[int] = 5432
    POSTGRES_DB: Optional[str] = None

    SECRET_KEY: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    ALLOWED_ORIGINS: str = 'http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://127.0.0.1:3000,http://localhost,http://localhost:80'

    @property
    def allowed_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(',')]

    @model_validator(mode='after')
    def assemble_db_connection(self):
        if not self.DATABASE_URL:
            if self.POSTGRES_SERVER and self.POSTGRES_DB:
                user = quote_plus(self.POSTGRES_USER) if self.POSTGRES_USER else ''
                password = quote_plus(self.POSTGRES_PASSWORD) if self.POSTGRES_PASSWORD else ''
                auth = f"{user}:{password}@" if user or password else ""
                port = f":{self.POSTGRES_PORT}" if self.POSTGRES_PORT else ""
                self.DATABASE_URL = f"postgresql://{auth}{self.POSTGRES_SERVER}{port}/{self.POSTGRES_DB}"
            else:
                raise ValueError("Either DATABASE_URL or POSTGRES_SERVER and POSTGRES_DB must be set")
        return self

    model_config = SettingsConfigDict(env_file='.env', env_file_encoding='utf-8', extra='ignore')

settings = Settings()
