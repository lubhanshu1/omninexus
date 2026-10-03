from app.schemas.future_lab import FutureLabRequest

ROLE_PROFILES = {
    "AI Engineer": {"readiness": 22, "market": 14.2, "critical": ["Machine Learning", "LLMs", "RAG", "MLOps"]},
    "Machine Learning Engineer": {"readiness": 26, "market": 13.6, "critical": ["Machine Learning", "Deep Learning", "PyTorch", "MLOps"]},
    "Data Scientist": {"readiness": 34, "market": 11.8, "critical": ["Statistics", "SQL", "Machine Learning", "Data Analysis"]},
    "MLOps Engineer": {"readiness": 18, "market": 15.1, "critical": ["Docker", "CI/CD", "Kubernetes", "MLOps"]},
    "AI Product Engineer": {"readiness": 29, "market": 13.1, "critical": ["LLMs", "RAG", "AI Agents", "Cloud Computing"]},
}

SKILL_IMPACT = {
    "Machine Learning": 14, "Deep Learning": 12, "PyTorch": 10, "LLMs": 16,
    "RAG": 13, "AI Agents": 12, "MLOps": 18, "Docker": 8,
    "Cloud Computing": 9, "CI/CD": 7, "Kubernetes": 6,
}


def _clamp(value: int, low: int, high: int) -> int:
    return min(high, max(low, value))


def simulate_future_lab(request: FutureLabRequest) -> dict:
    profile = ROLE_PROFILES.get(request.target_role)
    if profile is None:
        raise ValueError(f"Unsupported target role: {request.target_role}")

    readiness = _clamp(
        profile["readiness"] + round(request.reskill_people * 2.15) - round(request.demand_shock * 0.22),
        5,
        98,
    )
    base_demand, base_supply = 5839, 3421
    demand = round(base_demand * (1 + request.demand_shock / 100))
    supply = round(base_supply * (1 + request.reskill_people / 180))
    gap = round(((demand - supply) / demand) * 100)
    hiring_need = max(0, round((demand - supply) / 180))
    risk = _clamp(round(48 + request.demand_shock * 0.72 - request.reskill_people * 0.9), 8, 96)
    market_value = round(profile["market"] + readiness * 0.045, 1)

    skills = []
    for index, skill in enumerate(profile["critical"]):
        coverage = _clamp(
            round(28 + request.reskill_people * 2.4 + (3 - index) * 5 - request.demand_shock * 0.35),
            8,
            97,
        )
        priority = "Critical" if index == 0 else "High" if index < 3 else "Medium"
        skills.append({
            "skill": skill,
            "impact": SKILL_IMPACT.get(skill, 8),
            "coverage": coverage,
            "priority": priority,
        })

    return {
        "target_role": request.target_role,
        "readiness": readiness,
        "demand": demand,
        "supply": supply,
        "gap": gap,
        "market_value": market_value,
        "hiring_need": hiring_need,
        "risk": risk,
        "skills": skills,
        "recommended_transition": profile["critical"][:2],
        "model_version": "future-lab-1.0",
    }
