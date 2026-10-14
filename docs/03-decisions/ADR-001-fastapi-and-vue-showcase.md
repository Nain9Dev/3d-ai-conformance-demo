# ADR-001: Decoupled FastAPI and Vue 3 Showcase Architecture

- Status: Approved
- Date: 2026-10-14
- Deciders: Aitor Nain Mendoza Vallejo (`NainDev`)

## Context

The initial proof of concept was built as a single Streamlit script (`app.py`). While suitable for rapid prototyping, Streamlit hindered seamless portfolio embedding, real-time reactive 3D rendering with `<model-viewer>`, decoupled REST API consumption, and automated API contract testing.

## Decision

1. **Unfreeze and activate** the repository as NainDev's open-source 3D Conformance reference project.
2. **Re-architect the backend** using FastAPI, Pydantic v2, and Trimesh running on port `8104`.
3. **Build a dedicated frontend client** (`Nain3D.Client`) using Vue 3, TypeScript, Vite, and Google `<model-viewer>` on port `5376`.
4. **Enforce commercial portfolio branding** as **Nain3D Gateway** (Nain3D), consistent with *NainPolicy*, *NainConfigurator*, and *NainOrder*.

## Consequences

- Direct integration with `naindev.com` portfolio.
- High-performance, asynchronous REST API with auto-generated Scalar OpenAPI documentation.
- Client runs independently with hot module replacement (HMR) and strict TypeScript type-checking.
