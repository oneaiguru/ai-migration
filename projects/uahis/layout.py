from __future__ import annotations

from typing import List, Tuple

from .ast import (
    Button,
    Checkbox,
    Form,
    Header,
    Image,
    Input,
    Link,
    ListView,
    Panel,
    Screen,
    Split,
    Grid,
    RadioGroup,
    RadioOption,
    Progress,
    Text,
    Node,
)


def _split_sizes(total: int, percents: List[int]) -> List[int]:
    n = len(percents)
    if n == 0:
        return []
    s = sum(percents)
    if s == 0:
        base = max(1, total // n) if n else 0
        sizes = [base] * n
        if sizes:
            sizes[-1] += total - sum(sizes)
        return sizes
    sizes = [max(1, (p * total) // s) for p in percents]
    sizes[-1] += total - sum(sizes)
    return sizes


def _actionables(n: Node) -> List[Node]:
    kinds = (Button, Checkbox, Input, Link, RadioOption)
    out: List[Node] = []
    def walk(x: Node):
        for c in getattr(x, "children", []):
            if isinstance(c, kinds):
                out.append(c)
            walk(c)
    walk(n)
    return out


def _centroid(n: Node) -> tuple[int, int]:
    x = n.x or 0
    y = n.y or 0
    w = n.w or 1
    h = n.h or 1
    return (x + w // 2, y + h // 2)


def compute_layout(screen: Screen, width: int = 80, height: int = 24) -> None:
    screen.x, screen.y, screen.w, screen.h = 0, 0, width, height

    def layout(node: Node, x: int, y: int, w: int, h: int) -> None:
        node.x, node.y, node.w, node.h = x, y, w, h

        if isinstance(node, Split):
            children = node.children
            if not children:
                return
            if node.orientation.startswith("h"):
                # horizontal split → side-by-side
                parts = len(children)
                percents = [getattr(c, "percent", None) or 0 for c in children]
                sizes = _split_sizes(w, percents)
                cx = x
                for c, ww in zip(children, sizes):
                    layout(c, cx, y, ww, h)
                    cx += ww
            else:
                percents = [getattr(c, "percent", None) or 0 for c in children]
                sizes = _split_sizes(h, percents)
                cy = y
                for c, hh in zip(children, sizes):
                    layout(c, x, cy, w, hh)
                    cy += hh
            return

        if isinstance(node, Screen):
            # If there is a Split child, delegate; else arrange panels horizontally.
            if any(isinstance(c, Split) for c in node.children):
                for c in node.children:
                    layout(c, x, y, w, h)
                return
            panels = [c for c in node.children if isinstance(c, Panel)]
            others = [c for c in node.children if not isinstance(c, Panel)]
            if panels:
                percents = [p.percent or 0 for p in panels]
                sizes = _split_sizes(w, percents)
                cx = x
                for p, ww in zip(panels, sizes):
                    layout(p, cx, y, ww, h)
                    cx += ww
            # Stack others below panels if any
            oy = y + (h - len(others)) if panels else y
            for c in others:
                layout(c, x, oy, w, 1)
                oy += 1
            return

        if isinstance(node, Panel):
            # Fill area; layout children vertically
            cy = y + 1
            for c in node.children:
                layout(c, x + 1, cy, max(1, w - 2), 1 if not hasattr(c, "children") or not c.children else max(1, h - 2))
                if isinstance(c, (Form, ListView)):
                    # these will handle their own vertical space; just reserve some
                    cy += max(3, len(c.children))
                else:
                    cy += 1
            return

        if isinstance(node, Grid):
            cols = max(1, node.columns)
            col_w = max(1, w // cols)
            cx, cy = x, y
            col_idx = 0
            for c in node.children:
                span = int(getattr(c, 'props', {}).get('span', 1) or 1)
                if span < 1:
                    span = 1
                if span > cols:
                    span = cols
                # wrap to next row if not enough space in this row
                if col_idx != 0 and col_idx + span > cols:
                    col_idx = 0
                    cx = x
                    cy += 1
                item_w = max(1, col_w * span)
                layout(c, cx, cy, item_w, 1)
                col_idx += span
                if col_idx >= cols:
                    col_idx = 0
                    cx = x
                    cy += 1
                else:
                    cx += item_w
            return

        if isinstance(node, Form):
            cy = y
            for c in node.children:
                layout(c, x, cy, max(1, w - 2), 1)
                cy += 1
            return

        if isinstance(node, ListView):
            cy = y
            for c in node.children:
                layout(c, x, cy, max(1, w - 2), 1)
                cy += 1
            return

        if isinstance(node, RadioGroup):
            cy = y
            for c in node.children:
                layout(c, x, cy, max(1, w - 2), 1)
                cy += 1
            return

        # Leaves already set (x,y,w,h)

    layout(screen, 0, 0, width, height)

    # Compute focus order (reading order unless overridden)
    focus_order = []
    override = screen.props.get("focus_order") if isinstance(screen.props, dict) else None
    if isinstance(override, list) and override:
        # Map ids to nodes
        idmap = {}
        for n in _actionables(screen):
            if n.id:
                idmap[n.id] = n
        for i, tok in enumerate(override):
            n = idmap.get(tok)
            if n is not None:
                n.tabindex = i + 1
                focus_order.append(tok)
    else:
        # reading order of actionables
        acts = _actionables(screen)
        acts.sort(key=lambda n: ((n.y or 0), (n.x or 0)))
        for i, n in enumerate(acts):
            n.tabindex = i + 1
            if n.id:
                focus_order.append(n.id)
    screen.props["focus_order"] = focus_order

    # Compute nav graph (nearest neighbor per direction)
    acts = [n for n in _actionables(screen) if n.id]
    for a in acts:
        ax, ay = _centroid(a)
        neighbors = {"up": None, "down": None, "left": None, "right": None}
        best = {k: (1e9, None) for k in neighbors}
        for b in acts:
            if a is b:
                continue
            bx, by = _centroid(b)
            dx, dy = bx - ax, by - ay
            dist = abs(dx) + abs(dy)
            if dy < 0 and abs(dx) <= abs(dy):  # up
                if dist < best["up"][0]:
                    best["up"] = (dist, b)
            if dy > 0 and abs(dx) <= abs(dy):  # down
                if dist < best["down"][0]:
                    best["down"] = (dist, b)
            if dx < 0 and abs(dy) <= abs(dx):  # left
                if dist < best["left"][0]:
                    best["left"] = (dist, b)
            if dx > 0 and abs(dy) <= abs(dx):  # right
                if dist < best["right"][0]:
                    best["right"] = (dist, b)
        for k, (_, n) in best.items():
            if n is not None:
                a.props.setdefault("nav", {})[k] = n.id
