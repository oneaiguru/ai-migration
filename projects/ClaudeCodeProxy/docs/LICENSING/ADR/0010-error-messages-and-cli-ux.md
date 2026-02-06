# ADR-0010: Error Messages & CLI UX

**Status**: Proposed
**Date**: 2025-10-23

## Decision
- Human-first errors: “License invalid (signature mismatch). See docs/LICENSING/TROUBLESHOOTING.md”
- CLI verbs:
  - `cc license login [--issuer URL] [--loopback]`
  - `cc license set <PACK>`
  - `cc license status`

## Rationale
- Reduces support churn; clear self-serve steps.

## Consequences
- Maintain a concise troubleshooting page.
