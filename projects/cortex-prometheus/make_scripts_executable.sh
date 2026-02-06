#!/bin/bash
# Make all scripts executable at once

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Color output
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}[INFO]${NC} Making all scripts executable..."

chmod +x "${SCRIPT_DIR}/scripts/add_hosts.sh"
chmod +x "${SCRIPT_DIR}/scripts/add_linux_hosts.sh"
chmod +x "${SCRIPT_DIR}/scripts/add_windows_hosts.sh"
chmod +x "${SCRIPT_DIR}/scripts/create_htpasswd.sh"
chmod +x "${SCRIPT_DIR}/scripts/generate_certs.sh"
chmod +x "${SCRIPT_DIR}/scripts/generate_secrets.sh"
chmod +x "${SCRIPT_DIR}/scripts/install_node_exporter.sh"
chmod +x "${SCRIPT_DIR}/scripts/setup_monitoring.sh"
chmod +x "${SCRIPT_DIR}/scripts/update_secrets.sh"
chmod +x "${SCRIPT_DIR}/scripts/validate_config.sh"
chmod +x "${SCRIPT_DIR}/scripts/verify_deployment.sh"

echo -e "${GREEN}[SUCCESS]${NC} All scripts are now executable"
echo -e "${YELLOW}[TIP]${NC} Run the setup in the following order:"
echo -e "1. ${BLUE}./scripts/generate_certs.sh${NC} - Generate TLS certificates"
echo -e "2. ${BLUE}./scripts/update_secrets.sh${NC} - Update secrets securely"
echo -e "3. ${BLUE}./scripts/setup_monitoring.sh${NC} - Deploy the monitoring stack"
