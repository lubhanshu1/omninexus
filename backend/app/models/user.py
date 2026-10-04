import uuid

from datetime import datetime, timezone

from sqlalchemy import Boolean, Column, Integer, String

from app.database import Base


class User(Base):

    __tablename__ = "users"

    # ========================================================
    # PRIMARY KEY
    # ========================================================

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    # ========================================================
    # PUBLIC USER UUID
    # ========================================================

    uuid = Column(
        String(50),
        unique=True,
        index=True,
        nullable=False,
        default=lambda: f"usr_{uuid.uuid4().hex[:8]}",
    )

    # ========================================================
    # EMAIL
    # ========================================================

    email = Column(
        String(255),
        unique=True,
        index=True,
        nullable=False,
    )

    # ========================================================
    # PASSWORD
    # ========================================================

    password_hash = Column(
        String(255),
        nullable=False,
    )

    # ========================================================
    # ROLE
    # ========================================================

    role = Column(
        String(100),
        nullable=False,
        default="Talent Node",
    )

    # ========================================================
    # STATUS
    # ========================================================

    status = Column(
        String(50),
        nullable=False,
        default="Active",
    )

    # ========================================================
    # ACTIVITY
    # ========================================================

    last_active = Column(
        String(100),
        nullable=False,
        default="Just now",
    )

    # ========================================================
    # SESSION VERSION
    # ========================================================

    token_version = Column(
        Integer,
        nullable=False,
        default=0,
    )

    # ========================================================
    # ACTIVE FLAG
    # ========================================================

    is_active = Column(
        Boolean,
        nullable=False,
        default=True,
    )