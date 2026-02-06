from pathlib import Path
import os

import pytest

pytest.importorskip("httpx")

# Ensure required environment variable for config initialization
os.environ.setdefault("TELEGRAM_TOKEN", "test-token")
from fastapi.testclient import TestClient

os.environ.setdefault("TELEGRAM_TOKEN", "test-token")

import tempfile
os.environ["TASKS_FILE"] = str(Path(tempfile.mkdtemp()) / "tasks.json")

import web_server
from task_tracker import TaskTracker


class TestServer:
    def setup_method(self):
        self.tmpdir = Path(web_server.__file__).resolve().parent / "tmp_tests"
        self.tmpdir.mkdir(exist_ok=True)
        self.tasks_file = self.tmpdir / "tasks.json"
        os.environ["TASKS_FILE"] = str(self.tasks_file)
        import importlib
        importlib.reload(web_server)
        self.client = TestClient(web_server.app)
        self.creds = (web_server.USERNAME, web_server.PASSWORD)

    def teardown_method(self):
        web_server.app.dependency_overrides = {}
        if self.tasks_file.exists():
            self.tasks_file.unlink()

    def test_task_crud(self):
        resp = self.client.post(
            "/api/tasks", json={"id": "T01", "title": "Test"}, auth=self.creds
        )
        assert resp.status_code == 201
        data = resp.json()
        assert data["success"] is True
        assert data["data"]["id"] == "T01"

        resp = self.client.get("/api/tasks", auth=self.creds)
        assert resp.status_code == 200
        assert any(t["id"] == "T01" for t in resp.json()["data"]["tasks"])

        resp = self.client.put(
            "/api/tasks/T01", json={"status": "done"}, auth=self.creds
        )
        assert resp.status_code == 200
        assert resp.json()["data"]["status"] == "done"

    def test_validation_errors(self):
        resp = self.client.post(
            "/api/tasks", json={"id": "ab", "title": "x"}, auth=self.creds
        )
        assert resp.status_code == 400
        data = resp.json()
        assert data["error"]["code"] == "VALIDATION_ERROR"

        resp = self.client.get("/api/tasks/T01", auth=self.creds)
        assert resp.status_code == 404
