import pytest
from fastapi import status


def test_register_user_success(client):
    """Test standard registration with valid credentials."""
    payload = {
        "name": "Maya Lin",
        "email": "maya@example.com",
        "password": "SecurePassword123!",
        "password_confirm": "SecurePassword123!",
    }
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "maya@example.com"
    assert data["user"]["name"] == "Maya Lin"
    assert "password" not in data["user"]
    assert "password_hash" not in data["user"]


def test_register_duplicate_email(client, test_user):
    """Test duplicate registration fails with 400."""
    payload = {
        "name": "Sarah Imposter",
        "email": test_user.email,
        "password": "NewPassword123!",
        "password_confirm": "NewPassword123!",
    }
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "already exists" in response.json()["detail"]


def test_register_password_mismatch(client):
    """Test registration with mismatched passwords fails validation."""
    payload = {
        "name": "Mismatch Tester",
        "email": "mismatch@example.com",
        "password": "Password123!",
        "password_confirm": "DifferentPassword123!",
    }
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


def test_login_success(client, test_user):
    """Test authentication with correct credentials."""
    payload = {
        "email": test_user.email,
        "password": "Password123!",
    }
    response = client.post("/api/auth/login", json=payload)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == test_user.email


def test_login_invalid_password(client, test_user):
    """Test authentication with incorrect password returns 401."""
    payload = {
        "email": test_user.email,
        "password": "WrongPassword999!",
    }
    response = client.post("/api/auth/login", json=payload)
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_protected_me_endpoint(client, auth_headers, test_user):
    """Test retrieval of current user with bearer token."""
    response = client.get("/api/auth/me", headers=auth_headers)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["id"] == test_user.id
    assert data["email"] == test_user.email


def test_protected_me_without_token(client):
    """Test accessing protected route without auth token returns 401."""
    response = client.get("/api/auth/me")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
