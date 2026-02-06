from __future__ import annotations

from typing import Dict, Iterable, List, Tuple

from .ast import Button, Checkbox, Input, Link, RadioOption, Screen, Node
from .icons import icons_to_mnemonic

Interactive = Tuple[List[Node], Dict[str, Node]]


def gather_interactives(screen: Screen) -> Interactive:
    elements: List[Node] = []
    idmap: Dict[str, Node] = {}

    def walk(node: Node) -> None:
        for child in getattr(node, "children", []) or []:
            if isinstance(child, (Button, Checkbox, Input, Link, RadioOption)):
                elements.append(child)
                if getattr(child, "id", None):
                    idmap[child.id] = child
            walk(child)

    walk(screen)
    return elements, idmap


def describe_node(node: Node) -> str:
    if isinstance(node, Button):
        return node.label
    if isinstance(node, Link):
        return node.label
    if isinstance(node, Checkbox):
        return node.label
    if isinstance(node, RadioOption):
        return getattr(node, "label", "") or getattr(node, "id", "") or "option"
    if isinstance(node, Input):
        return node.name or node.placeholder or getattr(node, "id", "") or "input"
    return getattr(node, "id", "") or "element"


def build_hotkeys(order: Iterable[str], idmap: Dict[str, Node]) -> Dict[str, str]:
    hotkeys: Dict[str, str] = {}
    for fid in order:
        node = idmap[fid]
        explicit = getattr(node, "props", {}).get("hotkey") if hasattr(node, "props") else None
        if explicit:
            key = str(explicit)[0].lower()
            hotkeys.setdefault(key, fid)
            continue
        props = getattr(node, "props", {}) if hasattr(node, "props") else {}
        icons = props.get("icons") or []
        if icons:
            derived = icons_to_mnemonic(icons)
            for ch in derived:
                if ch and ch not in hotkeys:
                    hotkeys[ch] = fid
                    break
        label = describe_node(node)
        for ch in label:
            if ch.isalnum():
                k = ch.lower()
                if k not in hotkeys:
                    hotkeys[k] = fid
                    break
    return hotkeys


def nearest_neighbor(idmap: Dict[str, Node], current: Node, direction: str) -> Optional[str]:
    cx, cy = current.x or 0, current.y or 0
    best: Tuple[int, Optional[str]] = (10**9, None)
    for nid, node in idmap.items():
        if node is current:
            continue
        nx, ny = node.x or 0, node.y or 0
        dx, dy = nx - cx, ny - cy
        manhattan = abs(dx) + abs(dy)
        if direction == "up" and not (dy < 0 and abs(dx) <= abs(dy)):
            continue
        if direction == "down" and not (dy > 0 and abs(dx) <= abs(dy)):
            continue
        if direction == "left" and not (dx < 0 and abs(dy) <= abs(dx)):
            continue
        if direction == "right" and not (dx > 0 and abs(dy) <= abs(dx)):
            continue
        if manhattan < best[0]:
            best = (manhattan, nid)
    return best[1]
