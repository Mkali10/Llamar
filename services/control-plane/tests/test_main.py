from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)
TENANT = "00000000-0000-4000-8000-000000000001"


def test_liveness():
    assert client.get("/health/live").json() == {"status": "ok"}


def test_missing_consent_is_denied():
    response = client.post(
        "/v1/compliance/evaluate",
        headers={"X-Tenant-ID": TENANT},
        json={"destination": "919999999999", "purpose": "marketing"},
    )
    assert response.status_code == 200
    assert response.json()["decision"] == "deny"


def test_complete_request_still_requires_review():
    response = client.post(
        "/v1/compliance/evaluate",
        headers={"X-Tenant-ID": TENANT},
        json={
            "destination": "919999999999",
            "purpose": "transactional",
            "consent_reference": "consent-1",
        },
    )
    assert response.json()["decision"] == "review"
