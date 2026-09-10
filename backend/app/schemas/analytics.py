from datetime import datetime
from typing import List, Optional, Dict
from pydantic import BaseModel


class MoodDistributionItem(BaseModel):
    mood: str
    count: int
    percentage: float
    color: str


class MoodTrendPoint(BaseModel):
    date: str
    timestamp: datetime
    mood: str
    intensity: int
    sentiment: str
    entry_id: int


class DailyActivity(BaseModel):
    date: str
    count: int
    average_intensity: float


class AnalyticsSummary(BaseModel):
    total_entries: int
    average_intensity: float
    dominant_mood: Optional[str] = None
    recent_mood: Optional[str] = None
    entries_this_week: int
    entries_this_month: int
    current_streak_days: int
    insights: List[str]


class AnalyticsTrendsResponse(BaseModel):
    summary: AnalyticsSummary
    distribution: List[MoodDistributionItem]
    trend_points: List[MoodTrendPoint]
    daily_history: List[DailyActivity]
