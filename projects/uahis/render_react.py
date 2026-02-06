from __future__ import annotations

from typing import List

from .ast import Button, Checkbox, Form, Header, Input, Link, ListView, Panel, Screen, Text, Node, Image, Progress, RadioGroup, RadioOption, Split, Grid


def _jsx_escape(text: str) -> str:
    return (
        text.replace("\\", "\\\\")
        .replace("\"", "\\\"")
        .replace("{", "{" + "{")
        .replace("}", "}" + "}")
    )


def _render_node_jsx(node: Node, indent: int = 2) -> List[str]:
    pad = " " * indent
    lines: List[str] = []
    def nav_attrs(n: Node) -> str:
        nav = getattr(n, 'props', {}).get('nav', {}) if hasattr(n, 'props') else {}
        parts: List[str] = []
        for d in ('up','down','left','right'):
            v = nav.get(d)
            if v:
                parts.append(f" data-nav-{d}=\"{_jsx_escape(v)}\"")
        if getattr(n, 'x', None) is not None:
            parts.append(f" data-x=\"{n.x}\"")
        if getattr(n, 'y', None) is not None:
            parts.append(f" data-y=\"{n.y}\"")
        if getattr(n, 'w', None) is not None:
            parts.append(f" data-w=\"{n.w}\"")
        if getattr(n, 'h', None) is not None:
            parts.append(f" data-h=\"{n.h}\"")
        sp = getattr(n, 'props', {}).get('span') if hasattr(n, 'props') else None
        if sp:
            parts.append(f" data-span=\"{sp}\"")
        return ''.join(parts)

    def style_attr(n: Node) -> str:
        props = getattr(n, 'props', {}) if hasattr(n, 'props') else {}
        styles: List[str] = []
        align = props.get('align')
        if align:
            js = 'start' if align == 'left' else 'end' if align == 'right' else 'center'
            styles.append(f"justifySelf: '{js}'")
            # Also textAlign for non-grid contexts
            styles.append(f"textAlign: '{'left' if align=='left' else 'right' if align=='right' else 'center'}'")
        pad = props.get('pad')
        if isinstance(pad, int):
            styles.append(f"padding: '{pad}px'")
        span = props.get('span')
        if isinstance(span, int):
            styles.append(f"gridColumn: 'span {span}'")
        if styles:
            return " style={{ " + ", ".join(styles) + " }}"
        return ""
    if isinstance(node, Screen):
        lines.append(f"{pad}<div className=\"screen\" id=\"{node.id or 'screen'}\" data-name=\"{_jsx_escape(node.name)}\" onKeyDown={{onRootKeyDown}} tabIndex={{0}}>")
        for c in node.children:
            lines.extend(_render_node_jsx(c, indent + 2))
        lines.append(f"{pad}</div>")
        return lines
    if isinstance(node, Panel):
        title = node.name
        role = " role=\"navigation\"" if node.name.lower() == 'navigation' else " role=\"region\""
        lines.append(f"{pad}<section className=\"panel\" id=\"{node.id or ''}\" data-name=\"{_jsx_escape(title)}\"{role} aria-label=\"{_jsx_escape(title)}\">")
        for c in node.children:
            lines.extend(_render_node_jsx(c, indent + 2))
        lines.append(f"{pad}</section>")
        return lines
    if isinstance(node, Form):
        lines.append(f"{pad}<form className=\"form\" id=\"{node.id or ''}\" aria-label=\"{_jsx_escape(node.name)}\">")
        for c in node.children:
            lines.extend(_render_node_jsx(c, indent + 2))
        lines.append(f"{pad}</form>")
        return lines
    if isinstance(node, ListView):
        lines.append(f"{pad}<ul className=\"list\" id=\"{node.id or ''}\" aria-label=\"{_jsx_escape(node.name)}\">")
        for c in node.children:
            if isinstance(c, Link):
                action = c.events.get('click') if hasattr(c, 'events') else None
                handler = f" onClick={{() => props.onAction?.('{_jsx_escape(action)}','{_jsx_escape(c.id or '')}')}}" if action else ""
                ti = c.tabindex or 0
                lines.append(f"{pad}  <li><a id=\"{c.id or ''}\" href=\"#\" tabIndex={{{ti}}}{handler}{nav_attrs(c)}{style_attr(c)} onKeyDown={{(e) => e.key==='Enter' && e.currentTarget.click()}}>{_jsx_escape(c.label)}</a></li>")
            elif isinstance(c, Text):
                lines.append(f"{pad}  <li>{_jsx_escape(c.text)}</li>")
        lines.append(f"{pad}</ul>")
        return lines
    if isinstance(node, Split):
        orient = getattr(node, 'orientation', 'horizontal')
        style = " style={{ display: 'flex', flexDirection: 'row', gap: '8px' }}" if orient.startswith('h') else " style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}"
        lines.append(f"{pad}<div className=\"split {orient}\" id=\"{node.id or ''}\"{style}>")
        for c in node.children:
            lines.extend(_render_node_jsx(c, indent + 2))
        lines.append(f"{pad}</div>")
        return lines
    if isinstance(node, Grid):
        cols = getattr(node, 'columns', 2)
        # Use simple string for grid columns to avoid nested JS template syntax
        lines.append(f"{pad}<div className=\"grid\" id=\"{node.id or ''}\" data-columns=\"{cols}\" style={{{{ display: 'grid', gridTemplateColumns: 'repeat({cols}, 1fr)', gap: '8px' }}}}>")
        for c in node.children:
            lines.extend(_render_node_jsx(c, indent + 2))
        lines.append(f"{pad}</div>")
        return lines
    if isinstance(node, Header):
        lines.append(f"{pad}<h2 id=\"{node.id or ''}\">{_jsx_escape(node.text)}</h2>")
        return lines
    if isinstance(node, Button):
        dis = " disabled" if node.disabled else ""
        action = node.events.get('click') if hasattr(node, 'events') else None
        handler = f" onClick={{() => props.onAction?.('{_jsx_escape(action)}','{_jsx_escape(node.id or '')}')}}" if action else ""
        tabindex = f" tabIndex={node.tabindex}" if getattr(node, 'tabindex', None) else ""
        lines.append(f"{pad}<button id=\"{node.id or ''}\"{dis}{tabindex}{handler}{nav_attrs(node)}{style_attr(node)} onKeyDown={{(e) => e.key==='Enter' && e.currentTarget.click()}}>{_jsx_escape(node.label)}</button>")
        return lines
    if isinstance(node, Link):
        action = node.events.get('click') if hasattr(node, 'events') else None
        handler = f" onClick={{() => props.onAction?.('{_jsx_escape(action)}','{_jsx_escape(node.id or '')}')}}" if action else ""
        tabindex = f" tabIndex={node.tabindex}" if getattr(node, 'tabindex', None) else ""
        lines.append(f"{pad}<a id=\"{node.id or ''}\" href=\"#\"{tabindex}{handler}{nav_attrs(node)}{style_attr(node)} onKeyDown={{(e) => e.key==='Enter' && e.currentTarget.click()}}>{_jsx_escape(node.label)}</a>")
        return lines
    if isinstance(node, Input):
        attrs: List[str] = ["type=\"text\""]
        if node.placeholder:
            attrs.append(f"placeholder=\"{_jsx_escape(node.placeholder)}\"")
        if node.value is not None:
            attrs.append(f"defaultValue=\"{_jsx_escape(node.value)}\"")
        if node.name:
            attrs.append(f"name=\"{_jsx_escape(node.name)}\"")
        tabindex = f" tabIndex={node.tabindex}" if getattr(node, 'tabindex', None) else ""
        action = node.events.get('submit') if hasattr(node, 'events') else None
        handler = f" onKeyDown={{(e) => e.key==='Enter' && props.onAction?.('{_jsx_escape(action)}','{_jsx_escape(node.id or '')}')}}" if action else " onKeyDown={(e) => (e.key==='Enter') && e.currentTarget.blur()}"
        lines.append(f"{pad}<input id=\"{node.id or ''}\" {' '.join(attrs)}{tabindex}{handler}{nav_attrs(node)}{style_attr(node)} />")
        return lines
    if isinstance(node, Checkbox):
        chk = " defaultChecked" if node.checked else ""
        tabindex = f" tabIndex={node.tabindex}" if getattr(node, 'tabindex', None) else ""
        action = node.events.get('click') if hasattr(node, 'events') else None
        handler = f" onChange={{() => props.onAction?.('{_jsx_escape(action)}','{_jsx_escape(node.id or '')}')}}" if action else ""
        lines.append(f"{pad}<label id=\"{node.id or ''}\"><input type=\"checkbox\"{chk}{tabindex}{handler}{nav_attrs(node)}{style_attr(node)} /> {_jsx_escape(node.label)}</label>")
        return lines
    if isinstance(node, RadioGroup):
        lines.append(f"{pad}<fieldset id=\"{node.id or ''}\">")
        lines.append(f"{pad}  <legend>{_jsx_escape(node.name)}</legend>")
        for c in node.children:
            lines.extend(_render_node_jsx(c, indent + 2))
        lines.append(f"{pad}</fieldset>")
        return lines
    if isinstance(node, RadioOption):
        chk = " defaultChecked" if node.selected else ""
        tabindex = f" tabIndex={node.tabindex}" if getattr(node, 'tabindex', None) else ""
        group = getattr(node, "parent", None)
        group_name = _jsx_escape(getattr(group, "id", None) or getattr(group, "name", "") or "radio-group")
        lines.append(f"{pad}<label id=\"{node.id or ''}\"><input type=\"radio\" name=\"{group_name}\"{chk}{tabindex}{nav_attrs(node)}{style_attr(node)} /> {_jsx_escape(node.label)}</label>")
        return lines
    if isinstance(node, Progress):
        value = max(0, min(node.value, node.max))
        lines.append(f"{pad}<progress id=\"{node.id or ''}\" value={value} max={node.max} role=\"progressbar\" aria-valuenow={value} aria-valuemax={node.max} aria-label=\"{_jsx_escape(node.label)}\"{style_attr(node)}>{value}/{node.max}</progress>")
        return lines
    if isinstance(node, Image):
        w = f" width=\"{node.width}\"" if node.width else ""
        h = f" height=\"{node.height}\"" if node.height else ""
        alt = _jsx_escape(node.src.split('/')[-1])
        lines.append(f"{pad}<img id=\"{node.id or ''}\" src=\"{_jsx_escape(node.src)}\" alt=\"{alt}\"{w}{h}{nav_attrs(node)}{style_attr(node)} />")
        return lines
    if isinstance(node, Text):
        lines.append(f"{pad}<span>{_jsx_escape(node.text)}</span>")
        return lines
    # Generic container passthrough
    if hasattr(node, 'children') and node.children:
        for c in node.children:
            lines.extend(_render_node_jsx(c, indent))
    return lines


def generate_component(screen: Screen, component_name: str = "GeneratedUI") -> str:
    lines: List[str] = []
    lines.append("import React from 'react';")
    lines.append("")
    # collect key bindings (container-level) from AST
    def collect_keybinds(n: Node):
        out = {}
        evs = getattr(n, 'events', {}) or {}
        for k, a in evs.items():
            if k.startswith('key:'):
                out[k.split(':',1)[1]] = { 'action': a, 'id': getattr(n, 'id', '') or '' }
        for c in getattr(n, 'children', []) or []:
            out.update(collect_keybinds(c))
        return out
    keymap = collect_keybinds(screen)
    # serialize keymap literal
    def js_string(s: str) -> str:
        return s.replace('\\', '\\\\').replace('"', '\\"')
    km_lines = ["  const keyMap: Record<string, {action: string, id: string}> = {"]
    for k, v in keymap.items():
        km_lines.append(f"    \"{js_string(k)}\": {{ action: \"{js_string(v['action'])}\", id: \"{js_string(v['id'])}\" }},")
    km_lines.append("  };")

    lines.append(f"export default function {component_name}(props: {{ onAction?: (action: string, id: string) => void }}) {{")
    lines.extend(km_lines)
    # onRootKeyDown handler uses data-nav-* for arrow navigation and keyMap for actions
    lines.append("  const onRootKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {")
    lines.append("    const key = e.key;")
    lines.append("    // container-level key binds")
    lines.append("    const km = (keyMap as any)[key];")
    lines.append("    if (km && props.onAction) { props.onAction(km.action, km.id); }")
    lines.append("    // directional navigation")
    lines.append("    if (key.startsWith('Arrow')) {")
    lines.append("      const el = e.target as HTMLElement;")
    lines.append("      const ds = (el.dataset || {}) as any;")
    lines.append("      const dir = key === 'ArrowUp' ? 'navUp' : key === 'ArrowDown' ? 'navDown' : key === 'ArrowLeft' ? 'navLeft' : key === 'ArrowRight' ? 'navRight' : undefined;")
    lines.append("      if (dir && ds[dir]) {")
    lines.append("        const next = document.getElementById(ds[dir]);")
    lines.append("        if (next) { e.preventDefault(); (next as HTMLElement).focus(); return; }")
    lines.append("      }")
    lines.append("    }")
    lines.append("  };")
    lines.append("  return (")
    lines.extend(_render_node_jsx(screen, indent=4))
    lines.append("  );")
    lines.append("}")
    lines.append("")
    return "\n".join(lines)
