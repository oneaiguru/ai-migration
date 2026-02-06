# Project Brief

## Repo Snapshot
- Python macOS iMessage bulk sender with modules for contact import, message templates, AppleScript delivery, and logging.
- CLI entrypoint in `main-script.py`; tests live in `tests/`.
- GUI work is incomplete (see `gui-continued.py` placeholder). Docs live in `readme (1).md` and `iMessage_Sender_Documentation.md`.

## Current Goal
- Evolve this repo into the iCampaign Pro macOS desktop app described in `imessage.md` (PyQt6 GUI, SQLite-backed campaigns, licensing, packaging).

## Constraints
- macOS-only; Messages.app + AppleScript sending remain the delivery mechanism.
- No App Store distribution; direct download only.
- Local-only operation: no external services or network dependencies for core workflow.
- Preserve and reuse existing core modules (`contact_manager.py`, `message_template.py`, `imessage_sender.py`, `logger.py`, `config.py`).
- Target Python 3.9+ and PyQt6 for new GUI work.
- Keep the current CLI entrypoint functional unless explicitly retired.

## Non-goals
- iOS/Android or web app builds.
- App Store submission or sandboxed automation.
- Marketing site, payments, or customer support tooling.
- Replacing AppleScript with a different messaging backend.

## Success Signals
- New project structure under `/src` with core modules reused under `/src/core`.
- SQLite schema + data layer implemented for contacts, templates, campaigns, settings, and license.
- PyQt6 GUI covers contacts, templates, campaign creation/runs, reports, and settings.
- Local license + trial enforcement works.
- Build script (PyInstaller) documented and runnable.
- `python -m pytest tests` passes or updated tests exist for new modules.
