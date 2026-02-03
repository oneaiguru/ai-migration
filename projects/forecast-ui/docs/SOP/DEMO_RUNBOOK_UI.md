# Demo Runbook — UI (Vercel)

Use this to reliably point the UI at a fresh backend BASE and verify the demo.

## Prereqs
- Vercel CLI logged in to the project
- Backend BASE (quick tunnel) from the BE runbook

## Set BASE and Deploy
```bash
# Replace <BASE> with the fresh Cloudflare tunnel URL
scripts/dev/ui_deploy_with_base.sh <BASE>
```
This sets `VITE_API_URL` (Production), redeploys, and aliases `mytko-forecast-ui.vercel.app`.

## Verify UI (PR smokes, serial)
```bash
scripts/dev/ui_verify.sh https://mytko-forecast-ui.vercel.app
```

## Troubleshooting
- If the app shows “Failed to fetch”, hard reload or open incognito. Confirm DevTools → Network → Request URL starts with `<BASE>/api/...`.
- If requests are hitting `/api/...` on the UI host, re‑deploy with the correct `VITE_API_URL`.
- If direct `curl <BASE>/api/metrics` fails from your network, the tunnel is blocked; ask BE for a new BASE or a named tunnel.
