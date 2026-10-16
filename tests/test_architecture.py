import ast
import os
from pathlib import Path


def test_domain_layer_isolation_has_no_framework_or_infrastructure_dependencies():
    """Verify that domain layer models and profiles never import from presentation, web, or api."""
    domain_dir = Path(__file__).resolve().parent.parent / "src" / "nain3d" / "domain"
    forbidden_prefixes = (
        "fastapi",
        "starlette",
        "uvicorn",
        "src.nain3d.api",
        "src.nain3d.web",
    )

    for py_file in domain_dir.glob("*.py"):
        if py_file.name == "__init__.py":
            continue
        with open(py_file, "r", encoding="utf-8") as f:
            tree = ast.parse(f.read(), filename=str(py_file))

        for node in ast.walk(tree):
            if isinstance(node, ast.Import):
                for alias in node.names:
                    for forbidden in forbidden_prefixes:
                        assert not alias.name.startswith(forbidden), (
                            f"Domain file {py_file.name} violates clean architecture by importing {alias.name}"
                        )
            elif isinstance(node, ast.ImportFrom):
                module = node.module or ""
                for forbidden in forbidden_prefixes:
                    assert not module.startswith(forbidden), (
                        f"Domain file {py_file.name} violates clean architecture by importing from {module}"
                    )
