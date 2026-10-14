# Architecture — Nain3D Gateway

## 1. System Topology

```text
Browser Client (Vue 3 + TypeScript + <model-viewer> on Port 5376)
  │
  ├── Reverse Proxy (Vite Dev Server) -> http://localhost:8104
  │
FastAPI Host (Uvicorn on Port 8104)
  ├── Scalar OpenAPI Documentation (/docs)
  ├── Health Probes (/health, /health/ready)
  └── Conformance API (/api/v1/conformance/...)
        │
        ├── ML Classification Subsystem (RandomForest / Ollama Fallback)
        │     └── Inferred Category & Confidence Score ("La IA Propone")
        │
        └── Deterministic Conformance Engine (Trimesh & NumPy)
              ├── Feature Extraction (Triangles, Vertices, Bounding Box, Watertightness)
              ├── Mathematical Contract Evaluation (Budget, Scale, Solid Integrity)
              └── Fail-Closed Verdict Aggregator ("El Contrato Dispone")
```

## 2. Invariants

- **Boundary Separation:** File bytes are ingested in-memory and hashed via SHA-256 before any transformation.
- **Fail-Closed Logic:**
  $$\text{Verdict} = \begin{cases}
  \mathbf{NON\_CONFORMANT} & \text{if any blocking check fails} \\
  \mathbf{CONFORMANT\_WITH\_FINDINGS} & \text{if all blocking pass, but advisory fails} \\
  \mathbf{CONFORMANT} & \text{if all checks pass}
  \end{cases}$$
- **Zero Hallucination:** Even if a generative AI model claims 99% confidence that an asset is a "Chair", if the asset exceeds the 3.0 m scale bound or 50,000 polygon limit, it is rejected deterministically.
