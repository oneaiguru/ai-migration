# Schedule Grid System – Mock Demo

This repository is a standalone, mock-driven build of the Schedule Grid System UI that was previously tied to real backend services. It ships with rich mock data so the full experience works out of the box and is ready to deploy to Vercel (or any static host).

## Features
- React 18 + TypeScript + Vite
- Tailwind 3 styling (no blank screens when CSS fails)
- Drag-and-drop schedule grid, shift templates, calendar, time-off, forecasting and optimization dashboards
- All data served locally from TypeScript mocks – no backend, auth, or environment variables required

## Getting Started
```bash
npm install
npm run dev
```
Open http://localhost:5173 (or the port Vite prints). To preview the production build locally:
```bash
npm run build
npm run preview
```

## Deploying to Vercel
1. Push this folder to a git repo (ensure `.gitignore` keeps `node_modules` out).
2. In Vercel, import the repo.
3. Build command: `npm run build`
4. Output directory: `dist`
5. Install command: `npm install`

The mock data lives in `src/data/mockData.ts`; you can adjust or extend it without touching the components.

## Mounting Inside a Unified Shell
The demo now exports a mountable root component so it can run under a shared router (for example, `/schedule`).

```ts
import { Root as ScheduleRoot, setupRU as setupScheduleRU } from 'schedule-grid-system-mock';

setupScheduleRU();

// inside your shell route
<ScheduleRoot basename="/schedule" />;
```

- Call `setupScheduleRU()` once during shell boot so Chart.js adapters and locale helpers register against the Russian locale.
- The optional `basename` prop is surfaced as a document data attribute (`data-schedule-basename`) so hosts can resolve links when the package is mounted beneath nested routes.
- Styles are bundled automatically through the component import; no extra CSS wiring is required in the host shell.

## Scripts
- `npm run dev` – start Vite dev server
- `npm run build` – production bundle
- `npm run preview` – serve the bundle from `dist`
- `npm test` – (placeholder) add your own testing stack

## File Structure
```
src/
  components/        # UI building blocks
  modules/           # Feature dashboards
  services/          # Mock service layer returning local data
  data/mockData.ts   # Centralized mock fixtures
  index.css          # Tailwind entry point
```

## Notes
- The app uses Playwright only for local smoke checks; remove the dependency if you do not need it.
- Tailwind v3 is configured via `tailwind.config.js` and `postcss.config.js`.
- `dist/` is generated during `npm run build` and ignored by git.

Happy scheduling!
