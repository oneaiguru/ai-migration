#!/bin/bash
# Script to add Linux hosts to Prometheus monitoring
# Usage: ./add_linux_hosts.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_DIR="${SCRIPT_DIR}/../config"
TARGETS_FILE="${CONFIG_DIR}/prometheus/targets/linux/targets.yml"
PROMETHEUS_CONFIG="${CONFIG_DIR}/prometheus/prometheus.yml"

# Color output
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Add Linux Hosts to Prometheus Monitoring ===${NC}"
echo -e "This script will add Linux hosts to the Prometheus monitoring configuration."
echo -e "Linux hosts should be running Node Exporter (usually on port 9100)."
echo

# Check if config directory exists
if [ ! -d "${CONFIG_DIR}/prometheus/targets/linux" ]; then
    echo -e "${RED}Error: Target directory does not exist: ${CONFIG_DIR}/prometheus/targets/linux${NC}"
    echo -e "Make sure the monitoring stack is properly installed."
    exit 1
fi

# Verify the prometheus.yml has the correct job_name
if ! grep -q "job_name: 'linux'" "${PROMETHEUS_CONFIG}" && ! grep -q 'job_name: "linux"' "${PROMETHEUS_CONFIG}"; then
    echo -e "${RED}Error: Prometheus config missing the 'linux' scrape job${NC}"
    echo -e "Please ensure your prometheus.yml has a job_name: 'linux' configuration."
    exit 1
fi

# Function to list current targets
list_current_targets() {
    if [ -f "$TARGETS_FILE" ]; then
        echo -e "${YELLOW}Current Linux targets:${NC}"
        grep -E '^\s+- ' "$TARGETS_FILE" | sed 's/^[ \t]*- //' | sort
        echo
    else
        echo -e "${YELLOW}No Linux targets configured yet.${NC}"
        echo
    fi
}

# List current targets
list_current_targets

# Get new hosts
read -p "Enter Linux host addresses with port (e.g., 192.168.1.10:9100 192.168.1.11:9100): " hosts

if [ -z "$hosts" ]; then
    echo -e "${YELLOW}No hosts specified. Operation canceled.${NC}"
    exit 0
fi

# Option to append or replace
read -p "Do you want to append to existing targets? (y/n, default: n): " append
append=${append:-n}

if [ "$append" = "y" ]; then
    # Get existing targets
    existing_hosts=$(grep -E '^\s+- ' "$TARGETS_FILE" | sed 's/^[ \t]*- //' || echo "")
    
    # Combine existing and new hosts
    combined_hosts="$existing_hosts $hosts"
    
    # Remove duplicates
    unique_hosts=$(echo "$combined_hosts" | tr ' ' '\n' | sort | uniq | tr '\n' ' ')
    
    echo -e "${BLUE}Adding new hosts to existing targets...${NC}"
    echo "- targets:" > "$TARGETS_FILE"
    for host in $unique_hosts; do
        if [ -n "$host" ]; then
            echo "  - $host" >> "$TARGETS_FILE"
        fi
    done
else
    echo -e "${BLUE}Replacing all existing targets...${NC}"
    echo "- targets:" > "$TARGETS_FILE"
    for host in $hosts; do
        echo "  - $host" >> "$TARGETS_FILE"
    done
fi

# Reload Prometheus
echo -e "${BLUE}Reloading Prometheus configuration...${NC}"
if docker-compose exec prometheus kill -HUP 1; then
    echo -e "${GREEN}Prometheus configuration reloaded successfully.${NC}"
else
    echo -e "${RED}Failed to reload Prometheus configuration.${NC}"
    echo -e "${YELLOW}You may need to restart Prometheus manually:${NC}"
    echo -e "  docker-compose restart prometheus"
fi

# Show updated targets
echo
echo -e "${GREEN}Updated Linux targets:${NC}"
grep -E '^\s+- ' "$TARGETS_FILE" | sed 's/^[ \t]*- //' | sort

echo
echo -e "${GREEN}Done!${NC}"
