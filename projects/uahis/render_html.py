from __future__ import annotations

from typing import Optional

from .render_react import generate_component


HTML_CSS = """
  body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, Noto Sans, Apple Color Emoji, Segoe UI Emoji; margin: 16px; }
  .panel { border: 1px solid #d1d5db; border-radius: 8px; padding: 8px; }
  .split.horizontal { display: flex; flex-direction: row; gap: 8px; }
  .split.vertical { display: flex; flex-direction: column; gap: 8px; }
  .grid { display: grid; gap: 8px; }
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


def build_html(tsx: str, component_name: str = "GeneratedUI", title: Optional[str] = None) -> str:
    # Strip import React line to avoid ESM in browser Babel mode
    lines = [ln for ln in tsx.splitlines() if not ln.strip().startswith("import React")]
    tsx_clean = "\n".join(lines)
    # Replace default export with global function declaration for in-page use
    needle = f"export default function {component_name}"
    if needle in tsx_clean:
        tsx_clean = tsx_clean.replace(needle, f"function {component_name}")
    page_title = title or component_name
    return f"""<!doctype html>
<html lang=\"en\">
  <head>
    <meta charset=\"utf-8\" />
    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />
    <title>{page_title}</title>
    <style>{HTML_CSS}</style>
    <script crossorigin src=\"https://unpkg.com/react@18/umd/react.development.js\"></script>
    <script crossorigin src=\"https://unpkg.com/react-dom@18/umd/react-dom.development.js\"></script>
    <script src=\"https://unpkg.com/@babel/standalone/babel.min.js\"></script>
  </head>
  <body>
    <div id=\"root\"></div>
    <script type=\"text/babel\" data-presets=\"typescript,react\">
{tsx_clean}
      const root = ReactDOM.createRoot(document.getElementById('root'));
      root.render(React.createElement({component_name}, {{ onAction: (a, id) => console.log('action', a, id) }}));
    </script>
  </body>
</html>
"""
