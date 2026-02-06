from __future__ import annotations

import hashlib
from dataclasses import dataclass, replace
from typing import Dict, List, Optional, Set

from .ast import Checkbox, Input, Node, RadioOption, Screen
from .layout import compute_layout
from .nav import build_hotkeys, describe_node, gather_interactives, nearest_neighbor
from .render_terminal_canvas import render_canvas as _render_canvas


@dataclass
class FocusContext:
    """Snapshot of focusable elements and hotkeys for the current screen."""

    order: List[str]
    idmap: Dict[str, Node]
    hotkeys: Dict[str, str]


@dataclass
class EnvState:
    focus_id: Optional[str]
    width: int = 80
    height: int = 24
    done: bool = False
    last_key: Optional[str] = None
    last_message: Optional[str] = None
    focus_changed: bool = False
    mutated: bool = False
    activated: Optional[str] = None
    chord: str = ""


def init_env(screen: Screen, *, width: int = 80, height: int = 24) -> EnvState:
    """Prepare layout and initial reducer state for a screen."""

    compute_layout(screen, width=width, height=height)
    ctx = snapshot(screen)
    focus_id = ctx.order[0] if ctx.order else None
    return EnvState(focus_id=focus_id, width=width, height=height)


def snapshot(screen: Screen) -> FocusContext:
    """Collect focus order, element map, and hotkeys."""

    elements, _ = gather_interactives(screen)
    idmap = {node.id: node for node in elements if getattr(node, "id", None)}
    order = sorted(
        idmap.keys(),
        key=lambda fid: ((idmap[fid].y or 0), (idmap[fid].x or 0), fid),
    )
    hotkeys = build_hotkeys(order, idmap)
    return FocusContext(order=order, idmap=idmap, hotkeys=hotkeys)


def apply_key(screen: Screen, state: EnvState, key: str) -> EnvState:
    """Process a single key and return the next state."""

    key = (key or "").strip()
    if not key:
        return replace(
            state,
            last_key=None,
            last_message=None,
            focus_changed=False,
            mutated=False,
            activated=None,
        )

    if state.done:
        return replace(
            state,
            last_key=key,
            last_message=None,
            focus_changed=False,
            mutated=False,
            activated=None,
        )

    ctx = snapshot(screen)
    focus_id = state.focus_id
    if focus_id not in ctx.idmap:
        focus_id = ctx.order[0] if ctx.order else None

    if not focus_id:
        return replace(
            state,
            focus_id=None,
            last_key=key,
            last_message=None,
            focus_changed=False,
            mutated=False,
            activated=None,
        )

    current = ctx.idmap[focus_id]
    new_focus = focus_id
    focus_changed = False
    mutated = False
    activated: Optional[str] = None
    message: Optional[str] = None
    done = False

    raw_char = key if len(key) == 1 else None
    norm = _normalize_name(key)

    nav = getattr(current, "props", {}).get("nav", {}) if hasattr(current, "props") else {}

    def move_to(target: Optional[str]) -> None:
        nonlocal new_focus, focus_changed
        if target and target in ctx.idmap:
            if target != new_focus:
                new_focus = target
                focus_changed = new_focus != focus_id

    if norm in {"arrowright", "right", "keyright"}:
        move_to(nav.get("right") or nearest_neighbor(ctx.idmap, current, "right"))
    elif norm in {"arrowleft", "left", "keyleft"}:
        move_to(nav.get("left") or nearest_neighbor(ctx.idmap, current, "left"))
    elif norm in {"arrowup", "up", "keyup"}:
        move_to(nav.get("up") or nearest_neighbor(ctx.idmap, current, "up"))
    elif norm in {"arrowdown", "down", "keydown"}:
        move_to(nav.get("down") or nearest_neighbor(ctx.idmap, current, "down"))
    elif norm == "tab":
        if ctx.order:
            idx = ctx.order.index(new_focus)
            move_to(ctx.order[(idx + 1) % len(ctx.order)])
    elif norm in {"shifttab", "backtab", "btab"}:
        if ctx.order:
            idx = ctx.order.index(new_focus)
            move_to(ctx.order[(idx - 1) % len(ctx.order)])
    elif norm in {"enter", "return"}:
        # If chord active, commit Type Travel to best match
        if state.chord:
            matches = _match_ids(ctx, state.chord)
            target = matches[0] if matches else None
            if target:
                move_to(target)
                message = f"Jumped to {target}"
            else:
                message = f"No match for '{state.chord}'"
            # clear chord after commit
            new_state = EnvState(
                focus_id=new_focus,
                width=state.width,
                height=state.height,
                done=state.done,
                last_key=key,
                last_message=message,
                focus_changed=(new_focus != focus_id),
                mutated=False,
                activated=None,
                chord="",
            )
            return new_state
        mutated, message, activated = _activate(current, ctx)
    elif norm == "space":
        mutated, message, activated = _activate(current, ctx)
    elif norm in {"backspace", "delete", "del"}:
        if state.chord:
            # edit chord first
            new_chord = state.chord[:-1]
            return replace(
                state,
                last_key=key,
                last_message=None,
                focus_changed=False,
                mutated=False,
                activated=None,
                chord=new_chord,
            )
        if isinstance(current, Input) and current.value:
            current.value = current.value[:-1]
            mutated = True
            message = f"Backspace in {describe_node(current)}"
        else:
            message = None
    elif norm in {"escape", "esc", "quit"}:
        if state.chord:
            return replace(
                state,
                last_key=key,
                last_message="Chord cleared",
                focus_changed=False,
                mutated=False,
                activated=None,
                chord="",
            )
        done = True
        message = "Exited"
    elif norm == "q":
        done = True
        message = "Exited"
    elif raw_char:
        if isinstance(current, Input):
            current.value = (current.value or "") + raw_char
            mutated = True
            message = f"Typed '{raw_char}' in {describe_node(current)}"
        else:
            # If no active chord and a hotkey exists, honor hotkey (legacy behavior)
            hk_target = ctx.hotkeys.get(raw_char.lower())
            if hk_target and not state.chord:
                move_to(hk_target)
                current = ctx.idmap[new_focus]
                m, msg, act = _activate(current, ctx)
                return EnvState(
                    focus_id=new_focus,
                    width=state.width,
                    height=state.height,
                    done=state.done,
                    last_key=key,
                    last_message=msg,
                    focus_changed=(new_focus != focus_id),
                    mutated=m,
                    activated=act,
                    chord=state.chord,
                )
            # Otherwise, Type Travel: accumulate chord; do not trigger hotkey immediately
            new_chord = (state.chord or "") + raw_char.lower()
            return replace(
                state,
                last_key=key,
                last_message=None,
                focus_changed=False,
                mutated=False,
                activated=None,
                chord=new_chord,
            )
    else:
        target = ctx.hotkeys.get(norm)
        if target:
            move_to(target)
            current = ctx.idmap[new_focus]
            m, msg, act = _activate(current, ctx)
            mutated = mutated or m
            if msg:
                message = msg
            if act:
                activated = act

    return EnvState(
        focus_id=new_focus,
        width=state.width,
        height=state.height,
        done=state.done or done,
        last_key=key,
        last_message=message,
        focus_changed=focus_changed,
        mutated=mutated,
        activated=activated,
        chord=state.chord,
    )


def render_ascii(screen: Screen, focus_id: Optional[str], width: int = 80, height: int = 24, chord: Optional[str] = None) -> str:
    """Render the currently focused screen as ASCII with a focus marker."""
    highlights: Optional[Set[str]] = None
    if chord:
        ctx = snapshot(screen)
        highlights = set(_match_ids(ctx, chord))
    return _render_canvas(screen, width=width, height=height, focus_id=focus_id, highlights=highlights)


def screen_hash(text: str) -> str:
    """Generate a stable hash for an ASCII screen representation."""

    normalized = "\n".join(line.rstrip() for line in text.rstrip("\n").splitlines())
    return hashlib.sha1(normalized.encode("utf-8")).hexdigest()


def _normalize_name(key: str) -> str:
    if len(key) == 1:
        return key
    return key.lower().replace(" ", "").replace("_", "").replace("-", "").replace("+", "")


def _activate(node: Node, ctx: FocusContext) -> tuple[bool, Optional[str], Optional[str]]:
    mutated = False
    message: Optional[str]
    action: Optional[str] = None

    if isinstance(node, Checkbox):
        node.checked = not node.checked
        mutated = True
        message = f"Toggled {describe_node(node)}"
    elif isinstance(node, RadioOption):
        group = getattr(node, "parent", None)
        for other in ctx.idmap.values():
            if isinstance(other, RadioOption) and getattr(other, "parent", None) is group:
                other.selected = other is node
        mutated = True
        message = f"Selected {describe_node(node)}"
    elif isinstance(node, Input):
        message = f"Focused {describe_node(node)}"
    else:
        if hasattr(node, "events"):
            action = node.events.get("click") or node.events.get("submit")
        message = f"Activated {describe_node(node)}"
        if action:
            message = f"{message} -> {action}"
    return mutated, message, action


def _match_ids(ctx: FocusContext, prefix: str) -> List[str]:
    """Find element ids matching a chord prefix via mnemonic or label prefix (case-insensitive)."""
    pref = (prefix or "").lower()
    if not pref:
        return []
    out: List[str] = []
    for fid in ctx.order:
        node = ctx.idmap[fid]
        props = getattr(node, "props", {}) if hasattr(node, "props") else {}
        mn = str((props.get("mnemonic") or "")).lower()
        if mn.startswith(pref):
            out.append(fid)
            continue
        label = describe_node(node).lower()
        if label.startswith(pref):
            out.append(fid)
    return out


__all__ = [
    "EnvState",
    "FocusContext",
    "init_env",
    "snapshot",
    "apply_key",
    "render_ascii",
    "screen_hash",
]
