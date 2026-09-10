from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging

from backend.app.config import settings
from backend.app.database import engine, Base
# Import all models to ensure registration in Base.metadata
from backend.app.models import User, JournalEntry
from backend.app.routers import auth_router, journal_router, analytics_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("moodlog")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan: ensures database tables exist on startup."""
    logger.info("Initializing database schemas...")
    Base.metadata.create_all(bind=engine)
    logger.info("Database initialized successfully.")
    yield
    logger.info("Shutting down MoodLog service.")


app = FastAPI(
    title="MoodLog API",
    description=(
        "Production-grade RESTful API for MoodLog: an AI-assisted personal mood journaling "
        "and longitudinal emotional wellness platform. Features JWT authentication, safety gating, "
        "structured emotional taxonomy classification, empathetic reflections, and analytics."
    ),
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permits preview iframe & local development origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Modular Routers
app.include_router(auth_router, prefix=settings.API_PREFIX)
app.include_router(journal_router, prefix=settings.API_PREFIX)
app.include_router(analytics_router, prefix=settings.API_PREFIX)


@app.get("/api/health", tags=["Health"])
def health_check():
    """System health check and runtime status."""
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
    }


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Catch-all exception handler preventing raw stack traces from reaching clients."""
    logger.error(f"Unhandled error on {request.method} {request.url}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An unexpected server error occurred. Please try again later."}
    )
