"""
Seed script to initialize tables and populate sample demo data for MoodLog.
"""
import os
from datetime import datetime, timedelta
from backend.app.database import engine, Base, SessionLocal
from backend.app.models import User, JournalEntry
from backend.app.utils.security import get_password_hash

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # Check if demo user exists
        demo_user = db.query(User).filter(User.email == "alex@moodlog.example").first()
        if not demo_user:
            demo_user = User(
                email="alex@moodlog.example",
                name="Alex Rivera",
                password_hash=get_password_hash("Password123!"),
                created_at=datetime.utcnow() - timedelta(days=14),
                updated_at=datetime.utcnow() - timedelta(days=14),
            )
            db.add(demo_user)
            db.commit()
            db.refresh(demo_user)
            print(f"Created demo user: {demo_user.email}")
        else:
            print(f"Demo user already exists: {demo_user.email}")

        # Check existing entries
        existing = db.query(JournalEntry).filter(JournalEntry.user_id == demo_user.id).count()
        if existing == 0:
            sample_entries = [
                {
                    "content": "Started the morning with a crisp walk outside and fresh coffee. Felt remarkably at peace and ready for the week ahead.",
                    "mood": "happy",
                    "intensity": 8,
                    "confidence": 0.92,
                    "ai_response": "It is wonderful how a brisk morning walk and quiet moments can set such a grounded tone. What part of that calm would you most like to carry with you today?",
                    "sentiment": "positive",
                    "is_distress": False,
                    "days_ago": 9,
                },
                {
                    "content": "Deadline approaching at work. Juggling three different client deliverables and my heart rate felt elevated all afternoon.",
                    "mood": "stressed",
                    "intensity": 7,
                    "confidence": 0.88,
                    "ai_response": "Balancing multiple high-stakes demands is genuinely taxing on both body and mind. If you could pause for five minutes right now, what is one pressure you could temporarily set down?",
                    "sentiment": "negative",
                    "is_distress": False,
                    "days_ago": 7,
                },
                {
                    "content": "Wrapped up the big presentation! The team seemed receptive and gave enthusiastic feedback. Relieved and energized.",
                    "mood": "excited",
                    "intensity": 9,
                    "confidence": 0.95,
                    "ai_response": "Congratulations on delivering the presentation after all that preparation! Give yourself full credit for that effort—how does it feel to step back now and see it accomplished?",
                    "sentiment": "positive",
                    "is_distress": False,
                    "days_ago": 5,
                },
                {
                    "content": "A quiet Sunday afternoon. Read a book by the window while rain fell against the glass. No big plans, just calm breathing.",
                    "mood": "neutral",
                    "intensity": 5,
                    "confidence": 0.89,
                    "ai_response": "Unstructured afternoons with a good book and gentle rain offer rare space for replenishment. What did your mind find most comforting during those quiet hours?",
                    "sentiment": "neutral",
                    "is_distress": False,
                    "days_ago": 3,
                },
                {
                    "content": "Woke up with a sense of nervousness about the upcoming quarter planning. Feeling a bit scattered and anxious.",
                    "mood": "anxious",
                    "intensity": 6,
                    "confidence": 0.84,
                    "ai_response": "Anticipating quarterly shifts can stir up scattered energy. What is one concrete grounding step you can take today to regain your footing?",
                    "sentiment": "negative",
                    "is_distress": False,
                    "days_ago": 2,
                },
                {
                    "content": "Had dinner with good friends. We laughed until our stomachs hurt talking about college memories. Feeling so grateful for connection.",
                    "mood": "happy",
                    "intensity": 9,
                    "confidence": 0.96,
                    "ai_response": "Unfiltered laughter with dear friends is a powerful anchor for the heart. What shared memory from tonight brought you the deepest warmth?",
                    "sentiment": "positive",
                    "is_distress": False,
                    "days_ago": 1,
                },
            ]

            for s in sample_entries:
                entry_time = datetime.utcnow() - timedelta(days=s["days_ago"], hours=4)
                entry = JournalEntry(
                    user_id=demo_user.id,
                    content=s["content"],
                    mood=s["mood"],
                    intensity=s["intensity"],
                    confidence=s["confidence"],
                    ai_response=s["ai_response"],
                    sentiment=s["sentiment"],
                    is_distress=s["is_distress"],
                    created_at=entry_time,
                    updated_at=entry_time,
                )
                db.add(entry)
            db.commit()
            print(f"Seeded {len(sample_entries)} journal entries for {demo_user.email}")
        else:
            print(f"Entries already exist ({existing} entries)")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
