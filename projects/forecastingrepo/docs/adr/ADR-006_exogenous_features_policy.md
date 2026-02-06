# Architectural Decision Record — ADR-006: Exogenous Features Policy

**Status:** Accepted
**Date:** 2025‑11‑02

## Context
We will add weather, events, real estate, and other sources over time.

## Decision
- Each source is a **plugin** with: adapter → features → join → QA.
- **No leakage**: features for date t use data ≤ t.
- Disabled by default; **enabled via scenario flag**.
- All joins document mapping (district/station), NA policies, and fallbacks.

## Consequences
- Safe, auditable addition/removal of sources.
- Clear lines for agents to extend features.

## Implementation Notes
- Weather plugin is first; see `scenarios/weather_only.yml` for flags.