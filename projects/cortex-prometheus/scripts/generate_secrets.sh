#!/bin/bash
# Script to generate Docker secrets for Prometheus with Cortex monitoring
# Usage: ./generate_secrets.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SECRETS_DIR="${SCRIPT_DIR}/../secrets"

# Color output for better readability
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}[INFO]${NC} Generating Docker secrets for the monitoring stack"

# Create the secrets directory if it doesn't exist
if [ ! -d "${SECRETS_DIR}" ]; then
    mkdir -p "${SECRETS_DIR}"
    echo -e "${GREEN}[SUCCESS]${NC} Created secrets directory at ${SECRETS_DIR}"
fi

# Function to generate or update a secret
generate_secret() {
    local secret_name=$1
    local default_value=$2
    local secret_file="${SECRETS_DIR}/${secret_name}.txt"

    if [ -f "${secret_file}" ]; then
        echo -e "${YELLOW}[WARNING]${NC} Secret ${secret_name} already exists. Overwrite? (y/n)"
        read -r overwrite
        if [ "${overwrite}" != "y" ]; then
            echo -e "${BLUE}[INFO]${NC} Keeping existing secret ${secret_name}"
            return
        fi
    fi

    echo -e "${BLUE}[INFO]${NC} Creating secret ${secret_name}..."
    echo -n "Enter value for ${secret_name} [${default_value}]: "
    read -r value
    
    if [ -z "${value}" ]; then
        value="${default_value}"
    fi

    echo -n "${value}" > "${secret_file}"
    chmod 600 "${secret_file}"
    echo -e "${GREEN}[SUCCESS]${NC} Secret ${secret_name} created"
}

# Generate secrets for Grafana
generate_secret "grafana_admin_user" "admin"
generate_secret "grafana_admin_password" "admin"

# Generate secrets for Cortex
generate_secret "cortex_user" "admin"
generate_secret "cortex_password" "admin"

# Generate secrets for MinIO
generate_secret "minio_access_key" "minioadmin"
generate_secret "minio_secret_key" "minioadmin"

# Generate secrets for AlertManager
generate_secret "smtp_user" "alertmanager"
generate_secret "smtp_password" "password"
generate_secret "pagerduty_service_key" "your_pagerduty_service_key"
generate_secret "telegram_bot_token" "your_telegram_bot_token"
generate_secret "slack_api_url" "your_slack_webhook_url"

# Update file permissions for all secrets
chmod -R 600 "${SECRETS_DIR}"/*.txt

echo -e "${GREEN}[SUCCESS]${NC} Docker secrets generated successfully"
echo -e "${YELLOW}[WARNING]${NC} Keep these secrets safe and do not commit them to version control"
echo -e "${BLUE}[INFO]${NC} Secrets are stored in ${SECRETS_DIR}"
