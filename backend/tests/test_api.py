import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert "database" in data
    assert "ai_service" in data
    assert "version" in data


def test_root():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "TravelMate AI API"


def test_create_trip_validation():
    # Test missing required fields
    response = client.post("/api/trips", json={})
    assert response.status_code == 422


def test_list_trips():
    response = client.get("/api/trips")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_list_destinations():
    response = client.get("/api/destinations")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_init_sample_destinations():
    response = client.post("/api/destinations/init-sample")
    assert response.status_code == 200
    assert "message" in response.json()