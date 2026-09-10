import pytest
from backend.app.services.ai_service import ai_service
from backend.app.schemas.journal import MoodCategory


@pytest.mark.asyncio
async def test_ai_service_fallback_happy():
    """Test AI fallback correctly identifies positive/happy sentiment."""
    text = "I felt so happy and grateful today after taking a peaceful morning walk."
    result = await ai_service.analyze_entry(text)

    assert result.mood in {MoodCategory.HAPPY, MoodCategory.EXCITED, MoodCategory.NEUTRAL}
    assert 1 <= result.intensity <= 10
    assert 0.5 <= result.confidence <= 1.0
    assert len(result.ai_response) > 20
    assert "?" in result.ai_response  # Ends with a gentle reflective question


@pytest.mark.asyncio
async def test_ai_service_fallback_anxious():
    """Test AI fallback correctly identifies anxious/stressed tone."""
    text = "My heart was racing all day because of intense worry and dread about the exam."
    result = await ai_service.analyze_entry(text)

    assert result.mood in {MoodCategory.ANXIOUS, MoodCategory.STRESSED}
    assert 1 <= result.intensity <= 10
    assert result.sentiment == "negative"
    assert len(result.ai_response) > 20


@pytest.mark.asyncio
async def test_ai_service_malformed_json_resilience():
    """Test parse and validate resilience against corrupt LLM outputs."""
    malformed_json = '{"mood": "super_crazy", "intensity": 999, "sentiment": "weird"}'
    parsed = ai_service._parse_and_validate_response(malformed_json)
    assert parsed is not None
    # Schema validator should sanitize out-of-range values and invalid moods
    assert parsed.mood == MoodCategory.NEUTRAL
    assert parsed.intensity == 10  # Clamped to 10
    assert parsed.sentiment == "neutral"
