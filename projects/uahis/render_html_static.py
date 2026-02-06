from __future__ import annotations

from typing import List

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
    Progress,
    RadioGroup,
    RadioOption,
    Screen,
    Split,
    Grid,
    Text,
    Node,
)

CSS = """
  body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, Noto Sans; margin: 16px; }
  .panel { border: 1px solid #d1d5db; border-radius: 8px; padding: 8px; margin-bottom: 8px; }
  .split.horizontal { display: flex; gap: 8px; }
  .split.vertical { display: flex; flex-direction: column; gap: 8px; }
  .grid { display: grid; gap: 8px; grid-template-columns: repeat(2, 1fr); }
  .list { list-style: none; padding-left: 12px; margin: 0; }
  *:focus { outline: 2px solid #3b82f6; outline-offset: 2px; }
  [data-span="2"] { grid-column: span 2; }
  [data-span="3"] { grid-column: span 3; }
  [data-span="4"] { grid-column: span 4; }
  [data-align="left"]  { justify-self: start; text-align: left; }
  [data-align="center"]{ justify-self: center; text-align: center; }
  [data-align="right"] { justify-self: end; text-align: right; }
  progress { width: 100%; height: 12px; }
"""


def _esc(s: str) -> str:
    return (
        s.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
    )


def _style_from_props(n: Node) -> str:
    parts: List[str] = []
    align = getattr(n, 'props', {}).get('align') if hasattr(n, 'props') else None
    if align:
        js = 'start' if align == 'left' else 'end' if align == 'right' else 'center'
        parts.append(f"justify-self:{js}")
        parts.append(f"text-align:{'left' if align=='left' else 'right' if align=='right' else 'center'}")
    pad = getattr(n, 'props', {}).get('pad') if hasattr(n, 'props') else None
    if isinstance(pad, int):
        parts.append(f"padding:{pad}px")
    return (" style=\"" + "; ".join(parts) + "\"") if parts else ""


def _span_attr(n: Node) -> str:
    sp = getattr(n, 'props', {}).get('span') if hasattr(n, 'props') else None
    return f" data-span=\"{sp}\"" if sp else ""


def _hotkey_attr(n: Node) -> str:
    value = getattr(n, 'props', {}).get('hotkey') if hasattr(n, 'props') else None
    if not value:
        return ""
    token = str(value).strip()
    if not token:
        return ""
    return f" data-hotkey=\"{_esc(token[0].lower())}\""


def _nav_attrs(n: Node) -> str:
    nav = getattr(n, 'props', {}).get('nav') if hasattr(n, 'props') else None
    if not isinstance(nav, dict):
        return ""
    parts: List[str] = []
    for k in ('up','down','left','right'):
        v = nav.get(k)
        if v:
            parts.append(f" data-nav-{k}=\"{_esc(v)}\"")
    return ''.join(parts)


def _render_node(node: Node, out: List[str], indent: int = 2) -> None:
    pad = " " * indent
    if isinstance(node, Screen):
        out.append(f"{pad}<div class=\"screen\" id=\"{_esc(node.id or 'screen')}\">")
        for c in node.children:
            _render_node(c, out, indent + 2)
        out.append(f"{pad}</div>")
        return
    if isinstance(node, Panel):
        out.append(f"{pad}<section class=\"panel\" id=\"{_esc(node.id or '')}\" aria-label=\"{_esc(node.name)}\">")
        for c in node.children:
            _render_node(c, out, indent + 2)
        out.append(f"{pad}</section>")
        return
    if isinstance(node, Split):
        cls = 'horizontal' if str(getattr(node, 'orientation', 'horizontal')).startswith('h') else 'vertical'
        out.append(f"{pad}<div class=\"split {cls}\">")
        for c in node.children:
            _render_node(c, out, indent + 2)
        out.append(f"{pad}</div>")
        return
    if isinstance(node, Grid):
        cols = getattr(node, 'columns', 2) or 2
        out.append(f"{pad}<div class=\"grid\" data-columns=\"{cols}\" style=\"display:grid;gap:8px;grid-template-columns:repeat({cols},1fr)\">")
        for c in node.children:
            _render_node(c, out, indent + 2)
        out.append(f"{pad}</div>")
        return
    if isinstance(node, Form):
        out.append(f"{pad}<form class=\"form\" id=\"{_esc(node.id or '')}\" aria-label=\"{_esc(node.name)}\">")
        for c in node.children:
            _render_node(c, out, indent + 2)
        out.append(f"{pad}</form>")
        return
    if isinstance(node, ListView):
        out.append(f"{pad}<ul class=\"list\" id=\"{_esc(node.id or '')}\" aria-label=\"{_esc(node.name)}\">")
        for c in node.children:
            if isinstance(c, Link):
                out.append(f"{pad}  <li><a id=\"{_esc(c.id or '')}\" href=\"#\">{_esc(c.label)}</a></li>")
            elif isinstance(c, Text):
                out.append(f"{pad}  <li>{_esc(c.text)}</li>")
        out.append(f"{pad}</ul>")
        return
    if isinstance(node, Header):
        out.append(f"{pad}<h2 id=\"{_esc(node.id or '')}\">{_esc(node.text)}</h2>")
        return
    if isinstance(node, Button):
        ti = getattr(node, 'tabindex', None)
        tab = f" tabindex=\"{ti}\"" if ti else ""
        out.append(f"{pad}<button id=\"{_esc(node.id or '')}\"{tab}{_span_attr(node)}{_hotkey_attr(node)}{_nav_attrs(node)}{_style_from_props(node)}>{_esc(node.label)}</button>")
        return
    if isinstance(node, Link):
        ti = getattr(node, 'tabindex', None)
        tab = f" tabindex=\"{ti}\"" if ti else ""
        out.append(f"{pad}<a id=\"{_esc(node.id or '')}\" href=\"#\"{tab}{_span_attr(node)}{_hotkey_attr(node)}{_nav_attrs(node)}{_style_from_props(node)}>{_esc(node.label)}</a>")
        return
    if isinstance(node, Input):
        ti = getattr(node, 'tabindex', None)
        tab = f" tabindex=\"{ti}\"" if ti else ""
        attrs = []
        if node.placeholder:
            attrs.append(f"placeholder=\"{_esc(node.placeholder)}\"")
        if node.value is not None:
            attrs.append(f"value=\"{_esc(str(node.value))}\"")
        if node.name:
            attrs.append(f"name=\"{_esc(node.name)}\"")
        out.append(f"{pad}<input id=\"{_esc(node.id or '')}\" type=\"text\" {' '.join(attrs)}{tab}{_span_attr(node)}{_hotkey_attr(node)}{_nav_attrs(node)}{_style_from_props(node)}>")
        return
    if isinstance(node, Checkbox):
        ti = getattr(node, 'tabindex', None)
        tab = f" tabindex=\"{ti}\"" if ti else ""
        chk = " checked" if node.checked else ""
        out.append(f"{pad}<label id=\"{_esc(node.id or '')}\"><input type=\"checkbox\"{chk}{tab}{_span_attr(node)}{_hotkey_attr(node)}{_nav_attrs(node)}{_style_from_props(node)} /> {_esc(node.label)}</label>")
        return
    if isinstance(node, RadioGroup):
        out.append(f"{pad}<fieldset id=\"{_esc(node.id or '')}\"><legend>{_esc(node.name)}</legend>")
        for c in node.children:
            _render_node(c, out, indent + 2)
        out.append(f"{pad}</fieldset>")
        return
    if isinstance(node, RadioOption):
        ti = getattr(node, 'tabindex', None)
        tab = f" tabindex=\"{ti}\"" if ti else ""
        chk = " checked" if node.selected else ""
        group = getattr(node, "parent", None)
        group_name = _esc(getattr(group, "id", None) or getattr(group, "name", "") or "radio-group")
        out.append(f"{pad}<label id=\"{_esc(node.id or '')}\"><input type=\"radio\" name=\"{group_name}\"{chk}{tab}{_span_attr(node)}{_hotkey_attr(node)}{_nav_attrs(node)}{_style_from_props(node)} /> {_esc(node.label)}</label>")
        return
    if isinstance(node, Progress):
        val = max(0, min(node.value, node.max))
        out.append(f"{pad}<progress id=\"{_esc(node.id or '')}\" value=\"{val}\" max=\"{node.max}\" aria-label=\"{_esc(node.label)}\"{_span_attr(node)}{_style_from_props(node)}>{val}/{node.max}</progress>")
        return
    if isinstance(node, Image):
        w = f" width=\"{node.width}\"" if node.width else ""
        h = f" height=\"{node.height}\"" if node.height else ""
        out.append(f"{pad}<img id=\"{_esc(node.id or '')}\" src=\"{_esc(node.src)}\" alt=\"{_esc(node.src.split('/')[-1])}\"{w}{h}{_span_attr(node)}{_style_from_props(node)} />")
        return
    if isinstance(node, Text):
        out.append(f"{pad}<span>{_esc(node.text)}</span>")
        return


def render_static_html(screen: Screen, title: str = "UAHIS Preview (Static)") -> str:
    parts: List[str] = []
    parts.append("<!doctype html>")
    parts.append("<html lang=\"en\">")
    parts.append("  <head>")
    parts.append("    <meta charset=\"utf-8\" />")
    parts.append("    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />")
    parts.append(f"    <title>{_esc(title)}</title>")
    parts.append("    <style>")
    parts.append(CSS)
    parts.append("    </style>")
    parts.append("  </head>")
    parts.append("  <body>")
    _render_node(screen, parts, indent=2)
    parts.append(
        "  <script>\n"
        "document.addEventListener('keydown', function(e){\n"
        "  var dir = e.key==='ArrowUp'?'navUp': e.key==='ArrowDown'?'navDown': e.key==='ArrowLeft'?'navLeft': e.key==='ArrowRight'?'navRight': null;\n"
        "  var el = document.activeElement;\n"
        "  if(dir){\n"
        "    if(!el || !el.dataset) return;\n"
        "    var nextId = el.dataset[dir];\n"
        "    if(nextId){\n"
        "      var nx = document.getElementById(nextId);\n"
        "      if(nx){ e.preventDefault(); nx.focus(); }\n"
        "    }\n"
        "    return;\n"
        "  }\n"
        "  if(e.key === 'Tab'){\n"
        "    var focusables = Array.from(document.querySelectorAll('[id][tabindex]'));\n"
        "    if(!focusables.length) return;\n"
        "    focusables.sort(function(a,b){\n"
        "      return (Number(a.getAttribute('tabindex'))||0) - (Number(b.getAttribute('tabindex'))||0);\n"
        "    });\n"
        "    var idx = focusables.indexOf(el);\n"
        "    if(idx === -1){ idx = e.shiftKey ? 0 : -1; }\n"
        "    e.preventDefault();\n"
        "    var next = e.shiftKey ? focusables[(idx - 1 + focusables.length) % focusables.length]\n"
        "                          : focusables[(idx + 1) % focusables.length];\n"
        "    if(next){ next.focus(); }\n"
        "    return;\n"
        "  }\n"
        "  if(e.key.length === 1 && !e.metaKey && !e.ctrlKey && !e.altKey){\n"
        "    if(el && ['INPUT','TEXTAREA'].includes(el.tagName)) return;\n"
        "    var hk = e.key.toLowerCase();\n"
        "    var target = document.querySelector(\"[data-hotkey='\" + hk + \"']\");\n"
        "    if(target){ e.preventDefault(); target.focus(); }\n"
        "  }\n"
        "});\n"
        "</script>"
    )
    parts.append("  </body>")
    parts.append("</html>")
    return "\n".join(parts) + "\n"
