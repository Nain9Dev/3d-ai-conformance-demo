import os
import trimesh
import numpy as np
from sklearn.ensemble import RandomForestClassifier
import joblib

MODEL_PATH = os.path.join(os.path.dirname(__file__), 'rf_model.joblib')

def extract_features(mesh):
    """
    Extrae características geométricas puras del modelo 3D.
    """
    try:
        if isinstance(mesh, trimesh.Scene):
            # Convertir a malla única para extraer características globales
            geoms = [geom for geom in mesh.geometry.values() if isinstance(geom, trimesh.Trimesh)]
            if geoms:
                mesh = trimesh.util.concatenate(geoms)
            else:
                return None
                
        # 1. Extents (Caja Delimitadora)
        extents = mesh.extents
        max_dim = max(extents) if max(extents) > 0 else 1.0
        
        # Normalizar dimensiones para ser independientes de la escala absoluta
        norm_extents = np.sort(extents) / max_dim
        
        # 2. Ratios
        ratio_min_max = norm_extents[0] # grosor vs dimensión máxima
        ratio_mid_max = norm_extents[1] 
        
        # 3. Compacidad y Volumen
        # Para mallas no watertight el volumen puede ser 0 o incorrecto, usamos el convex hull
        hull_volume = mesh.convex_hull.volume if hasattr(mesh.convex_hull, 'volume') else 1.0
        if hull_volume <= 0: hull_volume = 1e-6
        
        # Si la malla es hermética, sacamos su volumen real
        mesh_volume = mesh.volume if mesh.is_watertight else (hull_volume * 0.5) 
        
        # Qué tan "llena" está su caja delimitadora
        bbox_volume = np.prod(extents)
        if bbox_volume <= 0: bbox_volume = 1e-6
        volume_fill = mesh_volume / bbox_volume
        
        # Densidad de triángulos (complejidad)
        triangles = len(mesh.faces)
        surface_area = mesh.area if mesh.area > 0 else 1.0
        tri_density = triangles / surface_area
        
        # Feature Vector
        features = [
            ratio_min_max, # Ej: Monitor tiene bajo ratio (es plano)
            ratio_mid_max, # Ej: Silla es más cúbica
            volume_fill,   # Ej: Una esfera es 0.52, un cubo 1.0. Una silla es muy bajo (mucho aire)
            triangles      # Para distinguir piezas industriales muy densas
        ]
        
        return np.array(features).reshape(1, -1)
    except Exception as e:
        print(f"Error extracting features: {e}")
        return None

def train_synthetic_model():
    """
    Genera un modelo sintético pre-entrenado basado en expectativas geométricas.
    En un entorno de producción, esto se reemplazaría por un entrenamiento con tu D:\3D-Assets.
    """
    X = []
    y = []
    
    # Sintetizamos datos para "Monitor"
    # ratio_min_max (grosor) bajo, ratio_mid_max medio, volume_fill alto (es un rectángulo), complejidad media
    for _ in range(100):
        X.append([np.random.normal(0.05, 0.02), np.random.normal(0.6, 0.1), np.random.normal(0.8, 0.1), np.random.normal(2000, 500)])
        y.append("Monitor")
        
    # Sintetizamos datos para "Silla (Chair)"
    # ratio_min_max medio, ratio_mid_max alto (es cúbica/alta), volume_fill bajo (tiene huecos entre patas), complejidad media-alta
    for _ in range(100):
        X.append([np.random.normal(0.4, 0.1), np.random.normal(0.8, 0.1), np.random.normal(0.2, 0.05), np.random.normal(15000, 5000)])
        y.append("Mobiliario (Chair)")
        
    # Sintetizamos datos para "Pieza Industrial (Tornillo/Engranaje)"
    # ratio_min_max medio/alto, volume_fill medio, complejidad MUY alta (alta densidad)
    for _ in range(100):
        X.append([np.random.normal(0.3, 0.1), np.random.normal(0.9, 0.1), np.random.normal(0.6, 0.1), np.random.normal(50000, 10000)])
        y.append("Pieza Industrial")

    clf = RandomForestClassifier(n_estimators=50, random_state=42)
    clf.fit(np.array(X), np.array(y))
    
    joblib.dump(clf, MODEL_PATH)
    return clf

def predict(mesh):
    """
    Retorna la predicción y la confianza.
    """
    if not os.path.exists(MODEL_PATH):
        clf = train_synthetic_model()
    else:
        clf = joblib.load(MODEL_PATH)
        
    features = extract_features(mesh)
    if features is None:
        return "Desconocido", 0.0
        
    prediction = clf.predict(features)[0]
    probabilities = clf.predict_proba(features)[0]
    confidence = float(np.max(probabilities))
    
    return prediction, confidence
