# ADR-0005: Telemetry & Privacy

**Status**: Proposed
**Date**: 2025-10-23

## Decision
- **No body logs** ever.
- Log only: `plan`, `features`, `exp`, `kid` (and whether license is valid), plus routing decisions.
- All license verification is local.

## Rationale
- Aligns with strict privacy posture.
- Simplifies legal review.

## Consequences
- Troubleshooting license issues relies on local logs; no phone-home.
