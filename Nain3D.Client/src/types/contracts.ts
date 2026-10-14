export type ConformanceVerdict =
  | 'CONFORMANT'
  | 'CONFORMANT_WITH_FINDINGS'
  | 'NON_CONFORMANT'
  | 'INCOMPLETE';

export type CheckSeverity = 'blocking' | 'advisory';

export interface GeometricFeatures {
  triangle_count: number;
  vertex_count: number;
  is_watertight: boolean;
  extents: [number, number, number];
  max_dimension_m: number;
  volume_m3: number;
  degenerate_faces_count: number;
}

export interface CheckResult {
  name: string;
  label: string;
  value: unknown;
  limit: unknown;
  passed: boolean;
  severity: CheckSeverity;
  message: string;
}

export interface AiProposal {
  predicted_category: string;
  confidence: number;
  source: string;
  reasoning: string | null;
}

export interface ProfileDefinition {
  id: string;
  name: string;
  description: string;
  max_triangles: number;
  max_dimension_m: number;
  is_watertight_required: boolean;
  max_degenerate_faces: number;
}

export interface EvaluationResult {
  asset_sha256: string;
  asset_name: string;
  asset_size_bytes: number;
  features: GeometricFeatures;
  ai_proposal: AiProposal;
  applied_profile: ProfileDefinition;
  checks: CheckResult[];
  verdict: ConformanceVerdict;
  verdict_summary: string;
  evaluation_duration_ms: number;
  timestamp_utc: string;
}

export interface SampleAsset {
  id: string;
  name: string;
  category: string;
  expected_verdict: ConformanceVerdict;
  description: string;
}
