#!/usr/bin/env python3
"""Quick CLI figlet to preview the "Features per $ spent" story."""

from __future__ import annotations

import shutil

RESET = "\033[0m"
GLM_COLOR = "\033[38;2;152;185;65m"
CODEX_COLOR = "\033[38;2;95;135;95m"
OPUS_COLOR = "\033[38;2;222;147;95m"
LABEL_COLOR = "\033[38;2;181;189;104m"
HEADER_COLOR = "\033[38;2;181;189;104m"

BAR = "█"


def _colored(text: str, color: str) -> str:
    return f"{color}{text}{RESET}"


def _draw_bar(count: int, color: str) -> str:
    return _colored(BAR * count, color)


def _draw_axis(width: int) -> str:
    return _colored(f"{'─' * width}→", LABEL_COLOR)


def _build_scale_line(width: int, ticks: list[int], label: str) -> str:
    tick_labels = [f"{tick:,}" for tick in ticks]
    max_label_len = max(len(tick) for tick in tick_labels)
    line = list(label) + [" "] * (width + max_label_len + 1)
    max_tick = ticks[-1]

    for tick, tick_label in zip(ticks, tick_labels):
        pos = round(tick / max_tick * width)
        for i, ch in enumerate(tick_label):
            idx = len(label) + 1 + pos + i
            if idx < len(line):
                line[idx] = ch

    return "".join(line).rstrip()



def main() -> None:
    term_width = shutil.get_terminal_size((80, 20)).columns

    data = [
        ("GLM 4.7", 1247.1, GLM_COLOR),
        ("Opus 4.5", 51.9, OPUS_COLOR),
        ("Codex", 34.3, CODEX_COLOR),
    ]

    scale_ticks = [0, 500, 1000, 1500]
    max_value = scale_ticks[-1]
    max_bar = 80
    value_gap = 2
    scale_span = max_bar + value_gap

    def bar_length(value: float) -> int:
        return max(1, round(value / max_value * max_bar))

    label_width = max(len(label) for label, _, _ in data) + 2
    axis_indent = " " * (label_width + 1)

    print()
    print(_colored("Features per $ spent", HEADER_COLOR))
    print()
    for index, (label, value, color) in enumerate(data):
        bar = _draw_bar(bar_length(value), color)
        formatted_value = _colored(f"{value:,.1f}", LABEL_COLOR)
        print(f"{label:<{label_width}} {bar}  {formatted_value}")
        if index < len(data) - 1:
            print()
    print()
    scale_label = "Features"
    scale_line = _build_scale_line(scale_span, scale_ticks, scale_label)
    print(_colored(scale_line, LABEL_COLOR))
    print(f"{axis_indent}{_draw_axis(scale_span)}")
    print()


if __name__ == "__main__":
    main()
