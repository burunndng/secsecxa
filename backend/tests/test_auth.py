import pytest
from fastapi import status


def test_register_user(client):
    response = client.post(
        "/auth/register",
        json={
            "email": "newuser@example.com",
            "username": "newuser",
            "password": "password123",
            "full_name": "New User"
        }
    )
    
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["email"] == "newuser@example.com"
    assert data["username"] == "newuser"
    assert data["is_active"] is True
    assert "id" in data


def test_register_duplicate_email(client, test_user):
    response = client.post(
        "/auth/register",
        json={
            "email": "test@example.com",
            "username": "anotheruser",
            "password": "password123"
        }
    )
    
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "Email already registered" in response.json()["detail"]


def test_register_duplicate_username(client, test_user):
    response = client.post(
        "/auth/register",
        json={
            "email": "another@example.com",
            "username": "testuser",
            "password": "password123"
        }
    )
    
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "Username already taken" in response.json()["detail"]


def test_login_success(client, test_user):
    response = client.post(
        "/auth/login",
        data={"username": "testuser", "password": "testpassword"}
    )
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_wrong_password(client, test_user):
    response = client.post(
        "/auth/login",
        data={"username": "testuser", "password": "wrongpassword"}
    )
    
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_login_nonexistent_user(client):
    response = client.post(
        "/auth/login",
        data={"username": "nonexistent", "password": "password"}
    )
    
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_login_json(client, test_user):
    response = client.post(
        "/auth/login/json",
        json={"username": "testuser", "password": "testpassword"}
    )
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_auth_flow(client):
    register_response = client.post(
        "/auth/register",
        json={
            "email": "flowtest@example.com",
            "username": "flowtest",
            "password": "password123"
        }
    )
    assert register_response.status_code == status.HTTP_201_CREATED
    
    login_response = client.post(
        "/auth/login",
        data={"username": "flowtest", "password": "password123"}
    )
    assert login_response.status_code == status.HTTP_200_OK
    token = login_response.json()["access_token"]
    assert token is not None
