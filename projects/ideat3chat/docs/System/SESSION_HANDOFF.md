# Session Handoff - 2026-01-20

## Summary
- Deployed the static HTML prototype to Vercel under the `granins-projects` team as project `ideat3chat`.
- Production is served from `https://granin.com` with `www.granin.com` set to redirect (308) to the apex domain.
- Local and production renders matched in Playwright (screenshot hash + DOM metrics).

## Deploy state
- Project root: `/Users/m/ai/projects/ideat3chat`
- Source file copied from: `/Users/m/Desktop/index.html` (no functional changes)
- Deploy command used: `vercel --prod --yes`
- Vercel project: `ideat3chat` (team: `granins-projects`)
- Public URL: `https://granin.com`
- `*.vercel.app` URL is private due to Vercel SSO settings; custom domains are public.

## DNS notes
- Apex record: `A @ -> 76.76.21.21`
- `www` record: `CNAME www -> cname.vercel-dns.com` (preferred) or `A www -> 76.76.21.21` if CNAME is not supported.
- Remove any conflicting `A/AAAA/CNAME` for `@` or `www` to avoid split routing.

## LocalStorage behavior
- Storage is per-origin. Keeping `www` redirected to the apex ensures a single origin for stored ideas.

## Verification
- `curl -I https://granin.com` returns HTTP 200.
- `curl -I https://www.granin.com` returns HTTP 308 redirect to apex.
- Playwright parity check (local `http://localhost:8000` vs `https://granin.com`) matched.

## Next time
- Update `/Users/m/ai/projects/ideat3chat/index.html` and re-run `vercel --prod --yes`.
- Re-check DNS and redirect if `www` record changes.
- Optional: run a Playwright screenshot parity check after deploy.
