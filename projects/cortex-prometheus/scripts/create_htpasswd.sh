#!/bin/bash
# Script to generate .htpasswd file for NGINX basic authentication
# Usage: ./create_htpasswd.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NGINX_CONF_DIR="${SCRIPT_DIR}/../config/nginx/conf.d"
HTPASSWD_FILE="${NGINX_CONF_DIR}/.htpasswd"
SECRETS_DIR="${SCRIPT_DIR}/../secrets"

# Color output for better visualization
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}[INFO]${NC} Generating .htpasswd file for NGINX basic authentication..."

# Check if htpasswd command is available
if ! command -v htpasswd &> /dev/null; then
    echo -e "${YELLOW}[WARNING]${NC} htpasswd command not found. Installing apache2-utils..."
    if [ -f /etc/debian_version ]; then
        # Debian/Ubuntu
        sudo apt-get update
        sudo apt-get install -y apache2-utils
    elif [ -f /etc/redhat-release ]; then
        # CentOS/RHEL
        sudo yum install -y httpd-tools
    else
        echo -e "${RED}[ERROR]${NC} Unsupported distribution. Please install apache2-utils or httpd-tools manually."
        exit 1
    fi
fi

# Create NGINX conf directory if it doesn't exist
if [ ! -d "${NGINX_CONF_DIR}" ]; then
    mkdir -p "${NGINX_CONF_DIR}"
    echo -e "${GREEN}[SUCCESS]${NC} Created NGINX configuration directory: ${NGINX_CONF_DIR}"
fi

# Read credentials from secrets if available
if [ -f "${SECRETS_DIR}/cortex_user.txt" ] && [ -f "${SECRETS_DIR}/cortex_password.txt" ]; then
    USERNAME=$(cat "${SECRETS_DIR}/cortex_user.txt")
    PASSWORD=$(cat "${SECRETS_DIR}/cortex_password.txt")
    echo -e "${BLUE}[INFO]${NC} Using credentials from secrets files."
else
    # Prompt for credentials
    read -p "Enter username for NGINX basic auth [admin]: " USERNAME
    USERNAME=${USERNAME:-admin}
    
    read -s -p "Enter password for NGINX basic auth [admin]: " PASSWORD
    PASSWORD=${PASSWORD:-admin}
    echo
fi

# Create or update htpasswd file
if [ -f "$HTPASSWD_FILE" ]; then
    echo -e "${YELLOW}[WARNING]${NC} Existing .htpasswd file found. Overwrite? (y/n)"
    read -r OVERWRITE
    if [ "$OVERWRITE" = "y" ]; then
        htpasswd -cb "$HTPASSWD_FILE" "$USERNAME" "$PASSWORD"
        echo -e "${GREEN}[SUCCESS]${NC} Updated .htpasswd file at: ${HTPASSWD_FILE}"
    else
        htpasswd -b "$HTPASSWD_FILE" "$USERNAME" "$PASSWORD"
        echo -e "${GREEN}[SUCCESS]${NC} Added user to existing .htpasswd file."
    fi
else
    htpasswd -cb "$HTPASSWD_FILE" "$USERNAME" "$PASSWORD"
    echo -e "${GREEN}[SUCCESS]${NC} Created new .htpasswd file at: ${HTPASSWD_FILE}"
fi

# Secure the file
chmod 600 "$HTPASSWD_FILE"

echo -e "${BLUE}[INFO]${NC} Basic authentication is now configured for NGINX."
echo -e "${YELLOW}[NOTE]${NC} Make sure to keep the .htpasswd file secure and do not commit it to version control!"
