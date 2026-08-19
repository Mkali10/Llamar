from enum import StrEnum

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field, model_validator

from .security import Principal, require_tenant

router = APIRouter(prefix="/v1/flows", tags=["flows"])


class NodeType(StrEnum):
    answer = "answer"
    play = "play"
    menu = "menu"
    queue = "queue"
    webhook = "webhook"
    voicemail = "voicemail"
    hangup = "hangup"


class FlowNode(BaseModel):
    id: str = Field(pattern=r"^[A-Za-z0-9_-]{1,64}$")
    type: NodeType
    config: dict = Field(default_factory=dict)


class FlowEdge(BaseModel):
    source: str
    target: str
    outcome: str = "default"


class FlowDefinition(BaseModel):
    name: str = Field(min_length=3, max_length=120)
    entry_node_id: str
    nodes: list[FlowNode] = Field(min_length=1, max_length=200)
    edges: list[FlowEdge] = Field(default_factory=list, max_length=500)

    @model_validator(mode="after")
    def validate_graph(self):
        ids = [node.id for node in self.nodes]
        if len(ids) != len(set(ids)):
            raise ValueError("node IDs must be unique")
        known = set(ids)
        if self.entry_node_id not in known:
            raise ValueError("entry node does not exist")
        for edge in self.edges:
            if edge.source not in known or edge.target not in known:
                raise ValueError("edge references an unknown node")
        reachable = {self.entry_node_id}
        changed = True
        while changed:
            changed = False
            for edge in self.edges:
                if edge.source in reachable and edge.target not in reachable:
                    reachable.add(edge.target)
                    changed = True
        unreachable = known - reachable
        if unreachable:
            raise ValueError(f"unreachable nodes: {', '.join(sorted(unreachable))}")
        if not any(node.type == NodeType.hangup for node in self.nodes):
            raise ValueError("flow requires a hangup node")
        return self


class ValidationResult(BaseModel):
    valid: bool
    node_count: int
    edge_count: int


@router.post("/validate", response_model=ValidationResult)
def validate_flow(
    definition: FlowDefinition,
    principal: Principal = Depends(require_tenant),
) -> ValidationResult:
    return ValidationResult(
        valid=True,
        node_count=len(definition.nodes),
        edge_count=len(definition.edges),
    )
