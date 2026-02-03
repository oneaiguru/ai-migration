import json
from pathlib import Path

from behave import given, then


BASE = Path(__file__).resolve().parents[2]
OUTPUT = BASE / "output"


def _get_by_path(data, path):
    cur = data
    for part in path.split("."):
        cur = cur[part]
    return cur


@given('I load the preprocessor output for call "{call_id}"')
def step_load_output(context, call_id):
    path = OUTPUT / f"call_{call_id}_structured_input_signals.json"
    assert path.exists(), f"Missing output for call {call_id}: {path}"
    context.data = json.loads(path.read_text(encoding="utf-8"))


@then('signal "{signal_path}" is true')
def step_signal_true(context, signal_path):
    value = _get_by_path(context.data["preprocessor_signals"]["checkpoint_signals"], signal_path)
    assert value is True, f"Expected {signal_path} to be true, got {value}"
