#!/usr/bin/env python3
"""
Structured JSON converter (BDD-style)

Reads VTT + diarized utterance JSON, aligns speakers, and emits structured JSON with
utterances (ms timestamps, gaps, speaker, confidence) and pre-calculated
search/greeting/closing metrics.

Primary: call_05 → phase1_analysis/structured_json_handoff/output/call_05_structured.json
Secondary (optional): call_02 → phase1_analysis/structured_json_handoff/output/call_02_structured.json
"""

import copy
import json
import re
from pathlib import Path
from typing import List, Dict, Any, Optional, Iterable, Tuple

BASE = Path(__file__).resolve().parent
REPO_ROOT = BASE.parent.parent
OUTPUT_DIR = BASE / "output"


def ts_to_ms(ts: str) -> int:
    ts = ts.replace(",", ".")
    parts = ts.split(":")
    if len(parts) == 3:
        h, m, s = parts
        total = int(h) * 3600 + int(m) * 60 + float(s)
    else:
        m, s = parts
        total = int(m) * 60 + float(s)
    return int(round(total * 1000))


def normalize_speaker(raw: Optional[str]) -> Optional[str]:
    if not raw:
        return None
    s = raw.strip().lower()
    if s.startswith("agent") or s.startswith("operator"):
        return "agent"
    if s.startswith("customer") or s.startswith("client") or s == "caller":
        return "customer"
    return s


def parse_vtt(vtt_path: Path) -> List[Dict[str, Any]]:
    if not vtt_path.exists():
        raise FileNotFoundError(vtt_path)

    lines = vtt_path.read_text(encoding="utf-8").splitlines()
    entries: List[Dict[str, Any]] = []
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        i += 1
        if not line or line == "WEBVTT" or line.isdigit():
            continue
        if "-->" not in line:
            continue

        start_part, end_part = [p.strip() for p in line.split("-->")]
        speaker = None
        if "<AGENT>" in end_part:
            speaker = "agent"
            end_part = end_part.replace("<AGENT>", "").strip()
        elif "<CUSTOMER>" in end_part:
            speaker = "customer"
            end_part = end_part.replace("<CUSTOMER>", "").strip()

        start_ms = ts_to_ms(start_part)
        end_ms = ts_to_ms(end_part)

        text_lines: List[str] = []
        while i < len(lines) and lines[i].strip() and "-->" not in lines[i] and not lines[i].strip().isdigit():
            text_lines.append(lines[i].strip())
            i += 1

        if not text_lines:
            continue

        entries.append(
            {
                "start_ms": start_ms,
                "end_ms": end_ms,
                "speaker": speaker,
                "text": " ".join(text_lines),
                "confidence": None,
            }
        )
    return entries


def load_diarized_json(path: Path, total_duration_ms: Optional[int] = None) -> List[Dict[str, Any]]:
    if not path.exists():
        return []
    data = json.loads(path.read_text(encoding="utf-8"))
    if isinstance(data, dict) and "utterances" in data:
        data = data["utterances"]

    utterances: List[Dict[str, Any]] = []
    for item in data:
        start_raw = item.get("start")
        end_raw = item.get("end")
        if start_raw is None or end_raw is None:
            continue

        def to_ms(value: float) -> int:
            # Heuristic: groq file is in seconds (<10_000), assembly is already ms (>10_000)
            if value is None:
                return 0
            if value < 10_000:
                return int(round(value * 1000))
            return int(round(value))

        start_ms = to_ms(start_raw)
        end_ms = to_ms(end_raw)
        speaker = normalize_speaker(item.get("speaker"))
        utterances.append(
            {
                "start_ms": start_ms,
                "end_ms": end_ms,
                "speaker": speaker,
                "text": item.get("text", ""),
                "confidence": item.get("confidence"),
            }
        )
    return sorted(utterances, key=lambda x: x["start_ms"])


def best_overlap_speaker(entry: Dict[str, Any], diarized: List[Dict[str, Any]]) -> Tuple[Optional[str], Optional[float]]:
    start = entry["start_ms"]
    end = entry["end_ms"]
    best_speaker = None
    best_conf = None
    best_overlap = 0

    # diarized is sorted; check small neighborhood
    left = 0
    right = len(diarized)
    while left < right and diarized[left]["end_ms"] <= start:
        left += 1
    for d in diarized[max(0, left - 3) : min(len(diarized), left + 6)]:
        overlap = min(end, d["end_ms"]) - max(start, d["start_ms"])
        if overlap > best_overlap:
            best_overlap = overlap
            best_speaker = d["speaker"]
            best_conf = d.get("confidence")
    return best_speaker, best_conf


def align_entries(vtt_entries: List[Dict[str, Any]], diarized: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    entries = sorted(vtt_entries, key=lambda e: e["start_ms"])
    for entry in entries:
        if diarized:
            speaker, conf = best_overlap_speaker(entry, diarized)
            if speaker:
                entry["speaker"] = speaker
                if conf is not None:
                    entry["confidence"] = conf

    verbs = ("посмотр", "провер", "уточн", "глян", "найд")
    info_tokens = (
        "есть",
        "имеется",
        "готов",
        "наш",
        "будут",
        "стоим",
        "стоимос",
        "диск",
        "шина",
        "номер",
        "в наличии",
        "оплат",
        "сумм",
        "итог",
        "можно будет",
        "совпад",
        "подойд",
        "параметр",
    )
    strong_tokens = (
        "есть",
        "имеется",
        "будут",
        "в наличии",
        "стоим",
        "стоимос",
        "оплат",
        "сумм",
        "итог",
        "подойд",
        "совпад",
        "готов",
        "номер",
        "стоимость",
        "диск",
        "шина",
    )

    def is_search_cue(text_lower: str) -> bool:
        has_minute = "минут" in text_lower
        has_now = ("сейчас" in text_lower) or ("щас" in text_lower)
        has_verb = any(v in text_lower for v in verbs)
        return bool(has_minute or (has_now and has_verb))

    # Light heuristics for obvious agent utterances (gratitude/search cue)
    for entry in entries:
        if entry.get("speaker"):
            continue
        text_lower = entry["text"].lower()
        if "спасибо" in text_lower or "благодар" in text_lower or is_search_cue(text_lower):
            entry["speaker"] = "agent"

    # Fill remaining missing speakers by alternation starting with agent
    for idx, entry in enumerate(entries):
        if entry.get("speaker"):
            continue
        if idx == 0:
            entry["speaker"] = "agent"
        else:
            prev = entries[idx - 1].get("speaker", "agent")
            entry["speaker"] = "customer" if prev == "agent" else "agent"
    return entries


def add_ids_and_gaps(entries: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    prev_end = None
    for idx, entry in enumerate(entries, start=1):
        entry["id"] = idx
        entry["duration_ms"] = entry["end_ms"] - entry["start_ms"]
        entry["gap_from_previous_ms"] = None if prev_end is None else max(0, entry["start_ms"] - prev_end)
        prev_end = entry["end_ms"]
    return entries


def detect_searches(entries: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    searches: List[Dict[str, Any]] = []
    THANKS_WINDOW_MS = 15000
    info_tokens = (
        "есть",
        "имеется",
        "готов",
        "наш",
        "будут",
        "стоим",
        "стоимос",
        "стоимость",
        "диск",
        "диски",
        "шина",
        "шины",
        "шин",
        "номер",
        "в наличии",
        "оплат",
        "сумм",
        "итог",
        "можно будет",
        "совпад",
        "подойд",
        "параметр",
        "размер",
        "размеры",
        "предоплат",
        "адрес",
        "пункт",
        "компан",
        "транспортн",
    )
    strong_tokens = (
        "есть",
        "имеется",
        "будут",
        "в наличии",
        "стоим",
        "стоимос",
        "стоимость",
        "оплат",
        "сумм",
        "итог",
        "подойд",
        "совпад",
        "готов",
        "номер",
        "диск",
        "диски",
        "шина",
        "шины",
        "шин",
        "размер",
        "размеры",
        "предоплат",
        "адрес",
        "пункт",
        "компан",
        "транспортн",
    )
    thanks_re = re.compile(r"(спасибо|благодар)[^\\n]{0,40}(ожидан|ждал|ждали|подождал)", re.IGNORECASE)
    thanks_simple = re.compile(r"(спасибо|благодар)", re.IGNORECASE)
    verbs = ("посмотр", "провер", "уточн", "глян", "найд")
    word_tokens = {"есть", "наш", "номер", "диск", "диски", "шина", "шины", "шин", "итог", "размер", "адрес", "пункт", "компан", "стоимость"}

    def is_search_cue(text_lower: str) -> bool:
        has_minute = "минут" in text_lower
        has_now = ("сейчас" in text_lower) or ("щас" in text_lower)
        has_verb = any(v in text_lower for v in verbs)
        return bool(has_minute or (has_now and has_verb))

    def has_token(text_lower: str, tokens: Tuple[str, ...]) -> bool:
        for tok in tokens:
            if tok in word_tokens:
                if re.search(rf"\b{re.escape(tok)}\b", text_lower):
                    return True
            elif tok in text_lower:
                return True
        return False

    active_start: Optional[int] = None
    active_announcement_text: Optional[str] = None

    for entry in entries:
        if entry["speaker"] != "agent":
            continue
        text_lower = entry["text"].lower()
        is_cue = is_search_cue(text_lower)
        has_info = has_token(text_lower, info_tokens) or has_token(text_lower, strong_tokens)

        if active_start is None:
            if is_cue:
                active_start = entry["start_ms"]
                active_announcement_text = entry["text"]
            continue

        # Already in a search window: end only on a substantive non-cue agent return
        if is_cue:
            continue
        if not has_info:
            continue

        start_ms = active_start
        end_ms = entry["start_ms"]
        duration_ms = max(0, end_ms - start_ms)
        duration_sec = round(duration_ms / 1000.0, 2)
        customer_between = any(
            u["speaker"] == "customer" and start_ms <= u["start_ms"] <= end_ms for u in entries
        )
        searches.append(
            {
                "announced_at_ms": start_ms,
                "ended_at_ms": end_ms,
                "duration_sec": duration_sec,
                "thanks_given": False,
                "customer_interactive": customer_between,
                "announcement_text": active_announcement_text,
            }
        )
        active_start = None
        active_announcement_text = None

    # Thanks detection with generous window (15s)
    for s in searches:
        window_end = s["ended_at_ms"] + THANKS_WINDOW_MS
        for entry in entries:
            if entry["speaker"] != "agent":
                continue
            if entry["start_ms"] < s["ended_at_ms"]:
                continue
            if entry["start_ms"] > window_end:
                break
            text = entry["text"].lower()
            if thanks_re.search(text) or thanks_simple.search(text):
                s["thanks_given"] = True
                break

    return sorted(searches, key=lambda s: s["announced_at_ms"])


def detect_echo_method_instances(entries: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    instances: List[Dict[str, Any]] = []

    data_types = [
        ("phone", ("телефон", "номер")),
        ("email", ("email", "e-mail", "почт", "электрон")),
        ("address", ("адрес", "улиц", "дом", "квартир")),
        ("surname", ("фамил",)),
        ("name", ("имя", "звать", "как вас", "как к вам")),
    ]
    reuse_keywords = (
        "так же",
        "тот же",
        "то же",
        "как раньше",
        "как в прошл",
        "из прошл",
        "оставляем",
        "оставлю",
        "прежн",
    )
    confirm_keywords = ("верно", "правильно", "да?", "укаж", "подтверж")
    yes_re = re.compile(r"\b(да|угу|ага|верно|правильно|конечно)\b", re.IGNORECASE)

    def detect_data_type(text_lower: str) -> Optional[str]:
        # Skip order number mentions
        if "номер заказа" in text_lower or "заказа" in text_lower and "номер" in text_lower:
            return None
        for dt, toks in data_types:
            if any(tok in text_lower for tok in toks):
                return dt
        return None

    for idx, entry in enumerate(entries):
        text_lower = entry["text"].lower()
        data_type = detect_data_type(text_lower)
        if not data_type:
            continue

        pattern = "new_entry"
        if any(k in text_lower for k in reuse_keywords):
            pattern = "reuse_existing"
        else:
            next_entry = entries[idx + 1] if idx + 1 < len(entries) else None
            next_text_lower = next_entry["text"].lower() if next_entry else ""
            if text_lower.strip().endswith("?") or any(k in text_lower for k in confirm_keywords):
                pattern = "echo_with_confirmation"
            elif next_entry and yes_re.search(next_text_lower):
                pattern = "echo_with_confirmation"

        customer_response = entries[idx + 1]["text"] if idx + 1 < len(entries) else None
        instances.append(
            {
                "data_type": data_type,
                "timestamp_ms": entry["start_ms"],
                "pattern": pattern,
                "operator_text": entry["text"],
                "customer_response": customer_response,
            }
        )

    return instances


def build_output(call_id: str,
                 operator: str,
                 total_duration_ms: Optional[int],
                 date_str: Optional[str],
                 entries: List[Dict[str, Any]]) -> Dict[str, Any]:
    utterances = add_ids_and_gaps(entries)
    if total_duration_ms is None and utterances:
        total_duration_ms = utterances[-1]["end_ms"]

    pre_calculated = {
        "searches": detect_searches(utterances),
        "greeting_delay_ms": utterances[0]["start_ms"] if utterances else None,
        "closing_delay_ms": None,
        "echo_method_instances": detect_echo_method_instances(utterances),
    }
    if utterances and total_duration_ms is not None:
        pre_calculated["closing_delay_ms"] = max(0, total_duration_ms - utterances[-1]["end_ms"])

    return {
        "call_metadata": {
            "call_id": call_id,
            "operator": operator,
            "total_duration_ms": total_duration_ms,
            "date": date_str,
        },
        "utterances": utterances,
        "pre_calculated": pre_calculated,
    }


def simplify_output(full_data: Dict[str, Any]) -> Dict[str, Any]:
    allowed_search_keys = {
        "announced_at_ms",
        "ended_at_ms",
        "duration_sec",
        "thanks_given",
        "customer_interactive",
        "announcement_text",
    }
    simplified = copy.deepcopy(full_data)
    searches = simplified.get("pre_calculated", {}).get("searches", [])
    simplified["pre_calculated"]["searches"] = [
        {k: v for k, v in s.items() if k in allowed_search_keys} for s in searches
    ]
    simplified["pre_calculated"].setdefault("echo_method_instances", [])
    return simplified


def convert_call(call_id: str,
                 operator: str,
                 vtt_path: Path,
                 diarized_path: Optional[Path] = None,
                 total_duration_ms: Optional[int] = None,
                 date_str: Optional[str] = None,
                 out_name: Optional[str] = None,
                 simplified_out_name: Optional[str] = None) -> Path:
    vtt_entries = parse_vtt(vtt_path)
    diarized_entries = load_diarized_json(diarized_path, total_duration_ms) if diarized_path else []
    merged = align_entries(vtt_entries, diarized_entries)
    output = build_output(call_id, operator, total_duration_ms, date_str, merged)

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    out_file = OUTPUT_DIR / (out_name or f"call_{call_id}_structured.json")
    out_file.write_text(json.dumps(output, ensure_ascii=False, indent=2), encoding="utf-8")

    if simplified_out_name:
        simplified_output = simplify_output(output)
        simplified_file = OUTPUT_DIR / simplified_out_name
        simplified_file.write_text(json.dumps(simplified_output, ensure_ascii=False, indent=2), encoding="utf-8")
    return out_file


def main():
    calls = [
        {
            "call_id": "05",
            "operator": "Анна",
            "vtt": REPO_ROOT / "calls" / "call_05" / "transcript-2.vtt",
            "diar": Path.home() / "Desktop/call_step_pairs_all/call_05/07/07_contact_utterances_call_05_groq.json",
            "total_ms": 568000,
            "date": "2025-11-19",
            "simplified_out": "call_05_structured_input_min.json",
        },
        {
            "call_id": "02",
            "operator": "Ирина",
            "vtt": REPO_ROOT / "calls" / "call_02" / "transcript-2.vtt",
            "diar": Path.home() / "Desktop/call_step_pairs_all/call_02/07/07_contact_utterances_call_02_assembly.json",
            "total_ms": 329000,
            "date": "2025-11-19",
            "out": "call_02_structured.json",
            "simplified_out": "call_02_structured_input_min.json",
        },
        {
            "call_id": "08",
            "operator": "Алина",
            "vtt": REPO_ROOT / "calls" / "call_08" / "transcript-2.vtt",
            "diar": None,
            "total_ms": None,
            "date": None,
            "out": "call_08_structured.json",
            "simplified_out": "call_08_structured_input_min.json",
        },
    ]

    for cfg in calls:
        out = convert_call(
            call_id=cfg["call_id"],
            operator=cfg["operator"],
            vtt_path=cfg["vtt"],
            diarized_path=cfg.get("diar"),
            total_duration_ms=cfg.get("total_ms"),
            date_str=cfg.get("date"),
            out_name=cfg.get("out"),
            simplified_out_name=cfg.get("simplified_out"),
        )
        print(f"Wrote {out}")


if __name__ == "__main__":
    main()
