from __future__ import annotations

import curses
from typing import Optional

from .ast import Screen
from .env import FocusContext, apply_key, init_env, render_ascii, snapshot
from .nav import describe_node

BASE_HINT = "Arrows/Tab move • Enter activates • Space toggles • q quits"
HOTKEY_HINT_LIMIT = 10


def _translate_key(code: int) -> Optional[str]:
    if code < 0:
        return None
    if code in {curses.KEY_RIGHT}:
        return "ArrowRight"
    if code in {curses.KEY_LEFT}:
        return "ArrowLeft"
    if code in {curses.KEY_UP}:
        return "ArrowUp"
    if code in {curses.KEY_DOWN}:
        return "ArrowDown"
    if code in {curses.KEY_BACKSPACE, 127, 8}:
        return "Backspace"
    if code in {curses.KEY_ENTER, 10, 13}:
        return "Enter"
    key_dc = getattr(curses, "KEY_DC", None)
    if key_dc is not None and code == key_dc:
        return "Delete"
    if code in {curses.KEY_BTAB, 353}:
        return "Shift+Tab"
    if code in {curses.KEY_TAB, 9}:
        return "Tab"
    if code in {27}:
        return "Escape"
    if code == ord(" "):
        return "Space"
    if 0 <= code < 256:
        ch = chr(code)
        if ch.isprintable() and ch not in {"\n", "\r", "\t"}:
            return ch
    return None


def _build_hint(ctx: FocusContext) -> str:
    if not ctx.order:
        return "No interactive elements • q quits"
    hotkey_pairs = []
    for key, target in ctx.hotkeys.items():
        node = ctx.idmap.get(target)
        if not node:
            continue
        label = describe_node(node)
        token = label.split()[0] if label else target
        hotkey_pairs.append(f"{key}={token}")
        if len(hotkey_pairs) >= HOTKEY_HINT_LIMIT:
            break
    if hotkey_pairs:
        return f"{BASE_HINT} • Hotkeys: {', '.join(hotkey_pairs)}"
    return BASE_HINT


def run_curses(screen: Screen, width: int = 80, height: int = 24) -> None:
    env_state = init_env(screen, width=width, height=height)

    def draw(stdscr) -> None:
        nonlocal env_state
        curses.curs_set(0)
        stdscr.nodelay(False)
        stdscr.keypad(True)

        draw_width = max(1, width - 1)
        draw_height = max(1, height - 1)

        while True:
            ctx = snapshot(screen)
            frame = render_ascii(
                screen,
                env_state.focus_id,
                width=env_state.width,
                height=env_state.height,
            )
            lines = frame.splitlines()

            stdscr.erase()
            for row in range(draw_height):
                text = lines[row] if row < len(lines) else ""
                stdscr.addnstr(row, 0, text.ljust(draw_width), draw_width)

            base_hint = _build_hint(ctx)
            status = (
                f"{env_state.last_message} • {base_hint}"
                if env_state.last_message
                else base_hint
            )
            stdscr.addnstr(height - 1, 0, status.ljust(draw_width), draw_width)
            stdscr.refresh()

            key_code = stdscr.getch()
            key = _translate_key(key_code)
            if key is None:
                continue

            env_state = apply_key(screen, env_state, key)
            if env_state.done:
                break

    curses.wrapper(draw)
