import json
import os
from typing import Optional, Tuple
import joblib
import numpy as np
import trimesh
import httpx
from ..domain.models import AiProposal, GeometricFeatures

MODEL_PATH = os.path.join(os.path.dirname(__file__), "rf_model.joblib")
OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434")


def extract_ml_features(mesh: trimesh.Trimesh | trimesh.Scene) -> Optional[np.ndarray]:
    """
    Extracts normalized 4-dimensional geometric feature vector:
    [ratio_min_max, ratio_mid_max, volume_fill, triangles]
    """
    try:
        if isinstance(mesh, trimesh.Scene):
            geoms = [geom for geom in mesh.geometry.values() if isinstance(geom, trimesh.Trimesh)]
            if geoms:
                single_mesh = trimesh.util.concatenate(geoms)
            else:
                return None
        else:
            single_mesh = mesh

        extents = single_mesh.extents
        max_dim = max(extents) if hasattr(extents, "__iter__") and max(extents) > 0 else 1.0
        norm_extents = np.sort(extents) / max_dim

        ratio_min_max = float(norm_extents[0])
        ratio_mid_max = float(norm_extents[1])

        hull_vol = float(single_mesh.convex_hull.volume) if hasattr(single_mesh.convex_hull, "volume") else 1.0
        if hull_vol <= 0:
            hull_vol = 1e-6

        mesh_vol = float(single_mesh.volume) if single_mesh.is_watertight else (hull_vol * 0.5)
        bbox_vol = float(np.prod(extents))
        if bbox_vol <= 0:
            bbox_vol = 1e-6

        volume_fill = float(mesh_vol / bbox_vol)
        triangles = float(len(single_mesh.faces)) if hasattr(single_mesh, "faces") else 0.0

        return np.array([ratio_min_max, ratio_mid_max, volume_fill, triangles]).reshape(1, -1)
    except Exception:
        return None


def predict_category(
    mesh: trimesh.Trimesh | trimesh.Scene,
    features: GeometricFeatures,
) -> AiProposal:
    """
    Infers 3D category proposal using Random Forest classifier or heuristic fallback.
    """
    ml_feats = extract_ml_features(mesh)

    if ml_feats is not None and os.path.exists(MODEL_PATH):
        try:
            clf = joblib.load(MODEL_PATH)
            pred = str(clf.predict(ml_feats)[0])
            probs = clf.predict_proba(ml_feats)[0]
            confidence = float(np.max(probs))

            reasoning = (
                f"RandomForest classification based on thickness ratio ({ml_feats[0, 0]:.2f}), "
                f"aspect ratio ({ml_feats[0, 1]:.2f}), fill ratio ({ml_feats[0, 2]:.2f}) "
                f"and {int(ml_feats[0, 3]):,} triangles."
            )

            return AiProposal(
                predicted_category=pred,
                confidence=round(confidence, 3),
                source="RandomForest (Local ML)",
                reasoning=reasoning,
            )
        except Exception:
            pass

    # Heuristic fallback based on aspect ratio & density
    ext = features.extents
    max_d = features.max_dimension_m
    norm_dims = sorted(ext) if ext else [1.0, 1.0, 1.0]

    if norm_dims[0] / max(max_d, 0.001) < 0.15:
        category = "Monitor"
        confidence = 0.82
        reasoning = "Heuristic classification: Thin depth profile characteristic of display monitors."
    elif features.is_watertight and features.triangle_count > 30000:
        category = "Pieza Industrial"
        confidence = 0.88
        reasoning = "Heuristic classification: High-density solid manifold characteristic of precision industrial parts."
    else:
        category = "Mobiliario (Chair)"
        confidence = 0.79
        reasoning = "Heuristic classification: 3D bounding envelope matching furniture proportions."

    return AiProposal(
        predicted_category=category,
        confidence=confidence,
        source="Geometric Heuristics",
        reasoning=reasoning,
    )


async def predict_with_llm_if_available(
    mesh: trimesh.Trimesh | trimesh.Scene,
    features: GeometricFeatures,
) -> AiProposal:
    """
    Attempts to query local Ollama LLM if available; gracefully falls back to local Random Forest.
    """
    # Quick probe to Ollama with 1-second timeout
    try:
        async with httpx.AsyncClient(timeout=1.5) as client:
            prompt = (
                f"Analyze these 3D mesh metrics and categorize into either 'Monitor', 'Mobiliario (Chair)', "
                f"or 'Pieza Industrial'. Dimensions: {features.extents} meters, Triangles: {features.triangle_count}, "
                f"Watertight: {features.is_watertight}. Return JSON: {{\"category\": \"...\", \"confidence\": 0.9, \"reason\": \"...\"}}"
            )
            res = await client.post(
                f"{OLLAMA_URL}/api/generate",
                json={
                    "model": "qwen2.5-coder:32b",
                    "prompt": prompt,
                    "format": "json",
                    "stream": False,
                },
            )
            if res.status_code == 200:
                data = res.json()
                raw_response = data.get("response", "")
                parsed = json.loads(raw_response)
                cat = parsed.get("category", "")
                if cat in ["Monitor", "Mobiliario (Chair)", "Pieza Industrial"]:
                    return AiProposal(
                        predicted_category=cat,
                        confidence=min(1.0, max(0.5, float(parsed.get("confidence", 0.85)))),
                        source="Ollama (Local LLM)",
                        reasoning=parsed.get("reason", "Inferred via local generative LLM."),
                    )
    except Exception:
        # Fall back to Random Forest seamlessly
        pass

    return predict_category(mesh, features)
