#!/usr/bin/env python3
import sys, os

def is_fence(line: str) -> bool:
    s = line.strip()
    return s.startswith("```")

def first_nonempty(lines):
    for i, ln in enumerate(lines):
        if ln.strip() != "":
            return i
    return None

def last_nonempty(lines):
    for i in range(len(lines) - 1, -1, -1):
        if lines[i].strip() != "":
            return i
    return None

def should_unwrap_whole_doc(lines):
    i = first_nonempty(lines)
    j = last_nonempty(lines)
    if i is None or j is None:
        return False
    if not is_fence(lines[i]):
        return False
    if lines[j].strip() != "```":
        return False
    return True

def sanitize(path: str, ext_hint: str) -> str:
    with open(path, 'r', encoding='utf-8', errors='replace') as f:
        lines = f.readlines()

    # If it's a code file, strip top/bottom fence if present
    code_exts = {'.json', '.js', '.ts', '.go', '.sh', '.yaml', '.yml'}
    if ext_hint in code_exts:
        i = first_nonempty(lines)
        j = last_nonempty(lines)
        if i is not None and j is not None and is_fence(lines[i]) and lines[j].strip() == "```":
            return ''.join(lines[i+1:j])
        return ''.join(lines)

    # For markdown, unwrap only if the entire doc is fenced
    if should_unwrap_whole_doc(lines):
        i = first_nonempty(lines)
        j = last_nonempty(lines)
        return ''.join(lines[i+1:j])
    return ''.join(lines)

def main():
    if len(sys.argv) < 2:
        print("usage: sanitize_fence.py <src> [<dst>]", file=sys.stderr)
        sys.exit(2)
    src = sys.argv[1]
    dst = sys.argv[2] if len(sys.argv) > 2 else None
    ext = os.path.splitext(src)[1].lower()
    out = sanitize(src, ext)
    if dst:
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        with open(dst, 'w', encoding='utf-8') as w:
            w.write(out)
    else:
        sys.stdout.write(out)

if __name__ == '__main__':
    main()

