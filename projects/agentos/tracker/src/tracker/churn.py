from __future__ import annotations

import subprocess
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Iterable, Sequence


@dataclass(frozen=True)
class ChurnStats:
    files_changed: int
    insertions: int
    deletions: int
    net: int


class ChurnError(RuntimeError):
    """Raised when churn computation fails."""


def resolve_git_root(cwd: Path | None = None) -> Path:
    """Return the git repository root for the given working directory."""
    cwd = cwd or Path.cwd()
    try:
        result = _run_git(["rev-parse", "--show-toplevel"], cwd=cwd)
    except subprocess.CalledProcessError as exc:  # pragma: no cover - error text handled by caller
        raise ChurnError("not inside a git repository") from exc
    return Path(result.strip())


def resolve_commit(commit: str | None, *, default: str | None, cwd: Path) -> str:
    target = commit or default
    if target is None:
        raise ChurnError("commit hash required but missing")
    try:
        result = _run_git(["rev-parse", target], cwd=cwd)
    except subprocess.CalledProcessError as exc:
        raise ChurnError(f"unable to resolve commit {target!r}") from exc
    return result.strip()


def compute_churn(
    commit_start: str,
    commit_end: str,
    *,
    paths: Sequence[str] | None = None,
    cwd: Path | None = None,
) -> ChurnStats:
    """Run `git diff --numstat` and aggregate churn statistics."""
    cwd = cwd or Path.cwd()
    range_spec = f"{commit_start}..{commit_end}"
    cmd = ["diff", "--numstat", range_spec]
    if paths:
        cmd.append("--")
        cmd.extend(paths)
    try:
        output = _run_git(cmd, cwd=cwd)
    except subprocess.CalledProcessError as exc:
        raise ChurnError("git diff --numstat failed") from exc

    files = 0
    insertions = 0
    deletions = 0
    for line in output.splitlines():
        line = line.strip()
        if not line:
            continue
        parts = line.split("\t")
        if len(parts) < 3:
            continue
        add_raw, del_raw, _ = parts[:3]
        try:
            add = int(add_raw) if add_raw != "-" else 0
            delete = int(del_raw) if del_raw != "-" else 0
        except ValueError:
            continue
        insertions += add
        deletions += delete
        files += 1
    net = insertions - deletions
    return ChurnStats(files_changed=files, insertions=insertions, deletions=deletions, net=net)


def build_churn_record(
    *,
    window: str,
    provider: str,
    methodology: str | None,
    commit_start: str,
    commit_end: str,
    features: int,
    stats: ChurnStats,
    notes: str,
    paths: Sequence[str] | None = None,
) -> dict[str, object]:
    """Create a JSONL-ready churn record."""
    normalized = None
    if features > 0:
        normalized = stats.net / features
    record: dict[str, object] = {
        "window": window,
        "provider": provider,
        "methodology": methodology,
        "commit_start": commit_start,
        "commit_end": commit_end,
        "files_changed": stats.files_changed,
        "insertions": stats.insertions,
        "deletions": stats.deletions,
        "net": stats.net,
        "features": features,
        "normalized_churn": normalized,
        "captured_at": datetime.now(timezone.utc).isoformat(),
        "notes": notes,
        "source": "churn",
    }
    if paths:
        record["paths"] = list(paths)
    return record


def _run_git(args: Iterable[str], *, cwd: Path) -> str:
    result = subprocess.run(
        ["git", *args],
        cwd=cwd,
        capture_output=True,
        text=True,
        check=True,
    )
    return result.stdout
