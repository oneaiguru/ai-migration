Title: CAP-CLI-ALIAS-DEL — Convenience alias delete

What to change
- Provide convenience wrappers for deleting the latest or second-latest Codex AFTER snapshot: `od1`, `od2`.
- File: `scripts/tracker-aliases.sh`.

Acceptance
1) Record a before/after; then record another after.
2) Run `od2` to delete the second-latest after for that window.
3) Preview confirms only the latest after remains.

Commands
```
codex /status | os
codex /status | oe
codex /status | oe
od2 --window <W0-XX>
```

Links
- Capability map: `docs/System/capability_map/agentos/capabilities.csv`
