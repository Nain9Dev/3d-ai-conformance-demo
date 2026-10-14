# Charter — Nain3D Gateway

- Product Name: **Nain3D** (3D AI Conformance Gateway)
- Version: 1.0.0
- Owner: Aitor Nain Mendoza Vallejo (`NainDev`)
- Status: Active / Production-grade FOSS Demo
- Category: 3D Computational Geometry & AI Quality Assurance

## 1. Mission & Vision

The industry of generative 3D and automated asset creation routinely outputs unconstrained, physically
implausible, and non-manifold meshes that crash game engines and real-time renderers.

**Nain3D Gateway** establishes the governing engineering paradigm:
> *"La IA propone, el contrato dispone."*
> (The AI proposes, the technical contract decides.)

The AI layer categorizes and predicts asset profiles using probabilistic heuristics and machine learning.
The deterministic geometry engine enforces mathematical contracts, guaranteeing that no asset violating
triangle density, metric extents, or manifold integrity ever reaches production pipelines.

## 2. Core Pillars

1. **Deterministic Conformance:** Reproducible, verifiable checks over floating-point geometry without heuristics.
2. **Fail-Closed Aggregation:** Any failing blocking rule guarantees asset rejection (`NON_CONFORMANT`).
3. **Decoupled Architecture:** High-throughput Python 3.12 (FastAPI + Pydantic v2) backend paired with a reactive Vue 3 + TypeScript 3D client.
4. **Zero-Overhead Local Demonstration:** Built-in synthetic 3D model generator for instant zero-dependency testing.
