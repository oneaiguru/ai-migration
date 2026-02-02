# Tech Stack Cost & Licensing Decisions (Oct 07 2025)

## Current Posture
- **Budget now:** $0 – continue Phase 5/6 work on the existing free stack.
- **Design tokens:** handled in-code (see ADRs 0001–0004); no Figma sync required yet.
- **Trigger-based spend:** only purchase when a concrete feature requires a paid tier (details below).

## Free Defaults In Use
- UI primitives & wrappers: Radix Primitives (core), TanStack Table/Virtual, dnd-kit, React Hook Form + Zod, Tremor, Recharts, MiniSearch.
- Tooling: Playwright, axe-core, Turborepo Remote Cache (Vercel).
- Data/excel: SheetJS Community Edition (Apache-2.0).

## When To Pay (Copy into handoffs/PRDs as needed)
| Trigger | Decision | Cost (USD) | Notes |
| --- | --- | --- | --- |
| Schedule demo needs resource timeline | **Buy** FullCalendar Premium | $480 (one-time per company) | Required for timeline/resource views. Alternative: Syncfusion Scheduler Community License (free if < $1M revenue, ≤5 devs, ≤10 employees, < $3M funding). |
| Schedule demo but Syncfusion eligibility met | Use Syncfusion Scheduler | $0 | Community license covers commercial use within eligibility limits; upgrade only if limits exceeded. |
| Reports need pivot tables / Excel export | **Upgrade grid** to AG Grid Enterprise | From $999 per developer | Only if TanStack Table cannot cover analytics requirements. |
| Visual regression suite exceeds 5k snapshots/mo | Chromatic Starter plan | $179/month | Free tier (5k) likely enough short-term; consider Percy 5k free screenshots as alternative. |
| Excel export needs advanced styling (images, charts, formulas) | SheetJS Pro | Contact sales | Stay on CE unless Pro-only features are required. |

## Nice-To-Have Alternatives
- **MUI X Pro/Premium:** $180–$588 per developer per year (only relevant if we ever replace the current component stack with MUI).
- **DayPilot Pro Scheduler:** $649 single dev license (alternative to FullCalendar if needed later).
- **Chromatic vs Percy:** both offer 5k free captures; choose based on workflow.
- **Vaul drawer:** *Do not adopt.* The library is unmaintained; compose sheets with Radix `Dialog` instead.

## References
- FullCalendar pricing: https://fullcalendar.io/pricing
- Syncfusion Community License: https://www.syncfusion.com/products/communitylicense
- AG Grid pricing: https://www.ag-grid.com/license-pricing
- Chromatic pricing: https://www.chromatic.com/pricing
- Percy plans: https://www.browserstack.com/docs/percy/overview/plans-and-billing
- SheetJS license matrix: https://docs.sheetjs.com/docs/miscellany/license
- Turborepo remote cache (free): https://vercel.com/changelog/free-vercel-remote-cache

## Maintenance
- Update this document when vendor pricing changes or new paid triggers arise.
- Cross-link from PRDs/hand-offs whenever budget discussions occur so stakeholders see the approved thresholds.
