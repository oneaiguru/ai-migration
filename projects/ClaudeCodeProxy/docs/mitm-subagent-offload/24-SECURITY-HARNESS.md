* Store secrets in env only (`ZAI_API_KEY`).
* Add `.env.example`; never commit real keys.
* Minimal logs; redact paths if shared.
* Trust CA: export `NODE_EXTRA_CA_CERTS` or import cert into system trust store.

---