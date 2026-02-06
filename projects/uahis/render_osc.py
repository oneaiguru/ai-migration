from __future__ import annotations

from typing import List

from .ast import Button, Checkbox, Form, Header, Input, Link, ListView, Panel, Screen, Split, Text, Node, Image, Progress, RadioOption


BEL = "\a"
ESC = "\033]"


def _osc(payload: str) -> str:
    return f"{ESC}{payload}{BEL}"


def render(screen: Screen, width: int = 80, height: int = 24) -> str:
    out: List[str] = []
    # Surface creation
    out.append(_osc(f"9900;surface:create:id={screen.id or 'main'}:w={width}:h={height}"))

    def emit_widget(node: Node) -> None:
        if node.x is None or node.y is None:
            return
        if isinstance(node, Button):
            out.append(_osc(
                f"9910;widget:button:id={node.id or 'btn'}:text={node.label}:pos={node.x},{node.y}"
            ))
        elif isinstance(node, Input):
            ph = node.placeholder or (node.name or "")
            out.append(_osc(
                f"9911;widget:input:id={node.id or 'in'}:placeholder={ph}:pos={node.x},{node.y}:w={node.w or 10}"
            ))
        elif isinstance(node, Checkbox):
            out.append(_osc(
                f"9912;widget:checkbox:id={node.id or 'cb'}:label={node.label}:pos={node.x},{node.y}:checked={(1 if node.checked else 0)}"
            ))
        elif isinstance(node, Link):
            out.append(_osc(
                f"9913;widget:link:id={node.id or 'lnk'}:text={node.label}:pos={node.x},{node.y}"
            ))
        elif isinstance(node, Header):
            out.append(_osc(
                f"9914;widget:header:id={node.id or 'hdr'}:text={node.text}:pos={node.x},{node.y}"
            ))
        elif isinstance(node, Text):
            out.append(_osc(
                f"9915;widget:text:id={node.id or 'txt'}:text={node.text}:pos={node.x},{node.y}"
            ))
        elif isinstance(node, Image):
            w = node.w or node.width or 10
            h = node.h or node.height or 5
            if isinstance(node.src, str) and node.src.startswith('data:'):
                out.append(_osc(
                    f"9916;widget:image:id={node.id or 'img'}:data={node.src}:pos={node.x},{node.y}:w={w}:h={h}"
                ))
            else:
                out.append(_osc(
                    f"9916;widget:image:id={node.id or 'img'}:path={node.src}:pos={node.x},{node.y}:w={w}:h={h}"
                ))
        elif isinstance(node, Progress):
            out.append(_osc(
                f"9917;widget:progress:id={node.id or 'prog'}:label={node.label}:pos={node.x},{node.y}:value={node.value}:max={node.max}"
            ))
        elif isinstance(node, RadioOption):
            out.append(_osc(
                f"9918;widget:radio:id={node.id or 'radio'}:label={node.label}:pos={node.x},{node.y}:checked={(1 if node.selected else 0)}"
            ))

        # bindings are emitted in walk() so they apply to nodes without widgets too

    def walk(n: Node) -> None:
        # emit binds for this node if any (even if no widget command)
        for ev, action in (n.events or {}).items():
            out.append(_osc(
                f"9920;bind:event={ev}:id={n.id or ''}:action={action}"
            ))
        for c in getattr(n, "children", []):
            emit_widget(c)
            walk(c)

    walk(screen)
    # Focus order announcement
    if isinstance(screen.props, dict) and screen.props.get('focus_order'):
        order = ",".join(map(str, screen.props['focus_order']))
        out.append(_osc(f"9930;focus:order={order}"))
    return "\n".join(out) + ("\n" if out else "")
