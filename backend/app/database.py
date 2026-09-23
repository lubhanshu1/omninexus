from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import declarative_base, sessionmaker

from app.core.config import settings

connect_args = {"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(settings.DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def ensure_database_schema() -> None:
    inspector = inspect(engine)
    if not inspector.has_table("users"):
        Base.metadata.create_all(bind=engine)
        return

    columns = {column["name"] for column in inspector.get_columns("users")}
    with engine.begin() as conn:
        for column_name, column_type in {
            "uuid": "VARCHAR",
            "email": "VARCHAR",
            "password_hash": "VARCHAR",
            "role": "VARCHAR",
            "status": "VARCHAR",
            "last_active": "VARCHAR",
            "is_active": "BOOLEAN",
        }.items():
            if column_name not in columns:
                conn.execute(text(f"ALTER TABLE users ADD COLUMN {column_name} {column_type}"))


Base.metadata.create_all(bind=engine)
ensure_database_schema()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
