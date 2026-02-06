# ADR-0006: Local Issuer Architecture

**Status**: Proposed
**Date**: 2025-10-23

## Decision
- Single-process **Go** issuer with endpoints:
  - `POST /v1/license/issue`
  - `POST /v1/device/begin`
  - `POST /v1/device/poll`
- Persistence: JSON files (invites, device codes, issued packs) for MVP.
- Rate-limits + TTL for device codes.

## Rationale
- Fast to build, easy to run locally, portable to Cloud Run/App Runner later.

## Consequences
- Add a minimal admin CLI to mint invites and rotate keys.
