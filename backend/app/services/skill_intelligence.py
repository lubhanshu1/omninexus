"""OmniNexus Skill Intelligence Engine.

This module contains a compact summary of the supplied hackathon Analytics Jobs
analysis. Raw hackathon datasets are intentionally not stored in this repo.

Signals:
- postings = number of Analytics Jobs records mentioning the normalized skill
- salary_mid_lakh = mean supplied salary-band midpoint for those records

These are sample-level signals, not live labour-market statistics.
"""

from __future__ import annotations

import re
from typing import Iterable


MARKET_SKILL_SIGNALS = {
    "SQL": {"postings": 915, "salary_mid_lakh": 12.697814},
    "Analytics": {"postings": 904, "salary_mid_lakh": 14.199668},
    "Python": {"postings": 840, "salary_mid_lakh": 14.006548},
    "Finance": {"postings": 756, "salary_mid_lakh": 13.581349},
    "Java": {"postings": 726, "salary_mid_lakh": 15.475895},
    "SAS": {"postings": 636, "salary_mid_lakh": 17.139151},
    "Business Analysis": {"postings": 633, "salary_mid_lakh": 12.483412},
    "Machine Learning": {"postings": 629, "salary_mid_lakh": 16.594595},
    "Data Analysis": {"postings": 618, "salary_mid_lakh": 11.538835},
    "Digital Marketing": {"postings": 566, "salary_mid_lakh": 9.133392},
    "JavaScript": {"postings": 535, "salary_mid_lakh": 12.218692},
    "Project Management": {"postings": 505, "salary_mid_lakh": 14.617822},
    "SEO": {"postings": 495, "salary_mid_lakh": 7.625253},
    "Data Analytics": {"postings": 412, "salary_mid_lakh": 16.809466},
    "Sales": {"postings": 404, "salary_mid_lakh": 13.993812},
}

ALIASES = {
    "py": "Python",
    "python3": "Python",
    "sql server": "SQL",
    "structured query language": "SQL",
    "ml": "Machine Learning",
    "machine-learning": "Machine Learning",
    "business analyst": "Business Analysis",
    "business analytics": "Business Analysis",
    "data analyst": "Data Analysis",
    "data analysis": "Data Analysis",
    "js": "JavaScript",
    "javascript": "JavaScript",
    "sas programming": "SAS",
}

ROLE_SKILLS = {
    "AI Engineer": ["Python", "Machine Learning", "Data Analysis"],
    "Data Scientist": ["Python", "SQL", "Data Analysis", "Machine Learning"],
    "MLOps Engineer": ["Python", "Machine Learning", "SQL"],
    "AI Product Engineer": ["Python", "JavaScript", "SQL", "Machine Learning"],
    "Machine Learning Engineer": ["Python", "Machine Learning", "SQL", "Data Analysis"],
}


def normalize_skill(skill: str) -> str | None:
    cleaned = re.sub(r"\s+", " ", str(skill).strip()).lower()
    if not cleaned:
        return None
    if cleaned in ALIASES:
        return ALIASES[cleaned]
    for canonical in MARKET_SKILL_SIGNALS:
        if cleaned == canonical.lower():
            return canonical
    return str(skill).strip()


def normalize_skills(skills: Iterable[str]) -> list[str]:
    seen = set()
    result = []
    for raw in skills:
        canonical = normalize_skill(raw)
        if canonical and canonical not in seen:
            seen.add(canonical)
            result.append(canonical)
    return result


def _percentile(value: float, values: list[float]) -> float:
    lower = sum(v < value for v in values)
    equal = sum(v == value for v in values)
    return round(100 * (lower + 0.5 * equal) / len(values), 1) if values else 0.0


def analyze_skills(skills: Iterable[str], target_role: str | None = None) -> dict:
    normalized = normalize_skills(skills)
    demand_values = [float(v["postings"]) for v in MARKET_SKILL_SIGNALS.values()]
    salary_values = [float(v["salary_mid_lakh"]) for v in MARKET_SKILL_SIGNALS.values()]
    market = []

    for skill in normalized:
        signal = MARKET_SKILL_SIGNALS.get(skill)
        if not signal:
            market.append({
                "skill": skill,
                "known_market_signal": False,
                "opportunity_score": None,
            })
            continue

        demand_index = _percentile(float(signal["postings"]), demand_values)
        salary_index = _percentile(float(signal["salary_mid_lakh"]), salary_values)
        opportunity = round(0.60 * demand_index + 0.40 * salary_index, 1)

        market.append({
            "skill": skill,
            "known_market_signal": True,
            "postings": int(signal["postings"]),
            "demand_index": demand_index,
            "salary_mid_lakh": round(float(signal["salary_mid_lakh"]), 2),
            "salary_index": salary_index,
            "opportunity_score": opportunity,
        })

    required = ROLE_SKILLS.get(target_role or "", [])
    owned = {s.lower() for s in normalized}
    gaps = [
        {
            "skill": skill,
            "priority": "critical" if index == 0 else "high",
            "reason": "Required by the selected OmniNexus role profile.",
        }
        for index, skill in enumerate(required)
        if skill.lower() not in owned
    ]

    known_scores = [x["opportunity_score"] for x in market if x["opportunity_score"] is not None]
    overall = round(sum(known_scores) / len(known_scores), 1) if known_scores else 0.0

    return {
        "status": "success",
        "normalized_skills": normalized,
        "target_role": target_role,
        "role_requirements": required,
        "skill_gaps": gaps,
        "market_signals": market,
        "overall_opportunity_score": overall,
        "source_note": (
            "Derived from the supplied hackathon Analytics Jobs sample. "
            "Demand is record mentions; salary is the mean salary-band midpoint. "
            "This is not a live-market feed."
        ),
    }


def get_market_leaderboard(limit: int = 10) -> list[dict]:
    result = analyze_skills(MARKET_SKILL_SIGNALS.keys())["market_signals"]
    return sorted(result, key=lambda x: x["opportunity_score"] or 0, reverse=True)[:limit]
