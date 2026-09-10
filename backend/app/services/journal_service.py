from datetime import datetime
from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, desc, asc

from backend.app.models.journal import JournalEntry
from backend.app.schemas.journal import JournalCreate, JournalUpdate, JournalResponse, MoodCategory
from backend.app.services.safety_service import safety_service
from backend.app.services.ai_service import ai_service


class JournalService:
    """
    Core Journal management service handling entries, safety gating,
    AI emotional tone analysis, and strict user-ownership enforcement.
    """

    @staticmethod
    async def create_entry(db: Session, user_id: int, entry_in: JournalCreate) -> JournalEntry:
        """
        Create a new journal entry:
        1. Safety detection gating (self-harm / suicide ideation check).
        2. If safety triggered, log safety alert, bypass normal AI, return crisis guidance.
        3. If safe, query AI service for structured classification & reflection.
        4. Persist to database with foreign key to user_id.
        """
        clean_content = entry_in.content.strip()
        if len(clean_content) < 3:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Journal content must be at least 3 characters long."
            )

        # 1. Safety Check
        is_distress, safety_msg = safety_service.check_distress(clean_content)

        if is_distress and safety_msg:
            entry = JournalEntry(
                user_id=user_id,
                content=clean_content,
                mood=MoodCategory.SAD.value,
                intensity=9,
                confidence=0.99,
                ai_response=safety_msg,
                sentiment="negative",
                is_distress=True,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
            )
        else:
            # 2. Structured AI Classification & Reflection
            ai_result = await ai_service.analyze_entry(clean_content)
            entry = JournalEntry(
                user_id=user_id,
                content=clean_content,
                mood=ai_result.mood.value,
                intensity=ai_result.intensity,
                confidence=ai_result.confidence,
                ai_response=ai_result.ai_response,
                sentiment=ai_result.sentiment,
                is_distress=False,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
            )

        db.add(entry)
        db.commit()
        db.refresh(entry)
        return entry

    @staticmethod
    def get_user_entries(
        db: Session,
        user_id: int,
        search: Optional[str] = None,
        mood: Optional[str] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        sort_order: str = "newest",
        limit: int = 50,
        offset: int = 0
    ) -> List[JournalEntry]:
        """
        Retrieve journal entries strictly scoped to the authenticated user.
        Supports full-text filtering, mood filtering, date scoping, and sorting.
        """
        query = db.query(JournalEntry).filter(
            JournalEntry.user_id == user_id,
            JournalEntry.deleted_at.is_(None)
        )

        # Mood filter
        if mood and mood.lower() != "all":
            query = query.filter(JournalEntry.mood == mood.lower())

        # Search filter
        if search and search.strip():
            search_pattern = f"%{search.strip()}%"
            query = query.filter(
                or_(
                    JournalEntry.content.ilike(search_pattern),
                    JournalEntry.ai_response.ilike(search_pattern)
                )
            )

        # Date range filter
        if start_date:
            query = query.filter(JournalEntry.created_at >= start_date)
        if end_date:
            query = query.filter(JournalEntry.created_at <= end_date)

        # Sorting
        if sort_order.lower() == "oldest":
            query = query.order_by(asc(JournalEntry.created_at))
        else:
            query = query.order_by(desc(JournalEntry.created_at))

        return query.offset(offset).limit(limit).all()

    @staticmethod
    def get_entry_by_id(db: Session, entry_id: int, user_id: int) -> JournalEntry:
        """
        Retrieve a specific entry with STRICT ownership verification.
        Raises 404 if not found or if the entry belongs to a different user.
        """
        entry = db.query(JournalEntry).filter(
            JournalEntry.id == entry_id,
            JournalEntry.deleted_at.is_(None)
        ).first()

        if not entry or entry.user_id != user_id:
            # Prevent enumeration / unauthorized access
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Journal entry not found."
            )

        return entry

    @staticmethod
    async def update_entry(db: Session, entry_id: int, user_id: int, entry_in: JournalUpdate) -> JournalEntry:
        """
        Update an existing journal entry and re-run AI reflection.
        Enforces strict ownership check.
        """
        entry = JournalService.get_entry_by_id(db, entry_id, user_id)
        clean_content = entry_in.content.strip()
        if len(clean_content) < 3:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Journal content must be at least 3 characters long."
            )

        # Re-run safety and AI analysis on modified content
        is_distress, safety_msg = safety_service.check_distress(clean_content)
        if is_distress and safety_msg:
            entry.content = clean_content
            entry.mood = MoodCategory.SAD.value
            entry.intensity = 9
            entry.ai_response = safety_msg
            entry.sentiment = "negative"
            entry.is_distress = True
        else:
            ai_result = await ai_service.analyze_entry(clean_content)
            entry.content = clean_content
            entry.mood = ai_result.mood.value
            entry.intensity = ai_result.intensity
            entry.confidence = ai_result.confidence
            entry.ai_response = ai_result.ai_response
            entry.sentiment = ai_result.sentiment
            entry.is_distress = False

        entry.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(entry)
        return entry

    @staticmethod
    def delete_entry(db: Session, entry_id: int, user_id: int) -> bool:
        """
        Soft-delete an entry after verifying ownership.
        """
        entry = JournalService.get_entry_by_id(db, entry_id, user_id)
        entry.deleted_at = datetime.utcnow()
        db.commit()
        return True


journal_service = JournalService()
