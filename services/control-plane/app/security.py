from datetime import UTC, datetime, timedelta
from enum import StrEnum
from uuid import UUID

import jwt
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel

from .config import Settings, get_settings


class Role(StrEnum):
    platform_admin = "platform_admin"
    reseller_admin = "reseller_admin"
    tenant_owner = "tenant_owner"
    tenant_admin = "tenant_admin"
    supervisor = "supervisor"
    agent = "agent"
    auditor = "auditor"


class Principal(BaseModel):
    user_id: UUID
    tenant_id: UUID | None
    reseller_id: UUID | None
    role: Role


bearer = HTTPBearer(auto_error=False)


def issue_access_token(
    principal: Principal, settings: Settings, lifetime: timedelta = timedelta(minutes=15)
) -> str:
    now = datetime.now(UTC)
    claims = {
        "sub": str(principal.user_id),
        "tenant_id": str(principal.tenant_id) if principal.tenant_id else None,
        "reseller_id": str(principal.reseller_id) if principal.reseller_id else None,
        "role": principal.role.value,
        "iat": now,
        "nbf": now,
        "exp": now + lifetime,
        "iss": settings.token_issuer,
        "aud": settings.token_audience,
    }
    return jwt.encode(claims, settings.secret_key, algorithm="HS256")


def current_principal(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer),
    settings: Settings = Depends(get_settings),
) -> Principal:
    if not credentials or credentials.scheme.lower() != "bearer":
        raise HTTPException(status_code=401, detail="bearer token required")
    try:
        claims = jwt.decode(
            credentials.credentials,
            settings.secret_key,
            algorithms=["HS256"],
            issuer=settings.token_issuer,
            audience=settings.token_audience,
            options={"require": ["sub", "role", "exp", "iat"]},
        )
        return Principal(
            user_id=UUID(claims["sub"]),
            tenant_id=UUID(claims["tenant_id"]) if claims.get("tenant_id") else None,
            reseller_id=UUID(claims["reseller_id"]) if claims.get("reseller_id") else None,
            role=Role(claims["role"]),
        )
    except (jwt.PyJWTError, ValueError, KeyError) as exc:
        raise HTTPException(status_code=401, detail="invalid or expired token") from exc


def require_roles(*allowed: Role):
    def dependency(principal: Principal = Depends(current_principal)) -> Principal:
        if principal.role not in allowed:
            raise HTTPException(status_code=403, detail="insufficient permission")
        return principal

    return dependency


def require_tenant(principal: Principal = Depends(current_principal)) -> Principal:
    if principal.role != Role.platform_admin and principal.tenant_id is None:
        raise HTTPException(status_code=403, detail="tenant context required")
    return principal
