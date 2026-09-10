import pytest
from fastapi import status


def test_analytics_empty_state(client, auth_headers):
    """Test analytics response for a brand new user with 0 entries."""
    response = client.get("/api/analytics/summary", headers=auth_headers)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["total_entries"] == 0
    assert data["average_intensity"] == 0.0
    assert data["current_streak_days"] == 0
    assert len(data["insights"]) > 0


def test_analytics_with_entries(client, auth_headers):
    """Test analytics calculations with multiple journal entries."""
    client.post("/api/entries", json={"content": "Super happy and joyful afternoon!"}, headers=auth_headers)
    client.post("/api/entries", json={"content": "Felt stressed and overwhelmed with tasks."}, headers=auth_headers)

    response = client.get("/api/analytics/trends", headers=auth_headers)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()

    assert data["summary"]["total_entries"] >= 2
    assert data["summary"]["average_intensity"] > 0
    assert len(data["distribution"]) >= 1
    assert len(data["trend_points"]) >= 2
