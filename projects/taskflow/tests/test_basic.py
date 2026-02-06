def test_imports():
    """Test that essential modules can be imported."""
    import config
    from bot.config import Config
    import task_tracker
    import template_processor
    import git_utils

    assert Config
    assert task_tracker
    assert template_processor
    assert git_utils


def test_config():
    """Test basic config functionality."""
    import os
    from config import Config

    os.environ.setdefault("TELEGRAM_TOKEN", "test-token")
    config = Config()
    assert hasattr(config, "telegram_token")
    assert hasattr(config, "repo_path")
    assert hasattr(config, "authorized_users_list")


def test_bot_script_runs(tmp_path):
    """Running bot/bot.py should fail on missing env vars, not import error."""
    import os
    import subprocess
    import sys
    from pathlib import Path

    bot_script = Path(__file__).resolve().parents[1] / "bot" / "bot.py"
    env = os.environ.copy()
    env.pop("TELEGRAM_TOKEN", None)
    result = subprocess.run(
        [
            sys.executable,
            str(bot_script),
        ],
        cwd=tmp_path,
        env=env,
        capture_output=True,
        text=True,
    )

    assert result.returncode != 0
    assert "Missing required environment variables" in result.stderr

from pathlib import Path
import importlib
import os

import pytest
pytest.importorskip("httpx")
from fastapi.testclient import TestClient

from src.services.task_service import TaskService, TaskStatus
from src.services.template_service import TemplateService
from task_tracker import TaskTracker
import git_utils


@pytest.fixture
def patched_config(monkeypatch):
    """Ensure config manager exposes needed attributes for API tests."""
    import config_manager

    for name in ["web_host", "web_port", "web_user", "web_password", "tasks_file"]:
        if not hasattr(config_manager.ConfigManager, name):
            monkeypatch.setattr(
                config_manager.ConfigManager,
                name,
                property(lambda self, n=name: self._config.get(n)),
                raising=False,
            )
    yield


def test_task_lifecycle(temp_repo):
    repo, path = temp_repo
    tasks_file = Path(path) / "tasks.json"
    service = TaskService(file_path=str(tasks_file), repo_path=path)

    created = service.create_task("T01", "Test")
    assert created.id == "T01"
    assert service.get_task("T01") is not None
    service.update_task("T01", status=TaskStatus.IN_PROGRESS, title="Updated")
    updated = service.get_task("T01")
    assert updated.status == TaskStatus.IN_PROGRESS
    assert updated.title == "Updated"
    service.delete_task("T01")
    assert service.get_task("T01") is None


def test_template_render(tmp_path):
    tpl_dir = tmp_path / "templates"
    tpl_dir.mkdir()
    (tpl_dir / "hello.md").write_text("Hello {{name}}")
    service = TemplateService(template_dir=str(tpl_dir), db_file=str(tmp_path / "db.json"))
    assert service.get_template("hello") is not None
    output = service.render_template("hello", {"name": "World"})
    assert output == "Hello World"


def test_git_operations(tmp_path):
    repo_path = tmp_path / "repo"
    repo = git_utils.get_repo(str(repo_path))
    (repo_path / "file.txt").write_text("data")
    sha = git_utils.commit_changes(repo, "[PENDING-L4] init", add_all=True)
    assert repo.head.commit.hexsha == sha
    git_utils.checkout_task_branch("123", create=True, repo=repo)
    assert repo.active_branch.name == "task/123"


def test_config_loading(monkeypatch):
    monkeypatch.setenv("REPO_PATH", "/tmp/test")
    from src.config import AppConfig

    cfg = AppConfig()
    assert cfg.repo_path == "/tmp/test"


def test_api_endpoints(tmp_path, patched_config):
    os.environ.setdefault("TELEGRAM_TOKEN", "dummy")
    import web_server
    importlib.reload(web_server)
    tasks_file = tmp_path / "tasks.json"
    web_server.tracker = TaskTracker(str(tasks_file))
    client = TestClient(web_server.app)
    creds = (web_server.authenticate.__globals__["USERNAME"], web_server.authenticate.__globals__["PASSWORD"])

    resp = client.post("/api/tasks", json={"id": "A01", "title": "Task"}, auth=creds)
    assert resp.status_code == 201
    resp = client.put("/api/tasks/A01", json={"status": "done"}, auth=creds)
    assert resp.status_code == 200
    resp = client.get("/api/tasks/A01", auth=creds)
    assert resp.json()["data"]["status"] == "done"


def test_authentication_flow(tmp_path, patched_config):
    os.environ.setdefault("TELEGRAM_TOKEN", "dummy")
    import web_server
    importlib.reload(web_server)
    tasks_file = tmp_path / "tasks.json"
    web_server.tracker = TaskTracker(str(tasks_file))
    client = TestClient(web_server.app)

    valid = (web_server.authenticate.__globals__["USERNAME"], web_server.authenticate.__globals__["PASSWORD"])
    resp = client.get("/api/tasks", auth=valid)
    assert resp.status_code == 200

    resp = client.get("/api/tasks", auth=("bad", "creds"))
    assert resp.status_code == 401
