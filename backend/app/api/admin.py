from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.core.security import get_current_user


router = APIRouter(
    prefix="/api/v1/admin",
    tags=["admin"],
)


@router.get(
    "/users",
    summary="Get registered users",
)
def get_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Return safe user information for the System Database Console.

    Password hashes are intentionally never returned.
    """

    users = (
        db.query(User)
        .order_by(User.id.desc())
        .all()
    )

    return {
        "status": "success",
        "count": len(users),
        "data": [
            {
                "id": user.id,
                "uuid": user.uuid,
                "email": user.email,
                "role": user.role,
                "status": user.status,
                "last_active": user.last_active,
                "is_active": user.is_active,
            }
            for user in users
        ],
    }