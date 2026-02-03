from pathlib import Path
import argparse
import sys
import html as _html

try:
    # Reuse existing pipeline function
    from fastwhisper.core.transcribe import transcribe_audio
except Exception as e:
    print(
        "ERROR: Cannot import fastwhisper.core.transcribe. "
        "Run from the repository root where 'fastwhisper' is importable."
    )
    raise


def ensure_transcript(audio_path: Path, transcript_dir: Path) -> tuple[Path, Path]:
    """Ensure .txt and .vtt exist for the given audio file.

    If missing, call transcribe_audio to generate them.
    Returns: (txt_path, vtt_path)
    """
    transcript_dir.mkdir(parents=True, exist_ok=True)
    base = audio_path.stem
    txt_path = transcript_dir / f"{base}.txt"
    vtt_path = transcript_dir / f"{base}.vtt"

    if not txt_path.exists() or not vtt_path.exists():
        transcribe_audio(
            str(audio_path),
            str(txt_path),
            str(vtt_path),
            language="ru",
            model=None,
            storage_manager=None,
        )

    return txt_path, vtt_path


def main() -> None:
    parser = argparse.ArgumentParser(
        description=(
            "Transcribe inputs if needed and build a concatenated report "
            "with H1 = full absolute path for each audio"
        )
    )
    parser.add_argument(
        "--inputs",
        nargs="*",
        default=[],
        help="List of audio files to process (WAV/MP3/M4A).",
    )
    parser.add_argument(
        "--transcript-dir",
        default="contact1010.ru/contact1010.ru/images/audio/transcript",
        help="Directory to write per-file TXT/VTT outputs.",
    )
    parser.add_argument(
        "--concat-out",
        default="concatenated_output.txt",
        help="Path to write the concatenated report.",
    )
    parser.add_argument(
        "--html-out",
        default=None,
        help="Optional path to write an HTML report mirroring the concatenated output.",
    )
    args = parser.parse_args()

    audio_paths = [Path(p).resolve() for p in args.inputs]
    transcript_dir = Path(args.transcript_dir).resolve()
    concat_path = Path(args.concat_out).resolve()

    missing = [str(p) for p in audio_paths if not p.exists()]
    if missing:
        print("ERROR: These input files do not exist:\n  - " + "\n  - ".join(missing))
        sys.exit(1)

    # Prepare to optionally render HTML
    html_chunks = []

    with open(concat_path, "w", encoding="utf-8") as cout:
        for audio_path in audio_paths:
            txt_path, vtt_path = ensure_transcript(audio_path, transcript_dir)

            cout.write(f"# {audio_path}\n\n")
            try:
                text = Path(txt_path).read_text(encoding="utf-8").strip()
            except Exception:
                text = f"[WARN] Could not read {txt_path}"
            cout.write(text + "\n\n")
            cout.write(f"---\nTXT: {txt_path}\nVTT: {vtt_path}\n\n")

            # Collect HTML chunk
            esc_path = _html.escape(str(audio_path))
            esc_txt = _html.escape(str(txt_path))
            esc_vtt = _html.escape(str(vtt_path))
            esc_body = _html.escape(text)
            html_chunks.append(
                (
                    f"<section>\n<h1>{esc_path}</h1>\n"
                    f"<p>TXT: {esc_txt}<br>VTT: {esc_vtt}</p>\n"
                    f"<pre>{esc_body}</pre>\n"
                    f"</section>\n"
                )
            )

    if args.html_out:
        html_path = Path(args.html_out).resolve()
        html_path.parent.mkdir(parents=True, exist_ok=True)
        doc = (
            "<!doctype html>\n<html><head>\n<meta charset=\"utf-8\">\n"
            "<title>Concatenated Transcripts</title>\n"
            "<style>body{font-family:system-ui,Arial,sans-serif}pre{white-space:pre-wrap}</style>\n"
            "</head><body>\n" + "\n".join(html_chunks) + "</body></html>\n"
        )
        html_path.write_text(doc, encoding="utf-8")

    if args.html_out:
        print(
            f"Done.\n- Concatenated report: {concat_path}\n- HTML report: {html_path}\n- Per-file transcripts under: {transcript_dir}"
        )
    else:
        print(
            f"Done.\n- Concatenated report: {concat_path}\n- Per-file transcripts under: {transcript_dir}"
        )


if __name__ == "__main__":
    main()
