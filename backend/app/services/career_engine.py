from app.services.skill_graph import build_skill_graph, find_shortest_career_path, get_skill_gaps


class CareerAnalysisResult(dict):
    pass


def analyze_career_path(current_skills: list[str], target_role: str) -> dict:
    graph = build_skill_graph()
    shortest_path = find_shortest_career_path(current_skills, target_role, graph)
    if not shortest_path:
        return {
            "status": "error",
            "message": f"No skill path found for target role '{target_role}'",
        }

    acquired = [skill for skill in shortest_path if skill in current_skills]
    missing_skills = [skill for skill in shortest_path if skill not in current_skills and skill != target_role]
    bottleneck_skill = shortest_path[1] if len(shortest_path) > 1 else "None"
    readiness_score = int((len(acquired) / len(shortest_path)) * 100) if shortest_path else 0

    return {
        "status": "success",
        "shortest_path": shortest_path,
        "current_skills": current_skills,
        "missing_skills": missing_skills,
        "bottleneck_skill": bottleneck_skill,
        "readiness_score": readiness_score,
        "market_value": 60000 + sum(
            SKILL_GRAPH_NODES.get(skill, {}).get("val", 0) for skill in current_skills if skill in SKILL_GRAPH_NODES
        ),
    }


from app.services.skill_graph import SKILL_GRAPH_NODES
