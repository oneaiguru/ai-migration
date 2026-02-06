# 🧯 Troubleshooting

Common fixes to keep momentum.

## mitmdump missing

Install mitmproxy:

```bash
brew install mitmproxy
```

## Port already in use

```
pkill -f "mitmdump.*-p 8082" || true
cc mitm start 8083
```

## CA certificate not found

Create or reinstall the mitmproxy CA (first mitmproxy run usually bootstraps it). Expected path: `~/.mitmproxy/mitmproxy-ca-cert.pem`.

## Z.AI 401s

Switch header mode and restart MITM:

```bash
export ZAI_HEADER_MODE=authorization
cc mitm start 8082
```

## HTTP/2 retarget jitter / stalls

Force HTTP/1.1 upstream:

```bash
export MITM_FORCE_H1=1
cc mitm start 8082
```

## Productize check warns: Z.AI header on Anthropic lane

This indicates historical log lines or a leaky run. Clean or review:

```bash
make clean-logs   # optional cleanup script
cc verify         # re-summarize current session
```

## “unknown” lane entries

These are typically decision or non-completion events and are excluded from completion metrics.

## Dual-terminal fallback (no tmux)

Open two terminals manually:

- A: `cd repo && source scripts/sub-env.sh 8082 && claude`
- B: `cd repo && unset HTTPS_PROXY NODE_EXTRA_CA_CERTS ANTHROPIC_* && claude`

