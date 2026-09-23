from fastapi import APIRouter

router = APIRouter(prefix="/api/v1", tags=["health"])


@router.get("/health", summary="Health check", description="Check whether the OmniNexus API is available.")
def health_check():
    return {
        "status": "healthy",
        "service": "OmniNexus Intelligence API",
    }
