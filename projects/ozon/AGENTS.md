# Ozon Product Reservation Bot
- What: Selenium bot for reserving Ozon products with full, demo, and stealth modes plus scheduling and Telegram notifications.
- Install: `pip install -r requirements.txt` (Python 3.8+; Chrome/Chromium for full/demo, Firefox for stealth).
- Config: copy `config-updated.json` to `config.json` and fill login/password, SKU list, payment method, Telegram info.
- Run: `python ozon_bot_updated.py run` (one-off) or `python ozon_bot_updated.py [start-now]` for scheduler mode.
- Demo: `python ozon_bot_demo.py`; stealth demo: `python ozon_bot_demo_stealth.py` or `./run_enhanced_stealth.sh`.
- Tests: `python unittest-file-updated.py`.
- Docs: `README.md`, `INSTALLATION.md`, `SUMMARY.md`, `bdd-specs.md`, `STEALTH.md`.

Monorepo note: /Users/m/ai is a multi-project monorepo. See the root README for details.
