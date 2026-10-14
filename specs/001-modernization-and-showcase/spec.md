# Specification 001 — Nain3D Architecture Modernization & Interactive Showcase

- Document version: 1.0
- Status: Approved
- Date: 2026-10-14
- Brand: **Nain3D** (3D AI Conformance Gateway)

## 1. Problem Statement

The previous repository existed as an archived prototype (`app.py`) combining monolithic Streamlit scripts with basic geometry evaluations. While it demonstrated the core principle *"La IA propone, el contrato dispone"*, it lacked production-grade decoupling, strict Pydantic v2 schemas, REST endpoints, automated testing, and a modern frontend client aligned with the visual and architectural standards of [naindev.com](https://www.naindev.com).

## 2. Requirements

### 2.1 Backend (FastAPI + Pydantic v2)
1. When a 3D asset (`.glb`) is submitted via `POST /api/v1/conformance/evaluate`, the system shall:
   - Extract reproducible geometric metadata (bounding box extents, triangle count, vertex count, watertightness, manifold integrity).
   - Compute the SHA-256 hash of the asset binary.
   - Run AI proposal inference (via Random Forest feature classifier, with optional local LLM integration).
   - Apply the deterministic technical contract associated with the candidate profile (or user-selected profile).
   - Enforce fail-closed aggregation: if any blocking check fails, the verdict shall be `non_conformant`.
2. When queried via `GET /api/v1/conformance/profiles`, the system shall return all active conformance contracts (e.g. `Monitor`, `Mobiliario (Chair)`, `Pieza Industrial`, `Arquitectura`).
3. When queried via `GET /health` or `GET /health/ready`, the system shall return standard liveness and readiness payloads.
4. The API shall expose OpenAPI documentation at `/docs` with Scalar reference integration.
5. The API shall enforce CORS allowing local origins (`http://localhost:5376`, `http://127.0.0.1:5376`) and `https://naindev.com`.

### 2.2 Frontend Client (`Nain3D.Client` in Vue 3 + TypeScript)
1. The client shall render on port `5376` (`strictPort: true`).
2. The client shall embed `<model-viewer>` to render real-time interactive 3D assets with orbit camera controls, auto-rotation, and shadow rendering.
3. The client shall provide an asset upload interface (drag-and-drop `.glb` or bundled synthetic sample models).
4. The UI shall present side-by-side or stacked panels:
   - **"La IA Propone":** Predicted category, confidence bar, reasoning/features.
   - **"El Contrato Dispone":** Technical contract profile rules, actual vs budget values, pass/fail status pills, and authoritative verdict.
5. The UI shall comply with WCAG 2.2 AA accessibility standards and adhere to the dark glassmorphic design system of NainDev.

### 2.3 Verification & Quality Gates
1. Unit tests in `tests/` using `pytest` shall cover geometric analysis, contract evaluations, profile validation, and Pydantic schema validation.
2. The Vue client shall build cleanly with `vue-tsc -b && vite build` (0 type errors).
