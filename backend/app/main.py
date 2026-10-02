from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi

from app.api.admin import router as admin_router
from app.api.auth import router as auth_router
from app.api.career import router as career_router
from app.api.health import router as health_router

from app.core.config import settings
from app.database import ensure_database_schema


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
        print(f"✓ Database URL         : {settings.DATABASE_URL}")

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
        print(f"Database initialization failed:")
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

    docs_url="/docs",

    redoc_url="/redoc",

    openapi_url="/openapi.json",
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,

    allow_origins=settings.CORS_ORIGINS,

    # Vercel preview + production domains, while preserving local development.
    allow_origin_regex=r"^https://([a-z0-9-]+\.)*vercel\.app$|^http://localhost(:\d+)?$|^http://127\.0\.0\.1(:\d+)?$",

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
async def system_status():
    """
    Lightweight system status endpoint.

    Useful for:
        - frontend dashboards
        - observatory
        - monitoring
        - deployment verification
    """

    return {
        "status": "online",

        "service": (
            "OmniNexus Intelligence API"
        ),

        "version": app.version,

        "environment": (
            getattr(
                settings,
                "ENVIRONMENT",
                "development",
            )
        ),

        "modules": {
            "authentication": "online",
            "career": "online",
            "database": "online",
            "health": "online",
            "admin": "online",
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

        "database_engine": "SQLite",

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