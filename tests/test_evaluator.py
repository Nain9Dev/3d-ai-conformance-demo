import pytest
from src.nain3d.domain.models import ConformanceVerdict, GeometricFeatures
from src.nain3d.domain.profiles import PROFILES
from src.nain3d.engine.evaluator import evaluate_conformance


def test_conforming_chair_passes_contract():
    features = GeometricFeatures(
        triangle_count=35000,
        vertex_count=18000,
        is_watertight=False,
        extents=[0.6, 0.6, 1.1],
        max_dimension_m=1.1,
        volume_m3=0.0,
        degenerate_faces_count=0,
    )
    profile = PROFILES["Mobiliario (Chair)"]
    checks, verdict, summary = evaluate_conformance(features, profile)

    assert verdict == ConformanceVerdict.CONFORMANT
    assert all(c.passed for c in checks if c.severity.value == "blocking")


def test_oversized_scale_fails_contract():
    features = GeometricFeatures(
        triangle_count=20000,
        vertex_count=10000,
        is_watertight=False,
        extents=[4.5, 4.0, 4.8],  # > 3.0m max
        max_dimension_m=4.8,
        volume_m3=0.0,
        degenerate_faces_count=0,
    )
    profile = PROFILES["Mobiliario (Chair)"]
    checks, verdict, summary = evaluate_conformance(features, profile)

    assert verdict == ConformanceVerdict.NON_CONFORMANT
    scale_check = next(c for c in checks if c.name == "metric_scale")
    assert scale_check.passed is False


def test_industrial_part_requires_watertightness():
    # An open mesh must be rejected for Pieza Industrial
    open_mesh_features = GeometricFeatures(
        triangle_count=45000,
        vertex_count=23000,
        is_watertight=False,
        extents=[0.5, 0.5, 0.5],
        max_dimension_m=0.5,
        volume_m3=0.0,
        degenerate_faces_count=0,
    )
    profile = PROFILES["Pieza Industrial"]
    checks, verdict, summary = evaluate_conformance(open_mesh_features, profile)

    assert verdict == ConformanceVerdict.NON_CONFORMANT
    watertight_check = next(c for c in checks if c.name == "integrity_watertight")
    assert watertight_check.passed is False
    assert watertight_check.severity.value == "blocking"
