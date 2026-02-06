# ADR-0012 — Engine Abstraction (Python + CLI + Fallback STT)

**Status:** Proposed (2025-11-12)  
**Owners:** Codex (BE)  
**References:** DR report lines 5-13; demo script backup note (“fallback STT”)

## Context
- Today the API imports faster-whisper directly. Some clients want CLI compatibility; others require routing edge cases to a paid STT provider.

## Decision
- Introduce an `Engine` interface with implementations:
  1. **PythonEngine** (default): uses faster-whisper library with GPU/CPU selection.
  2. **CLIEngine**: shells out to `faster-whisper` CLI for environments where Python deps are constrained.
  3. **FallbackEngine**: optional adapter for external STT APIs (Yandex, Soniox) triggered by policy.
- Workers choose the implementation per job based on configuration or heuristics (e.g., extreme duration, poor audio quality).

## Consequences
- Easier to swap models/versions.
- Enables staged migrations and hybrid deployments without duplicating pipeline code.
- Requires more thorough integration tests across engines but reduces vendor lock-in.
