# Changelog

## 1.0.0 — 2026-10-14 — Nain3D Architecture Modernization

Governing decision: ADR-001 (`Approved`). Specification: `specs/001-modernization-and-showcase/`.

### Added

- **FastAPI Modular Backend** (`src/nain3d/`) on port `8104`:
  - `POST /api/v1/conformance/evaluate`: Multipart `.glb` model evaluation with geometric feature extraction, AI proposal, and fail-closed deterministic contract enforcement.
  - `GET /api/v1/conformance/profiles`: Contract profile registry (`Monitor`, `Mobiliario (Chair)`, `Pieza Industrial`, `Prop / Decorativo`).
  - `GET /api/v1/conformance/samples` & `/download`: Built-in synthetic 3D GLB generator for zero-external-dependency benchmarking.
  - `GET /health` & `GET /health/ready`: Liveness and readiness probes.
  - Interactive Scalar OpenAPI Reference mounted at `/docs`.
- **Reactive Vue 3 + TypeScript Client** (`Nain3D.Client/`) on port `5376`:
  - Interactive Google `<model-viewer>` viewport with 360-degree rotation, lighting, and drag-and-drop `.glb` upload.
  - Side-by-side presentation: *"La IA Propone"* (probabilistic classification) vs *"El Contrato Dispone"* (deterministic mathematical gate).
  - Built-in Synthetic Samples drawer for instant 1-click model testing.
  - Dark glassmorphic design system matching the `naindev.com` portfolio standard.
- Comprehensive `pytest` test suite covering domain schemas, contract evaluator fail-closed logic, and API endpoints (9/9 passed).
- Governance documents: `AGENTS.md`, `CLAUDE.md`, `SECURITY.md`, `.editorconfig`.

### Changed

- Unfroze repository from legacy archived status and established open-source reference branding as **Nain3D Gateway**.
- Replaced monolithic Streamlit script with decoupled REST API + Vue 3 architecture.
