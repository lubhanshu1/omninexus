import re

from app.services.skill_graph import SKILL_GRAPH_NODES

ALIASES = {
    "machine learning": "Machine Learning",
    "ml": "Machine Learning",
    "deep learning": "Deep Learning",
    "pytorch": "PyTorch",
    "large language models": "LLMs",
    "llm": "LLMs",
    "retrieval augmented generation": "RAG",
    "rag": "RAG",
    "ai agents": "AI Agents",
    "cloud": "Cloud Computing",
    "aws": "AWS",
    "docker": "Docker",
    "kubernetes": "Kubernetes",
    "mlops": "MLOps",
    "ci/cd": "CI/CD",
    "data analysis": "Data Analysis",
    "pandas": "Pandas",
    "statistics": "Statistics",
    "visualization": "Visualization",
    "sql": "SQL",
    "python": "Python",
    "git": "Git",
}

ROLE_NODES = {
    "AI Engineer",
    "Data Scientist",
    "MLOps Engineer",
    "AI Product Engineer",
    "Machine Learning Engineer",
}


def extract_skills_from_resume(resume_text: str) -> list[str]:
    text = resume_text.lower()
    extracted: set[str] = set()

    for phrase, canonical in sorted(ALIASES.items(), key=lambda item: -len(item[0])):
        if re.search(rf"(?<!\\w){re.escape(phrase)}(?!\\w)", text):
            extracted.add(canonical)

    # Only include graph capabilities, never role nodes.
    extracted.intersection_update(set(SKILL_GRAPH_NODES) - ROLE_NODES)
    return sorted(extracted)
