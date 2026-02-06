# ADR 0004 – Theme Token Strategy for Wrapper Migration

**Status:** Accepted  
**Date:** 2025-10-07  
**Related Docs:** `docs/Tasks/phase-6-migration-planning-prd.md`, `ai-docs/QUESTIONS.md`, `docs/System/tech-stack-decisions.md`

## Context
- Phase 6 introduces shared wrappers (Radix dialog/popover, TanStack table, RHF forms) that will ship across multiple parity modules.
- Design feedback may arrive late or vary per customer. We need an override-friendly token layer so we can restyle without rewriting wrappers or wiring external design tools (Figma tokens, etc.).
- Existing styles live inside Tailwind classes / component CSS with hard-coded values, making client-specific theming expensive.

## Decision
- Define a code-first token map under `src/theme/` (`baseThemeTokens`, `createTheme`, `applyTheme`, `themeVar`) and surface CSS variables via `src/styles/tokens.css`.
- Expose every token as a CSS custom property with the prefix `--em-*` to support both CSS usage and runtime overrides.
- Keep the default palette aligned with current parity styling; allow per-client variations by merging overrides via `createTheme(overrides)` and `applyTheme`.
- Defer any external design-token sync (Figma/etc.) until a real design system demands it; the code-first map satisfies near-term customization needs.

## Consequences
- **Pros:**
  - Wrappers consume `themeVar()` helpers/CSS variables, so swapping palettes or typography requires updates in one place.
  - Supports incremental adoption: existing Tailwind utility classes can be replaced gradually with `var(--em-…)` usage.
  - No dependency on paid tooling or external token services during Phase 6.
- **Cons:**
  - Requires manual coordination with design if/when external token sources appear (future ADR can revisit syncing strategy).
  - Agents must learn the token naming scheme (`colors.primary`, `spacing.md`, etc.) before migrating components.

## Follow-up Actions
1. Update documentation (PRD, TODO, handoff) to point at the new `src/theme/` entry point and remove the “design tokens” open question.
2. During Stage 0, refactor wrapper drafts to consume `themeVar()` instead of literal hex/spacing values.
3. If product later mandates Figma/Design Tokens API integration, draft a new ADR evaluating tooling and migration path.

## Status History
- **2025-10-07:** Accepted – tokens module created; design-token question in `ai-docs/QUESTIONS.md` marked resolved.
