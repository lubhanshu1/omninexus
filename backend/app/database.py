from datetime import datetime, timezone
from pathlib import Path
import uuid

from sqlalchemy import create_engine, inspect, text
from sqlalchemy.engine import make_url
from sqlalchemy.orm import declarative_base, sessionmaker

from app.core.config import settings

DATABASE_URL = settings.DATABASE_URL
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+psycopg://", 1)
if DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg://", 1)

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(DATABASE_URL, connect_args=connect_args, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_database_url() -> str:
    return make_url(DATABASE_URL).render_as_string(hide_password=True)


def get_sqlite_path() -> str | None:
    if not DATABASE_URL.startswith("sqlite"):
        return None
    raw_path = DATABASE_URL.replace("sqlite:///", "", 1)
    path = Path(raw_path)
    if not path.is_absolute():
        path = Path.cwd() / path
    return str(path.resolve())


def ensure_database_schema() -> None:
    """Create registered tables and safely backfill legacy user columns.

    Keep this legacy compatibility migration dialect-neutral. In particular,
    PostgreSQL boolean columns must use TRUE rather than integer literal 1.
    Existing complete rows are not rewritten on every startup.
    """
    Base.metadata.create_all(bind=engine)
    inspector = inspect(engine)
    if not inspector.has_table("users"):
        return

    columns = {column["name"] for column in inspector.get_columns("users")}
    required_columns = {
        "uuid": "VARCHAR",
        "email": "VARCHAR",
        "password_hash": "VARCHAR",
        "role": "VARCHAR",
        "status": "VARCHAR",
        "last_active": "VARCHAR",
        "is_active": "BOOLEAN",
        "token_version": "INTEGER",
    }

    with engine.begin() as conn:
        for column_name, column_type in required_columns.items():
            if column_name not in columns:
                conn.execute(text(f"ALTER TABLE users ADD COLUMN {column_name} {column_type}"))

        conn.execute(text("CREATE UNIQUE INDEX IF NOT EXISTS ux_users_uuid ON users(uuid)"))
        now = datetime.now(timezone.utc).isoformat()
        rows = conn.execute(text(
            "SELECT id, uuid, role, status, last_active, is_active, token_version FROM users"
        )).fetchall()

        for user_id, user_uuid, role, status_value, last_active, is_active, token_version in rows:
            needs_update = (
                not user_uuid or not role or not status_value or not last_active
                or is_active is None or token_version is None
            )
            if not needs_update:
                continue
            conn.execute(
                text(
                    "UPDATE users SET "
                    "uuid = COALESCE(NULLIF(uuid, ''), :uuid), "
                    "role = COALESCE(NULLIF(role, ''), 'user'), "
                    "status = COALESCE(NULLIF(status, ''), 'Active'), "
                    "last_active = COALESCE(NULLIF(last_active, ''), :last_active), "
                    "is_active = COALESCE(is_active, TRUE), "
                    "token_version = COALESCE(token_version, 0) "
                    "WHERE id = :id"
                ),
                {"uuid": f"usr_{uuid.uuid4().hex}", "last_active": now, "id": user_id},
            )


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
