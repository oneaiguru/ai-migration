# AGENTS

## Summary
- Static Voice Analytics UI prototype built with Next.js 14 + Tailwind lives in `dialext-ui/`; pages cover stats, admin, reports, Bitrix flows using mock JSON data under `dialext-ui/data/`.
- Root docs include the product brief and plans (`PRD - Dialext Static UI Demo (v1).md`, `COMPLETE_IMPLEMENTATION_PLAN.md`, `APPENDIX_ZERO_AMBIGUITY_IMPLEMENTATION.md`, etc.) that describe the intended flows and UI scope.
- Next config exports a static build (`output: 'export'`) and ships local Geist fonts for offline runs.

## Installation & Run
1. `cd projects/salesvocieanalytics/dialext-ui`
2. Install deps: `npm install` (Node 18+ recommended for Next 14).
3. Dev server: `npm run dev` then open http://localhost:3000.
4. Static export: `npm run build` -> `out/`; serve with `npm run start` (uses `serve out`).
5. Optional screenshots: with the dev server running, `npm run snap` (Playwright) captures PNGs into `shots/`.

## Tests
- No automated tests are provided; `npm run lint` is available for quick checks.

## Dependencies
- App: Next.js, React 18, Tailwind CSS + tailwindcss-animate, Radix UI (checkbox/select/tabs), lucide-react, class-variance-authority, clsx.
- Dev: TypeScript, ESLint (Next config), PostCSS, Playwright, serve.

Monorepo note: /Users/m/ai is a multi-project monorepo. See the root README for details.
