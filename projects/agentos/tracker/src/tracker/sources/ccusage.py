from __future__ import annotations

import json
from typing import Any, Dict, List


def parse_ccusage_counts(text: str) -> dict[str, Any]:
    """Parse ccusage JSON output for GLM prompt counts."""

    result: dict[str, Any] = {
        "account": None,
        "generated_at": None,
        "blocks": [],
        "prompts_used": 0.0,
        "errors": [],
    }

    try:
        payload = json.loads(text)
    except json.JSONDecodeError:
        result["errors"].append("invalid-json")
        return result

    result["account"] = payload.get("account")
    result["generated_at"] = payload.get("generated_at")

    blocks = payload.get("blocks")
    if not isinstance(blocks, list):
        result["errors"].append("invalid-blocks")
        return result

    parsed_blocks: List[Dict[str, Any]] = []
    total_prompts = 0.0
    for block in blocks:
        if not isinstance(block, dict):
            continue
        window_id = block.get("window_id")
        prompts = block.get("prompts_used")
        try:
            prompts_value = float(prompts)
        except (TypeError, ValueError):
            continue
        total_prompts += prompts_value
        parsed_blocks.append(
            {
                "window_id": window_id,
                "prompts_used": prompts_value,
                "provider": block.get("provider"),
                "duration_minutes": block.get("duration_minutes"),
                "notes": block.get("notes"),
            }
        )

    if not parsed_blocks:
        result["errors"].append("no-blocks")

    result["blocks"] = parsed_blocks
    result["prompts_used"] = total_prompts
    result["errors"] = _dedupe(result["errors"])
    return result


def _dedupe(items: List[str]) -> List[str]:
    seen: List[str] = []
    for item in items:
        if item not in seen:
            seen.append(item)
    return seen
