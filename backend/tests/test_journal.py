import pytest
from fastapi import status


def test_create_journal_entry(client, auth_headers):
    """Test creating a valid journal entry with automated AI analysis."""
    payload = {
        "content": "Today was a remarkably peaceful and happy day. Finished reading my book by the sunny window."
    }
    response = client.post("/api/entries", json=payload, headers=auth_headers)
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["content"] == payload["content"]
    assert data["mood"] in {"happy", "neutral", "excited", "sad", "anxious", "stressed", "angry"}
    assert 1 <= data["intensity"] <= 10
    assert 0.0 <= data["confidence"] <= 1.0
    assert len(data["ai_response"]) > 10
    assert data["is_distress"] is False


def test_create_entry_too_short(client, auth_headers):
    """Test creating an entry with content shorter than 3 chars fails validation."""
    response = client.post("/api/entries", json={"content": "hi"}, headers=auth_headers)
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


def test_get_user_entries(client, auth_headers):
    """Test listing user entries."""
    client.post("/api/entries", json={"content": "First reflection of the morning."}, headers=auth_headers)
    client.post("/api/entries", json={"content": "Second evening reflection."}, headers=auth_headers)

    response = client.get("/api/entries", headers=auth_headers)
    assert response.status_code == status.HTTP_200_OK
    entries = response.json()
    assert len(entries) >= 2


def test_entry_isolation_between_users(client, auth_headers, second_user_headers):
    """
    CRITICAL SECURITY TEST:
    A user must NEVER be able to view, edit, or delete another user's journal entry.
    """
    # User 1 creates an entry
    res1 = client.post("/api/entries", json={"content": "User 1 private journal secrets."}, headers=auth_headers)
    assert res1.status_code == status.HTTP_201_CREATED
    entry_id = res1.json()["id"]

    # User 2 attempts to read User 1's entry
    res2 = client.get(f"/api/entries/{entry_id}", headers=second_user_headers)
    assert res2.status_code == status.HTTP_404_NOT_FOUND

    # User 2 attempts to update User 1's entry
    res3 = client.put(f"/api/entries/{entry_id}", json={"content": "Hacked content!"}, headers=second_user_headers)
    assert res3.status_code == status.HTTP_404_NOT_FOUND

    # User 2 attempts to delete User 1's entry
    res4 = client.delete(f"/api/entries/{entry_id}", headers=second_user_headers)
    assert res4.status_code == status.HTTP_404_NOT_FOUND

    # Verify original entry remains intact and accessible to User 1
    res5 = client.get(f"/api/entries/{entry_id}", headers=auth_headers)
    assert res5.status_code == status.HTTP_200_OK
    assert res5.json()["content"] == "User 1 private journal secrets."


def test_update_entry(client, auth_headers):
    """Test owner updating their journal entry."""
    res = client.post("/api/entries", json={"content": "Initial thought before revision."}, headers=auth_headers)
    entry_id = res.json()["id"]

    update_res = client.put(f"/api/entries/{entry_id}", json={"content": "Updated deep reflection with new perspective."}, headers=auth_headers)
    assert update_res.status_code == status.HTTP_200_OK
    assert update_res.json()["content"] == "Updated deep reflection with new perspective."


def test_delete_entry(client, auth_headers):
    """Test owner deleting their journal entry."""
    res = client.post("/api/entries", json={"content": "To be removed."}, headers=auth_headers)
    entry_id = res.json()["id"]

    del_res = client.delete(f"/api/entries/{entry_id}", headers=auth_headers)
    assert del_res.status_code == status.HTTP_200_OK

    # Subsequent fetch returns 404
    get_res = client.get(f"/api/entries/{entry_id}", headers=auth_headers)
    assert get_res.status_code == status.HTTP_404_NOT_FOUND
