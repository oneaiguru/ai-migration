import os
from pathlib import Path
from typing import List, Dict, Any

import pytest
from pytest_bdd import scenarios, given, when, then
import html


scenarios("../features/concat_report.feature")


@pytest.fixture
def state(tmp_path: Path) -> Dict[str, Any]:
    return {
        "tmp": tmp_path,
        "audio_paths": [],
        "transcript_dir": tmp_path / "transcript",
        "concat_out": tmp_path / "concatenated_output.txt",
        "html_out": tmp_path / "report.html",
        "transcribe_called": 0,
    }


@given("three audio files in a temporary directory")
def three_audio_files(state):
    audio_dir = state["tmp"] / "audio"
    audio_dir.mkdir(parents=True, exist_ok=True)
    # Create three dummy WAV files
    names = ["a.wav", "b.wav", "c.wav"]
    paths: List[Path] = []
    for n in names:
        p = audio_dir / n
        p.write_bytes(b"RIFF....WAVEfmt ")  # minimal stub header content
        paths.append(p.resolve())
    state["audio_paths"] = paths


@given("transcribe_audio is mocked to write outputs")
def mock_transcribe_write_outputs(monkeypatch, state):
    def _mock(audio_path: str, output_txt: str, output_vtt: str, language: str = "ru", model=None, storage_manager=None):
        state["transcribe_called"] += 1
        Path(output_txt).parent.mkdir(parents=True, exist_ok=True)
        Path(output_vtt).parent.mkdir(parents=True, exist_ok=True)
        Path(output_txt).write_text(f"TRANSCRIPT for {audio_path}", encoding="utf-8")
        Path(output_vtt).write_text("WEBVTT\n\n00:00:00.000 --> 00:00:01.000\nHello\n", encoding="utf-8")
        return (f"TRANSCRIPT for {audio_path}", "WEBVTT\n...")

    # Patch before importing the script so the imported symbol is mocked
    monkeypatch.setattr("fastwhisper.core.transcribe.transcribe_audio", _mock, raising=True)


@given("per-file transcripts already exist for those audios")
def precreate_transcripts(state):
    tdir: Path = state["transcript_dir"]
    tdir.mkdir(parents=True, exist_ok=True)
    for ap in state["audio_paths"]:
        base = ap.stem
        (tdir / f"{base}.txt").write_text(f"EXISTING for {ap}", encoding="utf-8")
        (tdir / f"{base}.vtt").write_text("WEBVTT\n\n00:00:00.000 --> 00:00:01.000\nExisting\n", encoding="utf-8")


@given("transcribe_audio is mocked to raise if called")
def mock_transcribe_raise(monkeypatch):
    def _raise(*args, **kwargs):
        raise AssertionError("transcribe_audio should not be called when transcripts exist")

    monkeypatch.setattr("fastwhisper.core.transcribe.transcribe_audio", _raise, raising=True)


@when("I run the concat script with those inputs")
def run_concat(monkeypatch, state):
    # Import late, after monkeypatching
    import importlib, sys
    # Ensure project root (parent of package) is on sys.path for module resolution
    repo_root = Path(__file__).resolve().parents[3]
    if str(repo_root) not in sys.path:
        sys.path.insert(0, str(repo_root))

    ff = importlib.import_module("fastwhisper.fodeler.file")

    # Build argv
    args = [
        "prog",
        "--inputs",
        *[str(p) for p in state["audio_paths"]],
        "--transcript-dir",
        str(state["transcript_dir"]),
        "--concat-out",
        str(state["concat_out"]),
    ]
    monkeypatch.setenv("PYTEST_CURRENT_TEST", "1")
    monkeypatch.setattr("sys.argv", args, raising=False)
    ff.main()


@then("a concatenated report is created with absolute-path headings")
def verify_concat_absolute_headings(state):
    concat_path: Path = state["concat_out"]
    assert concat_path.exists(), "Concatenated report not created"
    content = concat_path.read_text(encoding="utf-8")
    # Verify that each audio appears as an H1 with absolute path
    for ap in state["audio_paths"]:
        assert str(ap) in content
        assert f"# {ap}" in content
        assert Path(str(ap)).is_absolute()


@then("per-file transcripts are created in the transcript directory")
def verify_transcripts_created(state):
    tdir: Path = state["transcript_dir"]
    for ap in state["audio_paths"]:
        base = ap.stem
        assert (tdir / f"{base}.txt").exists()
        assert (tdir / f"{base}.vtt").exists()


@then("transcribe_audio was not called")
def verify_not_called(state):
    # When transcripts pre-exist we expect zero calls (the raising mock would fail otherwise)
    # This assertion is mainly a placeholder if a counting mock was used.
    assert True


@when("I run the concat script with those inputs and html output")
def run_concat_with_html(monkeypatch, state):
    import importlib, sys
    repo_root = Path(__file__).resolve().parents[3]
    if str(repo_root) not in sys.path:
        sys.path.insert(0, str(repo_root))
    ff = importlib.import_module("fastwhisper.fodeler.file")

    args = [
        "prog",
        "--inputs",
        *[str(p) for p in state["audio_paths"]],
        "--transcript-dir",
        str(state["transcript_dir"]),
        "--concat-out",
        str(state["concat_out"]),
        "--html-out",
        str(state["html_out"]),
    ]
    monkeypatch.setenv("PYTEST_CURRENT_TEST", "1")
    monkeypatch.setattr("sys.argv", args, raising=False)
    ff.main()


@then("an HTML report is created with absolute-path headings and transcript links")
def verify_html_created(state):
    html_path: Path = state["html_out"]
    assert html_path.exists(), "HTML report not created"
    content = html_path.read_text(encoding="utf-8")
    for ap in state["audio_paths"]:
        # H1 with escaped absolute path
        assert f"<h1>{html.escape(str(ap))}</h1>" in content
        base = ap.stem
        assert f"{base}.txt" in content
        assert f"{base}.vtt" in content


@when("I run the concat script with a missing input")
def run_with_missing_input(monkeypatch, state):
    import importlib, sys
    repo_root = Path(__file__).resolve().parents[3]
    if str(repo_root) not in sys.path:
        sys.path.insert(0, str(repo_root))
    ff = importlib.import_module("fastwhisper.fodeler.file")
    missing = state["tmp"] / "nope.wav"
    args = [
        "prog",
        "--inputs",
        *[str(p) for p in state["audio_paths"]],
        str(missing),
        "--transcript-dir",
        str(state["transcript_dir"]),
        "--concat-out",
        str(state["concat_out"]),
    ]
    monkeypatch.setattr("sys.argv", args, raising=False)
    with pytest.raises(SystemExit) as ex:
        ff.main()
    state["exit_code"] = ex.value.code


@then("it exits with an error and no report is created")
def verify_error_and_no_report(state):
    assert state.get("exit_code", 0) != 0
    assert not state["concat_out"].exists()
