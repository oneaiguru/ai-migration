# Skills Registry

Centralized management for Codex skills in this repo.

## Layout
- `skills/registry.json`: source of truth for skill versions.
- `skills/packages/`: packaged `.skill` files (build outputs).
- `skills/<skill-name>/`: skill source (SKILL.md, references/, scripts/).
- Optional: `skills/src/<skill-name>/` for new skills (tooling scans both).

## Scripts
All scripts live in `scripts/skills/` and run from repo root.

Pack a skill:
```bash
python scripts/skills/pack.py <skill-name>
```

Install a skill:
```bash
python scripts/skills/install.py <skill-name>
```

Remove a skill:
```bash
python scripts/skills/remove.py <skill-name>
```

List registry + installed:
```bash
python scripts/skills/list.py
```

Bump a version:
```bash
python scripts/skills/bump_version.py <skill-name> --part patch
```

## Notes
- `pack.py` updates registry fields: package path, checksum, built_at.
- `bump_version.py` clears package/checksum fields so you can re-pack.
