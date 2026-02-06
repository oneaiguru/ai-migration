# Architectural Decision Record — ADR-001: Scenarios & Plugins

**Status:** Accepted
**Date:** 2025‑11‑02
**Owners:** Core engineering

## Context
We need a safe, repeatable way to add/remove exogenous data (weather, events, real estate, etc.) without breaking the current forecasts. We also need reproducible configurations to share between agents.

## Decision
- Forecast runs are driven by **scenario YAMLs** (`scenarios/*.yml`).
- Exogenous sources are **plugins** (`src/plugins/<name>/`) with a manifest and stable API.
- Default scenario **reproduces Phase‑1 outputs exactly** (no sources enabled).
- Feature flags control activation; disabled plugins **must not** change outputs.

## Consequences
- Pluggable growth path; easy to toggle sources on/off.
- Scenario files become the single switch for behavior changes.
- CI can enforce a **golden baseline** for the default scenario.

## Implementation Notes
- Scenario Manager: `src/scenarios/manager.py` (load, overrides, is_enabled).
- Plugin Loader: `src/plugins/loader.py` (discover manifests, load meta).
- Weather plugin as first example (stubs present).

## Alternatives Considered
- Hardwired data joins (rejected: brittle).
- Single monolith config (rejected: hard to toggle features).

## References
- See `specs/scenarios/SCENARIO_SPEC.md` and `specs/source-plugins/PLUGIN_CONTRACT.md`.