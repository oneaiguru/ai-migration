import pytest

pytest.importorskip("httpx")
from fastapi.testclient import TestClient

from api.templates import create_templates_router
from src.services.template_service import TemplateService
from web_server import authenticate  # reuse auth without extra deps


class TestTemplatesAPI:
    def setup_method(self, tmp_path):
        if not hasattr(tmp_path, "joinpath"):
            from pathlib import Path
            import tempfile

            tmp_path = Path(tempfile.mkdtemp())
        self.tmpdir = tmp_path
        self.template_dir = tmp_path / "templates"
        self.template_dir.mkdir()
        self.db_file = tmp_path / "gallery.json"
        self.db_file.write_text("{}")
        self.service = TemplateService(
            template_dir=str(self.template_dir), db_file=str(self.db_file)
        )
        router = create_templates_router(self.service, lambda: "test")
        from fastapi import FastAPI

        self.app = FastAPI()
        self.app.include_router(router)
        self.client = TestClient(self.app)

    def test_crud_and_search(self):
        resp = self.client.post(
            "/api/templates",
            json={"name": "hello", "prompt": "Hi {{name}}", "categories": ["greet"]},
        )
        assert resp.status_code == 201

        resp = self.client.get("/api/templates")
        data = resp.json()["templates"]
        assert any(t["name"] == "hello" for t in data)

        resp = self.client.get("/api/templates/hello")
        assert resp.status_code == 200
        assert resp.json()["prompt"] == "Hi {{name}}"

        resp = self.client.put("/api/templates/hello", json={"description": "g"})
        assert resp.status_code == 200
        assert resp.json()["description"] == "g"

        resp = self.client.get("/api/templates", params={"query": "hell"})
        assert len(resp.json()["templates"]) == 1
        resp = self.client.get("/api/templates", params={"category": "greet"})
        assert len(resp.json()["templates"]) == 1

        resp = self.client.delete("/api/templates/hello")
        assert resp.status_code == 200
        assert not self.client.get("/api/templates").json()["templates"]

    def test_import_export_and_stats(self):
        # create two templates
        self.client.post(
            "/api/templates",
            json={"name": "a", "prompt": "A {{x}}", "categories": ["c1"]},
        )
        self.client.post(
            "/api/templates",
            json={"name": "b", "prompt": "B {{x}}", "categories": ["c2"]},
        )

        export_resp = self.client.get("/api/templates/export")
        exported = export_resp.json()["templates"]
        assert set(exported.keys()) == {"a", "b"}

        # import into new service
        new_db = self.tmpdir / "new.json"
        new_service = TemplateService(
            template_dir=str(self.template_dir), db_file=str(new_db)
        )
        router = create_templates_router(new_service, lambda: "test")
        from fastapi import FastAPI

        app = FastAPI()
        app.include_router(router)
        c = TestClient(app)
        resp = c.post("/api/templates/import", json={"templates": exported})
        assert resp.json()["imported"] == 2

        stats = self.client.get("/api/templates/stats").json()
        assert stats["total"] == 2
        assert stats["by_category"]["c1"] == 1

    def test_validation(self):
        resp = self.client.post(
            "/api/templates", json={"name": "bad", "prompt": "no vars"}
        )
        assert resp.status_code == 400
