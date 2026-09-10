from datetime import datetime
from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class MoodCategory(str, Enum):
    HAPPY = "happy"
    SAD = "sad"
    ANXIOUS = "anxious"
    STRESSED = "stressed"
    ANGRY = "angry"
    EXCITED = "excited"
    NEUTRAL = "neutral"


class AIAnalysisResult(BaseModel):
    mood: MoodCategory
    intensity: int = Field(..., ge=1, le=10, description="Mood intensity from 1 (subtle) to 10 (overwhelming)")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Model classification confidence")
    ai_response: str = Field(..., min_length=1, description="Empathetic, non-clinical reflection")
    sentiment: str = Field(default="neutral", description="High-level polarity: positive, negative, or neutral")
    is_distress: bool = Field(default=False, description="Whether distress or crisis risk was detected")


class JournalCreate(BaseModel):
    content: str = Field(..., min_length=3, max_length=10000, description="Journal entry reflection content")


class JournalUpdate(BaseModel):
    content: str = Field(..., min_length=3, max_length=10000, description="Updated journal entry reflection content")


class JournalResponse(BaseModel):
    id: int
    user_id: int
    content: str
    mood: str
    intensity: int
    confidence: float
    ai_response: str
    sentiment: str
    is_distress: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
