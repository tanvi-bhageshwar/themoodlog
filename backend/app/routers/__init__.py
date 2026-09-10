from backend.app.routers.auth import router as auth_router
from backend.app.routers.journal import router as journal_router
from backend.app.routers.analytics import router as analytics_router

__all__ = ["auth_router", "journal_router", "analytics_router"]
