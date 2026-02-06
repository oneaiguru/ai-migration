# Cortex-Prometheus Migration Notes

Scope:
- Imported code, configs, manifests, and docs needed to stand up the monitoring stack.
- Excluded: secrets, certificates, environment-specific runbooks and IP/domain references, ad-hoc VM scripts.

What to prepare:
- Generate secrets: `./scripts/generate_secrets.sh` (writes to `secrets/`).
- Generate TLS: `./scripts/generate_certs.sh` (writes to `certs/`).
- Update domains: replace `grafana.example.com` (and any other hostnames you need) in `docker-compose.yml`/NGINX if applicable.
- Provide Alertmanager destinations: fill SMTP/Slack/PagerDuty/Telegram secrets to match `config/alertmanager/alertmanager.yml`.

Quick validation:
- Make scripts executable: `./make_scripts_executable.sh`
- Run config checks: `./scripts/validate_config.sh`
- Optional smoke: `docker compose config` then `docker compose up -d` (starts Grafana + Alertmanager only; extend if you want Prometheus/Cortex in Compose).
- For full stack, prefer the Kubernetes manifests under `kubernetes/` (includes Cortex/Prometheus/Grafana/Alertmanager).
