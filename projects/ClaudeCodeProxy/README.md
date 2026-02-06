# Claude Code Proxy

A proxy server that allows Claude Code to be used in restricted environments, with multiple users and cost tracking.

## Documentation

- Start Here (numbered quick start): `docs/START-HERE/README.md`
- High-level doc map: `docs/README.md`
- Current P0 plan (MITM subagent offload): `docs/mitm-subagent-offload/README.md`
- Long-session handoff (model-only routing quick start): `docs/HANDOFF-LONG-SESSION.md`
- Dual-terminal pilot (ship real work now): `docs/HANDOFF-DUAL-TERMINAL-PILOT.md`
- One‑pager (ELI16 quick start): `docs/ONE-PAGER.md`
- Reproducibility guide (copy/paste runbook): `docs/REPRODUCIBILITY-GUIDE.md`
- Prod usage E2E tests (non-interactive proofs): `docs/PROD-TESTS.md`
- Subscription modes (Community vs Pro): `docs/SUBSCRIPTION.md`
- Operator guide (ELI16 + mermaid diagrams): `docs/OPS-GUIDE.md`
- Post-polish session plan (read after H1/H2 & header A/B): `docs/methodology/post-polish-session-plan.md`
- Archived Moonshot POC bundle: `docs/archive/multipath-poc/README.md`

## Features

- Proxy server for Anthropic APIs (Claude Code, Claude Chat)
- Token-based authentication for multiple users
- API key management per user
- Usage tracking with detailed logs
- Prepaid balance system with 2x markup
- Simple web interface for token validation
- Admin tools for user management and reporting

## Architecture



```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│  Client     │         │    Proxy     │         │  Anthropic  │
│  Claude Code│ ──────> │    Server    │ ──────> │  API        │
└─────────────┘  HTTPS  └──────────────┘  HTTPS  └─────────────┘
```



## Requirements

- Node.js 18+
- Docker (optional)
- Anthropic API key

## Server Setup

### Using Docker (Recommended)

1. Clone this repository
2. Configure your API key: `export DEFAULT_ANTHROPIC_API_KEY=your_api_key`
3. Start the server: `docker-compose up -d`
4. Note the admin token from the logs: `docker-compose logs`

### Manual Setup

1. Clone this repository
2. Install dependencies: `npm install`
3. Configure your API key: `export DEFAULT_ANTHROPIC_API_KEY=your_api_key`
4. Start the server: `npm start`
5. Note the admin token from the logs

## Administration

Use the included admin script to manage users and balances:

```bash
# List all users
./admin.sh list

# Add a new user
./admin.sh add username [api_key]

# Update a user's API key
./admin.sh update username [api_key]

# Delete a user
./admin.sh delete username

# Add funds to a user's balance
./admin.sh balance username 100

# Check usage statistics
./admin.sh usage [username]
```

## Client Setup

Users need to configure their environment to use the proxy:

1. Download the client setup script
2. Run the script: `./client-setup.sh -u https://your-proxy-server.com -t your_token`
3. Source the configuration: `source ~/.claude_proxy_config`
4. Start using Claude Code normally: `claude -p "Hello, Claude!"`

Z.AI credentials (local dev)
- Put your Z.ai key in the repo‑root `.env` so our scripts load it automatically.
  - Either `ZAI_API_KEY=sk-...` or a single line with `sk-...` only.
- `make go-proxy` and `scripts/run-go-shim.sh` read `.env` and export `ZAI_API_KEY` if present.
- Anthropic access for the Claude CLI happens via `/login`; no separate `ANTHROPIC_AUTH_TOKEN` env variable is required for the community (non-Z.ai) flow.

Community pass-through (no Z.ai license)
- Skip `scripts/dev/dev-license-activate.sh` and clear any lingering license exports:
  ```bash
  unset CC_LICENSE_JSON CC_LICENSE_SIG CCP_LICENSE_PUBKEY_B64 ZAI_HEADER_MODE
  ```
- Start the shim as usual:
  ```bash
  make go-proxy
  source scripts/go-env.sh 8082
  ```
- Every CLI request now stays on the Anth lane; `ccp-logs` (or `tail -f logs/prod/usage.jsonl`) will show only `lane:"anthropic"` entries.

## Pricing Model

The system implements a simple prepaid balance model:

- Users must preload their account with a minimum of $50
- Token usage is marked up by 2x from Anthropic's base pricing
- Balance is deducted automatically as APIs are used
- Users receive a warning when balance drops below $30
- Service is disabled when balance reaches $0

## Security Considerations

- All communication uses HTTPS
- User tokens are generated using UUID v4
- API keys are never exposed to clients
- Admin access is restricted by token authentication
- Usage logs are stored on the server for auditing

## License

This project is proprietary and confidential.
