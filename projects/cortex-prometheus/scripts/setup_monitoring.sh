#!/bin/bash
# Script for deploying the Prometheus with Cortex monitoring solution
# Usage: ./setup_monitoring.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_DIR="${SCRIPT_DIR}/../config"
DATA_DIR="${SCRIPT_DIR}/../data"
CERTS_DIR="${SCRIPT_DIR}/../certs"

# Color output for better visualization
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}[INFO]${NC} Starting installation of Prometheus with Cortex monitoring solution"
echo -e "${YELLOW}[NOTE]${NC} docker-compose.yml only starts Grafana and Alertmanager; deploy Prometheus/Cortex/MinIO/NGINX via Kubernetes manifests or your own extended Compose stack."

# Check for required tools
check_prerequisites() {
    echo -e "${BLUE}[INFO]${NC} Checking prerequisites..."
    
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}[ERROR]${NC} Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        echo -e "${RED}[ERROR]${NC} Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    echo -e "${GREEN}[SUCCESS]${NC} All prerequisites are installed."
}

# Create necessary directories
create_directories() {
    echo -e "${BLUE}[INFO]${NC} Creating directories..."
    
    mkdir -p ${CONFIG_DIR}/prometheus/rules
    mkdir -p ${CONFIG_DIR}/prometheus/targets/linux
    mkdir -p ${CONFIG_DIR}/prometheus/targets/windows
    mkdir -p ${CONFIG_DIR}/alertmanager/templates
    mkdir -p ${CONFIG_DIR}/cortex
    mkdir -p ${CONFIG_DIR}/grafana/provisioning/datasources
    mkdir -p ${CONFIG_DIR}/grafana/provisioning/dashboards
    mkdir -p ${CONFIG_DIR}/nginx/conf.d
    mkdir -p ${CERTS_DIR}
    mkdir -p ${DATA_DIR}
    
    echo -e "${GREEN}[SUCCESS]${NC} Directories created successfully."
}

# Ensure root prometheus.yml is removed (critical fix #2)
remove_root_prometheus_yml() {
    echo -e "${BLUE}[INFO]${NC} Checking for duplicate Prometheus configuration..."
    
    ROOT_PROMETHEUS_YML="${SCRIPT_DIR}/../prometheus.yml"
    if [ -f "${ROOT_PROMETHEUS_YML}" ]; then
        echo -e "${YELLOW}[WARNING]${NC} Found duplicate Prometheus configuration at root level."
        echo -e "${BLUE}[INFO]${NC} Removing ${ROOT_PROMETHEUS_YML} to avoid confusion."
        rm "${ROOT_PROMETHEUS_YML}"
        echo -e "${GREEN}[SUCCESS]${NC} Removed duplicate Prometheus configuration."
    else
        echo -e "${GREEN}[SUCCESS]${NC} No duplicate Prometheus configuration found."
    fi
}

# Create initial target files
create_initial_targets() {
    echo -e "${BLUE}[INFO]${NC} Creating initial target files..."
    
    # Create Linux targets file if it doesn't exist
    if [ ! -f "${CONFIG_DIR}/prometheus/targets/linux/targets.yml" ]; then
        echo "- targets:" > ${CONFIG_DIR}/prometheus/targets/linux/targets.yml
        echo "  - localhost:9100" >> ${CONFIG_DIR}/prometheus/targets/linux/targets.yml
        echo -e "${GREEN}[SUCCESS]${NC} Created initial Linux targets file."
    fi
    
    # Create Windows targets file if it doesn't exist
    if [ ! -f "${CONFIG_DIR}/prometheus/targets/windows/targets.yml" ]; then
        echo "- targets:" > ${CONFIG_DIR}/prometheus/targets/windows/targets.yml
        echo -e "${GREEN}[SUCCESS]${NC} Created initial Windows targets file."
    fi
}

# Check for TLS certificates and create if needed
check_and_create_certs() {
    echo -e "${BLUE}[INFO]${NC} Checking TLS certificates..."
    
    if [ ! -f "${CERTS_DIR}/server.crt" ] || [ ! -f "${CERTS_DIR}/ca.crt" ]; then
        echo -e "${YELLOW}[WARNING]${NC} TLS certificates not found. Running generate_certs.sh..."
        ${SCRIPT_DIR}/generate_certs.sh
    else
        echo -e "${GREEN}[SUCCESS]${NC} TLS certificates already exist."
    fi
}

# Check for secrets and create if needed
check_and_create_secrets() {
    echo -e "${BLUE}[INFO]${NC} Checking secrets..."
    
    if [ ! -f "${SCRIPT_DIR}/../secrets/cortex_user.txt" ] || [ ! -f "${SCRIPT_DIR}/../secrets/minio_access_key.txt" ]; then
        echo -e "${YELLOW}[WARNING]${NC} Secrets not found. Running update_secrets.sh..."
        ${SCRIPT_DIR}/update_secrets.sh
    else
        echo -e "${GREEN}[SUCCESS]${NC} Secrets already exist."
    fi
}

# Create .htpasswd file for nginx if needed
check_and_create_htpasswd() {
    echo -e "${BLUE}[INFO]${NC} Checking NGINX basic auth..."
    
    if [ ! -f "${CONFIG_DIR}/nginx/conf.d/.htpasswd" ]; then
        echo -e "${YELLOW}[WARNING]${NC} NGINX basic auth not configured. Running create_htpasswd.sh..."
        ${SCRIPT_DIR}/create_htpasswd.sh
    else
        echo -e "${GREEN}[SUCCESS]${NC} NGINX basic auth already configured."
    fi
}

# Start the monitoring stack
start_monitoring() {
    echo -e "${BLUE}[INFO]${NC} Starting the monitoring stack..."
    
    cd ${SCRIPT_DIR}/..
    docker-compose pull
    docker-compose up -d
    
    echo -e "${GREEN}[SUCCESS]${NC} Monitoring stack started successfully."
}

# Check the status of the services
check_services() {
    echo -e "${BLUE}[INFO]${NC} Checking service status..."
    
    sleep 10 # Give services time to start
    
    # Check if containers are running
    if docker-compose ps | grep -q "Up"; then
        echo -e "${GREEN}[SUCCESS]${NC} Services are running."
    else
        echo -e "${RED}[ERROR]${NC} Some services failed to start."
        docker-compose ps
        exit 1
    fi
    
    # Optional: run verify_deployment.sh for more detailed checks
    if [ -f "${SCRIPT_DIR}/verify_deployment.sh" ]; then
        echo -e "${BLUE}[INFO]${NC} Running deployment verification script..."
        ${SCRIPT_DIR}/verify_deployment.sh
    fi
}

# Show information about adding hosts
show_add_hosts_info() {
    echo -e "\n${YELLOW}=== Next Steps: Adding Hosts to Monitor ===${NC}"
    echo -e "The helper scripts populate file_sd targets under ${BLUE}config/prometheus/targets${NC} (for Kubernetes or a custom Prometheus deployment)."
    echo -e "  Linux:   ${BLUE}./scripts/add_linux_hosts.sh${NC}"
    echo -e "  Windows: ${BLUE}./scripts/add_windows_hosts.sh${NC}"
    echo
    echo -e "To install exporters on target hosts:"
    echo -e "  Linux: ${BLUE}sudo ./scripts/install_node_exporter.sh${NC} (run on each Linux host)"
    echo -e "  Windows: ${BLUE}powershell -ExecutionPolicy Bypass -File scripts/install_windows_exporter.ps1${NC} (run on each Windows host)"
    echo
}

# Display access information
print_access_info() {
    echo -e "\n${GREEN}=== ACCESS INFORMATION ===${NC}"
    echo -e "docker-compose quickstart (Grafana + Alertmanager only):"
    echo -e "  Grafana:      ${BLUE}http://localhost:3000${NC} (default: admin/admin)"
    echo -e "  Alertmanager: ${BLUE}http://localhost:9093${NC}"
    echo -e "\nFull stack (Kubernetes manifests or extended Compose):"
    echo -e "  Prometheus:   http://<prometheus-service>:9090"
    echo -e "  Cortex Query: http://<cortex-query-frontend>:9010/prometheus"
    echo -e "  MinIO Console: http://<minio-service>:9001"
    echo -e "  NGINX (if enabled): https://<nginx-host>/"
    
    echo -e "\n${YELLOW}IMPORTANT:${NC} The TLS certificate is self-signed. You may see a security warning in your browser."
    echo -e "For production use, please replace it with a proper certificate."
}

# Ask if the user wants to add hosts now
prompt_add_hosts() {
    echo
    read -p "Do you want to add hosts to monitoring now? (y/n): " ADD_HOSTS
    if [[ "$ADD_HOSTS" == "y" ]]; then
        echo
        read -p "Add Linux hosts (l), Windows hosts (w), or both (b)? " HOST_TYPE
        case "$HOST_TYPE" in
            l|L)
                ${SCRIPT_DIR}/add_linux_hosts.sh
                ;;
            w|W)
                ${SCRIPT_DIR}/add_windows_hosts.sh
                ;;
            b|B)
                ${SCRIPT_DIR}/add_linux_hosts.sh
                echo
                ${SCRIPT_DIR}/add_windows_hosts.sh
                ;;
            *)
                echo -e "${YELLOW}Invalid option. No hosts added.${NC}"
                ;;
        esac
    fi
}

# Main execution flow
main() {
    check_prerequisites
    create_directories
    remove_root_prometheus_yml
    create_initial_targets
    check_and_create_certs
    check_and_create_secrets
    check_and_create_htpasswd
    start_monitoring
    check_services
    print_access_info
    show_add_hosts_info
    prompt_add_hosts
    
    echo -e "\n${GREEN}Installation completed successfully!${NC}"
}

main
