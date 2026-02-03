import io
import sys
import tempfile
from contextlib import redirect_stdout
from pathlib import Path

TEST_ROOT = Path(__file__).resolve().parents[1]
if str(TEST_ROOT) not in sys.path:
    sys.path.insert(0, str(TEST_ROOT))

import transcript_cleaner


SAMPLE_OUTPUT = """Transcription:  So I'm drafting a simple first markdown version just by copy-pasting
Pasted to Microsoft Edge
✓ Transcription pasted successfully

 Ready for next recording. Press RIGHT OPTION to start.
----------------------------------------
Press and hold RIGHT OPTION to start recording...
Recording... (Release to stop)
Recording finished.
Transcribing...

Transcription:  from Google Docs.
Pasted to Microsoft Edge
✓ Transcription pasted successfully

 Ready for next recording. Press RIGHT OPTION to start.
----------------------------------------
Press and hold RIGHT OPTION to start recording...
Recording... (Release to stop)
Recording finished.
Transcribing...

Transcription:  If I export from Google Docs, it is 3 MB file, so probably it can import all the images into base64.
"""


def test_extract_transcriptions_keeps_only_payload():
    lines = io.StringIO(SAMPLE_OUTPUT)
    result = transcript_cleaner.extract_transcriptions(lines)
    assert result == [
        "So I'm drafting a simple first markdown version just by copy-pasting",
        "from Google Docs.",
        "If I export from Google Docs, it is 3 MB file, so probably it can import all the images into base64.",
    ]


def test_extract_transcriptions_normalizes_spaces():
    lines = io.StringIO("Transcription:  spaced   out   text  \n")
    result = transcript_cleaner.extract_transcriptions(lines, normalize_spaces=True)
    assert result == ["spaced out text"]


def test_cli_reads_file_and_applies_separator():
    with tempfile.NamedTemporaryFile(mode="w+", encoding="utf-8", delete=False) as tmp:
        tmp.write(SAMPLE_OUTPUT)
        tmp.flush()
        buf = io.StringIO()
        with redirect_stdout(buf):
            transcript_cleaner.main(
                [
                    tmp.name,
                    "--normalize-spaces",
                    "--separator",
                    "\\n---\\n",
                ]
            )
    output = buf.getvalue().strip()
    assert output == (
        "So I'm drafting a simple first markdown version just by copy-pasting\n---\n"
        "from Google Docs.\n---\n"
        "If I export from Google Docs, it is 3 MB file, so probably it can import all the images into base64."
    )


def test_cli_allows_literal_backslash_separator():
    with tempfile.NamedTemporaryFile(mode="w+", encoding="utf-8", delete=False) as tmp:
        tmp.write(SAMPLE_OUTPUT)
        tmp.flush()
        buf = io.StringIO()
        with redirect_stdout(buf):
            transcript_cleaner.main(
                [
                    tmp.name,
                    "--normalize-spaces",
                    "--separator",
                    "\\",
                ]
            )
    output = buf.getvalue().strip()
    assert output == (
        "So I'm drafting a simple first markdown version just by copy-pasting\\"
        "from Google Docs.\\"
        "If I export from Google Docs, it is 3 MB file, so probably it can import all the images into base64."
    )


def test_cli_writes_output_file(tmp_path):
    input_path = tmp_path / "input.md"
    input_path.write_text(SAMPLE_OUTPUT, encoding="utf-8")
    out_path = tmp_path / "out.txt"
    transcript_cleaner.main([str(input_path), "--output", str(out_path)])
    saved = out_path.read_text(encoding="utf-8").strip().splitlines()
    assert saved == [
        "So I'm drafting a simple first markdown version just by copy-pasting",
        "from Google Docs.",
        "If I export from Google Docs, it is 3 MB file, so probably it can import all the images into base64.",
    ]
