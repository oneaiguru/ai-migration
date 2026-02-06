# Prometheus with Cortex Solution

## Overview
This package provides a complete solution for setting up Prometheus with Cortex for scalable monitoring of a large number of hosts in an enterprise environment. The solution is ready to deploy and includes all necessary components, configurations, and documentation.

## Key Features
- Horizontal scaling - monitor thousands of servers
- Long-term storage of metrics - data is available for months
- High availability - no single point of failure
- Optimized queries - fast access to data even at high volumes
- Full automation - easy addition of new servers

## Directory Structure
```
prometheus-cortex/
├── config/                           # Configuration files
├── scripts/                          # Scripts for installation and management
├── kubernetes/                       # Kubernetes manifests
├── dashboards/                       # Grafana dashboards
├── docs/                             # Documentation
└── data/                             # Directory for data (created during installation)
```

## Quick Start
1. Run the setup script to install the system:
   ```
   cd scripts
   ./setup_monitoring.sh
   ```

2. Install Node Exporter on target hosts:
   ```
   ./install_node_exporter.sh <hostname>
   ```

3. Add hosts to monitoring:
   ```
   ./add_hosts.sh <hostname1> <hostname2> ...
   ```

4. Access Grafana at http://server-ip:3000 (login: admin, password: admin)

## Documentation
For detailed information, see the documentation in the `docs/` directory:
- Technical documentation
- Installation guide
- BDD specifications
- Acceptance criteria
- Traceability matrix

## Deployment Options
- Docker Compose: The provided `docker-compose.yml` starts Grafana + Alertmanager for quick UI/alert testing; extend it with Prometheus/Cortex services as needed for a full stack.
- Kubernetes: For a complete deployment, use the manifests in the `kubernetes/` directory (includes Cortex, Prometheus, Grafana, Alertmanager, storage).

## Repository Notes (sanitized import)
- Secrets, TLS materials, and environment-specific scripts were intentionally excluded; generate new values under `secrets/` with `scripts/generate_secrets.sh` and certificates with `scripts/generate_certs.sh`.
- Grafana domains are placeholder (`grafana.example.com`); change to your hostnames before deploy.
- The `dashboards/` directory is empty as a placeholder; add your dashboards there.
- Alertmanager points to file-based secrets; supply matching Docker/Compose secrets or environment before enabling notifications.
