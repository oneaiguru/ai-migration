import json
from pathlib import Path

from context_bridge import ContextBridge
from git import Repo


def test_deserialize_context_refresh(tmp_path):
    Repo.init(tmp_path)
    ctx_file = tmp_path / "context.json"
    ctx_file.write_text(json.dumps({"value": 1}))

    bridge = ContextBridge(repo_path=str(tmp_path))
    first = bridge.deserialize_context(str(ctx_file))
    assert first["value"] == 1

    ctx_file.write_text(json.dumps({"value": 2}))
    second = bridge.deserialize_context(str(ctx_file))
    assert second["value"] == 2

