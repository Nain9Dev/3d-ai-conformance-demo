import io
from typing import Tuple
import numpy as np
import trimesh
from ..domain.models import GeometricFeatures

DEGENERATE_AREA_THRESHOLD = 1e-12  # Quantum area threshold in m²


def load_mesh_from_bytes(file_bytes: bytes, file_name: str = "model.glb") -> trimesh.Trimesh | trimesh.Scene:
    """
    Safely loads a 3D asset from in-memory bytes into a Trimesh instance or Scene.
    """
    file_obj = io.BytesIO(file_bytes)
    file_type = "glb" if file_name.lower().endswith(".glb") else "gltf"
    mesh = trimesh.load(file_obj, file_type=file_type, process=False)
    return mesh


def extract_features(mesh: trimesh.Trimesh | trimesh.Scene) -> GeometricFeatures:
    """
    Deterministically computes geometric properties from a Trimesh geometry or Scene.
    """
    if isinstance(mesh, trimesh.Scene):
        # Aggregate across all sub-geometries
        geometries = [g for g in mesh.geometry.values() if isinstance(g, trimesh.Trimesh)]
        
        triangle_count = sum(len(g.faces) for g in geometries if hasattr(g, "faces"))
        vertex_count = sum(len(g.vertices) for g in geometries if hasattr(g, "vertices"))
        
        # Watertightness in Scene requires all sub-geometries to be closed manifolds
        is_watertight = bool(geometries) and all(g.is_watertight for g in geometries)
        
        # Bounding box extents across the combined scene
        if hasattr(mesh, "extents") and mesh.extents is not None:
            extents = [round(float(v), 4) for v in mesh.extents]
        else:
            extents = [0.0, 0.0, 0.0]
            
        # Volume
        volume = sum(float(g.volume) for g in geometries if g.is_watertight) if is_watertight else 0.0
        
        # Degenerate faces count
        degenerate_count = 0
        for g in geometries:
            if hasattr(g, "area_faces"):
                degenerate_count += int(np.sum(g.area_faces <= DEGENERATE_AREA_THRESHOLD))
    else:
        triangle_count = len(mesh.faces) if hasattr(mesh, "faces") else 0
        vertex_count = len(mesh.vertices) if hasattr(mesh, "vertices") else 0
        is_watertight = bool(mesh.is_watertight) if hasattr(mesh, "is_watertight") else False
        
        if hasattr(mesh, "extents") and mesh.extents is not None:
            extents = [round(float(v), 4) for v in mesh.extents]
        else:
            extents = [0.0, 0.0, 0.0]
            
        volume = float(mesh.volume) if is_watertight and hasattr(mesh, "volume") else 0.0
        
        if hasattr(mesh, "area_faces"):
            degenerate_count = int(np.sum(mesh.area_faces <= DEGENERATE_AREA_THRESHOLD))
        else:
            degenerate_count = 0

    max_dim = max(extents) if extents else 0.0

    return GeometricFeatures(
        triangle_count=int(triangle_count),
        vertex_count=int(vertex_count),
        is_watertight=bool(is_watertight),
        extents=extents,
        max_dimension_m=round(float(max_dim), 4),
        volume_m3=round(float(volume), 6),
        degenerate_faces_count=int(degenerate_count),
    )
