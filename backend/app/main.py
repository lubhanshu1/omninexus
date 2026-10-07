from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi
from fastapi.responses import JSONResponse

from app.api.admin import router as admin_router
from app.api.auth import router as auth_router
from app.api.career import router as career_router
from app.api.future_lab import router as future_lab_router
from app.api.health import router as health_router
from app.api.skill_intelligence import router as skill_intelligence_router

from app.core.config import settings
from app.database import ensure_database_schema, get_db


# ============================================================
# OMNINEXUS STARTUP / SHUTDOWN LIFECYCLE
# ============================================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifecycle manager.

    Startup:
        - Initializes database schema
        - Verifies database availability

    Shutdown:
        - Gracefully closes the application
    """

    print()
    print("=" * 70)
    print("                 OMNINEXUS INTELLIGENCE API")
    print("=" * 70)
    print("INITIALIZING SYSTEM...")
    print("-" * 70)

    try:
        # ----------------------------------------------------
        # DATABASE INITIALIZATION
        # ----------------------------------------------------

        ensure_database_schema()

        print("✓ Database schema      : READY")
        from sqlalchemy.engine import make_url
        safe_db_url = make_url(settings.DATABASE_URL).render_as_string(hide_password=True)
        print(f"✓ Database URL         : {safe_db_url}")

        # ----------------------------------------------------
        # API CONFIGURATION
        # ----------------------------------------------------

        print("✓ Authentication       : ENABLED")
        print("✓ JWT Security         : ENABLED")
        print("✓ Career Intelligence  : ENABLED")
        print("✓ Database Console     : ENABLED")
        print("✓ CORS                 : CONFIGURED")

        print("-" * 70)
        print("OMNINEXUS STATUS       : ONLINE")
        print("=" * 70)
        print()

    except Exception as exc:
        print()
        print("=" * 70)
        print("OMNINEXUS STARTUP FAILURE")
        print("=" * 70)
        print("Database initialization failed:")
        print(str(exc))
        print("=" * 70)
        print()

        raise

    yield

    # ========================================================
    # SHUTDOWN
    # ========================================================

    print()
    print("=" * 70)
    print("OMNINEXUS INTELLIGENCE API SHUTDOWN")
    print("=" * 70)
    print("System shutdown complete.")
    print("=" * 70)
    print()


# ============================================================
# APPLICATION
# ============================================================

app = FastAPI(
    title="OmniNexus Intelligence API",

    description="""
OmniNexus Workforce Intelligence API.

Core capabilities:

• Secure authentication
• Talent identity management
• Career intelligence
• Skill graph analysis
• Workforce forecasting
• System health monitoring
• Authenticated database administration
""",

    version="1.1.0",

    lifespan=lifespan,

    docs_url="/docs" if settings.ENVIRONMENT != "production" else None,

    redoc_url="/redoc" if settings.ENVIRONMENT != "production" else None,

    openapi_url="/openapi.json" if settings.ENVIRONMENT != "production" else None,
)


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    """Return a JSON error with CORS headers instead of a browser-level CORS failure."""
    origin = request.headers.get("origin")
    headers = {}
    if origin and origin in settings.CORS_ORIGINS:
        headers["Access-Control-Allow-Origin"] = origin
        headers["Vary"] = "Origin"
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error."},
        headers=headers,
    )


@app.middleware("http")
async def request_size_guard(request: Request, call_next):
    content_length = request.headers.get("content-length")
    if content_length:
        try:
            if int(content_length) > 1_000_000:
                return JSONResponse(
                    status_code=413,
                    content={"detail": "Request body is too large."},
                )
        except ValueError:
            return JSONResponse(status_code=400, content={"detail": "Invalid Content-Length."})
    return await call_next(request)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,

    allow_origins=settings.CORS_ORIGINS,

    # Vercel preview + production domains, while preserving local development.
    # Authentication uses an explicit Authorization header, not browser cookies.
    allow_credentials=False,

    allow_methods=["*"],

    allow_headers=["*"],
)


# ============================================================
# API ROUTERS
# ============================================================

# ------------------------------------------------------------
# Health
# ------------------------------------------------------------

app.include_router(
    health_router,
)


# ------------------------------------------------------------
# Skill Intelligence
# ------------------------------------------------------------

app.include_router(
    skill_intelligence_router,
)


# ------------------------------------------------------------
# Authentication
# ------------------------------------------------------------

app.include_router(
    auth_router,
)


# ------------------------------------------------------------
# Career Intelligence
# ------------------------------------------------------------

app.include_router(
    career_router,
)


# ------------------------------------------------------------
# Future Shock Intelligence
# ------------------------------------------------------------

app.include_router(
    future_lab_router,
)


# ------------------------------------------------------------
# Database / Administration
# ------------------------------------------------------------

app.include_router(
    admin_router,
)


# ============================================================
# ROOT SYSTEM ENDPOINT
# ============================================================

@app.get(
    "/",
    include_in_schema=False,
)
async def root():
    """
    OmniNexus root endpoint.
    """

    return {
        "status": "online",

        "service": (
            "OmniNexus Intelligence API"
        ),

        "version": app.version,

        "message": (
            "OmniNexus API is running"
        ),

        "modules": {
            "authentication": True,
            "career_intelligence": True,
            "skill_graph": True,
            "database_console": True,
            "health_monitoring": True,
        },
    }


# ============================================================
# SYSTEM STATUS
# ============================================================

@app.get(
    "/api/v1/system/status",
    tags=["system"],
    summary="Get OmniNexus system status",
)
async def system_status(db=Depends(get_db)):
    """
    Lightweight system status endpoint.

    Useful for:
        - frontend dashboards
        - observatory
        - monitoring
        - deployment verification
    """

    try:
        from sqlalchemy import text
        db.execute(text("SELECT 1"))
        database_status = "online"
        overall = "online"
    except Exception:
        database_status = "offline"
        overall = "degraded"

    return {
        "status": overall,
        "service": "OmniNexus Intelligence API",
        "version": app.version,
        "environment": settings.ENVIRONMENT,
        "modules": {
            "authentication": "online",
            "career": "online",
            "database": database_status,
            "health": "online",
            "admin": "online",
        },
        "checks": {
            "database_query": database_status == "online",
        },
    }


# ============================================================
# OPENAPI CUSTOMIZATION
# ============================================================

def custom_openapi():
    """
    Customize Swagger/OpenAPI schema.

    Adds JWT Bearer authentication so protected
    endpoints can be tested directly from Swagger.
    """

    if app.openapi_schema:
        return app.openapi_schema

    openapi_schema = get_openapi(
        title=app.title,

        version=app.version,

        description=app.description,

        routes=app.routes,
    )

    # --------------------------------------------------------
    # JWT SECURITY
    # --------------------------------------------------------

    if "components" not in openapi_schema:
        openapi_schema["components"] = {}

    if "securitySchemes" not in openapi_schema["components"]:
        openapi_schema["components"][
            "securitySchemes"
        ] = {}

    openapi_schema["components"][
        "securitySchemes"
    ]["BearerAuth"] = {
        "type": "http",

        "scheme": "bearer",

        "bearerFormat": "JWT",

        "description": (
            "Enter your OmniNexus JWT token."
        ),
    }

    # --------------------------------------------------------
    # API METADATA
    # --------------------------------------------------------

    openapi_schema["info"]["x-omninexus"] = {
        "platform": "Workforce Intelligence OS",

        "authentication": "JWT",

        "database": "SQLAlchemy",

        "database_engine": "PostgreSQL" if settings.DATABASE_URL.startswith(("postgres://", "postgresql://", "postgresql+psycopg://")) else "SQLite",

        "modules": [
            "Authentication",
            "Career Intelligence",
            "Skill Graph",
            "Database Console",
            "Health Monitoring",
        ],
    }

    app.openapi_schema = openapi_schema

    return app.openapi_schema


app.openapi = custom_openapi