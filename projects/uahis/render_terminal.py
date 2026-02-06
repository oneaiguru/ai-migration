from __future__ import annotations

from typing import List

from .ast import Button, Checkbox, Form, Header, Input, Link, ListView, Panel, Screen, Text, Node, Progress, Image, RadioGroup, RadioOption, Grid, Split


def _box(title: str, content_lines: List[str]) -> List[str]:
    width = max(len(title) + 2, *(len(line) for line in content_lines), 10)
    top = "┌" + "─" * (width) + "┐"
    ttl = f" {title} "
    title_line = "│" + ttl + " " * (width - len(ttl)) + "│"
    sep = "├" + "─" * (width) + "┤"
    lines = [top, title_line, sep]
    for line in content_lines:
        lines.append("│" + line + " " * (width - len(line)) + "│")
    lines.append("└" + "─" * (width) + "┘")
    return lines


def _render_node(node: Node, out: List[str]) -> None:
    if isinstance(node, Screen):
        out.extend(_box(f"Screen: {node.name}", _render_children(node)))
        return
    if isinstance(node, Panel):
        title = f"Panel: {node.name}" + (f" [{node.percent}%]" if node.percent else "")
        out.extend(_box(title, _render_children(node)))
        return
    if isinstance(node, Split):
        orient = getattr(node, 'orientation', None) or 'horizontal'
        title = f"Split: {'H' if str(orient).startswith('h') else 'V'}"
        out.extend(_box(title, _render_children(node)))
        return
    if isinstance(node, Grid):
        out.extend(_box(f"Grid: {node.columns} cols", _render_children(node)))
        return
    if isinstance(node, Form):
        out.extend(_box(f"Form: {node.name}", _render_children(node)))
        return
    if isinstance(node, ListView):
        lines: List[str] = []
        for c in node.children:
            if isinstance(c, Link):
                lines.append(f"<" + c.label + ">")
            elif isinstance(c, Text):
                lines.append(c.text)
        out.extend(_box(f"List: {node.name}", lines))
        return
    if isinstance(node, Header):
        out.append(f"## {node.text} ##")
        return
    if isinstance(node, Button):
        label = node.label
        out.append(f"({label})")
        return
    if isinstance(node, Link):
        out.append(f"<{node.label}>")
        return
    if isinstance(node, Input):
        if node.name and node.value is not None:
            out.append(f"{{{node.name}: {node.value}}}")
        elif node.placeholder:
            ph = node.placeholder
            out.append(f"{{{ph}____}}")
        else:
            out.append("{_____}")
        return
    if isinstance(node, Checkbox):
        out.append(f"[{'x' if node.checked else ' '}] {node.label}")
        return
    if isinstance(node, RadioGroup):
        lines = []
        for c in node.children:
            if isinstance(c, RadioOption):
                lines.append(f"({'@' if c.selected else ' '}) {c.label}")
        out.extend(_box(f"Radio: {node.name}", lines))
        return
    if isinstance(node, Progress):
        perc = 0 if node.max <= 0 else int(100 * node.value / node.max)
        bars = max(1, min(20, perc // 5))
        bar = "▓" * bars + "░" * (20 - bars)
        out.append(f"{node.label} │ {bar} {perc}%")
        return
    if isinstance(node, Image):
        out.append(f"[image: {node.src}]")
        return
    if isinstance(node, Text):
        out.append(node.text)
        return


def _render_children(node: Node) -> List[str]:
    buf: List[str] = []
    for c in node.children:
        _render_node(c, buf)
    return buf


def render(screen: Screen) -> str:
    lines: List[str] = []
    _render_node(screen, lines)
    return "\n".join(lines) + "\n"
