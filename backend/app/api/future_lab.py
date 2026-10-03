from fastapi import APIRouter, Depends, HTTPException, status
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.future_lab import FutureLabRequest
from app.services.future_lab import simulate_future_lab

router = APIRouter(prefix="/api/v1/future-lab", tags=["future-lab"])


@router.post("/simulate", summary="Simulate a workforce demand shock and reskilling scenario")
def simulate(request: FutureLabRequest, current_user: User = Depends(get_current_user)):
    try:
        return {"status": "success", "simulation": simulate_future_lab(request)}
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
