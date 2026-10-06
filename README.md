# OmniNexus

OmniNexus is a workforce intelligence operating system built around career-transition analysis, talent matching, workforce observability, and an authenticated identity registry.

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

- `GET /api/v1/health`
- `POST /api/v1/auth/signup`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`
- `POST /api/v1/parse-resume`
- `POST /api/v1/analyze`
- `GET /api/v1/admin/users`

Swagger is available at `/docs` when the backend is running.

## Environment

Frontend:

```env
NEXT_PUBLIC_API_URL=http://localhost:8001
```

Backend environment variables can override the database URL, JWT settings, and CORS origins.

## Quality gates

GitHub Actions runs backend tests plus frontend lint and production build on pushes and pull requests targeting `main`.

> Production redeploy trigger: final Vercel build is ready from commit `5c255ac`.
