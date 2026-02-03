#!/usr/bin/env python3
"""
Batch transcription helper for Phase 1 calls using AssemblyAI.

This script mirrors the config used in `assembly.py`, but works on the local
`call_XX.mp3` files in the `звонки и чек лист` folders and emits the same
family of artifacts you already have for calls 1‑1, 1‑5, and 1‑6:

- paragraphs-2.json
- sentences-2.json
- timestamps-2.json
- transcript-2.srt
- transcript-2.vtt

API key handling (no secrets hard‑coded):
- Prefer `api.txt` in this directory (first line = AssemblyAI API key)
- Fallback: `ASSEMBLYAI_API_KEY` environment variable

Example usage (single call test):
    python assembly_batch_phase1.py \
        --audio "14-11-2025_11-40-12/call_02.mp3" \
        --call-id "1-2"

Batch mode (when you are ready to process all 17 calls):
    python assembly_batch_phase1.py --batch

This script does not itself decide which calls to process in batch mode;
see the `BATCH_CALLS` list near the bottom and adjust mapping as needed.
"""

from __future__ import annotations

import argparse
import json
import os
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, Iterable, List, Tuple

import requests


BASE_URL = "https://api.assemblyai.com/v2"

# Root of the repo where Phase 1 package lives (relative to this script).
ROOT_DIR = Path(__file__).resolve().parent.parent
PHASE1_REPO_DIR = ROOT_DIR / "Phase 1 Package Complete" / "REPO"


@dataclass
class CallSpec:
    audio_path: Path
    call_id: str  # e.g. "1-2"

    @property
    def output_dir(self) -> Path:
        return PHASE1_REPO_DIR / self.call_id


def load_api_key() -> str:
    """
    Load AssemblyAI API key from api.txt or environment.

    Order:
    1) api.txt in the same directory as this script
    2) ASSEMBLYAI_API_KEY env var
    """
    here = Path(__file__).resolve().parent
    api_txt = here / "api.txt"
    if api_txt.exists():
        key = api_txt.read_text(encoding="utf-8").strip()
        if key:
            return key

    env_key = os.environ.get("ASSEMBLYAI_API_KEY")
    if env_key:
        return env_key.strip()

    raise SystemExit(
        "AssemblyAI API key not found.\n"
        "Create 'api.txt' next to assembly_batch_phase1.py "
        "with your key on the first line, or export ASSEMBLYAI_API_KEY."
    )


def upload_audio(api_key: str, audio_path: Path) -> str:
    """Upload local audio file to AssemblyAI and return the upload URL."""
    if not audio_path.exists():
        raise SystemExit(f"Audio file not found: {audio_path}")

    headers = {"authorization": api_key}
    upload_url = f"{BASE_URL}/upload"

    # Simple upload in one shot; audio files are small enough for this use‑case.
    with audio_path.open("rb") as f:
        resp = requests.post(upload_url, headers=headers, data=f)

    resp.raise_for_status()
    data = resp.json()
    url = data.get("upload_url")
    if not url:
        raise RuntimeError(f"Upload response missing 'upload_url': {data}")
    return url


def build_transcript_config(audio_url: str) -> Dict:
    """
    Build the transcription config, mirroring assembly.py as closely as possible.
    """
    config: Dict = {
        "audio_url": audio_url,
        "speaker_labels": True,
        "format_text": True,
        "punctuate": True,
        "speech_model": "universal",
        "language_detection": True,
    }

    # Speaker role identification (Agent / Customer).
    config["speech_understanding"] = {
        "request": {
            "speaker_identification": {
                "speaker_type": "role",
                "known_values": [
                    "Agent, Customer",
                ],
            }
        }
    }

    # Keyterms prompt copied from assembly.py (tyre brands, cities, etc).
    config["keyterms_prompt"] = [
        "Кусвы",
        "Качканар",
        "Ускотов",
        "Усть-Катав",
        "Кировский",
        "Красноуфимск",
        "Камешково",
        "Камешкова",
        "Челябинска",
        "Yokohama",
        "Йокохама",
        "Йоко Хама",
        "Kumho",
        "Кумхо",
        "Pirelli",
        "Пирелли",
        "Пирели",
        "Goodyear",
        "Гудер",
        "Bridgestone",
        "Бридстон",
        "Бриджстоун",
        "Hankook",
        "Ханкука",
        "Ханкук",
        "Cordiant",
        "Кордиант",
        "Nokian",
        "Нокен Политеро",
        "Fortune Polaris",
        "Форчуна Поларо Айс",
        "Triangle",
        "Sailun Atrezzo",
        "Sailun Azura",
        "Wintercraft",
        "Toyo Observe",
        "Icon Autograph",
        "Икон Автограф",
        "KAMA Irbis",
        "Кама Ирбис",
        "Haval",
        "Хавала Стрим",
        "Citroen Jumpy",
        "Пежо Эксперт",
        "Hyundai Elantra",
        "Хюндай Элантра",
        "Renault Sandero Stepway",
        "Сандеро Степвей",
        "74колеса.ру",
        "трейд-ин",
        "трейдин",
        "штампованные диски",
        "литые диски",
        "шиномонтаж",
        "разболтовка",
        "балансировка",
        "вылет",
        "ступица",
        "протектор",
        "Яндекс.Пэй",
        "Яндекс.Заправки",
        "рассрочка",
        "Tinkoff",
        "Синькоф",
        "Шевская",
        "Серафима Дерябина",
        "самовывоз",
        "предоплата",
        "липучка",
        "шипованная",
        "фрикционная",
        "перебортовка",
        "Магнитогорск",
        "Курган",
        "Самара",
        "Пермь",
        "Уфы",
        "УФЕ",
        "Владимирская область",
        "Ковров",
        "Ковровье",
        "Тюмени",
        "Васильево",
        "Пермь-Васильево",
        "Василия Васильева",
        "ВАЗ Веста",
        "Vesta",
        "Haval M6",
        "М6",
        "Пежо Джамп",
        "Jump",
        "Gislaved",
        "Гисловед",
        "Ningba",
        "Требл",
        "Treble",
        "Sonic Winter",
        "Formula Ice",
        "Формула Айс",
        "Ice Guard",
        "Айс Гард",
        "ASGORS",
        "IG55",
        "IG65",
        "Road Tour",
        "Гравити",
        "Трунтур",
        "СУФ",
        "SUV",
        "TIC KILIF",
        "транспортная компания Кит",
        "КИТ",
        "Луч компания",
        "Адвента",
        "вокзальная",
        "Щербакова",
        "Армавирская",
        "Машиностроителей",
        "Токаре",
        "Волгоградская",
        "Белореченской",
        "зоологической",
        "Карла Маркса",
        "строителей",
        "ВЖН склад",
        "посадочный диаметр",
        "заболтовка",
        "секрета",
        "безналом",
        "протектора",
        "тредовая",
        "расчетного счета",
        "уценка",
        "бронь",
        "резерв",
        "страд-ин",
        "сдать комплект",
        "послезавтра",
        "заказ оформлен",
        "номер брони",
        "купон бесплатный",
        "расширенная гарантия",
        "топливо в подарок",
        "пятнадцать литров",
        "защита проколов",
    ]
    return config


def request_transcript(api_key: str, audio_url: str) -> str:
    """Create a transcript request and return its ID."""
    url = f"{BASE_URL}/transcript"
    headers = {
        "authorization": api_key,
        "content-type": "application/json",
    }
    config = build_transcript_config(audio_url)
    resp = requests.post(url, json=config, headers=headers)
    resp.raise_for_status()
    data = resp.json()
    transcript_id = data.get("id")
    if not transcript_id:
        raise RuntimeError(f"Transcript creation response missing 'id': {data}")
    return transcript_id


def poll_transcript(api_key: str, transcript_id: str, timeout_sec: int = 900) -> Dict:
    """Poll AssemblyAI until transcript is completed or failed."""
    url = f"{BASE_URL}/transcript/{transcript_id}"
    headers = {"authorization": api_key}

    start_time = time.time()
    while True:
        resp = requests.get(url, headers=headers)
        resp.raise_for_status()
        data = resp.json()
        status = data.get("status")

        if status == "completed":
            return data
        if status == "error":
            raise RuntimeError(f"Transcription failed: {data.get('error')}")

        if time.time() - start_time > timeout_sec:
            raise TimeoutError(f"Transcription timed out after {timeout_sec} seconds")

        time.sleep(3)


def detect_speaker_mapping(utterances: List[Dict]) -> Tuple[Dict[str, str], Dict[str, str]]:
    """
    Detect mapping from AssemblyAI speaker IDs to:
    - short labels: "A" / "B"
    - roles: "Agent" / "Customer"

    Heuristic:
    - Try to identify the agent by greeting text mentioning
      "компания 74 колеса".
    - If that fails, assume first distinct speaker is Agent
      and second is Customer.
    """
    # Collect distinct speaker ids in order of appearance.
    speaker_order: List[str] = []
    for utt in utterances:
        sid = str(utt.get("speaker", "")).strip()
        if not sid:
            continue
        if sid not in speaker_order:
            speaker_order.append(sid)

    if not speaker_order:
        raise RuntimeError("No speaker IDs found in utterances.")

    # Try to detect agent by greeting content.
    agent_id = None
    greeting_markers = [
        "компания 74 колеса",
        "компания «74 колеса»",
        "компания \"74 колеса\"",
        "компания 74",
        "74 колеса",
    ]
    for utt in utterances:
        sid = str(utt.get("speaker", "")).strip()
        if not sid:
            continue
        text = str(utt.get("text", "")).lower()
        if any(marker in text for marker in greeting_markers):
            agent_id = sid
            break

    if agent_id is None:
        agent_id = speaker_order[0]

    # Choose customer as another distinct speaker if available.
    customer_id = None
    for sid in speaker_order:
        if sid != agent_id:
            customer_id = sid
            break

    speaker_to_letter: Dict[str, str] = {}
    speaker_to_role: Dict[str, str] = {}

    for sid in {str(u.get("speaker", "")).strip() for u in utterances}:
        if not sid:
            continue
        if sid == agent_id:
            speaker_to_letter[sid] = "A"
            speaker_to_role[sid] = "Agent"
        elif customer_id is not None and sid == customer_id:
            speaker_to_letter[sid] = "B"
            speaker_to_role[sid] = "Customer"
        else:
            speaker_to_letter[sid] = sid
            speaker_to_role[sid] = "Other"

    return speaker_to_letter, speaker_to_role


def iter_words_from_utterances(
    utterances: Iterable[Dict],
    speaker_to_letter: Dict[str, str],
    speaker_to_role: Dict[str, str],
) -> List[Dict]:
    """Flatten utterance.words into a list of word-level dicts."""
    words: List[Dict] = []
    for utt in utterances:
        sid_raw = str(utt.get("speaker", "")).strip()
        letter = speaker_to_letter.get(sid_raw, sid_raw or "A")
        role = speaker_to_role.get(sid_raw, "Agent")
        for w in utt.get("words", []):
            # AssemblyAI times are milliseconds already; keep as-is.
            words.append(
                {
                    "text": w.get("text", ""),
                    "start": w.get("start"),
                    "end": w.get("end"),
                    "confidence": w.get("confidence"),
                    "speaker_letter": letter,
                    "speaker_role": role,
                }
            )
    return words


def build_paragraphs(words: List[Dict]) -> Dict:
    """
    Build paragraphs-2.json structure:
    {"paragraphs": [ {text, start, end, confidence, words: [...]} ]}

    Simple heuristic: group consecutive words by speaker, breaking on long pauses.
    """
    paragraphs: List[Dict] = []
    if not words:
        return {"paragraphs": paragraphs}

    current_words: List[Dict] = []
    current_speaker = words[0]["speaker_letter"]

    def flush():
        if not current_words:
            return
        text = " ".join(w["text"] for w in current_words).strip()
        start = current_words[0]["start"]
        end = current_words[-1]["end"]
        confidences = [w["confidence"] for w in current_words if w.get("confidence") is not None]
        avg_conf = sum(confidences) / len(confidences) if confidences else None
        paragraphs.append(
            {
                "text": text,
                "start": start,
                "end": end,
                "confidence": avg_conf,
                "words": [
                    {
                        "text": w["text"],
                        "start": w["start"],
                        "end": w["end"],
                        "confidence": w.get("confidence"),
                        "speaker": w["speaker_letter"],
                    }
                    for w in current_words
                ],
            }
        )

    last_end = words[0]["end"]
    for w in words:
        speaker = w["speaker_letter"]
        start = w["start"]
        if (
            speaker != current_speaker
            or (last_end is not None and start is not None and start - last_end > 5000)
        ):
            flush()
            current_words = []
            current_speaker = speaker
        current_words.append(w)
        last_end = w["end"]

    flush()
    return {"paragraphs": paragraphs}


def build_sentences(words: List[Dict]) -> Dict:
    """
    Build sentences-2.json structure:
    {"sentences": [ {text, start, end, confidence, words: [...], speaker} ]}

    Heuristic: group words until we hit sentence-final punctuation.
    """
    sentences: List[Dict] = []
    if not words:
        return {"sentences": sentences}

    current_words: List[Dict] = []
    current_speaker = words[0]["speaker_letter"]

    def is_sentence_end(token: str) -> bool:
        return token.endswith((".", "?", "!"))

    def flush():
        if not current_words:
            return
        text = " ".join(w["text"] for w in current_words).strip()
        start = current_words[0]["start"]
        end = current_words[-1]["end"]
        confidences = [w["confidence"] for w in current_words if w.get("confidence") is not None]
        avg_conf = sum(confidences) / len(confidences) if confidences else None
        sentences.append(
            {
                "text": text,
                "start": start,
                "end": end,
                "confidence": avg_conf,
                "speaker": current_speaker,
                "words": [
                    {
                        "text": w["text"],
                        "start": w["start"],
                        "end": w["end"],
                        "confidence": w.get("confidence"),
                        "speaker": w["speaker_letter"],
                    }
                    for w in current_words
                ],
            }
        )

    for w in words:
        token = w["text"]
        speaker = w["speaker_letter"]
        if speaker != current_speaker and current_words:
            flush()
            current_words = []
            current_speaker = speaker

        current_words.append(w)
        if is_sentence_end(token):
            flush()
            current_words = []

    flush()
    return {"sentences": sentences}


def build_timestamps(words: List[Dict]) -> List[Dict]:
    """
    Build timestamps-2.json structure: flat list of word-level entries with
    speaker = "Agent" / "Customer".
    """
    items: List[Dict] = []
    for w in words:
        items.append(
            {
                "text": w["text"],
                "start": w["start"],
                "end": w["end"],
                "confidence": w.get("confidence"),
                "speaker": w["speaker_role"],
            }
        )
    return items


def build_vtt(words: List[Dict]) -> str:
    """Build transcript-2.vtt content with inline speaker tags."""
    def fmt_ms(ms: int) -> str:
        seconds = ms / 1000.0
        h = int(seconds // 3600)
        m = int((seconds % 3600) // 60)
        s = seconds % 60
        return f"{h:02d}:{m:02d}:{s:06.3f}".replace(".", ",")

    lines: List[str] = ["WEBVTT", ""]
    if not words:
        return "\n".join(lines) + "\n"

    # Group words into cues by speaker and short pauses.
    current_words: List[Dict] = []
    current_speaker = words[0]["speaker_role"]
    last_end = words[0]["end"]

    def flush(idx: int):
        if not current_words:
            return
        start = current_words[0]["start"]
        end = current_words[-1]["end"]
        text = " ".join(w["text"] for w in current_words).strip()
        lines.append(str(idx))
        lines.append(f"{fmt_ms(start)} --> {fmt_ms(end)} <{current_speaker.upper()}>")
        lines.append(text)
        lines.append("")

    cue_idx = 1
    for w in words:
        speaker = w["speaker_role"]
        start = w["start"]
        if (
            speaker != current_speaker
            or (last_end is not None and start is not None and start - last_end > 3000)
        ):
            flush(cue_idx)
            cue_idx += 1
            current_words = []
            current_speaker = speaker
        current_words.append(w)
        last_end = w["end"]

    flush(cue_idx)
    return "\n".join(lines) + "\n"


def build_srt(words: List[Dict]) -> str:
    """Build transcript-2.srt content."""
    def fmt_ms(ms: int) -> str:
        seconds = ms / 1000.0
        h = int(seconds // 3600)
        m = int((seconds % 3600) // 60)
        s = int(seconds % 60)
        ms_part = int((seconds - int(seconds)) * 1000)
        return f"{h:02d}:{m:02d}:{s:02d},{ms_part:03d}"

    lines: List[str] = []
    if not words:
        return ""

    current_words: List[Dict] = []
    current_speaker = words[0]["speaker_role"]
    last_end = words[0]["end"]

    def flush(idx: int):
        if not current_words:
            return
        start = current_words[0]["start"]
        end = current_words[-1]["end"]
        text = " ".join(w["text"] for w in current_words).strip()
        lines.append(str(idx))
        lines.append(f"{fmt_ms(start)} --> {fmt_ms(end)}")
        lines.append(f"{current_speaker.upper()}: {text}")
        lines.append("")

    cue_idx = 1
    for w in words:
        speaker = w["speaker_role"]
        start = w["start"]
        if (
            speaker != current_speaker
            or (last_end is not None and start is not None and start - last_end > 3000)
        ):
            flush(cue_idx)
            cue_idx += 1
            current_words = []
            current_speaker = speaker
        current_words.append(w)
        last_end = w["end"]

    flush(cue_idx)
    return "\n".join(lines) + "\n"


def save_json(path: Path, data: object) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")


def save_text(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")


def process_call(
    api_key: str,
    spec: CallSpec,
    save_raw_json: bool = True,
    with_derived: bool = False,
) -> None:
    """
    Full pipeline for a single call.

    Behaviour:
    - If raw JSON already exists and with_derived=False: skip API call (idempotent).
    - If raw JSON exists and with_derived=True: reuse it instead of calling the API.
    - Otherwise: upload + transcribe, then save raw JSON (if save_raw_json=True).
    - When with_derived=True: also build Phase 1 artifacts from the transcript.
    """
    print(f"▶ Processing {spec.call_id} from {spec.audio_path}")

    raw_dir = ROOT_DIR / "звонки и чек лист" / "assemblyai_transcripts"
    raw_path = raw_dir / f"{spec.call_id}_assembly.json"

    transcript: Dict | None = None

    # If caller only wants derived artifacts and we already have raw JSON, reuse it.
    if with_derived and raw_path.exists():
        transcript = json.loads(raw_path.read_text(encoding="utf-8"))
        print(f"   Using existing raw JSON at {raw_path}")

    # If we don't have a transcript yet, decide whether to hit the API.
    if transcript is None:
        if not with_derived and save_raw_json and raw_path.exists():
            print(f"   Raw AssemblyAI JSON already exists at {raw_path}, skipping API call.")
            return

        audio_url = upload_audio(api_key, spec.audio_path)
        transcript_id = request_transcript(api_key, audio_url)
        transcript = poll_transcript(api_key, transcript_id)

        # Store raw AssemblyAI JSON so we can inspect speaker mapping later.
        if save_raw_json:
            raw_dir.mkdir(parents=True, exist_ok=True)
            save_json(raw_path, transcript)
            print(f"   Raw AssemblyAI JSON saved to {raw_path}")

    if not with_derived:
        # Phase 1: caller only wants raw results to study AssemblyAI's own
        # speaker mapping behaviour. No extra processing here.
        return

    utterances = transcript.get("utterances") or []
    if not utterances:
        raise RuntimeError("AssemblyAI response has no 'utterances'; cannot build structures.")

    speaker_to_letter, speaker_to_role = detect_speaker_mapping(utterances)
    words = iter_words_from_utterances(utterances, speaker_to_letter, speaker_to_role)

    # Quick sanity log: first two role assignments.
    if words:
        first_speaker = words[0]["speaker_role"]
        second_speaker = None
        for w in words:
            if w["speaker_role"] != first_speaker:
                second_speaker = w["speaker_role"]
                break
        print(f"   Detected speakers (derived): first={first_speaker}, second={second_speaker}")

    paragraphs = build_paragraphs(words)
    sentences = build_sentences(words)
    timestamps = build_timestamps(words)
    vtt_content = build_vtt(words)
    srt_content = build_srt(words)

    out_dir = spec.output_dir
    save_json(out_dir / "paragraphs-2.json", paragraphs)
    save_json(out_dir / "sentences-2.json", sentences)
    save_json(out_dir / "timestamps-2.json", timestamps)
    save_text(out_dir / "transcript-2.vtt", vtt_content)
    save_text(out_dir / "transcript-2.srt", srt_content)

    print(f"   Derived artifacts written under {out_dir}")


# NOTE: Adjust this mapping once you confirm how you want to name each call.
# This is a *proposal* for the 17 remaining calls:
#
# - From 14-11-2025_11-40-12: calls 03,04,07,08,09,10 → 1-3,1-4,1-7,1-8,1-9,1-10
# - From 14-11-2025_11-55-13: calls 01..10 → 1-11..1-20
#
# Note: call_02.mp3 → 1-2 is expected to be run first as a one-off test via
# the --audio / --call-id mode to avoid a duplicate API call.
_FIRST_FOLDER_CALLS: List[Tuple[str, str]] = [
    ("1-3", "call_03.mp3"),
    ("1-4", "call_04.mp3"),
    ("1-7", "call_07.mp3"),
    ("1-8", "call_08.mp3"),
    ("1-9", "call_09.mp3"),
    ("1-10", "call_10.mp3"),
]

_SECOND_FOLDER_CALLS: List[Tuple[str, str]] = [
    (f"1-{10 + n}", f"call_{n:02d}.mp3") for n in range(1, 11)
]

BATCH_CALLS: List[CallSpec] = [
    CallSpec(
        audio_path=ROOT_DIR / "звонки и чек лист" / "14-11-2025_11-40-12" / filename,
        call_id=call_id,
    )
    for call_id, filename in _FIRST_FOLDER_CALLS
] + [
    CallSpec(
        audio_path=ROOT_DIR / "звонки и чек лист" / "14-11-2025_11-55-13" / filename,
        call_id=call_id,
    )
    for call_id, filename in _SECOND_FOLDER_CALLS
]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Batch AssemblyAI transcription for Phase 1 calls")
    parser.add_argument(
        "--audio",
        help="Path to single audio file (relative to 'звонки и чек лист') for one-off test.",
    )
    parser.add_argument(
        "--call-id",
        help="Call ID to use for a single audio file (e.g. 1-2). Required with --audio.",
    )
    parser.add_argument(
        "--batch",
        action="store_true",
        help="Run on all calls defined in BATCH_CALLS.",
    )
    parser.add_argument(
        "--with-derived",
        action="store_true",
        help="Also build Phase 1 artifacts (paragraphs/sentences/timestamps/VTT/SRT). "
             "By default only raw AssemblyAI JSON is saved.",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    api_key = load_api_key()

    if args.audio and args.batch:
        raise SystemExit("Use either --audio/--call-id or --batch, not both.")

    if args.audio:
        if not args.call_id:
            raise SystemExit("--call-id is required when using --audio.")
        audio_path = ROOT_DIR / "звонки и чек лист" / args.audio
        spec = CallSpec(audio_path=audio_path, call_id=args.call_id)
        process_call(api_key, spec, save_raw_json=True, with_derived=args.with_derived)
        return

    if args.batch:
        for spec in BATCH_CALLS:
            process_call(api_key, spec, save_raw_json=True, with_derived=args.with_derived)
        return

    raise SystemExit("Nothing to do. Use --audio/--call-id for a test or --batch for all calls.")


if __name__ == "__main__":
    main()
