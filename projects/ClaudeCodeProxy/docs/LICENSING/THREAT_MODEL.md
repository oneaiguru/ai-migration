# Threat Model (v0)

## Assets
- Signing key (issuer)
- Public keys (client embedded)
- License pack contents (non-secret)

## Threats & Mitigations
- **Key leak (server)**: rotate `kid`; revoke old keys; short `exp`.
- **Pack interception**: signed; no secrets; harmless.
- **Replay**: bounded by `exp`; per-device binding for paid.
- **Client tampering**: verify in process; protected by release signatures (later).
- **Phishing issuer**: device-code displays issuer domain; docs emphasize verification.

## Residual Risks
- Offline revocation delay between `exp` windows.
