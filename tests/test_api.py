from fastapi.testclient import TestClient
from src.nain3d.main import app

client = TestClient(app)


def test_liveness_and_readiness_endpoints():
    res_live = client.get("/health")
    assert res_live.status_code == 200
    assert res_live.json()["status"] == "Healthy"

    res_ready = client.get("/health/ready")
    assert res_ready.status_code == 200
    assert res_ready.json()["ready"] is True


def test_list_profiles():
    res = client.get("/api/v1/conformance/profiles")
    assert res.status_code == 200
    profiles = res.json()
    assert len(profiles) >= 3
    names = [p["name"] for p in profiles]
    assert "Monitor" in names
    assert "Pieza Industrial" in names


def test_list_and_download_samples():
    res_list = client.get("/api/v1/conformance/samples")
    assert res_list.status_code == 200
    samples = res_list.json()
    assert len(samples) >= 4

    res_dl = client.get("/api/v1/conformance/samples/sample-monitor/download")
    assert res_dl.status_code == 200
    assert res_dl.headers["content-type"] == "model/gltf-binary"
    assert len(res_dl.content) > 0


def test_evaluate_sample_model():
    sample_res = client.get("/api/v1/conformance/samples/sample-monitor/download")
    assert sample_res.status_code == 200
    glb_bytes = sample_res.content

    eval_res = client.post(
        "/api/v1/conformance/evaluate",
        files={"file": ("test_monitor.glb", glb_bytes, "model/gltf-binary")},
    )
    assert eval_res.status_code == 200
    data = eval_res.json()

    assert "asset_sha256" in data
    assert data["features"]["triangle_count"] > 0
    assert "ai_proposal" in data
    assert "checks" in data
    assert len(data["checks"]) == 4
    assert data["verdict"] in ["CONFORMANT", "NON_CONFORMANT"]
