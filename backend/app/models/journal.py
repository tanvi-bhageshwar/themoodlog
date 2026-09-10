from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Float, Boolean, DateTime, ForeignKey, CheckConstraint, Index
from sqlalchemy.orm import relationship
from backend.app.database import Base


class JournalEntry(Base):
    __tablename__ = "journal_entries"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    content = Column(Text, nullable=False)
    mood = Column(String(50), nullable=False, index=True)
    intensity = Column(Integer, nullable=False)
    confidence = Column(Float, nullable=False, default=0.85)
    ai_response = Column(Text, nullable=False)
    sentiment = Column(String(20), nullable=False, default="neutral")
    is_distress = Column(Boolean, nullable=False, default=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    deleted_at = Column(DateTime, nullable=True)

    __table_args__ = (
        CheckConstraint("intensity >= 1 AND intensity <= 10", name="chk_intensity_range"),
        Index("idx_user_entries_created", "user_id", "created_at"),
        Index("idx_user_entries_mood", "user_id", "mood"),
    )

    # Relationships
    user = relationship("User", back_populates="entries")

    def __repr__(self) -> str:
        return f"<JournalEntry(id={self.id}, user_id={self.user_id}, mood='{self.mood}', intensity={self.intensity})>"
