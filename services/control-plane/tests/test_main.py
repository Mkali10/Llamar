import os
from uuid import UUID

os.environ["LLAMAR_SECRET_KEY"] = "test-secret-key-that-is-at-least-32-bytes"

from fastapi.testclient import TestClient

from app.main import app
from app.config import get_settings
from app.security import Principal, Role, issue_access_token

client = TestClient(app)
TENANT = "00000000-0000-4000-8000-000000000001"
USER = "00000000-0000-4000-8000-000000000002"


def auth(role: Role = Role.tenant_admin, tenant_id: str | None = TENANT):
    token = issue_access_token(
        Principal(
            user_id=UUID(USER),
            tenant_id=UUID(tenant_id) if tenant_id else None,
            reseller_id=None,
            role=role,
        ),
        get_settings(),
    )
    return {"Authorization": f"Bearer {token}"}


def test_liveness():
    assert client.get("/health/live").json() == {"status": "ok"}


def test_missing_consent_is_denied():
    response = client.post(
        "/v1/compliance/evaluate",
        headers=auth(),
        json={"destination": "919999999999", "purpose": "marketing"},
    )
    assert response.status_code == 200
    assert response.json()["decision"] == "deny"


def test_complete_request_still_requires_review():
    response = client.post(
        "/v1/compliance/evaluate",
        headers=auth(),
        json={
            "destination": "919999999999",
            "purpose": "transactional",
            "consent_reference": "consent-1",
        },
    )
    assert response.json()["decision"] == "review"


def test_protected_endpoint_rejects_anonymous_request():
    assert client.get("/v1/auth/me").status_code == 401


def test_auth_me_returns_scoped_identity():
    response = client.get("/v1/auth/me", headers=auth(Role.supervisor))
    assert response.status_code == 200
    assert response.json()["tenant_id"] == TENANT
    assert response.json()["role"] == "supervisor"


def test_non_platform_identity_without_tenant_is_rejected():
    response = client.post(
        "/v1/compliance/evaluate",
        headers=auth(Role.agent, None),
        json={"destination": "919999999999", "purpose": "transactional"},
    )
    assert response.status_code == 403
