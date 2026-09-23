from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health_check():
    response = client.get('/api/v1/health')
    assert response.status_code == 200
    assert response.json()['status'] == 'healthy'


def test_signup_and_login_flow():
    signup = client.post('/api/v1/auth/signup', json={'email': 'phase1@example.com', 'password': 'StrongPass123!'})
    assert signup.status_code == 200
    assert signup.json()['status'] == 'success'

    login = client.post('/api/v1/auth/login', json={'email': 'phase1@example.com', 'password': 'StrongPass123!'})
    assert login.status_code == 200
    assert login.json()['status'] == 'success'
    token = login.json()['token']
    assert token

    me = client.get('/api/v1/auth/me', headers={'Authorization': f'Bearer {token}'})
    assert me.status_code == 200
    assert me.json()['email'] == 'phase1@example.com'


def test_invalid_password_and_duplicate_email():
    duplicate = client.post('/api/v1/auth/signup', json={'email': 'phase1@example.com', 'password': 'OtherPass123!'})
    assert duplicate.status_code == 409

    invalid = client.post('/api/v1/auth/login', json={'email': 'phase1@example.com', 'password': 'WrongPass123!'})
    assert invalid.status_code == 401


def test_parse_resume_and_analyze():
    payload = {'resume_text': 'I know Python, SQL, AWS, Docker, and MLOps.'}
    parsed = client.post('/api/v1/parse-resume', json=payload)
    assert parsed.status_code == 200
    assert 'Python' in parsed.json()['extracted_skills']

    analyzed = client.post('/api/v1/analyze', json={'current_skills': ['Python', 'SQL'], 'target_role': 'AI Engineer'})
    assert analyzed.status_code == 200
    assert analyzed.json()['status'] == 'success'
