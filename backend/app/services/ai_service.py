import json
import logging
import os
import re
from typing import Dict, Any, Optional
import httpx

from backend.app.config import settings
from backend.app.schemas.journal import AIAnalysisResult, MoodCategory

logger = logging.getLogger("moodlog.ai")

VALID_MOODS = {m.value for m in MoodCategory}


class AIService:
    """
    AI Service for structured emotional tone classification and empathetic journaling reflection.
    
    Adheres strictly to wellness/reflection boundaries:
    - Never diagnoses mental health disorders.
    - Never prescribes clinical interventions or acts as a therapist.
    - Classifies entries into controlled taxonomy (happy, sad, anxious, stressed, angry, excited, neutral).
    - Measures emotional intensity on a 1-10 scale.
    - Emits compassionate 2-4 sentence reflections with an optional gentle inquiry.
    """

    SYSTEM_PROMPT = """You are MoodLog, an empathetic and supportive AI companion for personal journaling and self-reflection.
The user is writing in their private journal. Your role is to analyze their entry and provide a thoughtful, grounded reflection.

CRITICAL GUIDELINES:
1. You are a journaling wellness companion, NOT a therapist, doctor, or clinical counselor. Never diagnose medical or psychological conditions.
2. Mood must be strictly one of: "happy", "sad", "anxious", "stressed", "angry", "excited", "neutral".
3. Intensity must be an integer from 1 (very mild/subtle) to 10 (intense/overwhelming).
4. Confidence must be a float between 0.50 and 0.99 reflecting your certainty.
5. Reflection must be warm, concise (2-4 sentences), non-clinical, validating their experience, and ending with ONE gentle, open reflective question.
6. Sentiment must be one of: "positive", "negative", "neutral".

You MUST respond in valid JSON format matching this exact schema:
{
  "mood": "happy|sad|anxious|stressed|angry|excited|neutral",
  "intensity": 1-10,
  "confidence": 0.5-0.99,
  "sentiment": "positive|negative|neutral",
  "ai_response": "Your empathetic 2-4 sentence reflection ending with a gentle question."
}
"""

    @classmethod
    async def analyze_entry(cls, content: str) -> AIAnalysisResult:
        """
        Analyze the journal entry using available AI providers (Groq -> Gemini -> Fallback).
        Always returns a validated, structured AIAnalysisResult.
        """
        clean_content = content.strip()

        # 1. Try Groq if configured
        if settings.GROQ_API_KEY:
            try:
                result = await cls._query_groq(clean_content)
                if result:
                    return result
            except Exception as e:
                logger.warning(f"Groq API call failed or timed out: {e}. Attempting secondary fallback.")

        # 2. Try Gemini if configured
        if settings.GEMINI_API_KEY:
            try:
                result = await cls._query_gemini(clean_content)
                if result:
                    return result
            except Exception as e:
                logger.warning(f"Gemini API call failed: {e}. Proceeding to heuristic fallback.")

        # 3. Deterministic Local Sentiment & Empathetic Reflection Fallback
        return cls._local_heuristic_fallback(clean_content)

    @classmethod
    async def _query_groq(cls, content: str) -> Optional[AIAnalysisResult]:
        """Call Groq Cloud API using JSON object mode."""
        url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {settings.GROQ_API_KEY}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": "llama-3.3-70b-versatile",
            "messages": [
                {"role": "system", "content": cls.SYSTEM_PROMPT},
                {"role": "user", "content": f"Journal Entry:\n\"\"\"{content}\"\"\""}
            ],
            "response_format": {"type": "json_object"},
            "temperature": 0.4,
            "max_tokens": 300,
        }

        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(url, headers=headers, json=payload)
            if response.status_code == 200:
                data = response.json()
                raw_json = data["choices"][0]["message"]["content"]
                return cls._parse_and_validate_response(raw_json)
        return None

    @classmethod
    async def _query_gemini(cls, content: str) -> Optional[AIAnalysisResult]:
        """Call Gemini REST API for structured sentiment analysis."""
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={settings.GEMINI_API_KEY}"
        payload = {
            "contents": [
                {
                    "parts": [
                        {"text": cls.SYSTEM_PROMPT},
                        {"text": f"Journal Entry:\n\"\"\"{content}\"\"\""}
                    ]
                }
            ],
            "generationConfig": {
                "response_mime_type": "application/json",
                "temperature": 0.3,
            }
        }

        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(url, json=payload)
            if response.status_code == 200:
                data = response.json()
                candidates = data.get("candidates", [])
                if candidates:
                    parts = candidates[0].get("content", {}).get("parts", [])
                    if parts:
                        raw_json = parts[0].get("text", "")
                        return cls._parse_and_validate_response(raw_json)
        return None

    @classmethod
    def _parse_and_validate_response(cls, raw_json: str) -> Optional[AIAnalysisResult]:
        """Parse raw model output and strictly validate against schema and taxonomy."""
        try:
            parsed = json.loads(raw_json)
            raw_mood = str(parsed.get("mood", "")).strip().lower()
            if raw_mood not in VALID_MOODS:
                raw_mood = "neutral"

            intensity = int(parsed.get("intensity", 5))
            intensity = max(1, min(10, intensity))

            confidence = float(parsed.get("confidence", 0.85))
            confidence = max(0.1, min(1.0, confidence))

            sentiment = str(parsed.get("sentiment", "neutral")).strip().lower()
            if sentiment not in {"positive", "negative", "neutral"}:
                sentiment = "neutral"

            ai_response = str(parsed.get("ai_response", "")).strip()
            if not ai_response:
                ai_response = "Thank you for taking the time to put your feelings into words. How did writing this reflection feel for you today?"

            return AIAnalysisResult(
                mood=MoodCategory(raw_mood),
                intensity=intensity,
                confidence=confidence,
                ai_response=ai_response,
                sentiment=sentiment,
                is_distress=False,
            )
        except Exception as e:
            logger.warning(f"Failed to parse LLM structured output: {e}. Raw was: {raw_json[:100]}")
            return None

    @classmethod
    def _local_heuristic_fallback(cls, content: str) -> AIAnalysisResult:
        """
        Sophisticated rule-based emotional lexicon analyzer and reflection generator.
        Ensures 100% testability and reliability even without external API connectivity.
        """
        lower = content.lower()
        words = set(re.findall(r"\b[a-z]{3,}\b", lower))

        # Emotion lexicon mappings
        lexicon = {
            MoodCategory.EXCITED: {"thrilled", "ecstatic", "hyped", "pumped", "amazing", "incredible", "promoted", "won", "celebrate"},
            MoodCategory.HAPPY: {"happy", "glad", "joy", "peaceful", "grateful", "good", "wonderful", "lovely", "content", "blessed", "smile"},
            MoodCategory.ANXIOUS: {"anxious", "nervous", "worried", "dread", "panic", "scared", "fear", "uneasy", "restless", "apprehensive"},
            MoodCategory.STRESSED: {"stressed", "overwhelmed", "deadline", "exhausted", "burnout", "busy", "pressure", "drained", "hectic"},
            MoodCategory.ANGRY: {"angry", "furious", "mad", "frustrated", "annoyed", "irritated", "pissed", "unfair", "hate", "resent"},
            MoodCategory.SAD: {"sad", "depressed", "lonely", "down", "cry", "crying", "unhappy", "hurt", "grief", "heartbroken", "gloomy"},
        }

        scores = {mood: len(words.intersection(terms)) for mood, terms in lexicon.items()}
        dominant_mood, count = max(scores.items(), key=lambda x: x[1])

        if count == 0:
            dominant_mood = MoodCategory.NEUTRAL
            intensity = 5
            sentiment = "neutral"
            confidence = 0.75
            reflection = (
                "Taking a moment to pause and record your day is a grounding practice in itself. "
                "Even when a day feels ordinary or quiet, your thoughts have value. "
                "What is one simple sensation or thought you notice most clearly right now?"
            )
        else:
            # Calculate intensity based on emotional keyword frequency and text length
            intensity = min(10, max(3, 4 + count * 2))
            confidence = min(0.95, 0.70 + (count * 0.08))

            if dominant_mood in {MoodCategory.HAPPY, MoodCategory.EXCITED}:
                sentiment = "positive"
                reflection = (
                    f"It is uplifting to hear this sense of lightness and {dominant_mood.value} in your words. "
                    "Honoring these bright chapters helps anchor them in your memory. "
                    "What is one detail from this experience that brought you the most joy?"
                )
            elif dominant_mood in {MoodCategory.ANXIOUS, MoodCategory.STRESSED}:
                sentiment = "negative"
                reflection = (
                    f"It sounds like you are navigating a substantial amount of pressure and feeling {dominant_mood.value}. "
                    "Giving voice to these challenges is an important first step in loosening their grip. "
                    "What is one small kindness you can grant yourself as you move through today?"
                )
            elif dominant_mood == MoodCategory.ANGRY:
                sentiment = "negative"
                reflection = (
                    "Feeling frustrated or angry is a completely natural reaction when things feel out of balance or unfair. "
                    "Writing it down allows those intense emotions a safe place to land. "
                    "What boundary or action could help you regain your equilibrium?"
                )
            else:  # SAD
                sentiment = "negative"
                reflection = (
                    "It takes quiet courage to sit with sadness and put those vulnerable feelings into words. "
                    "Be gentle with yourself right now; you do not have to carry everything all at once. "
                    "What is one comforting thing that could bring a touch of warmth to your day?"
                )

        return AIAnalysisResult(
            mood=dominant_mood,
            intensity=intensity,
            confidence=round(confidence, 2),
            ai_response=reflection,
            sentiment=sentiment,
            is_distress=False,
        )


ai_service = AIService()
