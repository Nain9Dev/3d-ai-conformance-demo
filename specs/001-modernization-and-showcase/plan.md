# Plan 001 — Implementation Strategy for Nain3D

- Document version: 1.0
- Date: 2026-10-14

## Architecture Breakdown

### 1. Python Backend (`src/nain3d/`)
- `src/nain3d/domain/models.py`:
  - `GeometricFeatures`: Bounding box extents $[x, y, z]$, triangle count, vertex count, is_watertight, volume.
  - `CheckResult`: Check name, evaluated value, allowed limit, pass/fail status, severity (`blocking` / `advisory`).
  - `AiProposal`: Category prediction, confidence score, source (`RandomForest` / `OllamaLLM`).
  - `ConformanceVerdict`: Enum (`CONFORMANT`, `NON_CONFORMANT`, `INCOMPLETE`).
  - `EvaluationResponse`: SHA-256 hash, duration_ms, AI proposal, check results, authoritative verdict.
  - `ConformanceProfile`: Rule limits dictionary for categories.
- `src/nain3d/domain/profiles.py`:
  - Contract definitions for standard 3D asset categories (`Monitor`, `Mobiliario (Chair)`, `Pieza Industrial`, `Prop / Decorativo`).
- `src/nain3d/engine/mesh.py`:
  - Load mesh from bytes safely via `trimesh.load(..., file_type='glb')`.
  - Extract exact metric extents, watertightness, face count, volume.
- `src/nain3d/engine/contract.py`:
  - Evaluate `GeometricFeatures` against a `ConformanceProfile`.
  - Aggregate verdict fail-closed: if any blocking check fails, status is `NON_CONFORMANT`.
- `src/nain3d/ml/classifier.py`:
  - Scikit-learn Random Forest model loader and predictor.
  - Local Ollama LLM client integration (optional / fallback).
- `src/nain3d/api/routes.py`:
  - `POST /api/v1/conformance/evaluate` (multipart upload or synthetic benchmark sample).
  - `GET /api/v1/conformance/profiles`.
  - `GET /health` and `GET /health/ready`.
- `src/nain3d/main.py`:
  - FastAPI app initialization, CORS, Scalar documentation integration, routes registration.

### 2. Frontend Client (`Nain3D.Client/`)
- Initialized with Vite, Vue 3, TypeScript.
- Pins port `5376` (`strictPort: true`).
- Components:
  - `HeaderNav.vue`: Branding (Nain3D Gateway), status indicators, links to Scalar docs & portfolio.
  - `ModelViewer.vue`: Embedded Google `<model-viewer>` for real-time 3D rotation, inspection, and wireframe toggle.
  - `AiProposalCard.vue`: Renders AI classification confidence, feature breakdown.
  - `ContractVerdictCard.vue`: Detailed rule breakdown (Triangles, Scale, Watertightness) and authoritative verdict banner.
  - `SampleModelsDrawer.vue`: Quick 1-click loading of bundled synthetic 3D assets to test valid and invalid models without needing user files.
- Design:
  - Dark glassmorphic palette (`#070a12`, `#0c1322`, cyan/emerald/rose accents), Outfit, Inter, JetBrains Mono.

### 3. Verification
- `pytest tests/ -v`: 100% passing test suite for geometric extraction, contract rules, and fail-closed logic.
- `npm run build`: Strict `vue-tsc -b` and Vite bundle.
