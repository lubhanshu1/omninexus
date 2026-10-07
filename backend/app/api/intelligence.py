from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.intelligence_engine import build_intelligence


router = APIRouter(prefix="/api/v1/intelligence", tags=["intelligence"])


class IntelligenceRequest(BaseModel):
    skills: list[str] = Field(default_factory=list, max_length=100)
    target_role: str | None = Field(default=None, max_length=100)


@router.post("/analyze", summary="Build unified evidence-backed career intelligence")
def analyze(request: IntelligenceRequest):
    if not request.skills:
        raise HTTPException(status_code=422, detail="Provide at least one skill.")
    return build_intelligence(request.skills, request.target_role)
