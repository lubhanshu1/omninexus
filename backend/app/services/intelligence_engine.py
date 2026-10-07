"""Unified OmniNexus Intelligence Engine.

This layer composes the evidence-backed market and skill signals already derived
from the supplied hackathon datasets. It deliberately separates observed market
signals from model-derived career signals so the UI can explain what is evidence
and what is inference.
"""

from __future__ import annotations

from app.services.skill_intelligence import analyze_skills, ROLE_SKILLS


JDS_MODEL_SIGNALS = [
    {"feature": "Dashboard & Storytelling", "importance": 0.3242, "source": "JDS Skill Traits", "type": "model_signal"},
    {"feature": "Maths & Statistics", "importance": 0.2469, "source": "JDS Skill Traits", "type": "model_signal"},
    {"feature": "Coding", "importance": 0.1610, "source": "JDS Skill Traits", "type": "model_signal"},
    {"feature": "AI & ML", "importance": 0.1453, "source": "JDS Skill Traits", "type": "model_signal"},
    {"feature": "Big Data", "importance": 0.1226, "source": "JDS Skill Traits", "type": "model_signal"},
]

SDS_MODEL_SIGNALS = [
    {"feature": "Conscientiousness", "importance": 0.3562, "source": "SDS Personality Traits", "type": "model_signal"},
    {"feature": "Openness to Experience", "importance": 0.3364, "source": "SDS Personality Traits", "type": "model_signal"},
    {"feature": "Extraversion", "importance": 0.1428, "source": "SDS Personality Traits", "type": "model_signal"},
    {"feature": "Agreeableness", "importance": 0.1347, "source": "SDS Personality Traits", "type": "model_signal"},
    {"feature": "Neuroticism", "importance": 0.0299, "source": "SDS Personality Traits", "type": "model_signal"},
]

MODEL_METRICS = {
    "jds": {"selected_model": "Logistic Regression", "accuracy": 0.8193, "roc_auc": 0.9032},
    "sds": {"selected_model": "Random Forest", "accuracy": 0.9564, "roc_auc": 0.9922},
}


def build_intelligence(skills: list[str], target_role: str | None = None) -> dict:
    market = analyze_skills(skills, target_role)
    normalized = market["normalized_skills"]
    required = ROLE_SKILLS.get(target_role or "", [])

    owned = {skill.lower() for skill in normalized}
    readiness = round(
        100 * (sum(skill.lower() in owned for skill in required) / len(required)),
        1,
    ) if required else None

    missing = [skill for skill in required if skill.lower() not in owned]

    return {
        "status": "success",
        "profile": {
            "skills": normalized,
            "target_role": target_role,
            "readiness_score": readiness,
        },
        "market": {
            "overall_opportunity_score": market["overall_opportunity_score"],
            "signals": market["market_signals"],
            "source_note": market["source_note"],
        },
        "skill_gap": {
            "required": required,
            "missing": missing,
            "count": len(missing),
        },
        "success_signals": {
            "junior": JDS_MODEL_SIGNALS,
            "senior": SDS_MODEL_SIGNALS,
            "metrics": MODEL_METRICS,
            "interpretation_note": (
                "Model signals are associations learned from the supplied "
                "hackathon samples; they are not causal rules or hiring criteria."
            ),
        },
        "evidence": [
            {
                "label": "Experience ↔ salary",
                "value": "Spearman rho 0.6332; p < 0.001",
                "type": "statistical",
            },
            {
                "label": "Job title ↔ salary",
                "value": "ANOVA F 154.48; p < 0.001",
                "type": "statistical",
            },
            {
                "label": "Posting volume ↔ salary",
                "value": "Spearman rho -0.4089; p < 0.001",
                "type": "statistical",
            },
        ],
        "traceability": {
            "datasets": [
                "Data Science Jobs",
                "Analytics Jobs",
                "JDS Skill Traits",
                "SDS Personality Traits",
            ],
            "note": (
                "Market values come from the supplied Analytics Jobs sample; "
                "statistical and model signals come from the documented hackathon analysis."
            ),
        },
    }
