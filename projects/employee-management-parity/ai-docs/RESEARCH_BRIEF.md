# Phase 6 Migration – Research Brief

Use this brief to validate the external assumptions called out in ADR 0004 and the updated Phase 6 PRD. Capture answers and source links back in `migration-prep/QUESTIONS.md`.

## A. Libraries & Versions
1. **Radix Dialog/Popover guidance** – confirm latest accessibility recommendations (focus return, `aria-describedby`, labelling patterns).
   - ✔ 2025-10-07: Radix dialog docs state Escape returns focus to `Dialog.Trigger`, first focusable receives focus, and title/description must be wired via `aria-labelledby`/`aria-describedby` (`migration-prep/reference/docs/radix/dialog.md:1724-1736`, `radix/accessibility.md:545-552`).
2. **TanStack Table + Virtual** – document the official virtualization guidance, including sticky header support and recommended row counts.
   - ✔ 2025-10-07: Virtualization guide confirms Table ships without virtualization and should be paired with TanStack Virtual (examples for fixed/dynamic row height, sticky headers, infinite scroll) before handling 10k+ rows (`migration-prep/reference/docs/tanstack-table/virtualization.md:2795-2788`).
3. **Vaul maintenance status** – verify current status and alternatives; ensure Radix sheet composition remains the preferred approach.
   - ✔ 2025-10-07: Vaul README notes the repo is unmaintained; stick with Radix dialog-as-sheet (`migration-prep/third_party/vaul/README.md:1-3`).
4. **shadcn/ui + Tailwind v4** – record current upgrade notes; confirm Tailwind v3 support status before scheduling adoption.
   - ⏳ Needs follow-up – latest shadcn docs target Tailwind v4/React 19; capture upgrade steps before planning Stage 4 (source: https://ui.shadcn.com/docs/tailwind-v4).

## B. Design Tokens & Tooling
5. **DTCG Format Module** – capture schema highlights (`$value`, `$type`, references) and note the technical report URL.
   - ✔ 2025-10-07: DTCG format module (https://www.designtokens.org/format/) defines core keys `$value`, `$type`, `$description`, plus aliasing via `{group.token}` references.
6. **Style Dictionary v4** – confirm support for DTCG JSON as an input source and list relevant transforms/output formats.
   - ✔ 2025-10-07: Style Dictionary v4 accepts DTCG input and ships `@design-tokens/transform` to emit CSS/JS/Android/iOS outputs (https://styledictionary.com/docs/format/).
7. **Tokens Studio ↔ GitHub sync** – outline requirements for enabling remote sync (auth scopes, branch strategy) for future automation.
   - ✔ 2025-10-07: Tokens Studio GitHub sync requires a repo token with `repo` scope, mapping to a branch/file path, supports two-way JSON sync (https://docs.tokens.studio/token-storage/remote/sync-git-github).
8. **Figma Variables primer** – summarise how variables relate to design tokens for stakeholder communication (no immediate action).
   - ⏳ Outline once design engagement begins (reference: https://help.figma.com/hc/en-us/articles/18490793776023). Current work relies on code-first tokens.

## C. Accessibility
9. **Radix accessibility checklists** – extract dialog/popover checklists into `migration-prep/ACCESSIBILITY_CHECKLIST.md` (focus trap, Esc, announcements).
   - ✔ 2025-10-07: Checklist updated; dialog/sheet rows marked ✅ after Playwright + manual sweep. Popover integration pending Stage 1.
10. **Virtualized table accessibility** – gather patterns for keyboard focus and screen-reader support when rows mount/unmount.
    - ⏳ Document roving tabindex guidance during Stage 3 (see TanStack virtualized rows example: https://tanstack.com/table/latest/docs/framework/react/examples/virtualized-rows).

## D. Performance & Ops
11. **TanStack Virtual performance tips** – note configuration guidance for large lists (10 k+ rows, dynamic sizing, sticky headers).
    - ✔ 2025-10-07: TanStack Virtual docs recommend `estimateSize`, `overscan`, and sticky header composition for 10k+ rows; use virtualization examples as baseline (https://tanstack.com/virtual/latest/docs/framework/react/examples/virtualized-rows).
12. **Bundle budgeting with Vite** – collect examples of build-size budgets and reporting commands for CI enforcement.
    - ✔ 2025-10-07: Vite `build.chunkSizeWarningLimit` and `vite build --mode analyze` provide bundle metrics; current baseline 1.51 MB (gzip 432 KB). Use CI report to enforce ≤250 KB initial JS.
13. **Feature flag patterns** – document options for build-time/env toggles in Vite (e.g., `import.meta.env`) vs runtime solutions.
    - ✔ 2025-10-07: Use `import.meta.env.VITE_*` build-time flags combined with branch-based rollout per ADR 0003; runtime toggles not required for static Vite build.
14. **Playwright selector guidance** – reaffirm best practice of `data-testid` usage and avoiding brittle text selectors.
    - ✔ 2025-10-07: Playwright docs recommend `getByTestId` for resilient selectors; wrappers expose stable ids (https://playwright.dev/docs/test-assertions#locators).

Log progress in `migration-prep/QUESTIONS.md` and surface blockers in `docs/SESSION_HANDOFF.md`.
