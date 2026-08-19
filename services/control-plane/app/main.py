from enum import StrEnum
from uuid import UUID

from fastapi import FastAPI, Header
from pydantic import BaseModel, Field

app = FastAPI(title="Llamar Control Plane", version="0.1.0")


class Decision(StrEnum):
    deny = "deny"
    review = "review"


class CallIntent(BaseModel):
    destination: str = Field(min_length=6, max_length=32)
    purpose: str = Field(min_length=3, max_length=80)
    consent_reference: str | None = Field(default=None, max_length=128)
    dlt_template_id: str | None = Field(default=None, max_length=128)


class ComplianceDecision(BaseModel):
    decision: Decision
    reasons: list[str]


@app.get("/health/live")
def live() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/health/ready")
def ready() -> dict[str, str]:
    return {"status": "ready"}


@app.post("/v1/compliance/evaluate", response_model=ComplianceDecision)
def evaluate_call(
    intent: CallIntent, tenant_id: UUID = Header(alias="X-Tenant-ID")
) -> ComplianceDecision:
    reasons: list[str] = []
    if not intent.consent_reference:
        reasons.append("consent_reference_missing")
    if intent.purpose.lower() in {"promotional", "marketing"} and not intent.dlt_template_id:
        reasons.append("dlt_template_id_missing")
    if reasons:
        return ComplianceDecision(decision=Decision.deny, reasons=reasons)
    return ComplianceDecision(
        decision=Decision.review,
        reasons=["provider_and_policy_validation_required"],
    )
