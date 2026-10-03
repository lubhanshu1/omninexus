from datetime import datetime, timedelta, timezone
from threading import Lock
import time
from typing import Any

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from app.core.config import settings
from app.database import get_db
from app.models.user import User

_RATE_LIMIT_LOCK = Lock()
_RATE_LIMIT_BUCKETS: dict[str, list[float]] = {}


def check_rate_limit(key: str, limit: int, window_seconds: int) -> None:
    now = time.monotonic()
    cutoff = now - window_seconds
    with _RATE_LIMIT_LOCK:
        timestamps = [stamp for stamp in _RATE_LIMIT_BUCKETS.get(key, []) if stamp > cutoff]
        if len(timestamps) >= limit:
            raise HTTPException(status_code=429, detail="Too many attempts. Please try again later.", headers={"Retry-After": str(window_seconds)})
        timestamps.append(now)
        _RATE_LIMIT_BUCKETS[key] = timestamps


def clear_rate_limit(key: str) -> None:
    with _RATE_LIMIT_LOCK:
        _RATE_LIMIT_BUCKETS.pop(key, None)


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer(auto_error=False)


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    return pwd_context.verify(password, password_hash)


def create_access_token(subject: str, expires_delta: timedelta | None = None) -> str:
    if expires_delta is None:
        expires_delta = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    expire = datetime.now(timezone.utc) + expires_delta
    to_encode: dict[str, Any] = {"sub": subject, "exp": expire}
    return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def decode_access_token(token: str) -> str:
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        subject: str | None = payload.get("sub")
        if subject is None:
            raise ValueError("Missing subject")
        return subject
    except (JWTError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    email = decode_access_token(credentials.credentials)
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active or user.status.strip().lower() != "active":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User account is inactive.")
    return user


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role.strip().lower() == "admin" or current_user.email.lower() in settings.ADMIN_EMAILS:
        return current_user
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required.")
