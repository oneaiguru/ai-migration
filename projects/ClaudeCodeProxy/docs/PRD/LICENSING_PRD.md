# docs/PRD/LICENSING_PRD.md

Scope (Rβ: local dev)
- Activation via license pack (Ed25519-signed JSON).
- Two flows: device-code and loopback OAuth to local issuer.
- No external billing integration in this phase (MoR under evaluation separately).

User stories
- As an operator, I paste a license pack or run `cc license login` and the Z.AI lane is enabled without restarting the shim.
- As a reviewer, I can inspect plan/features/exp via `cc license status` without contacting the server.

Functional requirements
- Shim: `--license-pack` flag and `CC_LICENSE_PACK` env; watch `~/.config/ccp/license.pack` for changes and re-verify.
- CLI: `cc license set <PACK>`, `cc license login [--loopback]`, `cc license status`.
- Issuer: `/v1/device/begin` and `/v1/device/poll` endpoints; JSON persistence of device state; in-memory rate limit.

Non-functional
- Packs verifiable fully offline; public keys baked into the binary (multiple allowed).
- No body logs; logs include `decision:"license_block"` when Haiku is downgraded.

Acceptance
- Start issuer; run `cc license login`; shim logs `features:["zai_offload"]`; Haiku routes to Z.AI; `make repro-go-quick` passes with clean hygiene.
