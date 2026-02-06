#!/bin/bash
# Script to securely update secrets for the monitoring stack

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SECRETS_DIR="${SCRIPT_DIR}/../secrets"

# Color output for better readability
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}[INFO]${NC} Securely updating monitoring stack secrets"

# Create the secrets directory if it doesn't exist
if [ ! -d "${SECRETS_DIR}" ]; then
    mkdir -p "${SECRETS_DIR}"
    echo -e "${GREEN}[SUCCESS]${NC} Created secrets directory at ${SECRETS_DIR}"
fi

# Function to generate a random secure password
generate_secure_password() {
    # Generate a random password with 16 characters
    openssl rand -base64 12 | tr -d '/+=' | head -c 16
}

# Function to update a secret
update_secret() {
    local secret_name=$1
    local prompt_text=${2:-"Enter value for $secret_name"}
    local default_random=${3:-false}
    local secret_file="${SECRETS_DIR}/${secret_name}.txt"

    if [ -f "${secret_file}" ]; then
        current_value=$(cat "${secret_file}")
        echo -e "${YELLOW}[WARNING]${NC} Secret $secret_name already exists with value: ${current_value:0:1}*****"
        read -p "Do you want to update it? (y/n): " update_choice

        if [[ "$update_choice" != "y" ]]; then
            echo -e "${BLUE}[INFO]${NC} Keeping existing secret $secret_name"
            return
        fi
    fi

    if [[ "$default_random" == "true" ]]; then
        random_password=$(generate_secure_password)
        read -p "$prompt_text [Press Enter to use randomly generated secure password]: " user_input

        if [ -z "$user_input" ]; then
            user_input="$random_password"
            echo -e "${GREEN}[SUCCESS]${NC} Using generated password: ${user_input:0:1}*****"
        fi
    else
        read -p "$prompt_text: " user_input
    fi

    echo -n "$user_input" > "$secret_file"
    chmod 600 "$secret_file"
    echo -e "${GREEN}[SUCCESS]${NC} Secret $secret_name updated"
}

# Update all secrets
echo -e "\n${BLUE}[INFO]${NC} Updating Grafana credentials"
update_secret "grafana_admin_user" "Enter Grafana admin username [admin]" false
update_secret "grafana_admin_password" "Enter Grafana admin password" true

echo -e "\n${BLUE}[INFO]${NC} Updating Cortex credentials"
update_secret "cortex_user" "Enter Cortex username [admin]" false
update_secret "cortex_password" "Enter Cortex password" true

echo -e "\n${BLUE}[INFO]${NC} Updating MinIO credentials"
update_secret "minio_access_key" "Enter MinIO access key [minimum 5 characters]" false
update_secret "minio_secret_key" "Enter MinIO secret key" true

echo -e "\n${BLUE}[INFO]${NC} Updating AlertManager notification channel credentials"
update_secret "smtp_user" "Enter SMTP username for email alerts" false
update_secret "smtp_password" "Enter SMTP password" false
update_secret "pagerduty_service_key" "Enter PagerDuty service key (leave empty if not used)" false
update_secret "telegram_bot_token" "Enter Telegram bot token (leave empty if not used)" false
update_secret "slack_api_url" "Enter Slack API URL (leave empty if not used)" false

# Ensure proper permissions
chmod -R 600 "${SECRETS_DIR}"/*.txt

echo -e "\n${GREEN}[SUCCESS]${NC} All secrets updated successfully"
echo -e "${YELLOW}[WARNING]${NC} Keep these secrets safe and never commit them to version control"
echo -e "${BLUE}[TIP]${NC} After updating secrets, restart the stack with: docker-compose restart"
