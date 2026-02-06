# iMessage Sender Project
- What: macOS iMessage bulk sender with contact import, templating, logging, and AppleScript-based delivery.
- How to run tests: `python -m pytest tests/test_basic.py tests/test_contact_manager.py tests/test_imessage_sender.py`
- Install deps: `python -m pip install -r requirements.txt` (PyQt5/pyobjc require macOS).
- CLI entrypoint: `python main-script.py -f <contacts.csv> -t <template.txt> [--media <path>] [--min-delay N] [--max-delay N]`
