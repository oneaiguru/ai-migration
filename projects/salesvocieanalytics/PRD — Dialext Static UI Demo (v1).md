**Short answer:** Vite works, but for a zero‑guess, one‑click Vercel deploy with shadcn/ui, **Next.js 14 (App Router) + Tailwind + shadcn** is the most reliable path. We’ll export static pages (no backend) so screenshots match your PDFs/Slides UX (not pixel-perfect). 

Below is a **compact PRD + 6 ADRs + repo blueprint** that an agent can implement directly.

------

# PRD — Dialext Static UI Demo (v1)

**Purpose**
 Ship a static site that replicates the Dialext admin + reports UI for screenshots and stakeholder review. Non‑interactive; all data from local JSON.
 **Primary source:** “Dialext — интерфейсы.pdf” (pp.2–26) and PPTX.

**Success criteria**

- All screens reachable via top navigation.
- Content/labels match screenshots for: time stats, daily stats, email notifications, privacy, CRM pull, tasks, filters (mgrs/sources), company/rules/LLM/groups, reports (managers, lagging, trends), calls list/detail, Bitrix views. 
- Charts rendered with inline‑SVG; tables and badges mirror colors and columns; Russian locale.
- Deployed to Vercel from a single repo; no server functions.

**Non‑goals**
 Auth, real APIs, filtering logic, CSV export, accessibility audits beyond basics.

## Scope → Routes (PDF mapping)

- `/stats/time` (p.2), `/stats/days` (p.3) — filters + line/table. 
- `/admin/email-notify` (p.4), `/admin/privacy` (p.5), `/admin/crm-pull` (p.6), `/admin/crm-tasks` (p.7). 
- `/admin/filters` (p.8), `/admin/filters/managers` (p.9), `/admin/filters/sources` (p.10). 
- `/company` (p.12), `/rules` (p.13), `/llm-tags` (p.14), `/groups` (p.15). 
- `/reports/managers` (p.17), `/reports/calls/filter` (p.18), `/reports/calls/list` (p.19), `/reports/call/:id` (pp.20–21), `/reports/lagging` (p.22), `/reports/trends` (p.23). 
- `/bitrix/transcript` (p.25), `/bitrix/score` (p.26). 

## Data

All pages read from `/data/*.json` (hourly, daily, managers, tags, rules, groups, calls, trends, pipelines, filters). Seed values mirror tables/charts from the PDF (abbreviations stay as “размыто” where needed). 

## UX rules

- Russian labels exactly as on screenshots (“ПРИМЕНИТЬ”, “Сохранить”, etc.). 
- Traffic‑light score badges: Green ≥72, Yellow 40–71, Pink <40.
- Tabs, selects, checkboxes, textareas per screens; forms are read‑only placeholders. 
- Charts: inline‑SVG (no chart libs): line (p.2), stacked bars (p.17), bars (p.22), multi‑line trends (p.23). 

------

# ADRs (concise)

**ADR‑001 — Framework**

- **Decision:** Next.js 14 (App Router) + `output: 'export'` for static hosting on Vercel.
- **Why:** First‑class Vercel support; shadcn/ui integrates cleanly; file‑based routes; easy static export.
- **Alternative:** Vite + React Router is possible but adds routing/build wiring and fewer presets on Vercel.

**ADR‑002 — Styling & UI**

- **Decision:** Tailwind CSS + shadcn/ui (only needed components: Button, Input, Select, Checkbox, Textarea, Tabs, Card, Table, Badge, Slider, Switch, Label, Tooltip).
- **Why:** Minimal code footprint; consistent tokens; fast assembly.

**ADR‑003 — Charts**

- **Decision:** Inline‑SVG components per chart type.
- **Why:** Zero dependencies; exact control to mimic screenshots; smaller “minitu” token cost.

**ADR‑004 — Data**

- **Decision:** Local JSON under `/data` read at build time (no fetch).
- **Why:** Deterministic renders; no API scaffolding; reproducible screenshots.
- **Note:** Keep field names matching PRD tables for easy future API swap.

**ADR‑005 — Internationalization/Format**

- **Decision:** Hardcode `ru-RU` formatting for dates/numbers; keep UI strings in `/i18n/ru.json`.
- **Why:** Matches source assets; prevents formatting drift seen in screenshots. 

**ADR‑006 — Deployment & Screenshots**

- **Decision:** `next export` → `/out`; Vercel Project = “Other” (or Next auto‑detect), output dir `/out`.
- **Plus:** Include Playwright script to batch screenshot every route at 1440×900.

------

# Repo blueprint (agent‑ready)

```
dialext-ui/
├─ app/
│  ├─ layout.tsx
│  ├─ page.tsx                     # index with grid links to all screens
│  ├─ stats/time/page.tsx
│  ├─ stats/days/page.tsx
│  ├─ admin/email-notify/page.tsx
│  ├─ admin/privacy/page.tsx
│  ├─ admin/crm-pull/page.tsx
│  ├─ admin/crm-tasks/page.tsx
│  ├─ admin/filters/page.tsx
│  ├─ admin/filters/managers/page.tsx
│  ├─ admin/filters/sources/page.tsx
│  ├─ company/page.tsx
│  ├─ rules/page.tsx
│  ├─ llm-tags/page.tsx
│  ├─ groups/page.tsx
│  ├─ reports/managers/page.tsx
│  ├─ reports/calls/filter/page.tsx
│  ├─ reports/calls/list/page.tsx
│  ├─ reports/call/[id]/page.tsx
│  ├─ reports/lagging/page.tsx
│  ├─ reports/trends/page.tsx
│  ├─ bitrix/transcript/page.tsx
│  └─ bitrix/score/page.tsx
├─ components/
│  ├─ ui/...(shadcn components)
│  ├─ shell.tsx          # header/tabs/container
│  ├─ table.tsx          # generic table
│  ├─ badge.tsx          # status/score badges
│  ├─ svg-line.tsx       # charts: line
│  ├─ svg-bars.tsx       # charts: bars/stacked
│  └─ svg-multiline.tsx  # trends
├─ data/
│  ├─ stats-time.json
│  ├─ stats-days.json
│  ├─ managers.json
│  ├─ calls.json
│  ├─ call-<id>.json
│  ├─ rules.json
│  ├─ llm-tags.json
│  ├─ groups.json
│  ├─ pipelines.json
│  └─ filters.json
├─ styles/globals.css
├─ scripts/snap.mjs
├─ next.config.mjs
├─ tailwind.config.ts
├─ postcss.config.js
├─ vercel.json             # (optional) set output directory
└─ package.json
```

**Key files (minimal content):**

```
next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
  trailingSlash: true,
};
export default nextConfig;
app/layout.tsx
import './globals.css';
export const metadata = { title: 'Dialext UI Demo' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru"><body className="min-h-screen bg-white text-slate-900">
      <header className="border-b">
        <div className="mx-auto max-w-6xl px-6 py-4 font-semibold">Dialext — UI Demo</div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-6">{children}</main>
    </body></html>
  );
}
```

`app/stats/time/page.tsx` (pattern for all pages)

```tsx
import data from '@/data/stats-time.json';
export default function Page() {
  const { period, hourly, peak, minimum } = data;
  // inline SVG line path computed client-side or precomputed
  const points = hourly.map((h, i) => `${i*50},${100-(h.count/80000)*100}`).join(' ');
  return (
    <section className="space-y-4">
      <h1 className="text-xl font-semibold">Статистика по распределению обработки звонков по времени</h1>
      <div className="flex gap-3 items-end">
        <div>Воркспейс: <span className="inline-block border px-2 py-1">Любой ▼</span></div>
        <div>Дата от: <span className="inline-block border px-2 py-1">дд.мм.гггг</span></div>
        <div>Дата до: <span className="inline-block border px-2 py-1">дд.мм.гггг</span></div>
        <button className="bg-black text-white px-4 py-2">ПРИМЕНИТЬ</button>
      </div>
      <div className="border p-4">
        <div className="text-center mb-2">Количество звонков по времени</div>
        <svg viewBox="0 0 1200 120" className="w-full h-40">
          <polyline fill="none" stroke="currentColor" strokeWidth="2" points={points} />
        </svg>
        <div className="text-sm text-slate-600 mt-2">{peak.label} · {minimum.label}</div>
      </div>
    </section>
  );
}
scripts/snap.mjs
import { chromium } from 'playwright';
const routes = [
  '/', '/stats/time', '/stats/days', '/admin/email-notify',
  '/admin/privacy', '/admin/crm-pull', '/admin/crm-tasks', '/admin/filters',
  '/admin/filters/managers','/admin/filters/sources','/company','/rules',
  '/llm-tags','/groups','/reports/managers','/reports/calls/filter',
  '/reports/calls/list','/reports/call/1','/reports/lagging','/reports/trends',
  '/bitrix/transcript','/bitrix/score'
];
const b = await chromium.launch(); const p = await b.newPage({ viewport:{ width:1440, height:900 }});
await p.goto('http://localhost:3000/');
for (const r of routes){ await p.goto('http://localhost:3000'+r); await p.screenshot({ path:`shots${r.replace(/\//g,'_')}.png`, fullPage:true }); }
await b.close();
```

`package.json` (scripts only)

```json
{
  "name": "dialext-ui",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build && next export",
    "start": "serve out",
    "snap": "node scripts/snap.mjs"
  },
  "dependencies": {
    "next": "14.2.10",
    "react": "18.3.1",
    "react-dom": "18.3.1"
  },
  "devDependencies": { "playwright": "^1.47.0", "tailwindcss": "^3.4.10", "postcss": "^8.4.47", "autoprefixer": "^10.4.20", "serve": "^14.2.0" }
}
```

> Agents: replicate each page from the PDF into its route using the same pattern as `stats/time`. Tables and forms are plain JSX with Tailwind classes; charts via small SVG components. Colors/labels come from the *Design System & Tokens* section of your doc.

------

# Vercel deploy (static)

1. **Create project** from Git repo.
2. Framework preset: **Next.js**.
3. Build Command: `next build && next export`
4. Output dir: `out`
5. Deploy → every route should render statically.

------

## What to add to your doc for 100% one‑shot build

- **Tokens (hex + font + radii + spacing)** for badges, button, tabs; score thresholds you already set; keep Russian locale.
- **Exact table columns & alignment** (daily stats, calls list, managers) as in your plan.
- **Seed JSON** values for: hourly (24 points), 10 daily rows, managers + stacked counts, lagging metrics, trends series, 16 calls, call detail. (Map to PDF pp.2–3, 17, 19–23.) 
- **Canonical 8 criteria** (remove duplicate “Долженость и функционал”) used across rules/pages. 

------

## Answer to your stack question

**Yes, Vite is fine**, but **ADR‑001** picks Next.js for Vercel and shadcn/ui ergonomics. If you insist on Vite, swap routing to React Router and keep everything else (Tailwind + inline SVG + JSON data). The rest of the PRD/ADRs remain the same.

------

If you want, I can turn this into a ready repo skeleton (files + seed JSONs) in a single pass next.