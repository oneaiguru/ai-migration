# Deployment SOP

## Purpose
Publish the static prototype to Vercel and keep `granin.com` as the canonical origin.

## Prereqs
- Vercel CLI installed and logged in.
- Access to the `granins-projects` team on Vercel.

## Deploy steps
1) Update `/Users/m/ai/projects/ideat3chat/index.html` (copy from the source file if needed).
2) Deploy from the project root:
   - `cd /Users/m/ai/projects/ideat3chat`
   - `vercel --prod --yes`
3) Confirm production is healthy:
   - `curl -I https://granin.com`

## Domain setup
- Add domain to the project (CLI or Vercel UI):
  - `vercel domains add granin.com ideat3chat --scope granins-projects`
  - `vercel domains add www.granin.com ideat3chat --scope granins-projects`
- Set DNS at the registrar:
  - `A @ -> 76.76.21.21`
  - `CNAME www -> cname.vercel-dns.com` (or `A www -> 76.76.21.21` if CNAME is not allowed)
- Set `www` redirect to the apex in Vercel Domains:
  - `www.granin.com` -> `granin.com` (status code 308)

## Verification checklist
- `https://granin.com` loads the UI.
- `https://www.granin.com` redirects to `https://granin.com`.
- The UI matches the local render when checked in a browser or with Playwright.

## Notes
- LocalStorage is per-origin; the redirect keeps a single storage bucket.
- The `*.vercel.app` URL may be private due to team SSO settings.
