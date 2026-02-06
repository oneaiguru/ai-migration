# Local Secrets (example)

Copy this file to `SECRETS.local.md` (gitignored) and fill with real values. Keep the real file local only; do not commit or share in PRs.

## SSH Access
- HOST: pve.atocomm.eu
- PORT: 2323
- USER: roman
- PASSWORD: <ssh_password>

## Salesforce Production Org
- LOGIN_URL: https://customer-inspiration-2543.my.salesforce.com
- USERNAME: <sf_username>
- PASSWORD: <sf_password>
- SECURITY_TOKEN: <sf_security_token_if_required>

## QuickBooks Production App
- CLIENT_ID: <qb_client_id>
- CLIENT_SECRET: <qb_client_secret>

## Middleware API
- API_KEY: <api_key_used_in_requests>
- BASE_URL: https://sqint.atocomm.eu

## Notes
- Mirror API_KEY and other runtime values into `.env` on the server.
- Rotate credentials if any secret was ever committed; document rotations in ops notes.
