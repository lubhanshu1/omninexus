import os
from typing import List

from dotenv import load_dotenv

load_dotenv()


class Settings:
    def __init__(self) -> None:
        self.DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./omninexus.db")

        jwt_secret = os.getenv("JWT_SECRET_KEY")
        if not jwt_secret:
            raise RuntimeError(
                "JWT_SECRET_KEY must be set to a strong random secret before starting OmniNexus."
            )
        if len(jwt_secret) < 32:
            raise RuntimeError("JWT_SECRET_KEY must be at least 32 characters long.")
        self.JWT_SECRET_KEY = jwt_secret

        self.JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
        self.ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
        self.ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
        self.ADMIN_EMAILS = {
            email.strip().lower()
            for email in os.getenv("ADMIN_EMAILS", "").split(",")
            if email.strip()
        }

        cors_value = os.getenv(
            "CORS_ORIGINS",
            "http://localhost:3000,http://localhost:3001,http://127.0.0.1:3000,http://127.0.0.1:3001,https://omninexus.vercel.app",
        )
        self.CORS_ORIGINS: List[str] = [
            origin.strip() for origin in cors_value.split(",") if origin.strip()
        ]


settings = Settings()
