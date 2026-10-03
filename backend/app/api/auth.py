from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.security import (
    create_access_token,
    get_current_user,
    hash_password,
    verify_password,
    check_rate_limit,
    clear_rate_limit,
)
from app.database import get_db
from app.models.user import User
from app.schemas.auth import (
    LoginRequest,
    SignupRequest,
    TokenResponse,
    UserResponse,
)


router = APIRouter(
    prefix="/api/v1/auth",
    tags=["auth"],
)


# ============================================================
# HELPERS
# ============================================================

def normalize_email(email: str) -> str:
    """
    Normalize email addresses so:
    Test@Email.com
    test@email.com
    test@email.com
    are treated consistently.
    """
    return email.strip().lower()


# ============================================================
# SIGN UP
# ============================================================

@router.post(
    "/signup",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a user account",
)
def signup(
    request: SignupRequest,
    http_request: Request,
    db: Session = Depends(get_db),
):
    email = normalize_email(request.email)
    ip = http_request.client.host if http_request.client else "unknown"
    check_rate_limit(f"signup-ip:{ip}", 10, 600)
    check_rate_limit(f"signup-email:{email}", 5, 600)

    # --------------------------------------------------------
    # Basic validation
    # --------------------------------------------------------

    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is required.",
        )

    if not request.password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password is required.",
        )

    # --------------------------------------------------------
    # Check existing user
    # --------------------------------------------------------

    existing = (
        db.query(User)
        .filter(User.email == email)
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered.",
        )

    # --------------------------------------------------------
    # Create user
    # --------------------------------------------------------

    user = User(
        email=email,
        password_hash=hash_password(request.password),
    )

    try:
        db.add(user)
        db.commit()
        db.refresh(user)

    except IntegrityError:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered.",
        )

    except Exception:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to create user account.",
        )

    # --------------------------------------------------------
    # Create JWT
    # --------------------------------------------------------

    token = create_access_token(user.email)

    return {
        "status": "success",
        "token": token,
    }


# ============================================================
# LOGIN
# ============================================================

@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Authenticate and return a token",
)
def login(
    request: LoginRequest,
    http_request: Request,
    db: Session = Depends(get_db),
):
    email = normalize_email(request.email)
    ip = http_request.client.host if http_request.client else "unknown"
    rate_key = f"login:{ip}:{email}"
    check_rate_limit(rate_key, 8, 300)

    # --------------------------------------------------------
    # Find user
    # --------------------------------------------------------

    user = (
        db.query(User)
        .filter(User.email == email)
        .first()
    )

    # --------------------------------------------------------
    # Validate credentials
    # --------------------------------------------------------

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={
                "WWW-Authenticate": "Bearer",
            },
        )

    if not user.is_active or user.status.strip().lower() != "active":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive.",
        )

    if not verify_password(
        request.password,
        user.password_hash,
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={
                "WWW-Authenticate": "Bearer",
            },
        )

    clear_rate_limit(rate_key)
    user.last_active = datetime.now(timezone.utc).isoformat()
    db.commit()

    # --------------------------------------------------------
    # Create JWT
    # --------------------------------------------------------

    token = create_access_token(user.email)

    return {
        "status": "success",
        "token": token,
    }


# ============================================================
# CURRENT USER
# ============================================================

@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get current authenticated user",
)
def get_me(
    current_user: User = Depends(get_current_user),
):
    return current_user