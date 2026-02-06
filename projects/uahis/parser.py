from __future__ import annotations

import re
from dataclasses import dataclass
from typing import List, Optional, Tuple

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
    Text,
    Node,
    Split,
    Grid,
)
from .icons import icons_to_mnemonic, scan_icon_tokens


_RE_HEADER = re.compile(r"^\s*##\s*(.*?)\s*##\s*$")
_RE_BUTTON = re.compile(r"\(([^()]+)\)")
_RE_LINK = re.compile(r"<([^<>]+)>")
_RE_INPUT_PAIR = re.compile(r"\{\s*([^:{}]+)\s*:\s*([^{}]+)\s*\}")
_RE_INPUT_PH = re.compile(r"\{\s*([^{}]+?)_+\s*\}")
_RE_RADIO = re.compile(r"^\((@|\s)\)\s*(.*)$")  # (@) Selected, ( ) Unselected
_RE_SPAN_TRAIL = re.compile(r"\[\s*span\s*=\s*(\d+)\s*\]\s*$", re.IGNORECASE)
_RE_KV_ALL = re.compile(r"\[\s*([a-zA-Z]+)\s*=\s*([^\]]+)\s*\]")
_RE_CHECKBOX = re.compile(r"\[([ xX])\]\s*(.*)")


@dataclass
class _Frame:
    indent: int
    node: Node


def _indent_of(line: str) -> int:
    # count leading spaces; 2 spaces == one level in our DSL
    n = len(line) - len(line.lstrip(" "))
    return n // 2


def parse_ui(source: str) -> Screen:
    """
    Parse a simplified hierarchical DSL inspired by q/q2:

    Supported containers (indent with 2 spaces per level):
      @screen NAME:
      @panel NAME [NN%]:
      @form NAME:
      @list NAME:

    Supported inline atoms on content lines:
      - ## Header ##
      - (Button)
      - <Link>
      - {name: value} or {placeholder____}
      - [x] Label / [ ] Label

    Lines starting with '-' under a list are treated as list items (links or text).
    Other lines become Text if they don't match any atom.
    """
    lines = source.splitlines()
    if not lines:
        raise ValueError("empty UI source")

    root: Optional[Screen] = None
    stack: List[_Frame] = []
    used_ids: dict[str, int] = {}

    def slugify(s: str) -> str:
        s2 = re.sub(r"[^a-zA-Z0-9]+", "-", s.strip()).strip("-").lower() or "item"
        n = used_ids.get(s2, 0)
        used_ids[s2] = n + 1
        return s2 if n == 0 else f"{s2}-{n}"

    def push(node: Node, level: int) -> None:
        nonlocal root
        while stack and stack[-1].indent >= level:
            stack.pop()
        if not stack:
            if root is None:
                if isinstance(node, Screen):
                    root = node
                else:
                    # implicitly create a screen
                    root = Screen(name="main")
                    root.add(node)
            else:
                root.add(node)
        else:
            stack[-1].node.add(node)
        stack.append(_Frame(indent=level, node=node))

    def add_inline_content(parent: Node, content: str) -> None:
        created: List[Node] = []
        # Headers
        m = _RE_HEADER.match(content)
        if m:
            h = Header(m.group(1).strip())
            h.id = slugify(h.text)
            parent.add(h)
            created.append(h)
            return

        # Extract checkboxes at start of line
        m = _RE_CHECKBOX.match(content.strip())
        if m:
            checked = m.group(1).lower() == "x"
            label = m.group(2).strip()
            cb = Checkbox(label, checked)
            cb.id = slugify(label)
            parent.add(cb)
            created.append(cb)
            return

        # Extract {name:value} and {placeholder____}
        for name, val in _RE_INPUT_PAIR.findall(content):
            inp = Input(name=name.strip(), value=val.strip())
            inp.id = slugify(name)
            parent.add(inp)
            created.append(inp)

        for ph in _RE_INPUT_PH.findall(content):
            inp = Input(placeholder=ph.strip())
            inp.id = slugify(ph)
            parent.add(inp)
            created.append(inp)

        # Extract links and buttons in order of appearance
        idx = 0
        while idx < len(content):
            lb = content.find("(", idx)
            ll = content.find("<", idx)
            if lb == -1 and ll == -1:
                break
            if lb != -1 and (ll == -1 or lb < ll):
                m = _RE_BUTTON.search(content, idx)
                if not m:
                    break
                b = Button(m.group(1).strip())
                b.id = slugify(b.label)
                parent.add(b)
                created.append(b)
                idx = m.end()
            else:
                m = _RE_LINK.search(content, idx)
                if not m:
                    break
                l = Link(m.group(1).strip())
                l.id = slugify(l.label)
                parent.add(l)
                created.append(l)
                idx = m.end()

        # If nothing was created on this line, add raw text (but avoid empty noise)
        if not created and content.strip():
            t = Text(content.strip())
            t.id = slugify(t.text)
            parent.add(t)
            created.append(t)

        # trailing [key=value] tokens apply to the last created element on this line
        if created:
            target = created[-1]
            for k, v in _RE_KV_ALL.findall(content):
                k = k.strip().lower()
                v = v.strip()
                if k == "span":
                    try:
                        target.props["span"] = int(v)
                    except ValueError:
                        pass
                elif k == "align":
                    target.props["align"] = v.lower()
                elif k == "pad":
                    try:
                        target.props["pad"] = int(v)
                    except ValueError:
                        pass
                elif k == "id":
                    target.id = slugify(v)
                elif k == "hotkey":
                    token = v.strip()
                    if token:
                        target.props["hotkey"] = token[0].lower()
                elif k in ("mnemonic", "mnemo", "keys"):
                    token = v.replace(",", "").replace(" ", "").lower()
                    if token:
                        target.props["mnemonic"] = token
                elif k == "icons":
                    target.props["icons"] = [tok.strip() for tok in v.split(",") if tok.strip()]

        # Auto-derive icons & mnemonics from label if none are provided explicitly
        if created:
            tgt = created[-1]
            label_text = None
            if isinstance(tgt, (Button, Link, Checkbox)):
                label_text = tgt.label
            elif isinstance(tgt, RadioOption):
                label_text = getattr(tgt, "label", None)
            if label_text:
                if "icons" not in tgt.props:
                    icons = scan_icon_tokens(label_text)
                    if icons:
                        tgt.props["icons"] = icons
                if "mnemonic" not in tgt.props and tgt.props.get("icons"):
                    mnemonic = icons_to_mnemonic(tgt.props["icons"])
                    if mnemonic:
                        tgt.props["mnemonic"] = mnemonic

    current_list: Optional[ListView] = None
    current_list_level: Optional[int] = None

    def find_target(node: Node, label: str) -> Optional[Node]:
        # DFS search for Button/Link/Checkbox/Input matching label or name
        from .ast import Button, Link, Checkbox, Input, RadioOption

        stackn = [node]
        while stackn:
            n = stackn.pop(0)
            for c in getattr(n, "children", []):
                if isinstance(c, Button) and c.label == label:
                    return c
                if isinstance(c, Link) and c.label == label:
                    return c
                if isinstance(c, Checkbox) and c.label == label:
                    return c
                if isinstance(c, Input) and (c.name == label or c.placeholder == label):
                    return c
                if isinstance(c, RadioOption) and c.label == label:
                    return c
                stackn.append(c)
        return None

    for raw in lines:
        line = raw.rstrip("\n")
        if not line.strip():
            continue

        level = _indent_of(line)
        body = line.strip()

        # Leave list scope when dedenting to list level or higher
        if current_list is not None and current_list_level is not None and level <= current_list_level:
            current_list = None
            current_list_level = None

        # Containers
        if body.startswith("@screen ") and body.endswith(":"):
            name = body[len("@screen ") : -1].strip()
            s = Screen(name=name)
            s.id = slugify(name)
            push(s, level)
            current_list = None
            continue

        if body.startswith("@panel ") and body.endswith(":"):
            header = body[len("@panel ") : -1].strip()
            percent = None
            orientation = None
            # NAME [NN%] optional
            m = re.search(r"\[(\d+)%\]", header)
            if m:
                percent = int(m.group(1))
                header = re.sub(r"\s*\[\d+%\]\s*", "", header)
            pnode = Panel(name=header, percent=percent, orientation=orientation)
            pnode.id = slugify(header)
            push(pnode, level)
            current_list = None
            continue

        if body.startswith("@form ") and body.endswith(":"):
            name = body[len("@form ") : -1].strip()
            f = Form(name=name)
            f.id = slugify(name)
            push(f, level)
            current_list = None
            continue

        if body.startswith("@list ") and body.endswith(":"):
            name = body[len("@list ") : -1].strip()
            node = ListView(name=name)
            node.id = slugify(name)
            push(node, level)
            current_list = node
            current_list_level = level
            continue

        if (body.startswith("@tmux-split ") or body.startswith("@split ")) and body.endswith(":"):
            header = body.split(" ", 1)[1][:-1].strip()
            orientation = header.split()[0].strip()
            sp = Split(orientation=orientation)
            sp.id = slugify(f"split-{orientation}")
            push(sp, level)
            current_list = None
            continue

        if body.startswith("@grid ") and body.endswith(":"):
            # @grid columns=3:
            args = body[len("@grid ") : -1].strip()
            m = re.search(r"columns\s*=\s*(\d+)", args)
            columns = int(m.group(1)) if m else 2
            g = Grid(columns=columns)
            g.id = slugify(f"grid-{columns}")
            push(g, level)
            current_list = None
            continue

        # Events binding: @bind event "Label": action  OR @bind key "Enter": action (container-level)
        mb = re.match(r"^@bind\s+(\w+)\s+\"?([^\":]+)\"?\s*:\s*([A-Za-z0-9_./:-]+)\s*$", body)
        if mb:
            ev, label, action = mb.groups()
            if ev.lower() == "key":
                # container-level key binding
                parent = stack[-1].node if stack else (root or Screen(name="main"))
                parent.events[f"key:{label}"] = action
            else:
                scope = stack[-1].node if stack else (root or Screen(name="main"))
                target = find_target(scope, label)
                if target is None and root is not None:
                    target = find_target(root, label)
                if target is not None:
                    target.events[ev] = action
            continue

        # State assignment: @state key=value
        ms = re.match(r"^@state\s+([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.+)\s*$", body)
        if ms:
            k, v = ms.groups()
            # crude value parsing: int, bool, else string
            vv: object
            if v.lower() in ("true", "false"):
                vv = v.lower() == "true"
            else:
                try:
                    vv = int(v)
                except ValueError:
                    vv = v.strip().strip('"')
            parent = stack[-1].node if stack else (root or Screen(name="main"))
            parent.props[k] = vv  # store at container
            continue

        # Focus order
        mf = re.match(r"^@focus\s+order\s*:\s*(.+)$", body)
        if mf:
            seq = [tok.strip() for tok in re.split(r"[ ,]+", mf.group(1).strip()) if tok.strip()]
            parent = stack[-1].node if stack else (root or Screen(name="main"))
            parent.props["focus_order"] = seq
            continue

        # Span for last element in this container
        mspan = re.match(r"^@span\s+(\d+)\s*$", body)
        if mspan:
            parent = stack[-1].node if stack else (root or Screen(name="main"))
            try:
                val = int(mspan.group(1))
            except ValueError:
                val = None
            if val and getattr(parent, 'children', None):
                parent.children[-1].props['span'] = val
            continue

        # Size for an element by label or id
        msize = re.match(r"^@size\s+(?:id=([A-Za-z0-9._-]+)|\"([^\"]+)\")\s+(?:w=(\d+))?(?:\s+h=(\d+))?\s*$", body)
        if msize:
            tid, tlab, w, h = msize.group(1), msize.group(2), msize.group(3), msize.group(4)
            scope = stack[-1].node if stack else (root or Screen(name="main"))
            target = None
            if tid:
                # search by id
                def find_by_id(n: Node, idv: str):
                    if getattr(n, 'id', None) == idv:
                        return n
                    for cc in getattr(n, 'children', []):
                        r = find_by_id(cc, idv)
                        if r is not None:
                            return r
                    return None
                target = find_by_id(scope, tid) or (root and find_by_id(root, tid))
            else:
                target = find_target(scope, tlab) or (root and find_target(root, tlab))
            if target is not None:
                if w: target.w = int(w)
                if h: target.h = int(h)
            continue

        # Align and Pad targeting specific element by id or label
        malign = re.match(r"^@align\s+(?:id=([A-Za-z0-9._-]+)|\"([^\"]+)\")\s+(left|center|right)\s*$", body, re.IGNORECASE)
        if malign:
            tid, tlab, av = malign.group(1), malign.group(2), malign.group(3).lower()
            scope = stack[-1].node if stack else (root or Screen(name="main"))
            target = None
            if tid:
                def find_by_id(n: Node, idv: str):
                    if getattr(n, 'id', None) == idv:
                        return n
                    for cc in getattr(n, 'children', []):
                        r = find_by_id(cc, idv)
                        if r is not None:
                            return r
                    return None
                target = find_by_id(scope, tid) or (root and find_by_id(root, tid))
            else:
                target = find_target(scope, tlab) or (root and find_target(root, tlab))
            if target is not None:
                target.props['align'] = av
            continue

        mpad = re.match(r"^@pad\s+(?:id=([A-Za-z0-9._-]+)|\"([^\"]+)\")\s+(\d+)\s*$", body, re.IGNORECASE)
        if mpad:
            tid, tlab, pv = mpad.group(1), mpad.group(2), int(mpad.group(3))
            scope = stack[-1].node if stack else (root or Screen(name="main"))
            target = None
            if tid:
                def find_by_id(n: Node, idv: str):
                    if getattr(n, 'id', None) == idv:
                        return n
                    for cc in getattr(n, 'children', []):
                        r = find_by_id(cc, idv)
                        if r is not None:
                            return r
                    return None
                target = find_by_id(scope, tid) or (root and find_by_id(root, tid))
            else:
                target = find_target(scope, tlab) or (root and find_target(root, tlab))
            if target is not None:
                target.props['pad'] = pv
            continue

        # List item
        if body.startswith("- ") and current_list is not None and current_list_level is not None and level > current_list_level:
            item = body[2:].strip()
            # try to parse as link first
            m = _RE_LINK.match(item)
            if m:
                lbl = m.group(1).strip()
                ln = Link(lbl)
                ln.id = slugify(lbl)
                current_list.add(ln)
            else:
                t = Text(item)
                t.id = slugify(item)
                current_list.add(t)
            continue

        # Content line inside current container
        parent = stack[-1].node if stack else (root or Screen(name="main"))
        if not stack and root is None:
            root = parent  # ensure root exists
            stack.append(_Frame(indent=0, node=parent))

        # Special atoms: image, progress, radio options
        mi = re.match(r"^@image\s+src=([^\s]+)(?:\s+w=(\d+))?(?:\s+h=(\d+))?\s*$", body)
        if mi:
            src, w, h = mi.group(1), mi.group(2), mi.group(3)
            img = Image(src=src, width=int(w) if w else None, height=int(h) if h else None)
            img.id = slugify(src)
            parent.add(img)
            continue

        mp = re.match(r"^@progress\s+label=\"?([^\"]+)\"?\s+value=(\d+)(?:\s+max=(\d+))?\s*$", body)
        if mp:
            lbl, val, mx = mp.group(1), int(mp.group(2)), int(mp.group(3)) if mp.group(3) else 100
            pr = Progress(label=lbl, value=val, max_value=mx)
            pr.id = slugify(lbl)
            parent.add(pr)
            continue

        mr = _RE_RADIO.match(body)
        if mr:
            selected = (mr.group(1) == "@")
            lbl = mr.group(2).strip()
            # Find last RadioGroup among parent's children; else create one
            rg = None
            for ch in reversed(getattr(parent, "children", [])):
                if isinstance(ch, RadioGroup):
                    rg = ch
                    break
            if rg is None:
                rg = RadioGroup(name="options")
                rg.id = slugify("radio")
                parent.add(rg)
            ro = RadioOption(label=lbl, selected=selected)
            ro.id = slugify(lbl)
            rg.add(ro)
            continue

        add_inline_content(parent, body)

    if root is None:
        root = Screen(name="main")
    return root
