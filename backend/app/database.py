from pathlib import Path

from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import declarative_base, sessionmaker

from app.core.config import settings


# ============================================================
# DATABASE CONFIGURATION
# ============================================================

DATABASE_URL = settings.DATABASE_URL


# SQLite needs this for FastAPI's threaded request handling.
connect_args = (
    {"check_same_thread": False}
    if DATABASE_URL.startswith("sqlite")
    else {}
)


# ============================================================
# ENGINE
# ============================================================

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=True,
)


# ============================================================
# SESSION
# ============================================================

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


# ============================================================
# BASE MODEL
# ============================================================

Base = declarative_base()


# ============================================================
# DATABASE INFORMATION
# ============================================================

def get_database_url() -> str:
    """
    Return the configured database URL.

    Useful for debugging without exposing passwords.
    """
    return DATABASE_URL


def get_sqlite_path() -> str | None:
    """
    Return the actual SQLite file path when SQLite is used.
    """

    if not DATABASE_URL.startswith("sqlite"):
        return None

    raw_path = DATABASE_URL.replace("sqlite:///", "", 1)

    path = Path(raw_path)

    if not path.is_absolute():
        path = Path.cwd() / path

    return str(path.resolve())


# ============================================================
# SCHEMA INITIALIZATION
# ============================================================

def ensure_database_schema() -> None:
    """
    Make sure the users table exists and contains
    the columns expected by the current User model.

    IMPORTANT:
    This function should be called AFTER all SQLAlchemy
    models have been imported.
    """

    inspector = inspect(engine)

    # --------------------------------------------------------
    # Create all registered tables
    # --------------------------------------------------------

    Base.metadata.create_all(bind=engine)

    # --------------------------------------------------------
    # Check users table
    # --------------------------------------------------------

    inspector = inspect(engine)

    if not inspector.has_table("users"):
        # At this point, if User has been imported correctly,
        # metadata.create_all() should have created it.
        return

    columns = {
        column["name"]
        for column in inspector.get_columns("users")
    }

    # --------------------------------------------------------
    # Legacy / migration support
    # --------------------------------------------------------

    required_columns = {
        "uuid": "VARCHAR",
        "email": "VARCHAR",
        "password_hash": "VARCHAR",
        "role": "VARCHAR",
        "status": "VARCHAR",
        "last_active": "VARCHAR",
        "is_active": "BOOLEAN",
    }

    with engine.begin() as conn:

        for column_name, column_type in required_columns.items():

            if column_name not in columns:

                conn.execute(
                    text(
                        f"""
                        ALTER TABLE users
                        ADD COLUMN {column_name} {column_type}
                        """
                    )
                )


# ============================================================
# DATABASE SESSION DEPENDENCY
# ============================================================

def get_db():
    """
    FastAPI database dependency.
    """

    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()