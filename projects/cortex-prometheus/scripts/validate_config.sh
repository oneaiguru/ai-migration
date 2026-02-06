#!/bin/bash
# Script to validate core configuration before deployment
# Usage: ./validate_config.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
CONFIG_DIR="${PROJECT_ROOT}/config"

# Color output for better readability
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}[INFO]${NC} Validating configuration files..."

# Check if a file exists
check_file_exists() {
    local file_path=$1
    local file_description=$2

    if [ ! -f "$file_path" ]; then
        echo -e "${RED}[ERROR]${NC} ${file_description} not found at ${file_path}"
        return 1
    else
        echo -e "${GREEN}[OK]${NC} ${file_description} found at ${file_path}"
        return 0
    fi
}

# Validate YAML syntax (best-effort; skips if PyYAML is unavailable)
validate_yaml() {
    local file_path=$1
    local file_description=$2

    if ! command -v python3 &> /dev/null; then
        echo -e "${YELLOW}[WARNING]${NC} Python is not available. Skipping YAML validation for ${file_description}"
        return 0
    fi

    if ! python3 - <<'PYCODE' >/dev/null 2>&1
import yaml  # noqa: F401
PYCODE
    then
        echo -e "${YELLOW}[WARNING]${NC} PyYAML is not installed. Skipping YAML validation for ${file_description}"
        return 0
    fi

    if python3 - <<PYCODE 2>/dev/null
import yaml
yaml.safe_load(open("${file_path}", "r"))
PYCODE
    then
        echo -e "${GREEN}[OK]${NC} ${file_description} has valid YAML syntax"
        return 0
    else
        echo -e "${RED}[ERROR]${NC} ${file_description} has invalid YAML syntax"
        return 1
    fi
}

validate_prometheus_config() {
    local prometheus_config="${CONFIG_DIR}/prometheus/prometheus.yml"

    check_file_exists "$prometheus_config" "Prometheus configuration file" || return 1
    validate_yaml "$prometheus_config" "Prometheus configuration file" || return 1

    if ! grep -q "job_name: 'linux'" "$prometheus_config" && ! grep -q 'job_name: \"linux\"' "$prometheus_config"; then
        echo -e "${RED}[ERROR]${NC} Prometheus configuration is missing 'linux' job"
        return 1
    fi

    if ! grep -q "job_name: 'windows'" "$prometheus_config" && ! grep -q 'job_name: \"windows\"' "$prometheus_config"; then
        echo -e "${RED}[ERROR]${NC} Prometheus configuration is missing 'windows' job"
        return 1
    fi

    if ! grep -q "remote_write:" "$prometheus_config"; then
        echo -e "${YELLOW}[WARNING]${NC} Prometheus configuration is missing 'remote_write' (expected when shipping to Cortex)"
    fi

    echo -e "${GREEN}[OK]${NC} Prometheus configuration looks structurally sound"
    return 0
}

validate_cortex_config() {
    local cortex_config="${CONFIG_DIR}/cortex/cortex.yml"

    check_file_exists "$cortex_config" "Cortex configuration file" || return 1
    validate_yaml "$cortex_config" "Cortex configuration file" || return 1

    if ! grep -q "storage:" "$cortex_config"; then
        echo -e "${RED}[ERROR]${NC} Cortex configuration is missing 'storage' section"
        return 1
    fi

    if ! grep -q "blocks_storage:" "$cortex_config"; then
        echo -e "${RED}[ERROR]${NC} Cortex configuration is missing 'blocks_storage' section"
        return 1
    fi

    if ! grep -q "minio" "$cortex_config"; then
        echo -e "${YELLOW}[WARNING]${NC} Cortex configuration does not reference a MinIO endpoint"
    fi

    echo -e "${GREEN}[OK]${NC} Cortex configuration looks structurally sound"
    return 0
}

validate_alertmanager_config() {
    local alertmanager_config="${CONFIG_DIR}/alertmanager/alertmanager.yml"

    check_file_exists "$alertmanager_config" "Alertmanager configuration file" || return 1
    validate_yaml "$alertmanager_config" "Alertmanager configuration file" || return 1

    for section in global route receivers; do
        if ! grep -q "^${section}:" "$alertmanager_config"; then
            echo -e "${RED}[ERROR]${NC} Alertmanager configuration is missing '${section}' section"
            return 1
        fi
    done

    echo -e "${GREEN}[OK]${NC} Alertmanager configuration looks structurally sound"
    return 0
}

validate_docker_compose() {
    local docker_compose_file="${PROJECT_ROOT}/docker-compose.yml"

    check_file_exists "$docker_compose_file" "Docker Compose file" || return 1

    local required_services=("grafana" "alertmanager")
    local missing_services=()

    if command -v python3 &> /dev/null && python3 - <<'PYCODE' >/dev/null 2>&1
import yaml  # noqa: F401
PYCODE
    then
        local services
        services=$(python3 - <<'PYCODE' "${docker_compose_file}"
import sys, yaml
data = yaml.safe_load(open(sys.argv[1], "r"))
services = data.get("services", {}) if isinstance(data, dict) else {}
print(" ".join(services.keys()))
PYCODE
        )
        for service in "${required_services[@]}"; do
            if ! grep -qw "$service" <<< "$services"; then
                missing_services+=("$service")
            fi
        done
    else
        for service in "${required_services[@]}"; do
            if command -v rg &> /dev/null; then
                if ! rg -q "^\\s*${service}:" "$docker_compose_file"; then
                    missing_services+=("$service")
                fi
            else
                if ! grep -Eq "^[[:space:]]${service}:" "$docker_compose_file"; then
                    missing_services+=("$service")
                fi
            fi
        done
    fi

    if [ ${#missing_services[@]} -gt 0 ]; then
        echo -e "${YELLOW}[WARNING]${NC} Docker Compose is missing or misnaming services: ${missing_services[*]}"
    else
        echo -e "${GREEN}[OK]${NC} Docker Compose lists expected services (${required_services[*]})"
    fi

    return 0
}

validate_setup_script() {
    local setup_script="${PROJECT_ROOT}/scripts/setup_monitoring.sh"
    
    check_file_exists "$setup_script" "Setup script" || return 1

    if [ ! -x "$setup_script" ]; then
        echo -e "${YELLOW}[WARNING]${NC} Setup script is not executable. Run 'chmod +x ${setup_script}' to fix this"
    fi

    return 0
}

main() {
    local errors=0

    validate_prometheus_config || ((errors++))
    validate_cortex_config || ((errors++))
    validate_alertmanager_config || ((errors++))
    validate_docker_compose || ((errors++))
    validate_setup_script || ((errors++))

    echo
    if [ $errors -eq 0 ]; then
        echo -e "${GREEN}[SUCCESS]${NC} All configuration files validated successfully!"
        exit 0
    else
        echo -e "${RED}[FAILED]${NC} Found $errors error(s) in configuration files."
        echo -e "Please fix the issues before deploying the monitoring stack."
        exit 1
    fi
}

main
