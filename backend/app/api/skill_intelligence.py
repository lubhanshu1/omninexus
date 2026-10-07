from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.skill_intelligence import analyze_skills, get_market_leaderboard


router = APIRouter(
    prefix="/api/v1/skill-intelligence",
    tags=["skill-intelligence"],
)


class SkillIntelligenceRequest(BaseModel):
    skills: list[str] = Field(default_factory=list, max_length=100)
    target_role: str | None = Field(default=None, max_length=100)


@router.post("/analyze", summary="Analyze skills against hackathon market signals")
def analyze(request: SkillIntelligenceRequest):
    if not request.skills:
        raise HTTPException(status_code=422, detail="Provide at least one skill.")
    return analyze_skills(request.skills, request.target_role)


@router.get("/leaderboard", summary="Get top skills from the analyzed hackathon sample")
def leaderboard(limit: int = 10):
    if limit < 1 or limit > 15:
        raise HTTPException(status_code=422, detail="limit must be between 1 and 15.")
    return {
        "status": "success",
        "items": get_market_leaderboard(limit),
        "source_note": (
            "Derived from the supplied hackathon Analytics Jobs sample; "
            "not a live labour-market feed."
        ),
    }
