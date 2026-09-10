from collections import Counter
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func

from backend.app.models.journal import JournalEntry
from backend.app.schemas.analytics import (
    AnalyticsSummary,
    MoodDistributionItem,
    MoodTrendPoint,
    DailyActivity,
    AnalyticsTrendsResponse
)

MOOD_COLORS: Dict[str, str] = {
    "happy": "#10b981",    # Emerald
    "excited": "#f59e0b",  # Amber
    "neutral": "#94a3b8",  # Slate
    "anxious": "#8b5cf6",  # Violet
    "stressed": "#f43f5e", # Rose
    "sad": "#0ea5e9",      # Sky Blue
    "angry": "#ef4444",    # Crimson Red
}


class AnalyticsService:
    """
    Analytics engine providing longitudinal insights, emotional trends,
    frequency distributions, and consecutive-day streaks.
    """

    @staticmethod
    def get_analytics(db: Session, user_id: int) -> AnalyticsTrendsResponse:
        """
        Calculate full analytics summary, distribution, and timeline trends
        for the authenticated user.
        """
        now = datetime.utcnow()
        week_ago = now - timedelta(days=7)
        month_ago = now - timedelta(days=30)

        # Retrieve all non-deleted entries for this user, ordered by creation date
        entries: List[JournalEntry] = db.query(JournalEntry).filter(
            JournalEntry.user_id == user_id,
            JournalEntry.deleted_at.is_(None)
        ).order_by(JournalEntry.created_at.asc()).all()

        total_entries = len(entries)

        if total_entries == 0:
            summary = AnalyticsSummary(
                total_entries=0,
                average_intensity=0.0,
                dominant_mood=None,
                recent_mood=None,
                entries_this_week=0,
                entries_this_month=0,
                current_streak_days=0,
                insights=[
                    "Welcome to MoodLog! Write your first journal entry above to start uncovering personal emotional trends."
                ]
            )
            return AnalyticsTrendsResponse(
                summary=summary,
                distribution=[],
                trend_points=[],
                daily_history=[]
            )

        # 1. Calculate Intensity & Mood Counts
        total_intensity = sum(e.intensity for e in entries)
        avg_intensity = round(total_intensity / total_entries, 1)

        mood_counts = Counter(e.mood.lower() for e in entries)
        dominant_mood, dominant_count = mood_counts.most_common(1)[0]
        recent_entry = entries[-1]
        recent_mood = recent_entry.mood.lower()

        # 2. Entries this week and month
        entries_this_week = sum(1 for e in entries if e.created_at >= week_ago)
        entries_this_month = sum(1 for e in entries if e.created_at >= month_ago)

        # 3. Consecutive Day Streak Calculation
        entry_dates = sorted(list({e.created_at.date() for e in entries}))
        streak = 0
        today_date = now.date()
        yesterday_date = today_date - timedelta(days=1)

        if entry_dates:
            latest_date = entry_dates[-1]
            if latest_date == today_date or latest_date == yesterday_date:
                # User logged today or yesterday, streak is active
                current_check = latest_date
                for d in reversed(entry_dates):
                    if d == current_check:
                        streak += 1
                        current_check -= timedelta(days=1)
                    elif d < current_check:
                        break

        # 4. Mood Distribution List
        distribution: List[MoodDistributionItem] = []
        for mood, count in mood_counts.items():
            percentage = round((count / total_entries) * 100, 1)
            distribution.append(
                MoodDistributionItem(
                    mood=mood,
                    count=count,
                    percentage=percentage,
                    color=MOOD_COLORS.get(mood, "#94a3b8")
                )
            )
        distribution.sort(key=lambda x: x.count, reverse=True)

        # 5. Timeline Trend Points (Last 30 entries or all)
        trend_points: List[MoodTrendPoint] = []
        for e in entries[-30:]:
            trend_points.append(
                MoodTrendPoint(
                    date=e.created_at.strftime("%b %d, %H:%M"),
                    timestamp=e.created_at,
                    mood=e.mood.capitalize(),
                    intensity=e.intensity,
                    sentiment=e.sentiment,
                    entry_id=e.id
                )
            )

        # 6. Daily History (aggregation per day for bar/area charts)
        day_map: Dict[str, List[int]] = {}
        for e in entries:
            day_str = e.created_at.strftime("%Y-%m-%d")
            if day_str not in day_map:
                day_map[day_str] = []
            day_map[day_str].append(e.intensity)

        daily_history: List[DailyActivity] = []
        for day_str, intensities in sorted(day_map.items()):
            daily_history.append(
                DailyActivity(
                    date=day_str,
                    count=len(intensities),
                    average_intensity=round(sum(intensities) / len(intensities), 1)
                )
            )

        # 7. Grounded, Data-Driven Observations (Non-clinical)
        insights: List[str] = []
        insights.append(f"You have logged {total_entries} total reflection{'s' if total_entries != 1 else ''} in your private journal.")
        if entries_this_week > 0:
            insights.append(f"You recorded {entries_this_week} reflection{'s' if entries_this_week != 1 else ''} over the past 7 days.")
        insights.append(f"Your most frequent emotional tone is '{dominant_mood}' ({dominant_count} time{'s' if dominant_count != 1 else ''}, {round(dominant_count / total_entries * 100)}% of entries).")
        insights.append(f"Average emotional intensity across your logs is {avg_intensity}/10.")
        if streak > 1:
            insights.append(f"You are currently on a {streak}-day active journaling streak! Regular reflection builds mindful self-awareness.")

        summary = AnalyticsSummary(
            total_entries=total_entries,
            average_intensity=avg_intensity,
            dominant_mood=dominant_mood,
            recent_mood=recent_mood,
            entries_this_week=entries_this_week,
            entries_this_month=entries_this_month,
            current_streak_days=streak,
            insights=insights
        )

        return AnalyticsTrendsResponse(
            summary=summary,
            distribution=distribution,
            trend_points=trend_points,
            daily_history=daily_history[-14:]  # Last 14 active days
        )


analytics_service = AnalyticsService()
