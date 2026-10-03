import uuid

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base, get_db
from app.main import app


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
