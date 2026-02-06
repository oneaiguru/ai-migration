## Suggested shortcuts (shell)

```bash
# ~/.zshrc
alias cc='claude'
function cc-zai() {
  export ANTHROPIC_BASE_URL="https://api.z.ai/api/anthropic"
  export ANTHROPIC_AUTH_TOKEN="$ZAI_API_KEY"
  claude "$@"
}
```

## Slash‑command idea (PTY wrapper)

* `/haiku` → flip to ZAI lane
* `/sonnet` → flip to SUB lane
* `/status` → call `/status` and print current model from JSON

---