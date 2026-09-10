from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.models.user import User
from backend.app.schemas.journal import JournalCreate, JournalUpdate, JournalResponse
from backend.app.services.journal_service import journal_service
from backend.app.routers.deps import get_current_user

router = APIRouter(prefix="/entries", tags=["Journal Entries"])


@router.post("", response_model=JournalResponse, status_code=status.HTTP_201_CREATED)
async def create_journal_entry(
    entry_in: JournalCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Submit a private journal entry:
    - Analyzes content for crisis distress (immediate supportive guidance if flagged).
    - Classifies mood, emotional intensity (1-10), and confidence.
    - Generates empathetic, non-clinical AI reflection.
    - Persists securely linked to the authenticated user.
    """
    entry = await journal_service.create_entry(db, current_user.id, entry_in)
    return JournalResponse.model_validate(entry)


@router.get("", response_model=List[JournalResponse])
def get_journal_entries(
    search: Optional[str] = Query(None, description="Search keyword in journal or AI response"),
    mood: Optional[str] = Query(None, description="Filter by mood taxonomy"),
    start_date: Optional[datetime] = Query(None, description="Filter entries starting from date"),
    end_date: Optional[datetime] = Query(None, description="Filter entries up to date"),
    sort_order: str = Query("newest", pattern="^(newest|oldest)$", description="Sort order"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve user's private journal entries with optional search, filtering, and sorting."""
    entries = journal_service.get_user_entries(
        db=db,
        user_id=current_user.id,
        search=search,
        mood=mood,
        start_date=start_date,
        end_date=end_date,
        sort_order=sort_order,
        limit=limit,
        offset=offset
    )
    return [JournalResponse.model_validate(e) for e in entries]


@router.get("/{entry_id}", response_model=JournalResponse)
def get_journal_entry(
    entry_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve a single journal entry by ID. Strict ownership check enforced."""
    entry = journal_service.get_entry_by_id(db, entry_id=entry_id, user_id=current_user.id)
    return JournalResponse.model_validate(entry)


@router.put("/{entry_id}", response_model=JournalResponse)
async def update_journal_entry(
    entry_id: int,
    entry_in: JournalUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a journal entry and re-analyze emotional tone. Enforces user ownership."""
    entry = await journal_service.update_entry(db, entry_id=entry_id, user_id=current_user.id, entry_in=entry_in)
    return JournalResponse.model_validate(entry)


@router.delete("/{entry_id}", status_code=status.HTTP_200_OK)
def delete_journal_entry(
    entry_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a journal entry after verifying ownership."""
    journal_service.delete_entry(db, entry_id=entry_id, user_id=current_user.id)
    return {"message": "Journal entry deleted successfully.", "id": entry_id}
