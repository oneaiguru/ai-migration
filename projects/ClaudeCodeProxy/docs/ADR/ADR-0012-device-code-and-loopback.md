# docs/ADR/ADR-0012-device-code-and-loopback.md

Status: Accepted
Date: 2025-10-23 10:44 UTC

Decision
Provide two activation paths in the CLI:
1) Loopback OAuth: opens browser; localhost listener captures redirect automatically.
2) Device-code (RFC 8628): prints code+URL; polls issuer until authorized.

Rationale
- Covers desktop and headless/SSH.
- Resilient to browser environment quirks; straightforward to test locally.

Consequences
- CLI commands: `cc license login --loopback` and `cc license login` (device-code).
- Issuer endpoints: `/v1/device/begin` and `/v1/device/poll` (already prototyped).
- Security: short-lived poll tokens; CSRF not applicable; packs contain no secrets.

Migration
- None (new). Add docs with diagrams and failure-mode table.
