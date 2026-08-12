import trimesh

PROFILES = {
    "Monitor": {
        "max_triangles": 20000,
        "is_watertight_required": False,
        "max_size_m": 2.5 # Un monitor gigante sería 2.5m
    },
    "Mobiliario (Chair)": {
        "max_triangles": 50000,
        "is_watertight_required": False,
        "max_size_m": 3.0
    },
    "Pieza Industrial": {
        "max_triangles": 100000,
        "is_watertight_required": True,
        "max_size_m": 1.0 # Las piezas industriales suelen ser pequeñas
    }
}

def evaluate_contract(mesh, ai_prediction):
    """
    Evalúa la malla contra el contrato geométrico determinista basado en la propuesta de la IA.
    Retorna (boolean_pasado, detalles_dict)
    """
    if ai_prediction not in PROFILES:
        return False, {"error": f"No existe un perfil de contrato para '{ai_prediction}'."}
        
    profile = PROFILES[ai_prediction]
    
    # 1. Conteo de Triángulos
    if isinstance(mesh, trimesh.Scene):
        triangles = sum([len(g.faces) for g in mesh.geometry.values() if hasattr(g, 'faces')])
    else:
        triangles = len(mesh.faces) if hasattr(mesh, 'faces') else 0
        
    pass_triangles = triangles <= profile["max_triangles"]
    
    # 2. Tamaño Máximo (Bounding Box)
    if isinstance(mesh, trimesh.Scene):
        extents = mesh.extents
    else:
        extents = mesh.extents
        
    max_dim = max(extents) if hasattr(extents, '__iter__') else 0
    pass_size = max_dim <= profile["max_size_m"]
    
    # 3. Integridad (Watertight)
    pass_watertight = True
    if profile["is_watertight_required"]:
        if isinstance(mesh, trimesh.Scene):
            # Asumimos que todas las mallas deben ser herméticas
            is_watertight = all([g.is_watertight for g in mesh.geometry.values() if isinstance(g, trimesh.Trimesh)])
        else:
            is_watertight = mesh.is_watertight
            
        pass_watertight = is_watertight

    # Veredicto final
    is_conformant = pass_triangles and pass_size and pass_watertight
    
    details = {
        "budget_triangles": {
            "value": triangles,
            "limit": profile["max_triangles"],
            "pass": pass_triangles
        },
        "scale_dimension": {
            "value": round(float(max_dim), 3),
            "limit": profile["max_size_m"],
            "pass": pass_size
        },
        "integrity_watertight": {
            "required": profile["is_watertight_required"],
            "pass": pass_watertight
        }
    }
    
    return is_conformant, details
