import uuid

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base, get_db
from app.main import app
from app.core.security import _RATE_LIMIT_BUCKETS, _RATE_LIMIT_LOCK


@pytest.fixture()
def client(tmp_path):
    database_url = f"sqlite:///{tmp_path / 'test.db'}"
    engine = create_engine(database_url, connect_args={"check_same_thread": False})
    Session = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base.metadata.create_all(bind=engine)

    def override_get_db():
        db = Session()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
    Base.metadata.drop_all(bind=engine)
    with _RATE_LIMIT_LOCK:
        _RATE_LIMIT_BUCKETS.clear()


def unique_email():
    return f"test-{uuid.uuid4().hex}@example.com"


def create_user(client, email=None):
    email = email or unique_email()
    response = client.post(
        "/api/v1/auth/signup",
        json={"email": email, "password": "StrongPass123!"},
    )
    assert response.status_code == 201
    return email, response.json()["token"]


def test_health_check(client):
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_signup_and_login_flow(client):
    email = unique_email()
    signup = client.post(
        "/api/v1/auth/signup",
        json={"email": email, "password": "StrongPass123!"},
    )
    assert signup.status_code == 201

    login = client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": "StrongPass123!"},
    )
    assert login.status_code == 200
    token = login.json()["token"]

    me = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert me.status_code == 200
    assert me.json()["email"] == email


def test_invalid_password_and_duplicate_email(client):
    email, _ = create_user(client)

    duplicate = client.post(
        "/api/v1/auth/signup",
        json={"email": email, "password": "OtherPass123!"},
    )
    assert duplicate.status_code == 409

    invalid = client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": "WrongPass123!"},
    )
    assert invalid.status_code == 401


def test_parse_resume_and_analyze(client):
    _, token = create_user(client)
    headers = {"Authorization": f"Bearer {token}"}

    payload = {"resume_text": "I know Python, SQL, AWS, Docker, and MLOps."}
    parsed = client.post("/api/v1/parse-resume", json=payload, headers=headers)
    assert parsed.status_code == 200
    assert "Python" in parsed.json()["extracted_skills"]

    analyzed = client.post(
        "/api/v1/analyze",
        json={"current_skills": ["Python", "SQL"], "target_role": "AI Engineer"},
        headers=headers,
    )
    assert analyzed.status_code == 200
    assert analyzed.json()["status"] == "success"


def test_admin_requires_admin_role(client):
    _, token = create_user(client)
    response = client.get(
        "/api/v1/admin/users",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 403


def test_all_supported_roles_are_reachable(client):
    _, token = create_user(client)
    headers = {"Authorization": f"Bearer {token}"}
    roles = [
        "AI Engineer",
        "Data Scientist",
        "MLOps Engineer",
        "AI Product Engineer",
        "Machine Learning Engineer",
    ]
    for role in roles:
        response = client.post(
            "/api/v1/analyze",
            json={"current_skills": ["Python", "Git"], "target_role": role},
            headers=headers,
        )
        assert response.status_code == 200, role


def test_career_analysis_normalizes_role_and_rejects_unknown_target(client):
    _, token = create_user(client)
    headers = {"Authorization": f"Bearer {token}"}

    normalized = client.post(
        "/api/v1/analyze",
        json={"current_skills": ["Python"], "target_role": "ai engineer"},
        headers=headers,
    )
    assert normalized.status_code == 200
    normalized_payload = normalized.json()
    assert normalized_payload["explainability"]["target_role"] == "AI Engineer"
    assert normalized_payload["market_skill_gaps"]

    unknown = client.post(
        "/api/v1/analyze",
        json={"current_skills": ["Python"], "target_role": "Docker"},
        headers=headers,
    )
    assert unknown.status_code == 404


def test_logout_revokes_token(client):
    _, token = create_user(client)
    headers = {"Authorization": f"Bearer {token}"}

    logout = client.post("/api/v1/auth/logout", headers=headers)
    assert logout.status_code == 200

    me = client.get("/api/v1/auth/me", headers=headers)
    assert me.status_code == 401


def test_admin_endpoint_rejects_non_admin(client):
    email, token = create_user(client)
    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/api/v1/admin/users", headers=headers)
    assert response.status_code == 403
    assert email


def test_password_rejects_nul(client):
    response = client.post(
        "/api/v1/auth/signup",
        json={"email": unique_email(), "password": "Strong\u0000Pass123!"},
    )
    assert response.status_code == 422


def test_career_analysis_handles_empty_skills_and_whitespace(client):
    _, token = create_user(client)
    headers = {"Authorization": f"Bearer {token}"}

    response = client.post(
        "/api/v1/analyze",
        json={"current_skills": ["", "Python", " python "], "target_role": " AI Engineer "},
        headers=headers,
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] == "success"
    assert payload["normalized_skills"] == ["Python"]


def test_resume_file_rejects_unsupported_format(client):
    _, token = create_user(client)
    response = client.post(
        "/api/v1/parse-resume-file",
        headers={"Authorization": f"Bearer {token}"},
        files={"file": ("resume.exe", b"not a resume", "application/octet-stream")},
    )
    assert response.status_code == 415


def test_observatory_snapshot(client):
    response = client.get("/api/v1/observatory/snapshot")
    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] == "success"
    assert "top_skills" in payload["market"]
    assert "experience_salary_rho" in payload["signals"]


def test_career_analysis_exposes_graph_evidence(client):
    _, token = create_user(client)
    response = client.post(
        "/api/v1/analyze",
        json={"current_skills": ["Python", "Git"], "target_role": "AI Engineer"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    evidence = response.json()["explainability"]
    assert evidence["method"] == "deterministic shortest-path skill graph analysis"
    assert evidence["target_role"] == "AI Engineer"
    assert evidence["path_length"] >= 1
    assert 0 <= evidence["graph_coverage_percent"] <= 100
    assert evidence["required_skills"]



def test_talent_match_ranks_candidates_with_graph_intelligence(client):
    _, token = create_user(client)
    response = client.post(
        "/api/v1/talent-match",
        json={
            "target_role": "ai engineer",
            "candidates": [
                {"name": "Candidate B", "current_skills": ["Python", "Machine Learning", "Deep Learning", "PyTorch", "MLOps"]},
                {"name": "Candidate A", "current_skills": ["Python"]},
            ],
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] == "success"
    assert payload["target_role"] == "AI Engineer"
    assert payload["candidate_count"] == 2
    assert payload["matches"][0]["name"] == "Candidate B"
    assert payload["matches"][0]["score"] > payload["matches"][1]["score"]
    assert payload["matches"][0]["shortest_path"]
    assert "market_signals" in payload["matches"][0]


def test_talent_match_rejects_blank_candidate_name(client):
    _, token = create_user(client)
    response = client.post(
        "/api/v1/talent-match",
        json={
            "target_role": "AI Engineer",
            "candidates": [{"name": "   ", "current_skills": ["Python"]}],
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 422


def test_talent_match_normalizes_duplicate_skills(client):
    _, token = create_user(client)
    response = client.post(
        "/api/v1/talent-match",
        json={
            "target_role": "AI Engineer",
            "candidates": [
                {
                    "name": "Candidate Clean",
                    "current_skills": [" Python ", "python", "", "Machine Learning"],
                }
            ],
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    candidate = response.json()["matches"][0]
    assert candidate["current"] == ["Python", "Machine Learning"]
