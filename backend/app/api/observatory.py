from fastapi import APIRouter
from app.services.skill_intelligence import get_market_leaderboard

router = APIRouter(prefix="/api/v1/observatory", tags=["observatory"])

@router.get("/snapshot", summary="Get workforce observatory snapshot")
def snapshot():
    skills = get_market_leaderboard(10)
    return {
        "status": "success",
        "source": "hackathon-analysis",
        "market": {
            "top_skills": skills,
            "skills_tracked": len(skills),
        },
        "signals": {
            "experience_salary_rho": 0.6332,
            "job_title_anova_f": 154.48,
            "posting_salary_rho": -0.4089,
            "interpretation": "Observed associations in the supplied hackathon sample; not causal estimates.",
        },
    }
