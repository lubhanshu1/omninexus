import re

from app.services.skill_graph import SKILL_GRAPH_NODES


def extract_skills_from_resume(resume_text: str) -> list[str]:
    text = resume_text.lower()
    extracted = [skill for skill in SKILL_GRAPH_NODES if skill.lower() in text]
    return extracted if extracted else ["Python"]
