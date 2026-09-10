import pytest
from fastapi import status
from backend.app.services.safety_service import safety_service


def test_safety_service_non_crisis():
    """Verify standard reflective text passes safety checks without flags."""
    text = "Had a somewhat tiring day at work, but resting now."
    is_distress, response = safety_service.check_distress(text)
    assert is_distress is False
    assert response is None


def test_safety_service_crisis_detection():
    """Verify direct self-harm/suicidal ideation is safely identified."""
    crisis_text = "I feel so hopeless and I just want to kill myself tonight."
    is_distress, response = safety_service.check_distress(crisis_text)
    assert is_distress is True
    assert response is not None
    assert "988" in response
    assert "Crisis Lifeline" in response
    assert "741741" in response


def test_journal_entry_with_distress_safety_flow(client, auth_headers):
    """
    Test that an entry containing crisis language:
    1. Is marked with is_distress = True
    2. Receives crisis support response rather than generic AI reflection
    3. Remains safely saved so user can see supportive hotline resources
    """
    payload = {
        "content": "I feel like everyone would be better off dead without me here."
    }
    response = client.post("/api/entries", json=payload, headers=auth_headers)
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["is_distress"] is True
    assert "988" in data["ai_response"]
    assert "not a substitute for medical or crisis services" in data["ai_response"] or "cannot provide clinical or emergency care" in data["ai_response"]
