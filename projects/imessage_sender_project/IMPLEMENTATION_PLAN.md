# IMPLEMENTATION_PLAN

Project goal:
- Build iCampaign Pro (PyQt6 + SQLite) from the existing iMessage sender codebase per `imessage.md`.

P0
- [ ] Create the new `/src` app skeleton (main.py, app.py) and move/copy existing core modules into `/src/core` with minimal shims; keep the CLI entrypoint working.
- [ ] Implement the SQLite database layer (schema + migrations/init) for contacts, groups, templates, campaigns, settings, and license.
- [ ] Build the PyQt6 shell: main window, sidebar navigation, screen routing, shared styles.
- [ ] Implement the Contacts screen (import CSV/Excel/TXT, list/search, group assignment) backed by the DB and existing contact manager.
- [ ] Implement the Templates screen (editor, variable detection, preview) with DB persistence.
- [ ] Implement Campaign flow (create campaign, select contacts/templates, configure delays/media, run send with progress + pause/stop).
- [ ] Implement Reports screen and campaign history export using logger outputs.

P1
- [ ] Implement local license/trial validation (tiers, limits) with settings UI and DB storage.
- [ ] Add build/distribution scripts (PyInstaller config, Info.plist/entitlements) and document packaging steps.
- [ ] Update requirements/tests/docs for the new structure; add a basic GUI smoke-test note.

Notes
- macOS-only; Messages.app + AppleScript required; no App Store distribution.
- Local-only data and licensing; no external services.
