#!/usr/bin/env python3
import sys
import pathlib

REQ = {
  "Onboarding.md": ["# Onboarding", "## Steps"],
  "Repo_Layout.md":["# Repository Layout"],
  "Testing.md":["# Testing","## Coverage Targets","## Determinism"],
  "Spec_Sync.md":["# Spec Sync","ID scheme"],
  "CI_CD.md":["# CI/CD Pipeline","## Jobs"],
  "Release.md":["# Release"]
}

base = pathlib.Path("docs/System")
missing = []
for fname, heads in REQ.items():
    f = base / fname
    if not f.exists():
        missing.append(f"missing file: {f}")
        continue
    text = f.read_text(encoding="utf-8")
    for h in heads:
        if h not in text:
            missing.append(f"{fname}: missing heading '{h}'")

# Simple link check: ensure internal cross-links exist (README -> Onboarding)
root = pathlib.Path("README.md")
if root.exists():
    t = root.read_text(encoding="utf-8")
    if "docs/System/Onboarding.md" not in t:
        missing.append("README.md: must link to docs/System/Onboarding.md")

if missing:
    print("DOCS CHECK FAILED:")
    for m in missing:
        print("-", m)
    sys.exit(1)
print("Docs check OK")
