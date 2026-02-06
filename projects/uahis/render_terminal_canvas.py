from __future__ import annotations

from typing import List, Optional, Set

from .ast import Button, Checkbox, Form, Header, Image, Input, Link, ListView, Panel, Screen, Split, Grid, Text, Node, RadioOption


def _make_canvas(w: int, h: int) -> List[List[str]]:
    return [[" " for _ in range(w)] for _ in range(h)]


def _put(canvas: List[List[str]], x: int, y: int, text: str) -> None:
    h = len(canvas)
    w = len(canvas[0]) if h else 0
    if y < 0 or y >= h:
        return
    if x < 0:
        text = text[-x:]
        x = 0
    if x >= w:
        return
    for i, ch in enumerate(text):
        xx = x + i
        if 0 <= xx < w:
            canvas[y][xx] = ch


def _box(canvas: List[List[str]], x: int, y: int, w: int, h: int) -> None:
    if w <= 1 or h <= 1:
        return
    _put(canvas, x, y, "┌" + "─" * (w - 2) + "┐")
    for row in range(y + 1, y + h - 1):
        _put(canvas, x, row, "│")
        _put(canvas, x + w - 1, row, "│")
    _put(canvas, x, y + h - 1, "└" + "─" * (w - 2) + "┘")


def _label_for(node: Node) -> str:
    if isinstance(node, Header):
        return f"## {node.text} ##"
    if isinstance(node, Button):
        return f"({node.label})"
    if isinstance(node, Link):
        return f"<{node.label}>"
    if isinstance(node, Input):
        if node.name and node.value is not None:
            return f"{{{node.name}: {node.value}}}"
        if node.placeholder:
            return f"{{{node.placeholder}____}}"
        return "{_____}"
    if isinstance(node, Checkbox):
        return f"[{'x' if node.checked else ' '}] {node.label}"
    if isinstance(node, RadioOption):
        return f"({'@' if getattr(node, 'selected', False) else ' '}) {getattr(node, 'label', '')}"
    if isinstance(node, Text):
        return node.text
    return ""


def render_canvas(
    screen: Screen,
    width: int = 80,
    height: int = 24,
    focus_id: Optional[str] = None,
    highlights: Optional[Set[str]] = None,
) -> str:
    canvas = _make_canvas(width, height)

    # draw outer box
    _box(canvas, 0, 0, width, height)
    title = f" Screen: {screen.name} "
    _put(canvas, 2, 0, title[: max(0, width - 4)])

    def walk(n: Node) -> None:
        for c in getattr(n, "children", []):
            if isinstance(c, (Panel, Split, Grid, Form, ListView)):
                if c.x is not None and c.y is not None and c.w and c.h:
                    _box(canvas, max(0, c.x), max(0, c.y), max(2, c.w), max(2, c.h))
                walk(c)
            else:
                if c.x is not None and c.y is not None:
                    label = _label_for(c)
                    cid = getattr(c, "id", None)
                    if focus_id and cid == focus_id and label:
                        if not label.startswith("▶ "):
                            label = "▶ " + label
                    elif highlights and cid in highlights and label:
                        if not label.startswith("• ") and not label.startswith("▶ "):
                            label = "• " + label
                    if label:
                        _put(canvas, max(0, c.x), max(0, c.y), label[: max(0, width - c.x)])

    walk(screen)

    # Trim common leading whitespace so first visible char starts at column 0
    def first_non_space(line: List[str]) -> int:
        for i, ch in enumerate(line):
            if ch != " ":
                return i
        return len(line)

    margin = min((first_non_space(row) for row in canvas if any(c != " " for c in row)), default=0)
    if margin and margin < width:
        trimmed = [row[margin:] for row in canvas]
    else:
        trimmed = canvas
    return "\n".join("".join(row) for row in trimmed) + "\n"
