# Security & Threat Model (v0)

## Trust Model
- Client only trusts embedded pubkeys; verifies pack signature locally.
- Packs contain no secrets; provider keys live in env.

## Threats & Mitigations
- Replay → TTL/exp; optional device binding (hostname hash) for paid plans.
- Key rotation → support `kid`; ship small key set; rotate by release.
- MITM on fetch → signed content; cache last-known-good.
- Data minimization → no body logs; log only plan/features/exp/kid.

## Ops Controls
- Feature flags; `/readyz` and logs show license state without sensitive content.
