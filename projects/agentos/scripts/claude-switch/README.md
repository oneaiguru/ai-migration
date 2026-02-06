# Claude Code Mode Switcher

Run Claude Code in two isolated modes on the same machine:

1. **Subscription mode (OAuth)** – uses your Claude Pro/Max plan; no API keys required.
2. **Z.ai API mode** – points Claude Code at the Z.ai Anthropic-compatible endpoint (GLM-4.6).

## Files

- `claude-sub.sh` – launches Claude Code with subscription authentication.
- `claude-zai.sh` – launches Claude Code with Z.ai API credentials (.env-driven).
- `cc.sh` – small dispatcher: `./cc.sh sub …` or `./cc.sh zai …`.
- `.env.zai.example` – template for the Z.ai credentials file.

State for each mode lives under `state/sub` and `state/zai` (per XDG directories). Set `ISOLATE_HOME=1` to give each mode its own `$HOME`.

## Setup

```bash
cd scripts/claude-switch
chmod +x claude-sub.sh claude-zai.sh cc.sh
cp .env.zai.example .env.zai
${EDITOR:-nano} .env.zai   # fill ZAI_API_KEY, optional base URL/models
```

## Usage

```bash
# Terminal A – Claude via subscription
./cc.sh sub -p

# Terminal B – Z.ai GLM via API mode
./cc.sh zai -p
```

Both sessions run concurrently without stepping on each other’s config/state. If you see any collisions, enforce isolated homes:

```bash
ISOLATE_HOME=1 ./cc.sh sub -p
ISOLATE_HOME=1 ./cc.sh zai -p
```

## Notes

- Do **not** export `ANTHROPIC_API_KEY` globally; otherwise Claude Code will default to API mode.
- The Z.ai script only uses your Z.ai key; your Anthropic subscription will not be billed.
- If your Z.ai plan lacks API access, the Z.ai script will error out; the subscription script still works.
- Agents can execute these scripts directly to deterministically select a runtime.
