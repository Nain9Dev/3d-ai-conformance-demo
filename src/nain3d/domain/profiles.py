from typing import Dict
from .models import ProfileDefinition

PROFILES: Dict[str, ProfileDefinition] = {
    "Monitor": ProfileDefinition(
        id="monitor-std-01",
        name="Monitor",
        description="Electronic visual displays, monitors and screens.",
        max_triangles=25000,
        max_dimension_m=2.5,
        is_watertight_required=False,
        max_degenerate_faces=0,
    ),
    "Mobiliario (Chair)": ProfileDefinition(
        id="furniture-chair-01",
        name="Mobiliario (Chair)",
        description="Seating, ergonomic office and living furniture.",
        max_triangles=50000,
        max_dimension_m=3.0,
        is_watertight_required=False,
        max_degenerate_faces=0,
    ),
    "Pieza Industrial": ProfileDefinition(
        id="industrial-part-01",
        name="Pieza Industrial",
        description="Precision mechanical components and manufactured engineering parts.",
        max_triangles=100000,
        max_dimension_m=1.2,
        is_watertight_required=True,
        max_degenerate_faces=0,
    ),
    "Prop / Decorativo": ProfileDefinition(
        id="prop-decor-01",
        name="Prop / Decorativo",
        description="General environment assets, architectural fittings and props.",
        max_triangles=35000,
        max_dimension_m=4.0,
        is_watertight_required=False,
        max_degenerate_faces=0,
    ),
}

DEFAULT_PROFILE = PROFILES["Mobiliario (Chair)"]
