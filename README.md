# OmniNexus

OmniNexus is a workforce intelligence operating system built around career-transition analysis, talent matching, workforce observability, and an authenticated identity registry.

## Hackathon Analytics Foundation

For the SAS CU Hackathon, OmniNexus uses the four supplied datasets as an evidence pipeline:

- **Data Science Jobs** — market demand, job titles, experience and compensation
- **Analytics Jobs** — analytics roles, descriptions, skills, location and salary
- **JDS Skill Traits** — technical skill signals associated with the supplied junior outcome
- **SDS Personality Traits** — personality-trait signals associated with the supplied senior outcome

The Round 2 analytics pipeline performs:

`quality audit -> preparation -> EDA -> statistical testing -> ML comparison -> feature interpretation -> intelligence layer`

The public repository does **not** contain the raw hackathon datasets. It contains the reproducible analytical code and documentation.

### Round 2 documents

- [Approach Note](docs/APPROACH_NOTE.md)
- [Analytics Pipeline](analysis/README.md)
- [Evidence outputs](analysis/)

## Architecture

- **Frontend:** Next.js 16 + React 19 + TypeScript + Tailwind CSS v4
- **Career graph:** React Flow
- **Backend:** FastAPI + SQLAlchemy
- **Database:** SQLite by default
- **Authentication:** JWT
- **Career engine:** NetworkX skill graph
- **Deployment-ready:** Vercel-compatible frontend and FastAPI-compatible backend

## Local development

### Backend

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8001
```

### Frontend

Copy `frontend/.env.example` to `frontend/.env.local`, then:

```powershell
cd frontend
npm install
npm run dev
```

The frontend defaults to `http://localhost:3000` and the API to `http://localhost:8001`.

## Core modules

| Route | Purpose |
| --- | --- |
| `/career-simulator` | Skill graph, readiness analysis and career transition simulation |
| `/recruiter` | Talent matching and candidate intelligence |
| `/observatory` | Workforce/system observability |
| `/database` | Authenticated identity registry and diagnostics |
| `/login` | JWT authentication |

## API

Core endpoints:

- `GET /api/v1/health` — liveness/health check
- `GET /api/v1/system/status` — database-backed readiness/status check
- `POST /api/v1/auth/signup` — create an account
- `POST /api/v1/auth/login` — issue a JWT
- `POST /api/v1/auth/logout` — revoke the current token version
- `GET /api/v1/auth/me` — authenticated identity
- `POST /api/v1/parse-resume` — extract skills from resume text
- `POST /api/v1/parse-resume-file` — parse supported resume files
- `POST /api/v1/analyze` — graph-based career analysis
- `POST /api/v1/talent-match` — candidate matching
- `GET /api/v1/observatory/snapshot` — workforce/market snapshot
- `GET /api/v1/admin/users` — admin-only identity registry

Swagger/OpenAPI is enabled outside production. In production, `ENVIRONMENT=production` disables `/docs`, `/redoc`, and `/openapi.json`.

## Environment

### Frontend

Copy `frontend/.env.example` to `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8001
```

For deployment, set `NEXT_PUBLIC_API_URL` to the public HTTPS backend URL.

### Backend

Copy `backend/.env.example` and provide real production values:

```env
JWT_SECRET_KEY=<at-least-32-character-random-secret>
ENVIRONMENT=production
DATABASE_URL=<postgresql-connection-string>
CORS_ORIGINS=https://<your-frontend-domain>
ACCESS_TOKEN_EXPIRE_MINUTES=30
ADMIN_EMAILS=<comma-separated-admin-emails>
```

**Production note:** SQLite is the local-development default. Use PostgreSQL (or another persistent managed SQL database) for deployment; do not rely on an ephemeral filesystem for production user data.

The backend intentionally fails fast when `JWT_SECRET_KEY` is missing or shorter than 32 characters.

## Quality gates

GitHub Actions runs backend tests plus frontend lint and production build on pushes and pull requests targeting `main`.

> Production redeploy trigger: final Vercel build is ready from commit `5c255ac`.
