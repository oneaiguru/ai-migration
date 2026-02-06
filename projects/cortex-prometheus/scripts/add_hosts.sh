#!/bin/bash
#
# Script to add hosts to Prometheus monitoring
#

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEFAULT_CONFIG="${SCRIPT_DIR}/../config/prometheus/prometheus.yml"

# Default values
PROMETHEUS_CONFIG="${DEFAULT_CONFIG}"
TARGET="linux"          # linux | windows | both
LINUX_PORT=9100
WINDOWS_PORT=9182
PORT_OVERRIDE=""

# Display help
function show_help {
    echo "Usage: $0 [options] <hostname1> [hostname2] [hostname3] ..."
    echo "Add hosts to Prometheus monitoring configuration"
    echo ""
    echo "Options:"
    echo "  -c, --config FILE    Specify Prometheus configuration file path"
    echo "                       Default: ${DEFAULT_CONFIG}"
    echo "  -t, --target TARGET  Target group: linux | windows | both (default: linux)"
    echo "  -p, --port PORT      Override port for selected target (or both if --target=both)"
    echo "      --linux-port P   Set Linux exporter port (default: 9100)"
    echo "      --windows-port P Set Windows exporter port (default: 9182)"
    echo "  Config path default: ${DEFAULT_CONFIG}"
    echo "  -h, --help           Display this help message"
    exit 0
}

# Parse command line options
while [[ $# -gt 0 ]]; do
    case $1 in
        -c|--config)
            PROMETHEUS_CONFIG="$2"
            shift 2
            ;;
        -t|--target)
            TARGET="$2"
            shift 2
            ;;
        -p|--port)
            PORT_OVERRIDE="$2"
            shift 2
            ;;
        --linux-port)
            LINUX_PORT="$2"
            shift 2
            ;;
        --windows-port)
            WINDOWS_PORT="$2"
            shift 2
            ;;
        -h|--help)
            show_help
            ;;
        *)
            break
            ;;
    esac
done

# Check if at least one hostname is provided
if [ $# -lt 1 ]; then
    echo "Error: At least one hostname is required"
    show_help
fi

# Resolve config directory and ensure the main config exists
if [ ! -f "$PROMETHEUS_CONFIG" ]; then
    echo "Error: Prometheus config not found at $PROMETHEUS_CONFIG"
    exit 1
fi

CONFIG_DIR="$(cd "$(dirname "$PROMETHEUS_CONFIG")" && pwd)"
TARGET_ROOT="${CONFIG_DIR}/targets"
LINUX_TARGETS="${TARGET_ROOT}/linux/targets.yml"
WINDOWS_TARGETS="${TARGET_ROOT}/windows/targets.yml"

# Normalize target selection
case "$TARGET" in
    linux|windows|both) ;;
    *)
        echo "Invalid target '$TARGET'. Use linux | windows | both."
        exit 1
        ;;
esac

# Apply port override if provided
if [ -n "$PORT_OVERRIDE" ]; then
    if [ "$TARGET" = "linux" ]; then
        LINUX_PORT="$PORT_OVERRIDE"
    elif [ "$TARGET" = "windows" ]; then
        WINDOWS_PORT="$PORT_OVERRIDE"
    else
        LINUX_PORT="$PORT_OVERRIDE"
        WINDOWS_PORT="$PORT_OVERRIDE"
    fi
fi

# Create backup of the config file
BACKUP_FILE="${PROMETHEUS_CONFIG}.$(date +%Y%m%d%H%M%S).bak"
cp "$PROMETHEUS_CONFIG" "$BACKUP_FILE"
echo "Created backup of configuration at $BACKUP_FILE"

# Ensure target directories exist
mkdir -p "${TARGET_ROOT}/linux" "${TARGET_ROOT}/windows"

# Helper to append to a file_sd targets file
append_target() {
    local file=$1
    local host=$2
    local port=$3

    if [ -f "$file" ]; then
        if grep -q "$host:$port" "$file"; then
            echo "Host $host already present in $(basename "$(dirname "$file")") targets."
            return
        fi
        printf "  - %s\n" "$host:$port" >> "$file"
        echo "Added $host to $(basename "$(dirname "$file")") targets."
    else
        {
            echo "- targets:"
            printf "  - %s\n" "$host:$port"
        } > "$file"
        echo "Created $(basename "$(dirname "$file")") targets file and added $host."
    fi
}

# Add hosts to configuration (file_sd targets for linux/windows jobs)
for host in "$@"; do
    echo "Adding host $host to Prometheus configuration..."

    if [ "$TARGET" = "linux" ] || [ "$TARGET" = "both" ]; then
        append_target "$LINUX_TARGETS" "$host" "$LINUX_PORT"
    fi

    if [ "$TARGET" = "windows" ] || [ "$TARGET" = "both" ]; then
        append_target "$WINDOWS_TARGETS" "$host" "$WINDOWS_PORT"
    fi
done

# Reload Prometheus
echo "Reloading Prometheus configuration..."
if curl -fs -X POST http://localhost:9090/-/reload >/dev/null 2>&1; then
    echo "Prometheus configuration reloaded via HTTP."
else
    echo "Prometheus reload endpoint not reachable. If Prometheus is running in Kubernetes or under a different address, restart/reload it manually."
fi

# Done
echo "All hosts have been added to Prometheus monitoring"
