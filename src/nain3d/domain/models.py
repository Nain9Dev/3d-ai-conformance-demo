from enum import Enum
from typing import Any, Optional
from pydantic import BaseModel, ConfigDict, Field


class CheckSeverity(str, Enum):
    BLOCKING = "blocking"
    ADVISORY = "advisory"


class ConformanceVerdict(str, Enum):
    CONFORMANT = "CONFORMANT"
    CONFORMANT_WITH_FINDINGS = "CONFORMANT_WITH_FINDINGS"
    NON_CONFORMANT = "NON_CONFORMANT"
    INCOMPLETE = "INCOMPLETE"


class GeometricFeatures(BaseModel):
    model_config = ConfigDict(frozen=True)

    triangle_count: int = Field(ge=0, description="Total face/polygon count")
    vertex_count: int = Field(ge=0, description="Total unique vertex count")
    is_watertight: bool = Field(description="Whether the mesh represents a closed solid volume")
    extents: list[float] = Field(description="Bounding box dimensions [x, y, z] in meters")
    max_dimension_m: float = Field(ge=0, description="Maximum single dimension in meters")
    volume_m3: float = Field(ge=0, description="Approximated enclosed volume in cubic meters")
    degenerate_faces_count: int = Field(ge=0, default=0, description="Faces with near-zero area")


class CheckResult(BaseModel):
    model_config = ConfigDict(frozen=True)

    name: str
    label: str
    value: Any
    limit: Any
    passed: bool
    severity: CheckSeverity
    message: str


class AiProposal(BaseModel):
    model_config = ConfigDict(frozen=True)

    predicted_category: str
    confidence: float = Field(ge=0.0, le=1.0)
    source: str = Field(description="Classifier engine (e.g. RandomForest or Ollama)")
    reasoning: Optional[str] = None


class ProfileDefinition(BaseModel):
    model_config = ConfigDict(frozen=True)

    id: str
    name: str
    description: str
    max_triangles: int
    max_dimension_m: float
    is_watertight_required: bool
    max_degenerate_faces: int = 0


class EvaluationResult(BaseModel):
    model_config = ConfigDict(frozen=True)

    asset_sha256: str
    asset_name: str
    asset_size_bytes: int
    features: GeometricFeatures
    ai_proposal: AiProposal
    applied_profile: ProfileDefinition
    checks: list[CheckResult]
    verdict: ConformanceVerdict
    verdict_summary: str
    evaluation_duration_ms: float
    timestamp_utc: str
