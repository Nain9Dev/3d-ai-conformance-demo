from typing import List, Tuple
from ..domain.models import (
    CheckResult,
    CheckSeverity,
    ConformanceVerdict,
    GeometricFeatures,
    ProfileDefinition,
)


def evaluate_conformance(
    features: GeometricFeatures,
    profile: ProfileDefinition,
) -> Tuple[List[CheckResult], ConformanceVerdict, str]:
    """
    Evaluates geometric features against the given profile definition using fail-closed logic.
    """
    checks: List[CheckResult] = []

    # 1. Triangle Count Budget
    pass_triangles = features.triangle_count <= profile.max_triangles
    checks.append(
        CheckResult(
            name="budget_triangles",
            label="Triangle Budget (Polygon Density)",
            value=features.triangle_count,
            limit=profile.max_triangles,
            passed=pass_triangles,
            severity=CheckSeverity.BLOCKING,
            message=(
                f"Within budget ({features.triangle_count:,} <= {profile.max_triangles:,})"
                if pass_triangles
                else f"Exceeds polygon limit: {features.triangle_count:,} > {profile.max_triangles:,}"
            ),
        )
    )

    # 2. Metric Scale Dimension
    pass_scale = features.max_dimension_m <= profile.max_dimension_m
    checks.append(
        CheckResult(
            name="metric_scale",
            label="Physical Extents (Metric Scale Bounds)",
            value=f"{features.max_dimension_m:.3f} m",
            limit=f"<= {profile.max_dimension_m:.1f} m",
            passed=pass_scale,
            severity=CheckSeverity.BLOCKING,
            message=(
                f"Scale conforms ({features.max_dimension_m:.3f} m <= {profile.max_dimension_m:.1f} m)"
                if pass_scale
                else f"Scale out of bounds: {features.max_dimension_m:.3f} m > {profile.max_dimension_m:.1f} m"
            ),
        )
    )

    # 3. Watertight Solid Integrity
    if profile.is_watertight_required:
        pass_watertight = features.is_watertight
        severity = CheckSeverity.BLOCKING
        msg = "Solid manifold verified" if pass_watertight else "Mesh is non-manifold or contains open boundary edges"
    else:
        pass_watertight = True
        severity = CheckSeverity.ADVISORY
        msg = "Watertightness not mandated for this category"

    checks.append(
        CheckResult(
            name="integrity_watertight",
            label="Solid Integrity (Watertightness)",
            value="Watertight Solid" if features.is_watertight else "Open Surface",
            limit="Required" if profile.is_watertight_required else "Optional",
            passed=pass_watertight,
            severity=severity,
            message=msg,
        )
    )

    # 4. Degenerate Faces Check
    pass_degenerate = features.degenerate_faces_count <= profile.max_degenerate_faces
    checks.append(
        CheckResult(
            name="degenerate_faces",
            label="Geometry Quality (Degenerate Faces)",
            value=features.degenerate_faces_count,
            limit=profile.max_degenerate_faces,
            passed=pass_degenerate,
            severity=CheckSeverity.BLOCKING,
            message=(
                "Zero degenerate micro-faces detected"
                if pass_degenerate
                else f"Detected {features.degenerate_faces_count} degenerate faces with area <= 1e-12 m²"
            ),
        )
    )

    # Fail-closed aggregation
    has_blocking_failure = any(not c.passed and c.severity == CheckSeverity.BLOCKING for c in checks)
    has_advisory_failure = any(not c.passed and c.severity == CheckSeverity.ADVISORY for c in checks)

    if has_blocking_failure:
        verdict = ConformanceVerdict.NON_CONFORMANT
        summary = "Asset REJECTED: One or more blocking technical contract rules failed."
    elif has_advisory_failure:
        verdict = ConformanceVerdict.CONFORMANT_WITH_FINDINGS
        summary = "Asset CONFORMANT WITH FINDINGS: All blocking criteria met; advisory warnings flagged."
    else:
        verdict = ConformanceVerdict.CONFORMANT
        summary = "Asset CONFORMANT: All technical contract criteria fully satisfied."

    return checks, verdict, summary
