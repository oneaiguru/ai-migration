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
ORDER_NUMBER_SLOPPY_RE = re.compile(r"(?:\d[\s\-]?){6,8}")
ORDER_NUMBER_LABELED_RE = re.compile(
    r"(?:(?:номер|бронь|заказ)\s*(?:заказа)?|код\s*(?:заказа|брони))\s*[:#–-]?\s*((?:\d[\s-]?){6,8}|\d{2}\s\d{2}\s\d{2,4})",
    re.IGNORECASE,
)
PHONE_LIKE_RE = re.compile(r"(?:\+?7|8)[\s\d()\-\+]{9,12}")
ORDER_KEYWORD_RE = re.compile(r"(номер|заказ|бронь|оформл|код\s+(?:заказ|брони))", re.IGNORECASE)
MARKETPLACE_TOKENS = {
    "ozon": (" ozon", "ozon", "озон"),
    "yandex": ("яндекс маркет", "яндекс-маркет", "yandex market", "яндекс.маркет"),
    "sber": ("сбермегамаркет", "сбер мегамаркет", "сбермаркет"),
    "wb": ("wildberries", "wild berry", "wild-berries", " вб", " wb", "вайлдберри", "вайлдберриз"),
}
PAYMENT_GATEWAY_TOKENS = (
    "яндекс pay",
    "yandex pay",
    "яндекс.пей",
    "яндекс пей",
    "яндекс пэй",
    "яндекс.пэй",
    "яндекс плей",
    "яндекс.плей",
    "яндекс плейс",
    "яндекс.плейс",
    "yandexpay",
)
WHEEL_CONTEXT_STRICT = ("диск", "диски", "лит", "лить", "литье", "литьё", "штамп", "штампован", "кован")


def _normalize_order_number_candidate(raw: str) -> Optional[str]:
    digits = re.sub(r"\D", "", raw)
    if 6 <= len(digits) <= 8:
        return digits
    return None


def extract_order_numbers_with_positions(text: str) -> List[Tuple[str, int, bool]]:
    results: List[Tuple[str, int, bool]] = []
    text_lower = text.lower()

    def add_candidate(raw: str, start: int, labeled: bool):
        num = _normalize_order_number_candidate(raw)
        if not num:
            return
        window = text_lower[max(0, start - 4) : start + len(raw) + 4]
        if PHONE_LIKE_RE.search(window):
            return
        prefix = text_lower[max(0, start - 12) : start]
        if any(tok in prefix for tok in ("руб", "₽", "тыс", "%", "74колес")):
            return
        if "74" in prefix and "колес" in prefix:
            return
        if prefix.strip().endswith("+7") or prefix.strip().endswith("8") and len(num) >= 7:
            return
        results.append((num, start, labeled))

    for m in ORDER_NUMBER_LABELED_RE.finditer(text_lower):
        add_candidate(m.group(1), m.start(1), True)

    if ORDER_KEYWORD_RE.search(text_lower):
        for m in ORDER_NUMBER_SLOPPY_RE.finditer(text_lower):
            add_candidate(m.group(0), m.start(), False)

    return results


def detect_marketplace_platform(text_lower: str) -> Optional[str]:
    pay_hit = any(tok in text_lower for tok in PAYMENT_GATEWAY_TOKENS)
    for platform, toks in MARKETPLACE_TOKENS.items():
        for tok in toks:
            if tok.strip() == tok and not tok.startswith(" "):
                if re.search(rf"\b{re.escape(tok)}\w*\b", text_lower):
                    return platform
            elif tok in text_lower:
                return platform
    if pay_hit:
        return None
    return None


def is_plausible_tire_size(width: str, height: str, rim: str) -> bool:
    try:
        w = int(width)
        h = int(height)
        r = int(rim)
    except Exception:
        return False
    return 90 <= w <= 355 and 25 <= h <= 85 and 12 <= r <= 24


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



def annotate_speaker_confidence(entries: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Assign a lightweight confidence score to each utterance speaker label."""

    agent_cues = ("могу предложить", "можем предложить", "у нас есть", "предложу")
    customer_cues = ("мне нужно", "мне бы", "хочу", "у меня", "нужно бы")
    price_tokens = ("руб", "стоим", "стоимос", "цена", "итог", "сумм", "оплат")

    def has_price(text_lower: str) -> bool:
        if any(tok in text_lower for tok in price_tokens):
            return True
        return bool(re.search(r"\b\d{2,}\s*(?:руб|тыс)\b", text_lower))

    for entry in entries:
        txt_lower = entry.get("text", "").lower()
        assigned = entry.get("speaker")
        score = 0.5
        agent_hit = any(cue in txt_lower for cue in agent_cues) or has_price(txt_lower)
        customer_hit = any(cue in txt_lower for cue in customer_cues)

        diar_conf = entry.get("confidence")
        if isinstance(diar_conf, (int, float)):
            score = max(score, min(1.0, float(abs(diar_conf))))

        if assigned == "agent":
            if agent_hit:
                score += 0.3
            if customer_hit:
                score -= 0.3
        elif assigned == "customer":
            if customer_hit:
                score += 0.3
            if agent_hit:
                score -= 0.3

        entry["speaker_confidence"] = max(0.0, min(1.0, round(score, 3)))
    return entries
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
    MIN_SEARCH_END_MS = 20000
    info_tokens = (
        "есть",
        "имеется",
        "готов",
        "нашел",
        "нашла",
        "найд",
        "будут",
        "в наличии",
        "стоим",
        "стоимос",
        "руб",
        "стоимость",
        "цена",
        "можно будет",
        "получает",
        "получится",
        "диск",
        "диски",
        "шина",
        "шины",
        "шин",
        "номер",
        "оплат",
        "сумм",
        "итог",
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
        "вариант",
        "можно будет",
        "год выпуска",
    )
    strong_tokens = (
        "есть",
        "имеется",
        "будут",
        "в наличии",
        "стоим",
        "стоимос",
        "руб",
        "стоимость",
        "цена",
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
        "вариант",
    )
    thanks_re = re.compile(r"(спасибо|благодар)[^\\n]{0,40}(ожидан|ждал|ждали|подождал)", re.IGNORECASE)
    thanks_simple = re.compile(r"(спасибо|благодар)", re.IGNORECASE)
    verbs = ("посмотр", "провер", "уточн", "глян", "найд", "подбер", "посчита", "подсмотр")
    word_tokens = {"есть", "наш", "номер", "диск", "диски", "шина", "шины", "шин", "итог", "размер", "адрес", "пункт", "компан", "стоимость", "цена", "руб"}
    hold_cues = ("минут", "секунд", "секундоч", "минутк", "подожд", "оставайтесь", "на линии")

    def is_search_cue(text_lower: str) -> bool:
        has_minute = "минут" in text_lower
        has_second = "секунд" in text_lower or "секундоч" in text_lower
        has_now = ("сейчас" in text_lower) or ("щас" in text_lower) or ("давайте" in text_lower)
        has_verb = any(v in text_lower for v in verbs)
        return bool(has_minute or has_second or (has_now and has_verb))

    def is_hold_extension(text_lower: str) -> bool:
        return any(tok in text_lower for tok in hold_cues)

    end_tokens = (
        "руб",
        "стоим",
        "стоимос",
        "цена",
        "стоимость",
        "в налич",
        "готов",
        "можно забрать",
        "достав",
        "вариант",
    )

    def has_strong_end(text_lower: str) -> bool:
        if any(tok in text_lower for tok in end_tokens):
            return True
        return False

    def has_token(text_lower: str, tokens: Tuple[str, ...]) -> bool:
        has_number = bool(re.search(r"\b\d{2,}\b", text_lower))
        if has_number and any(k in text_lower for k in ("руб", "тыс", "литр", "шт", "штук", "колес", "колёс", "колеса", "резин", "диски", "диск")):
            return True
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

        if thanks_simple.search(text_lower):
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
                    "thanks_given": True,
                    "customer_interactive": customer_between,
                    "announcement_text": active_announcement_text,
                }
            )
            active_start = None
            active_announcement_text = None
            continue

        # Already in a search window: end only on a substantive non-cue agent return
        if is_cue or is_hold_extension(text_lower):
            continue
        if not has_info:
            continue
        elapsed = entry["start_ms"] - active_start

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

    searches = sorted(searches, key=lambda s: s["announced_at_ms"])

    # Merge adjacent searches separated by small gaps to avoid over-segmentation on quick follow-ups
    MERGE_GAP_MS = 10000
    MAX_MERGED_DURATION_MS = 80000
    merged: List[Dict[str, Any]] = []
    for s in searches:
        if merged and s["announced_at_ms"] - merged[-1]["ended_at_ms"] <= MERGE_GAP_MS:
            potential_duration = s["ended_at_ms"] - merged[-1]["announced_at_ms"]
            if potential_duration <= MAX_MERGED_DURATION_MS:
                merged[-1]["ended_at_ms"] = s["ended_at_ms"]
                merged[-1]["duration_sec"] = round(potential_duration / 1000.0, 2)
                merged[-1]["thanks_given"] = merged[-1]["thanks_given"] or s["thanks_given"]
                merged[-1]["customer_interactive"] = merged[-1]["customer_interactive"] or s["customer_interactive"]
                if not merged[-1].get("announcement_text"):
                    merged[-1]["announcement_text"] = s.get("announcement_text")
                continue
        merged.append(dict(s))

    return merged


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


def detect_call_context(entries: List[Dict[str, Any]]) -> Dict[str, Any]:
    texts = [e["text"].lower() for e in entries]
    joined = " ".join(texts)
    tire_tokens = ("шина", "шины", "резин", "покрыш", "баллон")
    wheel_tokens = ("диск", "диски", "литые", "литой", "литье", "литьё", "штампован", "кован", "колесные диски")
    repeat_tokens = (
        "как обычно",
        "как в прошл",
        "тот же",
        "то же",
        "как раньше",
        "оставляем",
        "прежн",
        "не первый раз",
        "пару раз",
        "у вас уже",
        "у вас брал",
        "у вас покупал",
        "снова",
        "опять",
    )
    order_status_tokens = ("статус", "готов", "когда забрать", "в пути", "проверить заказ", "возврат", "вернуть", "отмен", "не пришл")
    order_creation_tokens = (
        "оформляю",
        "оформлю",
        "оформим",
        "оформили",
        "оформлен",
        "создала",
        "создал",
        "создам",
        "создадим",
        "создад",
        "создаю",
        "выпис",
        "запис",
        "заказ оформ",
        "давайте оформ",
        "сделаю заказ",
        "брониру",
        "бронь офор",
        "броню",
    )
    order_intent_tokens = ("закаж", "возьму", "берите", "готов взять", "готов заказать", "готов оформить", "оформляем")
    self_service_tokens = (
        "сам оформ",
        "сам закаж",
        "сам куп",
        "сам сдел",
        "сам через сайт",
        "сам опла",
        "я уже сам",
        "сам посмотр",
        "оформлю сам",
        "закажу сам",
        "куплю сам",
        "сделаю сам",
        "сам оформлю",
        "сам закажу",
        "сам куплю",
        "сам сделаю",
    )

    def has_any(text: str, tokens: Iterable[str]) -> bool:
        return any(tok in text for tok in tokens)

    def detect_call_type() -> str:
        joined_lower = joined
        has_tire_service = has_any(
            joined_lower, ("записать на шиномонтаж", "запись на шиномонтаж", "переобув", "запишу на шиномонтаж")
        ) or (
            "шиномонтаж" in joined_lower and any(tok in joined_lower for tok in ("запис", "запиш", "бронь", "брон"))
        )
        marketplace_platform = detect_marketplace_platform(joined_lower)
        order_number_present = False
        labeled_order_number_present = False
        status_with_number = 0
        new_order_number_announced = 0

        for t in texts:
            has_status_kw = any(k in t for k in order_status_tokens)
            has_creation_kw = any(k in t for k in order_creation_tokens)
            has_new_number_phrase = ("номер" in t and ("заказ" in t or "брон" in t))
            numbers = extract_order_numbers_with_positions(t)
            if numbers:
                order_number_present = True
            for _num, _pos, labeled in numbers:
                if labeled:
                    labeled_order_number_present = True
                near_order_kw = labeled or has_new_number_phrase or has_creation_kw
                if has_status_kw:
                    status_with_number += 1
                if near_order_kw and not has_status_kw:
                    new_order_number_announced += 1

        status_intent = any(
            ("статус заказа" in t)
            or ("проверить заказ" in t)
            or ("номер заказа" in t and ("статус" in t or "готов" in t))
            or (("возврат" in t or "отмен" in t or "вернуть" in t) and ("заказ" in t or "брон" in t))
            for t in texts
        )
        order_creation_phrase = has_any(
            joined_lower,
            (
                "оформляю заказ",
                "оформлю заказ",
                "заказ оформлен",
                "создала заказ",
                "создал заказ",
                "оформим заказ",
                "оформили заказ",
                "заказ оформили",
                "сейчас оформлю",
            ),
        )
        self_service_intent = any(tok in joined_lower for tok in self_service_tokens)
        has_order_intent = order_creation_phrase or has_any(joined_lower, order_intent_tokens)
        has_status = status_with_number > 0 or (order_number_present and status_intent)
        has_order_creation = new_order_number_announced > 0 or (has_order_intent and not self_service_intent)
        has_tire_service_only = has_tire_service and not has_order_intent

        if has_status and has_order_creation:
            if status_with_number >= new_order_number_announced or status_intent:
                return "STATUS_INQUIRY"
            return "ORDER"
        if has_order_creation:
            return "ORDER"
        if has_status:
            return "STATUS_INQUIRY"
        if has_tire_service_only:
            return "TIRE_SERVICE"
        if marketplace_platform and not (has_order_creation or has_status or has_tire_service):
            return "OTHER"
        return "PRODUCT_INQUIRY"

    tire_hits = sum(1 for t in texts if has_any(t, tire_tokens))
    wheel_hits = sum(1 for t in texts if has_any(t, wheel_tokens))
    is_wheel_call = wheel_hits > tire_hits and wheel_hits > 0
    is_tire_call = tire_hits > 0 and tire_hits >= wheel_hits

    return {
        "call_type": detect_call_type(),
        "is_tire_call": is_tire_call,
        "is_wheel_call": is_wheel_call,
        "has_repeat_customer": any(tok in joined for tok in repeat_tokens),
    }


def extract_entities(entries: List[Dict[str, Any]]) -> Dict[str, Any]:
    car_brands = (
        "toyota",
        "bmw",
        "audi",
        "mercedes",
        "kia",
        "hyundai",
        "renault",
        "lada",
        "skoda",
        "volkswagen",
        "vw",
        "nissan",
        "ford",
        "mazda",
        "chevrolet",
        "honda",
        "mitsubishi",
        "peugeot",
        "citroen",
        "volvo",
        "lexus",
        "infiniti",
        "opel",
        "seat",
        "subaru",
        "suzuki",
        "jeep",
        "dodge",
        "chrysler",
        "fiat",
        "geely",
        "chery",
        "haval",
        "byd",
    )

    def add_unique(lst: List[Any], value: Any):
        if value and value not in lst:
            lst.append(value)

    tire_sizes: List[str] = []
    rim_sizes: List[str] = []
    bolt_patterns: List[str] = []
    quantities: List[int] = []
    quantity_candidates: List[Tuple[int, bool, int, str, bool]] = []
    quantity_match_candidates: List[Tuple[int, str]] = []
    quantity_matches: List[str] = []
    car_models: List[str] = []
    seasons: List[str] = []
    season_counts = {"winter": 0, "summer": 0, "allseason": 0}
    order_numbers: List[str] = []
    legal_entity_markers: List[str] = []
    marketplace_platform: Optional[str] = None
    disk_diameter: Optional[int] = None
    found_wheel_context = False
    pending_short_digits: Optional[str] = None
    tire_size_with_wheel_context = False
    rim_from_context = False

    size_patterns = [
        re.compile(r"\b(\d{3})\s*[/-]?\s*(\d{2})\s*(?:r|р)\s*[- ]?(\d{2})\b", re.IGNORECASE),
        re.compile(r"\b(\d{3})\s+[xх/]\s*(\d{2})\s*(?:r|р)\s*(\d{2})\b", re.IGNORECASE),
        re.compile(r"\b(\d{3})\s*[ -]\s*(\d{2})\s*[ -]?\s*(\d{2})\b", re.IGNORECASE),
    ]
    rim_pattern = re.compile(r"\b[рr]\s*-?\s*(\d{2})\b", re.IGNORECASE)
    rim_word_pattern = re.compile(r"радиус\s*(\d{2})", re.IGNORECASE)
    wheel_size_pattern = re.compile(r"\b(1[3-9]|2[0-4])\s*на\s*\d", re.IGNORECASE)
    wheel_radius_prefix_pattern = re.compile(r"\b(1[3-9]|2[0-4])\s*-?\s*й?\s*радиус\b", re.IGNORECASE)
    diameter_word_pattern = re.compile(r"диаметр\s*(\d{2})", re.IGNORECASE)
    diameter_prefix_pattern = re.compile(r"(\d{2})\s*диаметр", re.IGNORECASE)
    rim_word_numbers = {
        "тринадц": 13,
        "четырнадц": 14,
        "пятнадц": 15,
        "шестнадц": 16,
        "семнадц": 17,
        "восемнадц": 18,
        "девятнадц": 19,
        "двадцать один": 21,
        "двадцать два": 22,
        "двадцать": 20,
    }
    inch_pattern = re.compile(r"\b(1[3-9]|2[0-4])\s*(?:дюйм|\"|'')", re.IGNORECASE)
    size_triple_pattern = re.compile(r"\b(\d{3})\s*[ ,/]?\s*(\d{2})\s*(?:на|r|р)\s*(\d{2})\b", re.IGNORECASE)
    bolt_pattern = re.compile(r"\b(\d)\s*[xх]\s*(\d{2,3})\b", re.IGNORECASE)
    qty_pattern = re.compile(
        r"\b(\d{1,2})\s*(?:шт|штук|колес|колёс|колеса|колесо|комплект(?:а|ов)?|к-?т|к-т|пар|пары|пара|пакет(?:а|ов)?|диск(?:а|ов)?|шина|шины|шин|покрыш[а-я]*)\b",
        re.IGNORECASE,
    )
    qty_word_pattern = re.compile(
        r"\b(один|одна|одно|одну|два|две|три|четыре|пять|шесть|семь|восемь|девять|десять|одиннадцать|двенадцать)\b"
        r"(?:\s+|-)?(?:шт|штук|колес|колёс|колеса|комплект|к-?т|к-т|пар|пары|пара)?",
        re.IGNORECASE,
    )
    qty_word_map = {
        "один": 1,
        "одна": 1,
        "одно": 1,
        "одну": 1,
        "два": 2,
        "две": 2,
        "три": 3,
        "четыре": 4,
        "пять": 5,
        "шесть": 6,
        "семь": 7,
        "восемь": 8,
        "девять": 9,
        "десять": 10,
        "одиннадцать": 11,
        "двенадцать": 12,
    }

    brand_patterns = {b: re.compile(rf"\b({re.escape(b)})\s*([\w-]{{0,10}})?", re.IGNORECASE) for b in car_brands}

    quantity_context_tokens = (
        "шт",
        "штук",
        "колес",
        "колёс",
        "колеса",
        "колесо",
        "комплект",
        "к-т",
        "к- т",
        "пара",
        "пар",
        "баллон",
        "шина",
        "шины",
        "резин",
        "диск",
        "диски",
        "пакет",
        "покрыш",
    )
    quantity_context_stem_patterns = (
        re.compile(r"\bшин[а-я]{1,3}\b", re.IGNORECASE),
        re.compile(r"\bпокрыш[а-я]{0,3}\b", re.IGNORECASE),
    )
    wheel_context_tokens = ("диск", "диски", "лит", "лить", "литье", "литьё", "штамп", "штампован", "кован", "колесн")
    wheel_brand_tokens = ("trebl", "treble", "skad", "скад", "k&k", "k k", "реплик", "alfard", "алфар", "trekbl")
    legal_tokens = ("ооо", "ип", "юр. лицо", "юр лицо", "юрлицо", "инн", "кпп")
    order_number_pattern = ORDER_NUMBER_SLOPPY_RE

    def has_quantity_context(text_lower: str) -> bool:
        if any(tok in text_lower for tok in quantity_context_tokens):
            return True
        return any(pat.search(text_lower) for pat in quantity_context_stem_patterns)

    def allow_loose_quantity_word(text_lower: str, has_quantity_ctx: bool, has_wheel_context: bool) -> bool:
        if has_quantity_ctx or has_wheel_context:
            return True
        if any(bad in text_lower for bad in ("руб", "тыс", "номер", "код", "заказ", "оплат", "минут", "секунд", "час")):
            return False
        soft_ctx_tokens = (
            "шина",
            "шины",
            "резин",
            "покрыш",
            "колес",
            "колёс",
            "колеса",
            "комплект",
            "пакет",
            "диск",
            "диски",
        )
        if any(tok in text_lower for tok in soft_ctx_tokens):
            return True
        tokens = text_lower.strip().split()
        if len(tokens) <= 3:
            return True
        return False

    def has_negative(text_lower: str, token: str) -> bool:
        return f"не {token}" in text_lower or f"не{token}" in text_lower

    for entry in entries:
        text = entry["text"]
        text_lower = text.lower()
        text_clean = re.sub(r"[,.;\-]+", " ", text_lower)
        sizes_in_entry = set()
        rim_in_entry = None
        has_wheel_context = any(tok in text_lower for tok in wheel_context_tokens)
        wheel_brand_hit = any(tok in text_lower for tok in wheel_brand_tokens)
        has_quantity_ctx = has_quantity_context(text_lower)
        if has_wheel_context or wheel_brand_hit:
            found_wheel_context = True

        # Order numbers (exclude phone-like contexts)
        lead_match = re.match(r"^\s*([\d\s-]{2,8})", text_lower)
        if pending_short_digits and lead_match:
            combined = re.sub(r"\D", "", pending_short_digits + lead_match.group(1))
            if 6 <= len(combined) <= 8:
                add_unique(order_numbers, combined)
                pending_short_digits = None
        for num, _pos, _labeled in extract_order_numbers_with_positions(text):
            add_unique(order_numbers, num)
        trailing_nums = re.findall(r"(\d[\d\s-]{1,5})\s*$", text_lower)
        if trailing_nums:
            tail = re.sub(r"\D", "", trailing_nums[-1])
            if 2 <= len(tail) <= 5:
                pending_short_digits = tail
            else:
                pending_short_digits = None
        else:
            pending_short_digits = None

        for pat in size_patterns:
            for m in pat.finditer(text_clean):
                size = f"{m.group(1)}/{m.group(2)} R{m.group(3)}".upper()
                if size in sizes_in_entry:
                    continue
                if not is_plausible_tire_size(m.group(1), m.group(2), m.group(3)):
                    continue
                add_unique(tire_sizes, size)
                if has_wheel_context:
                    tire_size_with_wheel_context = True
                sizes_in_entry.add(size)
        for m in size_triple_pattern.finditer(text_clean):
            if not is_plausible_tire_size(m.group(1), m.group(2), m.group(3)):
                continue
            size = f"{m.group(1)}/{m.group(2)} R{m.group(3)}".upper()
            if size not in sizes_in_entry:
                add_unique(tire_sizes, size)
                sizes_in_entry.add(size)
                if has_wheel_context:
                    tire_size_with_wheel_context = True

        def should_use_rim_for_disk_diameter(match_start: int) -> bool:
            prefix = text_clean[max(0, match_start - 10) : match_start]
            size_prefix = re.search(r"\d{2,3}\s*[xх/]\s*\d{2}", prefix) or re.search(r"\d{2,3}\s*/\s*\d{2}", prefix)
            if size_prefix:
                return False
            return bool(has_wheel_context or "радиус" in text_lower)

        for m in rim_pattern.finditer(text_clean):
            rim = f"R{m.group(1)}".upper()
            rim_in_entry = rim
            add_unique(rim_sizes, rim)
            if disk_diameter is None and should_use_rim_for_disk_diameter(m.start()):
                try:
                    disk_diameter = int(m.group(1))
                except Exception:
                    pass
            if has_wheel_context or "радиус" in text_lower:
                rim_from_context = True
        for m in rim_word_pattern.finditer(text_clean):
            rim = f"R{m.group(1)}".upper()
            rim_in_entry = rim
            add_unique(rim_sizes, rim)
            if disk_diameter is None and should_use_rim_for_disk_diameter(m.start()):
                try:
                    disk_diameter = int(m.group(1))
                except Exception:
                    pass
            rim_from_context = True

        if has_wheel_context and disk_diameter is None:
            m = wheel_size_pattern.search(text_clean)
            if m and should_use_rim_for_disk_diameter(m.start()):
                rim = f"R{m.group(1)}".upper()
                add_unique(rim_sizes, rim)
                try:
                    disk_diameter = int(m.group(1))
                except Exception:
                    pass
                rim_from_context = True

        rim_context = (has_wheel_context or wheel_brand_hit or "дюйм" in text_lower or "радиус" in text_lower or "диаметр" in text_lower) and (
            found_wheel_context or has_wheel_context or wheel_brand_hit
        )
        if rim_context:
            for m in wheel_radius_prefix_pattern.finditer(text_lower):
                rim = f"R{m.group(1)}".upper()
                add_unique(rim_sizes, rim)
                if disk_diameter is None:
                    try:
                        disk_diameter = int(m.group(1))
                    except Exception:
                        pass
                rim_from_context = True
            for m in diameter_word_pattern.finditer(text_lower):
                rim = f"R{m.group(1)}".upper()
                add_unique(rim_sizes, rim)
                if disk_diameter is None:
                    try:
                        disk_diameter = int(m.group(1))
                    except Exception:
                        pass
                rim_from_context = True
            for m in diameter_prefix_pattern.finditer(text_lower):
                rim = f"R{m.group(1)}".upper()
                add_unique(rim_sizes, rim)
                if disk_diameter is None:
                    try:
                        disk_diameter = int(m.group(1))
                    except Exception:
                        pass
                rim_from_context = True
            if disk_diameter is None:
                for phrase, val in rim_word_numbers.items():
                    if phrase == "двадцать" and (
                        re.search(r"двадцать\s+четыр", text_lower) or re.search(r"двадцать\s+четвер", text_lower)
                    ):
                        continue
                    if phrase in text_lower:
                        idx = text_lower.find(phrase)
                        prefix = text_lower[max(0, idx - 5) : idx].strip()
                        if prefix.endswith("сто"):
                            continue
                        suffix = text_lower[idx : idx + 12]
                        if "год" in suffix:
                            continue
                        rim = f"R{val}".upper()
                        add_unique(rim_sizes, rim)
                        disk_diameter = val
                        break
            for m in inch_pattern.finditer(text_lower):
                rim = f"R{m.group(1)}".upper()
                add_unique(rim_sizes, rim)
                if disk_diameter is None:
                    try:
                        disk_diameter = int(m.group(1))
                    except Exception:
                        pass
                rim_from_context = True

        for m in bolt_pattern.finditer(text_clean):
            bolt = f"{m.group(1)}x{m.group(2)}".upper()
            add_unique(bolt_patterns, bolt)

        # Handle spaced patterns like "225 на 55, радиус 19"
        width_height_pairs = re.findall(r"\b(\d{3})\s*(?:/|на| )\s*(\d{2})\b", text_clean)
        for wh in width_height_pairs:
            if rim_in_entry:
                rim_val = rim_in_entry.lstrip("R")
                if not is_plausible_tire_size(wh[0], wh[1], rim_val):
                    continue
                size = f"{wh[0]}/{wh[1]} {rim_in_entry}".upper()
                size = size.replace("  ", " ").strip()
                if size not in sizes_in_entry:
                    add_unique(tire_sizes, size)
                    sizes_in_entry.add(size)
                    if has_wheel_context:
                        tire_size_with_wheel_context = True

        entry_ts = entry.get("start_ms", 0)
        for m in qty_pattern.finditer(text_lower):
            val = int(m.group(1))
            if val == 74:
                continue
            match_text = m.group(0)
            pair_word = bool(re.search(r"\bдве\b|\bпара\b", match_text))
            quantity_candidates.append((val, True, entry_ts, match_text, pair_word))
            quantity_match_candidates.append((val, match_text))

        for m in qty_word_pattern.finditer(text_lower):
            if not allow_loose_quantity_word(text_lower, has_quantity_ctx, has_wheel_context):
                continue
            word = m.group(1).lower()
            val = qty_word_map.get(word)
            if val:
                if val == 1 and "транспорт" in text_lower:
                    continue
                strong = has_quantity_ctx or has_wheel_context or val <= 4
                match_text = m.group(0)
                pair_word = word in ("два", "две")
                quantity_candidates.append((val, strong, entry_ts, match_text, pair_word))
                quantity_match_candidates.append((val, match_text))

        for brand, pat in brand_patterns.items():
            m = pat.search(text)
            if m:
                brand_text = m.group(1)
                model = m.group(2) or ""
                add_unique(car_models, " ".join([brand_text, model]).strip())

        winter_hit = any(tok in text_lower for tok in ("зим", "шип", "шипов"))
        if "winter" in text_lower:
            winter_hit = True
        if "wintercraft" in text_lower:
            winter_hit = True
        summer_hit = bool(re.search(r"\bлетн", text_lower) or re.search(r"\bлето", text_lower) or "summer" in text_lower)
        allseason_hit = any(tok in text_lower for tok in ("всесез", "все сезон", "всесезонка"))

        if winter_hit and not has_negative(text_lower, "зим"):
            season_counts["winter"] += 1
        if summer_hit and not has_negative(text_lower, "лет"):
            season_counts["summer"] += 1
        if allseason_hit:
            season_counts["allseason"] += 1
        if has_negative(text_lower, "зим"):
            season_counts["winter"] = 0
        if has_negative(text_lower, "лет"):
            season_counts["summer"] = 0

        if re.search(r"\bооо\b", text_lower):
            add_unique(legal_entity_markers, "ООО")
        if re.search(r"\bип\b", text_lower):
            add_unique(legal_entity_markers, "ИП")
        if re.search(r"\bинн\b", text_lower):
            add_unique(legal_entity_markers, "ИНН")
        if re.search(r"\bкпп\b", text_lower):
            add_unique(legal_entity_markers, "КПП")
        if re.search(r"юр\.?\s*лиц", text_lower):
            add_unique(legal_entity_markers, "ЮР ЛИЦО")
        if marketplace_platform is None:
            platform_hit = detect_marketplace_platform(text_lower)
            if platform_hit:
                marketplace_platform = platform_hit

    def select_quantities(
        candidates: List[Tuple[int, bool, int, str, bool]], match_candidates: List[Tuple[int, str]]
    ) -> Tuple[List[int], List[str]]:
        if not candidates:
            return [], []
        filtered = []
        for val, strong, ts, text, pair_word in candidates:
            if val not in (1, 2, 4):
                continue
            if "74колес" in text.replace(" ", ""):
                continue
            if re.search(r"\b\d{10,}\b", text):
                continue
            filtered.append((val, strong, ts, text, pair_word))
        if not filtered:
            return [], []

        filtered.sort(key=lambda c: c[2])
        has_four = any(c[0] == 4 for c in filtered)
        has_explicit_pair = any(c[0] == 2 and c[4] for c in filtered)

        chosen = filtered[0]
        if has_four:
            if has_explicit_pair:
                # honor explicit pair wording over later set
                pair_candidates = [c for c in filtered if c[0] == 2 and c[4]]
                if pair_candidates:
                    chosen = pair_candidates[0]
                else:
                    chosen = [c for c in filtered if c[0] == 4][0]
            else:
                chosen = [c for c in filtered if c[0] == 4][0]

        best_val = chosen[0]
        match_texts: List[str] = []
        for val, text in match_candidates:
            if val == best_val and text not in match_texts:
                match_texts.append(text)
        return [best_val] if best_val is not None else [], match_texts

    rim_cleaned: List[str] = []
    for r in rim_sizes:
        try:
            val = int(r.lstrip("R"))
            if 12 <= val <= 24:
                rim_cleaned.append(f"R{val}")
        except Exception:
            continue
    rim_sizes = rim_cleaned

    if not found_wheel_context and len(tire_sizes) > 1:
        tire_sizes = tire_sizes[:1]

    if found_wheel_context and tire_sizes and not tire_size_with_wheel_context:
        if not any("без диск" in e.get("text", "").lower() for e in entries):
            tire_size_with_wheel_context = True

    quantities, quantity_matches = select_quantities(quantity_candidates, quantity_match_candidates)

    seasons = []
    winter_hits = season_counts["winter"]
    summer_hits = season_counts["summer"]
    if winter_hits or summer_hits:
        if winter_hits > summer_hits:
            seasons.append("winter")
        elif summer_hits >= winter_hits:
            seasons.append("summer")
    if season_counts["allseason"]:
        add_unique(seasons, "allseason")

    if disk_diameter is None and rim_sizes and (rim_from_context or tire_size_with_wheel_context):
        try:
            disk_diameter = int(rim_sizes[0].lstrip("R"))
        except Exception:
            pass
    if disk_diameter is None and tire_size_with_wheel_context and len(tire_sizes) == 1:
        try:
            rim_part = tire_sizes[0].split()[-1].lstrip("R")
            disk_diameter = int(rim_part)
        except Exception:
            pass

    preferred_orders = [n for n in order_numbers if 6 <= len(n) <= 7]
    if preferred_orders:
        order_numbers = preferred_orders
    else:
        order_numbers = [n for n in order_numbers if 6 <= len(n) <= 8]

    return {
        "car_models": car_models,
        "tire_sizes": tire_sizes,
        "rim_sizes": rim_sizes,
        "bolt_patterns": bolt_patterns,
        "quantities": quantities,
        "quantity_matches": quantity_matches,
        "seasons": seasons,
        "order_numbers": order_numbers,
        "disk_diameter": disk_diameter,
        "legal_entity_markers": legal_entity_markers,
        "marketplace_platform": marketplace_platform,
    }


def detect_checkpoint_signals(entries: List[Dict[str, Any]]) -> Dict[str, Any]:
    agent_entries = [e for e in entries if e.get("speaker") == "agent"]
    customer_entries = [e for e in entries if e.get("speaker") == "customer"]

    def is_question_like(text: str) -> bool:
        t = text.lower()
        if "?" in text:
            return True
        return any(q in t for q in ("как", "сколько", "по как", "какой", "какая", "какие", "или", "можете", "можем"))

    def in_last_block(predicate):
        last_block = entries[-3:] if len(entries) >= 3 else entries
        return any(predicate(u) for u in last_block)

    def find_company_74() -> Tuple[List[int], List[str]]:
        ids: List[int] = []
        texts: List[str] = []
        company_re = re.compile(r"\b\d*\s*4\s*колес", re.IGNORECASE)
        for e in agent_entries:
            txt = e["text"].lower()
            if (
                "74 колес" in txt
                or "74колес" in txt
                or "семьдесят четыре колеса" in txt
                or company_re.search(txt)
            ):
                ids.append(e["id"])
                texts.append(e["text"])
        return ids, texts

    def find_matches(
        patterns: Iterable[str],
        require_question: bool = False,
        max_id: Optional[int] = None,
        require_question_like: bool = False,
    ) -> Tuple[List[int], List[str]]:
        ids: List[int] = []
        texts: List[str] = []
        for e in agent_entries:
            txt = e["text"].lower()
            if max_id is not None and e["id"] > max_id:
                continue
            if require_question and "?" not in e["text"]:
                continue
            if require_question_like and not is_question_like(e["text"]):
                continue
            if any(p in txt for p in patterns):
                ids.append(e["id"])
                texts.append(e["text"])
        return ids, texts

    first_agent = agent_entries[0] if agent_entries else None
    greeting_first_company = False
    greeting_first_name = False
    greeting_first_greeting = False
    greeting_first_ask_name = False
    if first_agent:
        txt_lower = first_agent["text"].lower()
        greeting_first_company = "74 колес" in txt_lower or "74колес" in txt_lower or "семьдесят четыре колеса" in txt_lower
        greeting_first_name = "меня зовут" in txt_lower
        greeting_first_greeting = any(g in txt_lower for g in ("здравствуй", "добрый день", "добрый вечер"))
        if any(
            p in txt_lower
            for p in (
                "как можно к",
                "как к вам обращ",
                "как можно обращ",
                "как вас зовут",
                "как вас могу",
                "как могу к вам обращ",
                "как к вам обращаться",
            )
        ):
            greeting_first_ask_name = True

    greeting_company_ids, greeting_company_txt = find_company_74()
    greeting_name_ids, greeting_name_txt = find_matches(("меня зовут", "это", "с вами", "вас приветств", "говорит"))
    greeting_address_ids, greeting_address_txt = find_matches(
        ("какой у вас адрес", "по какому адресу", "адрес доставки", "куда достав")
    )

    city_patterns = (
        "какой город",
        "из какого города",
        "по какому городу",
        "в каком городе",
        "по какому региону",
        "по какому городу ищем",
        "по какому региону ищем",
        "какая область",
        "в какой области",
        "какая это область",
        "какая это обл",
        "в каком регионе",
        "в каком крае",
        "какой край",
    )
    city_ids, city_txt = find_matches(city_patterns, require_question_like=True)
    city_within_first_five = False
    if city_ids:
        city_within_first_five = min(city_ids) <= 5

    quantity_ids: List[int] = []
    quantity_txt: List[str] = []
    season_ids: List[int] = []
    season_txt: List[str] = []
    parameters_ids: List[int] = []
    parameters_txt: List[str] = []
    brand_ids: List[int] = []
    brand_txt: List[str] = []
    price_ids: List[int] = []
    price_txt: List[str] = []
    delivery_ids: List[int] = []
    delivery_txt: List[str] = []
    wheel_type_ids: List[int] = []
    wheel_type_txt: List[str] = []

    brand_tokens = ("бренд", "марка", "марку", "марки", "производител")
    price_tokens = ("бюджет", "диапазон", "диапазоне", "какую сумму", "какой сумме", "в какую сумму", "по цене хотите", "максимал", "минимал")
    delivery_tokens = ("доставка", "самовывоз", "куда достав", "куда отправ", "где забирать", "забрать", "какой адрес")
    wheel_type_tokens = ("литые", "литье", "литьё", "штампован", "штамповка", "кован")

    for e in agent_entries:
        txt = e["text"]
        txt_lower = txt.lower()
        question_like = "?" in txt or is_question_like(txt)
        if question_like:
            if any(
                tok in txt_lower
                for tok in ("сколько", "какое количество", "количество", "комплект", "по одной", "по паре", "штук", "колес", "колёс", "колеса", "колесо")
            ):
                if "сколько стоит" in txt_lower or ("стоить" in txt_lower and "сколько" in txt_lower):
                    pass
                else:
                    quantity_ids.append(e["id"])
                    quantity_txt.append(txt)

            if any(tok in txt_lower for tok in ("зим", "лет", "сезон", "шип", "без шип")):
                season_ids.append(e["id"])
                season_txt.append(txt)

            if any(tok in txt_lower for tok in ("размер", "радиус", "параметр", "ширин", "профил", "диаметр", "индекс", "бренд", "марка", "модель")):
                parameters_ids.append(e["id"])
                parameters_txt.append(txt)

        if question_like and any(tok in txt_lower for tok in brand_tokens):
            brand_ids.append(e["id"])
            brand_txt.append(txt)
        if question_like and any(tok in txt_lower for tok in price_tokens):
            price_ids.append(e["id"])
            price_txt.append(txt)
        if question_like and any(tok in txt_lower for tok in delivery_tokens):
            delivery_ids.append(e["id"])
            delivery_txt.append(txt)
        if question_like and any(tok in txt_lower for tok in wheel_type_tokens):
            wheel_type_ids.append(e["id"])
            wheel_type_txt.append(txt)

    three_opt_ids: List[int] = []
    three_opt_txt: List[str] = []
    enumerators = ("перв", "втор", "трет")
    for e in agent_entries:
        txt = e["text"].lower()
        if "вариант" in txt or "предлож" in txt or sum(1 for t in enumerators if t in txt) >= 2:
            three_opt_ids.append(e["id"])
            three_opt_txt.append(e["text"])

    advantage_tokens = (
        "гаранти",
        "склад",
        "быстра",
        "достав",
        "скидк",
        "акци",
        "официаль",
        "сертифик",
        "качеств",
        "усилен",
        "в подарок",
        "бесплатн",
        "рассроч",
        "монтаж",
        "топливо",
    )
    advantage_ids: List[int] = []
    advantage_txt: List[str] = []
    for e in agent_entries:
        txt = e["text"].lower()
        if any(tok in txt for tok in advantage_tokens):
            advantage_ids.append(e["id"])
            advantage_txt.append(e["text"])

    objection_ids, objection_txt = find_matches(
        ("подешевле", "дешевле", "скидк", "можем предложить", "если дорого", "по цене", "по доставке", "успеем", "привез")
    )
    reservation_ids: List[int] = []
    reservation_txt: List[str] = []
    reservation_tokens = ("бронь", "заброни", "резерв", "отлож", "держать", "оставить на ваше имя", "оставлю на ваше имя")
    for e in agent_entries:
        txt = e["text"].lower()
        if any(tok in txt for tok in reservation_tokens):
            reservation_ids.append(e["id"])
            reservation_txt.append(e["text"])

    last_block = entries[-3:] if len(entries) >= 3 else entries
    last_block_ids = {u["id"] for u in last_block}
    thanks_ids: List[int] = []
    thanks_txt: List[str] = []
    goodbye_ids: List[int] = []
    goodbye_txt: List[str] = []
    thanks_last_ids: List[int] = []
    goodbye_last_ids: List[int] = []

    def is_thanks(txt: str) -> bool:
        return any(p in txt for p in ("спасибо", "благодар"))

    def is_goodbye(txt: str) -> bool:
        return any(g in txt for g in ("до свидан", "всего добр", "хорошего дня", "до связи", "до встречи"))

    for e in agent_entries:
        txt = e["text"].lower()
        if is_thanks(txt):
            thanks_ids.append(e["id"])
            thanks_txt.append(e["text"])
            if e["id"] in last_block_ids:
                thanks_last_ids.append(e["id"])
        if is_goodbye(txt):
            goodbye_ids.append(e["id"])
            goodbye_txt.append(e["text"])
            if e["id"] in last_block_ids:
                goodbye_last_ids.append(e["id"])
    for e in customer_entries:
        txt = e["text"].lower()
        if is_goodbye(txt):
            goodbye_ids.append(e["id"])
            goodbye_txt.append(e["text"])
            if e["id"] in last_block_ids:
                goodbye_last_ids.append(e["id"])

    thanks_in_last = bool(thanks_last_ids)
    goodbye_in_last = bool(goodbye_last_ids)

    upsell_ids: List[int] = []
    upsell_txt: List[str] = []
    upsell_flags = {"sekretki_mentioned": False, "datchiki_mentioned": False, "krepezh_mentioned": False}
    for e in agent_entries:
        txt_lower = e["text"].lower()
        if "секретк" in txt_lower or "секретн" in txt_lower:
            upsell_flags["sekretki_mentioned"] = True
            upsell_ids.append(e["id"])
            upsell_txt.append(e["text"])
        if "датчик" in txt_lower or "дд" in txt_lower:
            upsell_flags["datchiki_mentioned"] = True
            upsell_ids.append(e["id"])
            upsell_txt.append(e["text"])
        if "крепеж" in txt_lower or "крепёж" in txt_lower or "болт" in txt_lower or "гайк" in txt_lower:
            upsell_flags["krepezh_mentioned"] = True
            upsell_ids.append(e["id"])
            upsell_txt.append(e["text"])
    upsell_flags["offered"] = any(upsell_flags.values())

    order_status_requests: List[int] = []
    order_status_request_txt: List[str] = []
    status_ids: List[int] = []
    status_txt: List[str] = []
    next_steps_ids: List[int] = []
    next_steps_txt: List[str] = []
    storage_ids: List[int] = []
    storage_txt: List[str] = []
    order_request_tokens = ("номер заказа", "номер заявки", "номер телефона", "контактный телефон", "телефон для связи")
    status_tokens = (
        "заказ готов",
        "готов",
        "в пути",
        "можно забирать",
        "прибыл",
        "оформлен",
        "создан",
        "передал",
        "передала",
        "передали",
        "номер заказа",
    )
    next_steps_tokens = ("можно забрать", "приходите", "приезжайте", "оплатить", "ссылк", "смс", "сообщени", "будет завтра", "будет сегодня", "отправим", "доставка будет")
    storage_tokens = ("хранени", "держим", "склад", "складск", "сколько дней", "5 дней", "пять дней")
    for e in agent_entries:
        txt_lower = e["text"].lower()
        if (
            "?" in e["text"]
            or "подскаж" in txt_lower
            or "скажите" in txt_lower
            or "оставьте" in txt_lower
            or is_question_like(e["text"])
        ) and any(tok in txt_lower for tok in order_request_tokens):
            order_status_requests.append(e["id"])
            order_status_request_txt.append(e["text"])
        if any(tok in txt_lower for tok in status_tokens):
            status_ids.append(e["id"])
            status_txt.append(e["text"])
        if any(tok in txt_lower for tok in next_steps_tokens):
            next_steps_ids.append(e["id"])
            next_steps_txt.append(e["text"])
        if any(tok in txt_lower for tok in storage_tokens):
            storage_ids.append(e["id"])
            storage_txt.append(e["text"])

    tire_service_ids: List[int] = []
    tire_service_txt: List[str] = []
    tire_flags = {
        "booking_confirmed": False,
        "sms_mentioned": False,
        "arrival_time_stated": False,
        "vehicle_restriction_stated": False,
        "empty_vehicle_stated": False,
        "mount_discount_mentioned": False,
        "free_mount_mentioned": False,
    }
    time_re = re.compile(
        r"\b\d{1,2}[:.]\d{2}\b|\b(?:к|в|на)\s*\d{1,2}\s*(?:час|часа|часов)\b|\b\d{1,2}\s*час(?:а|ов)?\b|\b\d{1,2}\s*мин"
    )
    for e in entries:
        txt_lower = e["text"].lower()
        if "шиномонтаж" in txt_lower or "запись" in txt_lower or "монтаж" in txt_lower:
            tire_service_ids.append(e["id"])
            tire_service_txt.append(e["text"])
        if any(tok in txt_lower for tok in ("записал", "записала", "записать", "запишу", "бронь на шиномонтаж", "запись на шиномонтаж")):
            tire_flags["booking_confirmed"] = True
        if "смс" in txt_lower or "сообщени" in txt_lower:
            tire_flags["sms_mentioned"] = True
        if time_re.search(txt_lower) or "время" in txt_lower or "к часу" in txt_lower or re.search(r"(?:к|в|на)\s*\d{1,2}\s*(?:утр|вечер)", txt_lower):
            tire_flags["arrival_time_stated"] = True
        if any(tok in txt_lower for tok in ("легков", "грузов", "кроссов", "без грузовых", "пассажир")):
            tire_flags["vehicle_restriction_stated"] = True
        if "пуст" in txt_lower or "ничего в багажнике" in txt_lower:
            tire_flags["empty_vehicle_stated"] = True
        if ("скидк" in txt_lower or "дисконт" in txt_lower) and ("монтаж" in txt_lower or "шиномонтаж" in txt_lower):
            tire_flags["mount_discount_mentioned"] = True
        if "бесплат" in txt_lower and ("монтаж" in txt_lower or "шиномонтаж" in txt_lower or "в подарок" in txt_lower):
            tire_flags["free_mount_mentioned"] = True

    callback_ids: List[int] = []
    callback_txt: List[str] = []
    legal_ids: List[int] = []
    legal_txt: List[str] = []
    tire_request_ids: List[int] = []
    tire_request_txt: List[str] = []
    third_party_ids: List[int] = []
    third_party_txt: List[str] = []
    callback_tokens = ("номер телефона", "контактный телефон", "перезвон", "как с вами связаться", "телефон для связи")
    legal_tokens = ("ооо", "ип", "юр. лицо", "юр лицо", "юридичес", "инн", "кпп")
    third_party_tokens = ("третье лицо", "доверенн", "кто заберет", "может кто-то", "по доверенности")
    for e in entries:
        txt_lower = e["text"].lower()
        if ("?" in e["text"] or "подскаж" in txt_lower or "скажите" in txt_lower or "оставьте" in txt_lower or is_question_like(e["text"])) and any(
            tok in txt_lower for tok in callback_tokens
        ):
            callback_ids.append(e["id"])
            callback_txt.append(e["text"])
        if any(tok in txt_lower for tok in legal_tokens):
            legal_ids.append(e["id"])
            legal_txt.append(e["text"])
        if any(tok in txt_lower for tok in ("шиномонтаж", "переобув", "записать на шиномонтаж", "озонирован")):
            tire_request_ids.append(e["id"])
            tire_request_txt.append(e["text"])
        if any(tok in txt_lower for tok in third_party_tokens):
            third_party_ids.append(e["id"])
            third_party_txt.append(e["text"])

    needs_ids = sorted(set(quantity_ids + season_ids + parameters_ids + brand_ids + price_ids + delivery_ids + wheel_type_ids))
    needs_texts = list(set(quantity_txt + season_txt + parameters_txt + brand_txt + price_txt + delivery_txt + wheel_type_txt))

    return {
        "greeting": {
            "company_said": bool(greeting_company_ids),
            "name_said": bool(greeting_name_ids),
            "address_question": bool(greeting_address_ids),
            "first_agent_company": greeting_first_company,
            "first_agent_name": greeting_first_name,
            "first_agent_greeting": greeting_first_greeting,
            "asked_how_to_address": greeting_first_ask_name,
            "matched_utterance_ids": sorted(set(greeting_company_ids + greeting_name_ids + greeting_address_ids)),
            "matched_texts": list(set(greeting_company_txt + greeting_name_txt + greeting_address_txt)),
        },
        "city": {
            "asked_city": bool(city_ids),
            "matched_utterance_ids": city_ids,
            "matched_texts": city_txt,
            "within_first_five": city_within_first_five,
        },
        "needs": {
            "quantity_asked": bool(quantity_ids),
            "season_asked": bool(season_ids),
            "parameters_asked": bool(parameters_ids),
            "brand_asked": bool(brand_ids),
            "price_range_asked": bool(price_ids),
            "delivery_preference_asked": bool(delivery_ids),
            "wheel_type_asked": bool(wheel_type_ids),
            "matched_utterance_ids": needs_ids,
            "matched_texts": needs_texts,
        },
        "three_options": {
            "offered_three_plus": bool(three_opt_ids),
            "matched_utterance_ids": three_opt_ids,
            "matched_texts": three_opt_txt,
        },
        "advantages_used": {
            "count": len(set(advantage_ids)),
            "matched_utterance_ids": sorted(set(advantage_ids)),
            "matched_texts": list(set(advantage_txt)),
        },
        "objection_handled": {
            "handled": bool(objection_ids),
            "matched_utterance_ids": objection_ids,
            "matched_texts": objection_txt,
        },
        "reservation_offered": {
            "offered": bool(reservation_ids),
            "matched_utterance_ids": reservation_ids,
            "matched_texts": reservation_txt,
        },
        "upsell_offer": {
            **upsell_flags,
            "matched_utterance_ids": sorted(set(upsell_ids)),
            "matched_texts": list(set(upsell_txt)),
        },
        "order_status": {
            "order_or_phone_requested": bool(order_status_requests),
            "status_communicated": bool(status_ids),
            "next_steps_explained": bool(next_steps_ids),
            "storage_time_asked": bool(storage_ids),
            "matched_utterance_ids": sorted(set(order_status_requests + status_ids + next_steps_ids + storage_ids)),
            "matched_texts": list(set(order_status_request_txt + status_txt + next_steps_txt + storage_txt)),
        },
        "tire_service": {
            **tire_flags,
            "matched_utterance_ids": sorted(set(tire_service_ids)),
            "matched_texts": list(set(tire_service_txt)),
        },
        "conditional_triggers": {
            "callback_phone_asked": bool(callback_ids),
            "legal_entity_detected": bool(legal_ids),
            "tire_service_requested": bool(tire_request_ids),
            "third_party_pickup_asked": bool(third_party_ids),
            "matched_utterance_ids": sorted(set(callback_ids + legal_ids + tire_request_ids + third_party_ids)),
            "matched_texts": list(set(callback_txt + legal_txt + tire_request_txt + third_party_txt)),
        },
        "closing": {
            "thanks": bool(thanks_ids),
            "goodbye": bool(goodbye_ids),
            "thanks_in_last_block": thanks_in_last,
            "goodbye_in_last_block": goodbye_in_last,
            "matched_utterance_ids": sorted(set(thanks_ids + goodbye_ids)),
            "matched_texts": list(set(thanks_txt + goodbye_txt)),
        },
    }


def build_preprocessor_signals(entries: List[Dict[str, Any]]) -> Dict[str, Any]:
    call_context = detect_call_context(entries)
    extracted = extract_entities(entries)

    qty = extracted.get("quantities") or []
    if qty and call_context.get("is_wheel_call") and qty[0] > 4:
        qty = [4]
    if not qty:
        if call_context.get("call_type") in ("ORDER", "STATUS_INQUIRY", "TIRE_SERVICE") or call_context.get("is_wheel_call"):
            qty = [4]
    extracted["quantities"] = qty

    return {
        "_meta": {
            "version": "3.2.3",
            "note": "Signals are regex-based hints; the agent should verify against utterances.",
        },
        "call_context": call_context,
        "extracted_data": extracted,
        "checkpoint_signals": detect_checkpoint_signals(entries),
    }


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
        "preprocessor_signals": build_preprocessor_signals(utterances),
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
                 simplified_out_name: Optional[str] = None,
                 signals_out_name: Optional[str] = None) -> Path:
    vtt_entries = parse_vtt(vtt_path)
    diarized_entries = load_diarized_json(diarized_path, total_duration_ms) if diarized_path else []
    merged = align_entries(vtt_entries, diarized_entries)
    annotate_speaker_confidence(merged)
    output = build_output(call_id, operator, total_duration_ms, date_str, merged)

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    out_file = OUTPUT_DIR / (out_name or f"call_{call_id}_structured.json")
    out_file.write_text(json.dumps(output, ensure_ascii=False, indent=2), encoding="utf-8")

    simplified_output = None
    if simplified_out_name or signals_out_name:
        simplified_output = simplify_output(output)
    if simplified_out_name and simplified_output is not None:
        simplified_file = OUTPUT_DIR / simplified_out_name
        simplified_file.write_text(json.dumps(simplified_output, ensure_ascii=False, indent=2), encoding="utf-8")
    if signals_out_name:
        signals_payload = simplified_output or output
        signals_file = OUTPUT_DIR / signals_out_name
        signals_file.write_text(json.dumps(signals_payload, ensure_ascii=False, indent=2), encoding="utf-8")
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
            "signals_out": "call_05_structured_input_signals.json",
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
            "signals_out": "call_02_structured_input_signals.json",
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
            "signals_out": "call_08_structured_input_signals.json",
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
            signals_out_name=cfg.get("signals_out"),
        )
        print(f"Wrote {out}")


if __name__ == "__main__":
    main()
