# Stage 6 Agent Note – Manual UAT Only

A previous agent generated remote Playwright test scaffolding (`playwright.remote.config.ts`) while network access was blocked. That file has been removed. When you perform Stage 6 UAT:

- Do not recreate remote Playwright configs or run Playwright against production builds.
- Follow `docs/SOP/ai-uat-browser-agent.md` and use the manual checklist instead.
