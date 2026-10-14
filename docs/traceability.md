# Traceability Matrix — Nain3D Gateway

| Requirement | Contract / Rule | Implementing Code | Verifying Test | State |
|:---|:---|:---|:---|:---:|
| Triangle Budget Enforcement | `budget_triangles` | `src.nain3d.engine.evaluator` | `tests/test_evaluator.py::test_conforming_chair_passes_contract` | Verified |
| Physical Metric Scale Bound | `metric_scale` | `src.nain3d.engine.evaluator` | `tests/test_evaluator.py::test_oversized_scale_fails_contract` | Verified |
| Watertight Solid Integrity | `integrity_watertight` | `src.nain3d.engine.evaluator` | `tests/test_evaluator.py::test_industrial_part_requires_watertightness` | Verified |
| Synthetic Model Evaluation | `POST /evaluate` | `src.nain3d.api.routes` | `tests/test_api.py::test_evaluate_sample_model` | Verified |
| Health Liveness & Readiness | `GET /health` | `src.nain3d.main` | `tests/test_api.py::test_liveness_and_readiness_endpoints` | Verified |
| Profiles Registry Query | `GET /profiles` | `src.nain3d.api.routes` | `tests/test_api.py::test_list_profiles` | Verified |
| Synthetic Samples Streaming | `GET /samples` | `src.nain3d.api.routes` | `tests/test_api.py::test_list_and_download_samples` | Verified |
