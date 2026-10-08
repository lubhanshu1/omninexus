from __future__ import annotations

from app.services.skill_graph import (
    SKILL_GRAPH_NODES,
    build_skill_graph,
    find_paths_to_role,
    ROLE_NODES,
)


def analyze_career_path(
    current_skills: list[str],
    target_role: str,
) -> dict:
    """
    Calculate a deterministic career-transition path.

    The engine:
    - normalizes incoming skill names
    - handles an already-reached target role
    - evaluates paths from all known current skills
    - prefers the path with the fewest missing capabilities
    - returns readiness, gaps, bottleneck and market value
    """

    graph = build_skill_graph()

    target_role = str(target_role or "").strip()
    canonical_roles = {role.lower(): role for role in ROLE_NODES}
    target_role = canonical_roles.get(target_role.lower(), target_role)
    if target_role not in ROLE_NODES:
        return {
            "status": "error",
            "message": f"Unknown target role '{target_role}'.",
        }

    known_by_lower = {
        name.lower(): name
        for name in SKILL_GRAPH_NODES
    }

    normalized_skills: list[str] = []
    seen: set[str] = set()

    for raw_skill in current_skills or []:
        raw = str(raw_skill).strip()
        if not raw:
            continue
        canonical = known_by_lower.get(raw.lower())
        if canonical and canonical not in ROLE_NODES and canonical not in seen:
            normalized_skills.append(canonical)
            seen.add(canonical)

    if target_role in normalized_skills:
        return {
            "status": "success",
            "target_role": target_role,
            "shortest_path": [target_role],
            "current_skills": normalized_skills,
            "missing_skills": [],
            "bottleneck_skill": "None",
            "readiness_score": 100,
            "market_value": 60000 + sum(
                SKILL_GRAPH_NODES.get(skill, {}).get("val", 0)
                for skill in normalized_skills
            ),
        }

    candidate_paths: list[list[str]] = []

    for skill in normalized_skills:
        if skill == target_role or skill not in graph:
            continue
        candidate_paths.extend(
            find_paths_to_role(skill, target_role, graph)
        )

    if not candidate_paths:
        return {
            "status": "error",
            "message": (
                f"No skill path found from the current capabilities "
                f"to '{target_role}'."
            ),
        }

    current_set = set(normalized_skills)

    def path_score(path: list[str]) -> tuple[int, int]:
        missing = sum(
            1
            for node in path
            if node != target_role and node not in current_set
        )
        return missing, len(path)

    best_path = min(candidate_paths, key=path_score)

    required_skills = [
        node for node in best_path
        if node != target_role
    ]

    missing_skills = [
        node for node in required_skills
        if node not in current_set
    ]

    acquired_count = len(required_skills) - len(missing_skills)
    readiness_score = (
        round((acquired_count / len(required_skills)) * 100)
        if required_skills
        else 100
    )

    bottleneck_skill = (
        max(missing_skills, key=lambda skill: SKILL_GRAPH_NODES.get(skill, {}).get("val", 0))
        if missing_skills
        else "None"
    )

    market_value = 60000 + sum(
        SKILL_GRAPH_NODES.get(skill, {}).get("val", 0)
        for skill in normalized_skills
    )

    return {
        "status": "success",
        "target_role": target_role,
        "shortest_path": best_path,
        "current_skills": normalized_skills,
        "missing_skills": missing_skills,
        "bottleneck_skill": bottleneck_skill,
        "readiness_score": min(100, max(0, readiness_score)),
        "market_value": market_value,
    }
