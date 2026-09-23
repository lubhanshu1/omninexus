from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi

from app.api.auth import router as auth_router
from app.api.career import router as career_router
from app.api.health import router as health_router
from app.core.config import settings

app = FastAPI(
    title="OmniNexus Intelligence API",
    description="Career intelligence, skill graph analysis, and authentication endpoints for OmniNexus.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(auth_router)
app.include_router(career_router)


@app.get("/", include_in_schema=False)
def root():
    return {"message": "OmniNexus API is running"}


def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    openapi_schema = get_openapi(
        title=app.title,
        version=app.version,
        description=app.description,
        routes=app.routes,
    )
    app.openapi_schema = openapi_schema
    return app.openapi_schema


app.openapi = custom_openapi
