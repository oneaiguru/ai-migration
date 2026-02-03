#!/usr/bin/env python3
import os
import re
import sys
import yaml

BASE = os.path.dirname(os.path.dirname(__file__))
FEATURE_DIR = os.path.join(BASE, 'specs', 'bdd', 'features')
UNIT_DIR = os.path.join(BASE, 'specs', 'unit-md')
TEST_DIR = os.path.join(BASE, 'tests')
REG_DIR = os.path.join(BASE, 'spec_registry')
IDX_PATH = os.path.join(REG_DIR, 'spec_index.yml')

ID_RE = re.compile(r'@([A-Z]+-\d{3})')
UNIT_ID_RE = re.compile(r'\b([A-Z]+-\d{3})\b')
TEST_MARK_RE = re.compile(r"spec_id\(\s*\"([A-Z]+-\d{3})\"\s*\)")

def collect_features():
    ids = {}
    if not os.path.isdir(FEATURE_DIR):
        return ids
    for fn in os.listdir(FEATURE_DIR):
        if not fn.endswith('.feature'):
            continue
        path = os.path.join(FEATURE_DIR, fn)
        with open(path, encoding='utf-8') as f:
            text = f.read()
        found = set(ID_RE.findall(text))
        for sid in found:
            ids.setdefault(sid, {"feature": []})["feature"].append(os.path.relpath(path, BASE))
    return ids

def collect_unit_md(idx):
    if not os.path.isdir(UNIT_DIR):
        return
    for fn in os.listdir(UNIT_DIR):
        if not fn.endswith('.md'):
            continue
        path = os.path.join(UNIT_DIR, fn)
        with open(path, encoding='utf-8') as f:
            text = f.read()
        # find any Spec IDs in the doc
        found = set(UNIT_ID_RE.findall(text))
        for sid in found:
            idx.setdefault(sid, {}).setdefault('unit_md', []).append(os.path.relpath(path, BASE))

def collect_tests(idx):
    for root, _, files in os.walk(TEST_DIR):
        for fn in files:
            if not fn.startswith('test_') or not fn.endswith('.py'):
                continue
            path = os.path.join(root, fn)
            with open(path, encoding='utf-8') as f:
                text = f.read()
            found = set(TEST_MARK_RE.findall(text))
            for sid in found:
                idx.setdefault(sid, {}).setdefault('tests', []).append(os.path.relpath(path, BASE))

def main():
    idx = collect_features()
    collect_unit_md(idx)
    collect_tests(idx)
    os.makedirs(REG_DIR, exist_ok=True)
    with open(IDX_PATH, 'w', encoding='utf-8') as f:
        yaml.safe_dump(idx, f, sort_keys=True, allow_unicode=True)

    # Validate every feature id has at least one test
    missing_tests = [sid for sid, m in idx.items() if m.get('feature') and not m.get('tests')]
    if missing_tests:
        print('Spec-Sync ERROR: Missing tests for IDs:', ', '.join(missing_tests))
        sys.exit(1)
    print('Spec-Sync OK. Index written to', IDX_PATH)

if __name__ == '__main__':
    main()
