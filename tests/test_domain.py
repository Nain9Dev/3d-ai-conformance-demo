import pytest
from src.nain3d.domain.models import (
    CheckResult,
    CheckSeverity,
    ConformanceVerdict,
    GeometricFeatures,
    ProfileDefinition,
)
from src.nain3d.domain.profiles import PROFILES


def test_geometric_features_validation():
    features = GeometricFeatures(
        triangle_count=12000,
        vertex_count=6000,
        is_watertight=True,
        extents=[1.0, 0.8, 0.5],
        max_dimension_m=1.0,
        volume_m3=0.4,
        degenerate_faces_count=0,
    )
    assert features.triangle_count == 12000
    assert features.max_dimension_m == 1.0
    assert features.is_watertight is True


def test_profiles_dictionary_structure():
    assert "Monitor" in PROFILES
    assert "Mobiliario (Chair)" in PROFILES
    assert "Pieza Industrial" in PROFILES

    monitor = PROFILES["Monitor"]
    assert monitor.max_triangles == 25000
    assert monitor.max_dimension_m == 2.5
    assert monitor.is_watertight_required is False

    industrial = PROFILES["Pieza Industrial"]
    assert industrial.is_watertight_required is True
