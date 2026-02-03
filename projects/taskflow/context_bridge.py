import os
import json
import re
from functools import lru_cache
from typing import Dict, Any
from git import Repo


class ContextBridge:
    """Bridge context between mobile and desktop environments."""

    def __init__(self, repo_path: str = ".") -> None:
        self.repo = Repo(repo_path)

    @lru_cache(maxsize=None)
    def _read_file(self, path: str) -> str:
        """Read a file with caching."""
        with open(path, "r", encoding="utf-8") as f:
            return f.read()

    def expand_references(self, text: str) -> str:
        """Expand [[doc:path/to/file]] references with file contents."""
        pattern = re.compile(r"\[\[doc:(.*?)\]\]")

        def repl(match: re.Match) -> str:
            doc_path = match.group(1)
            try:
                content = self._read_file(doc_path)
            except FileNotFoundError:
                content = f"[MISSING DOCUMENT: {doc_path}]"
            return content

        return pattern.sub(repl, text)

    def serialize_context(self, context: Dict[str, Any], path: str) -> None:
        """Serialize context data to JSON and stage it in Git."""
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, "w", encoding="utf-8") as f:
            json.dump(context, f, indent=2)
        if self.repo.git_dir:
            self.repo.git.add(path)

    def deserialize_context(self, path: str) -> Dict[str, Any]:
        """Load context data from JSON."""
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)

    def convert_for_model(self, context: Dict[str, Any], model: str) -> str:
        """Convert context to a format suitable for the given model."""
        content = context.get("content", "")
        content = self.expand_references(content)
        metadata = context.get("metadata", {})
        header = "\n".join(f"{k}: {v}" for k, v in metadata.items())

        if model.lower() == "codex":
            return f"""{header}\n\n\"\"\"\n{content}\n\"\"\""""
        if model.lower() == "claude":
            return f"{header}\n\n{content}"
        return f"{header}\n\n{content}"

    def preserve_metadata(
        self, src_context: Dict[str, Any], dst_context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Merge metadata from src to dst, preserving existing values."""
        metadata = src_context.get("metadata", {}).copy()
        metadata.update(dst_context.get("metadata", {}))
        dst_context["metadata"] = metadata
        return dst_context

    def transfer_context(
        self, src_path: str, dst_path: str, commit_message: str
    ) -> None:
        """Transfer context between environments and commit changes."""
        context = self.deserialize_context(src_path)
        existing = {}
        if os.path.exists(dst_path):
            existing = self.deserialize_context(dst_path)
        context = self.preserve_metadata(context, existing)
        self.serialize_context(context, dst_path)
        if self.repo.is_dirty():
            self.repo.index.commit(commit_message)
