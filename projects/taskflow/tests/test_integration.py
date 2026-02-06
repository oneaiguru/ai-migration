import json
import time
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from git import Repo

import web_server
from src.services.template_service import TemplateService, MissingTemplateVariableError
from task_tracker import TaskTracker
from git_utils import commit_changes, get_repo


@pytest.fixture
def integration_env(tmp_path, monkeypatch):
    repo_path = tmp_path / "repo"
    tasks_file = tmp_path / "tasks.json"
    templates_dir = tmp_path / "templates"
    db_file = tmp_path / "gallery.json"

    monkeypatch.setenv("REPO_PATH", str(repo_path))
    monkeypatch.setenv("TASKS_FILE", str(tasks_file))
    monkeypatch.setenv("TEMPLATES_DIR", str(templates_dir))
    monkeypatch.setenv("GALLERY_FILE", str(db_file))
    monkeypatch.setenv("WEB_USER", "user")
    monkeypatch.setenv("WEB_PASSWORD", "pass")

    from config_manager import ConfigManager

    ConfigManager.reload()

    Repo.init(repo_path)
    templates_dir.mkdir()
    (templates_dir / "hello.md").write_text("Hello {{name}}")
    db_file.write_text(json.dumps({"bye": {"prompt": "Bye {{name}}"}}))

    import importlib

    importlib.reload(web_server)
    web_server.tracker = TaskTracker(str(tasks_file))
    web_server.template_service = TemplateService(
        template_dir=str(templates_dir), db_file=str(db_file)
    )
    client = TestClient(web_server.app)
    return {
        "repo": get_repo(str(repo_path)),
        "client": client,
        "creds": ("user", "pass"),
        "service": web_server.template_service,
        "tracker": web_server.tracker,
    }


def test_full_workflow(integration_env):
    repo = integration_env["repo"]
    client = integration_env["client"]
    creds = integration_env["creds"]

    start = time.perf_counter()
    resp = client.post("/api/tasks", json={"id": "W01", "title": "Work"}, auth=creds)
    duration = time.perf_counter() - start
    assert resp.status_code == 201 and duration < 0.5

    assert repo.active_branch.name == "task/W01"

    output = integration_env["service"].render_template("hello", {"name": "Bob"})
    assert output == "Hello Bob"

    file_path = Path(repo.working_tree_dir) / "output.txt"
    file_path.write_text(output)
    sha = commit_changes(repo, "[PENDING-L4] add output", add_all=True)
    assert repo.head.commit.hexsha == sha

    resp = client.put("/api/tasks/W01", json={"status": "done"}, auth=creds)
    assert resp.status_code == 200

    resp = client.get("/api/tasks/W01", auth=creds)
    assert resp.json()["data"]["status"] == "done"

    resp = client.delete("/api/tasks/W01", auth=creds)
    assert resp.status_code == 200


def test_authentication_and_errors(integration_env):
    client = integration_env["client"]
    creds = integration_env["creds"]

    assert client.get("/api/tasks").status_code == 401
    assert client.get("/api/tasks", auth=("bad", "creds")).status_code == 401
    assert client.get("/api/tasks", auth=creds).status_code == 200

    client.post("/api/tasks", json={"id": "D01", "title": "T"}, auth=creds)
    dup = client.post("/api/tasks", json={"id": "D01", "title": "T"}, auth=creds)
    assert dup.status_code == 409

    with pytest.raises(MissingTemplateVariableError):
        integration_env["service"].render_template("hello", {})


def test_performance_and_concurrency(integration_env):
    client = integration_env["client"]
    creds = integration_env["creds"]

    start = time.perf_counter()
    for i in range(3):
        client.post("/api/tasks", json={"id": f"P0{i}", "title": "x"}, auth=creds)
    assert time.perf_counter() - start < 1.0

    def fetch():
        c = TestClient(web_server.app)
        return c.get("/api/tasks", auth=creds).status_code

    with ThreadPoolExecutor(max_workers=5) as exe:
        results = list(exe.map(lambda _: fetch(), range(5)))
    assert all(code == 200 for code in results)

    start = time.perf_counter()
    text = integration_env["service"].render_template("bye", {"name": "A"})
    assert text == "Bye A" and time.perf_counter() - start < 0.1
