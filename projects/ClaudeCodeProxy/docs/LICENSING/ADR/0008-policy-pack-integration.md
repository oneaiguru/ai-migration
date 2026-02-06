# ADR-0008: Policy Pack vs License Pack

**Status**: Proposed
**Date**: 2025-10-23

## Decision
- **Separate concerns**: Policy pack controls routing rules; License pack controls **feature gates**.
- Policy may **suggest** routes; license decides if premium lanes are enabled.

## Rationale
- Security: policy can be public; license is user-specific.
- Operational flexibility.

## Consequences
- `/readyz` must reflect both: provider reachability and license gating reasons.
