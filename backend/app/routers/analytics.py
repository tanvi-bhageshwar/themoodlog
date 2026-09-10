from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.models.user import User
from backend.app.schemas.analytics import (
    AnalyticsSummary,
    MoodDistributionItem,
    MoodTrendPoint,
    AnalyticsTrendsResponse
)
from backend.app.services.analytics_service import analytics_service
from backend.app.routers.deps import get_current_user

router = APIRouter(prefix="/analytics", tags=["Analytics & Insights"])


@router.get("/summary", response_model=AnalyticsSummary)
def get_analytics_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve statistical summary of journal activity, streaks, and grounded observations."""
    data = analytics_service.get_analytics(db, current_user.id)
    return data.summary


@router.get("/trends", response_model=AnalyticsTrendsResponse)
def get_analytics_trends(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve full analytics bundle: summary stats, mood distribution, and longitudinal intensity trends."""
    return analytics_service.get_analytics(db, current_user.id)


@router.get("/moods", response_model=List[MoodDistributionItem])
def get_mood_distribution(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve mood frequency distribution and proportions."""
    data = analytics_service.get_analytics(db, current_user.id)
    return data.distribution
