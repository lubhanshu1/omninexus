import networkx as nx

SKILL_GRAPH_NODES = {
    "Python": {"val": 5000},
    "SQL": {"val": 4000},
    "Git": {"val": 2000},
    "Data Analysis": {"val": 6000},
    "Machine Learning": {"val": 12000},
    "Deep Learning": {"val": 15000},
    "PyTorch": {"val": 18000},
    "LLMs": {"val": 25000},
    "RAG": {"val": 22000},
    "AI Agents": {"val": 28000},
    "Cloud Computing": {"val": 10000},
    "AWS": {"val": 12000},
    "Docker": {"val": 11000},
    "Kubernetes": {"val": 15000},
    "MLOps": {"val": 20000},
    "CI/CD": {"val": 9000},
    "AI Engineer": {"val": 0},
    "Data Scientist": {"val": 0},
    "MLOps Engineer": {"val": 0},
}

SKILL_GRAPH_EDGES = [
    ("Python", "Data Analysis"),
    ("SQL", "Data Analysis"),
    ("Data Analysis", "Machine Learning"),
    ("Python", "Machine Learning"),
    ("Machine Learning", "Deep Learning"),
    ("Deep Learning", "PyTorch"),
    ("PyTorch", "MLOps"),
    ("MLOps", "AI Engineer"),
    ("PyTorch", "LLMs"),
    ("LLMs", "RAG"),
    ("RAG", "AI Agents"),
    ("AI Agents", "AI Engineer"),
    ("Machine Learning", "Data Scientist"),
    ("Python", "Cloud Computing"),
    ("Cloud Computing", "AWS"),
    ("AWS", "Docker"),
    ("Docker", "Kubernetes"),
    ("Kubernetes", "MLOps"),
    ("CI/CD", "MLOps"),
]


def build_skill_graph() -> nx.DiGraph:
    graph = nx.DiGraph()
    graph.add_nodes_from([(name, attrs.copy()) for name, attrs in SKILL_GRAPH_NODES.items()])
    graph.add_edges_from(SKILL_GRAPH_EDGES)
    return graph


def find_paths_to_role(skill: str, target_role: str, graph: nx.DiGraph | None = None) -> list[list[str]]:
    graph = graph or build_skill_graph()
    try:
        return list(nx.all_simple_paths(graph, source=skill, target=target_role))
    except nx.NetworkXNoPath:
        return []


def find_shortest_career_path(current_skills: list[str], target_role: str, graph: nx.DiGraph | None = None) -> list[str]:
    graph = graph or build_skill_graph()
    all_paths: list[list[str]] = []
    for skill in current_skills:
        if skill not in graph:
            continue
        all_paths.extend(find_paths_to_role(skill, target_role, graph))

    if not all_paths:
        return []

    return min(all_paths, key=len)


def get_skill_dependencies(skill: str, graph: nx.DiGraph | None = None) -> list[str]:
    graph = graph or build_skill_graph()
    if skill not in graph:
        return []
    return sorted(graph.predecessors(skill))


def get_skill_gaps(current_skills: list[str], target_role: str, graph: nx.DiGraph | None = None) -> list[str]:
    graph = graph or build_skill_graph()
    shortest_path = find_shortest_career_path(current_skills, target_role, graph)
    if not shortest_path:
        return []
    return [node for node in shortest_path if node not in current_skills and node != target_role]
