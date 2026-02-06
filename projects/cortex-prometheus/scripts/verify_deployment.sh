#!/bin/bash
# Comprehensive verification script for Prometheus with Cortex monitoring stack
# Usage: ./verify_deployment.sh

set -e

# Color output for better readability
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Track test results
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Check if a service is defined in docker-compose
service_defined() {
    local svc=$1
    docker-compose config --services 2>/dev/null | grep -qx "$svc"
}

# Function to run a test and track results
run_test() {
    local test_name=$1
    local test_cmd=$2
    local expected_result=$3
    local actual_result
    
    TOTAL_TESTS=$((TOTAL_TESTS+1))
    
    echo -ne "${BLUE}Running test:${NC} $test_name... "
    
    # Execute the test command
    actual_result=$(eval "$test_cmd" 2>/dev/null || echo "COMMAND_FAILED")
    
    if [[ "$actual_result" == "$expected_result" ]]; then
        echo -e "${GREEN}PASSED${NC}"
        PASSED_TESTS=$((PASSED_TESTS+1))
        return 0
    else
        echo -e "${RED}FAILED${NC}"
        echo -e "  Expected: ${expected_result}"
        echo -e "  Actual:   ${actual_result}"
        FAILED_TESTS=$((FAILED_TESTS+1))
        return 1
    fi
}

# Function to check if a container is running
check_container() {
    local container_name=$1
    
    TOTAL_TESTS=$((TOTAL_TESTS+1))
    
    echo -ne "${BLUE}Checking container:${NC} $container_name... "
    
    if docker-compose ps --services --filter "status=running" | grep -q "$container_name"; then
        echo -e "${GREEN}RUNNING${NC}"
        PASSED_TESTS=$((PASSED_TESTS+1))
        return 0
    else
        echo -e "${RED}NOT RUNNING${NC}"
        FAILED_TESTS=$((FAILED_TESTS+1))
        return 1
    fi
}

# Function to check a HTTP endpoint
check_endpoint() {
    local service_name=$1
    local url=$2
    local expected_code=${3:-200}
    local actual_code
    
    TOTAL_TESTS=$((TOTAL_TESTS+1))
    
    echo -ne "${BLUE}Checking endpoint:${NC} $service_name ($url)... "
    
    actual_code=$(curl -s -o /dev/null -w "%{http_code}" "$url" || echo "FAILED")
    
    if [[ "$actual_code" == "$expected_code" ]]; then
        echo -e "${GREEN}ACCESSIBLE (HTTP $actual_code)${NC}"
        PASSED_TESTS=$((PASSED_TESTS+1))
        return 0
    else
        echo -e "${RED}INACCESSIBLE (HTTP $actual_code)${NC}"
        FAILED_TESTS=$((FAILED_TESTS+1))
        return 1
    fi
}

# Check Consul cluster
check_consul_cluster() {
    echo -e "\n${YELLOW}=== Checking Consul Cluster ===${NC}"

    if ! service_defined "consul-server-1"; then
        echo -e "${YELLOW}Skipping Consul checks: Consul services not present in docker-compose.yml${NC}"
        return
    fi
    
    check_container "consul-server-1"
    check_container "consul-server-2"
    check_container "consul-server-3"
    
    # Check if Consul cluster has formed properly
    echo -ne "${BLUE}Checking Consul cluster formation:${NC} "
    
    TOTAL_TESTS=$((TOTAL_TESTS+1))
    
    local consul_members=$(docker-compose exec -T consul-server-1 consul members || echo "COMMAND_FAILED")
    local consul_servers=$(echo "$consul_members" | grep -c "server" || echo "0")
    
    if [[ "$consul_servers" == "3" ]]; then
        echo -e "${GREEN}OK (3 servers joined)${NC}"
        PASSED_TESTS=$((PASSED_TESTS+1))
    else
        echo -e "${RED}FAILED (Expected 3 servers, found $consul_servers)${NC}"
        FAILED_TESTS=$((FAILED_TESTS+1))
    fi
}

# Check MinIO cluster
check_minio_cluster() {
    echo -e "\n${YELLOW}=== Checking MinIO Cluster ===${NC}"

    if ! service_defined "minio-1"; then
        echo -e "${YELLOW}Skipping MinIO checks: MinIO services not present in docker-compose.yml${NC}"
        return
    fi
    
    check_container "minio-1"
    check_container "minio-2"
    check_container "minio-3"
    check_container "minio-4"
    check_container "minio-5"
    check_container "minio-6"
    
    # Check if MinIO buckets were created
    TOTAL_TESTS=$((TOTAL_TESTS+1))
    
    echo -ne "${BLUE}Checking MinIO buckets:${NC} "
    
    local minio_buckets=$(docker-compose exec -T minio-1 mc ls minio 2>/dev/null || echo "COMMAND_FAILED")
    
    if echo "$minio_buckets" | grep -q "cortex-blocks" && echo "$minio_buckets" | grep -q "cortex-rules"; then
        echo -e "${GREEN}OK (cortex-blocks and cortex-rules exist)${NC}"
        PASSED_TESTS=$((PASSED_TESTS+1))
    else
        echo -e "${RED}FAILED (Missing cortex-blocks and/or cortex-rules buckets)${NC}"
        FAILED_TESTS=$((FAILED_TESTS+1))
    fi
}

# Check Cortex components
check_cortex_components() {
    echo -e "\n${YELLOW}=== Checking Cortex Components ===${NC}"

    if ! service_defined "cortex-distributor"; then
        echo -e "${YELLOW}Skipping Cortex checks: Cortex services not present in docker-compose.yml${NC}"
        return
    fi
    
    local cortex_components=(
        "cortex-distributor-1"
        "cortex-distributor-2"
        "cortex-distributor-3"
        "cortex-ingester-1"
        "cortex-ingester-2"
        "cortex-ingester-3"
        "cortex-query-frontend"
        "cortex-querier-1"
        "cortex-querier-2"
        "cortex-store-gateway-1"
        "cortex-store-gateway-2"
        "cortex-compactor"
        "cortex-ruler"
    )
    
    for component in "${cortex_components[@]}"; do
        check_container "$component"
    done
    
    # Check if Cortex ring is properly formed
    TOTAL_TESTS=$((TOTAL_TESTS+1))
    
    echo -ne "${BLUE}Checking Cortex ring status:${NC} "
    
    local ring_status=$(curl -s http://localhost:9009/ring 2>/dev/null || echo "FAILED")
    
    if echo "$ring_status" | grep -q "ingester"; then
        echo -e "${GREEN}OK (ring API accessible)${NC}"
        PASSED_TESTS=$((PASSED_TESTS+1))
    else
        echo -e "${RED}FAILED (ring API not accessible)${NC}"
        FAILED_TESTS=$((FAILED_TESTS+1))
    fi
    
    # Verify Cortex retention configuration
    TOTAL_TESTS=$((TOTAL_TESTS+1))
    
    echo -ne "${BLUE}Checking Cortex retention configuration:${NC} "
    
    local cortex_config=$(curl -s http://localhost:9009/config 2>/dev/null || echo "FAILED")
    
    if echo "$cortex_config" | grep -q "retention_period: 90d"; then
        echo -e "${GREEN}OK (90 day retention configured)${NC}"
        PASSED_TESTS=$((PASSED_TESTS+1))
    else
        echo -e "${RED}FAILED (90 day retention not configured properly)${NC}"
        FAILED_TESTS=$((FAILED_TESTS+1))
    fi
}

# Check Prometheus configuration
check_prometheus_config() {
    echo -e "\n${YELLOW}=== Checking Prometheus Configuration ===${NC}"

    if ! service_defined "prometheus"; then
        echo -e "${YELLOW}Skipping Prometheus checks: Prometheus service not present in docker-compose.yml${NC}"
        return
    fi
    
    check_container "prometheus"
    
    # Check if Prometheus config is valid
    TOTAL_TESTS=$((TOTAL_TESTS+1))
    
    echo -ne "${BLUE}Checking Prometheus configuration:${NC} "
    
    local config_status=$(curl -s http://localhost:9090/api/v1/status/config 2>/dev/null || echo "FAILED")
    
    if echo "$config_status" | grep -q "\"status\":\"success\""; then
        echo -e "${GREEN}OK (Configuration valid)${NC}"
        PASSED_TESTS=$((PASSED_TESTS+1))
    else
        echo -e "${RED}FAILED (Configuration invalid or not accessible)${NC}"
        FAILED_TESTS=$((FAILED_TESTS+1))
    fi
    
    # Check if Linux and Windows job configurations exist
    TOTAL_TESTS=$((TOTAL_TESTS+1))
    
    echo -ne "${BLUE}Checking job configurations:${NC} "
    
    local linux_job=$(curl -s http://localhost:9090/api/v1/status/config | grep -c "job_name: \"linux\"" || echo "0")
    local windows_job=$(curl -s http://localhost:9090/api/v1/status/config | grep -c "job_name: \"windows\"" || echo "0")
    
    if [[ "$linux_job" -gt "0" && "$windows_job" -gt "0" ]]; then
        echo -e "${GREEN}OK (Both Linux and Windows jobs found)${NC}"
        PASSED_TESTS=$((PASSED_TESTS+1))
    else
        echo -e "${RED}FAILED (Missing Linux and/or Windows jobs)${NC}"
        FAILED_TESTS=$((FAILED_TESTS+1))
    fi
    
    # Check if remote_write shards setting is sufficient
    TOTAL_TESTS=$((TOTAL_TESTS+1))
    
    echo -ne "${BLUE}Checking remote_write max_shards configuration:${NC} "
    
    local max_shards=$(curl -s http://localhost:9090/api/v1/status/config | grep -o "max_shards: [0-9]*" | awk '{print $2}' || echo "0")
    
    if [[ "$max_shards" -ge "200" ]]; then
        echo -e "${GREEN}OK (max_shards set to $max_shards)${NC}"
        PASSED_TESTS=$((PASSED_TESTS+1))
    else
        echo -e "${YELLOW}WARNING (max_shards set to $max_shards, recommended ≥250 for large deployments)${NC}"
        FAILED_TESTS=$((FAILED_TESTS+1))
    fi
}

# Check Grafana
check_grafana() {
    echo -e "\n${YELLOW}=== Checking Grafana ===${NC}"
    
    check_container "grafana"
    check_endpoint "Grafana Health API" "http://localhost:3000/api/health"
    
    # Check if Grafana datasources are configured
    TOTAL_TESTS=$((TOTAL_TESTS+1))
    
    echo -ne "${BLUE}Checking Grafana datasources:${NC} "
    
    local datasources=$(curl -s -u admin:admin http://localhost:3000/api/datasources 2>/dev/null || echo "FAILED")
    
    if echo "$datasources" | grep -q "Prometheus" && echo "$datasources" | grep -q "Cortex"; then
        echo -e "${GREEN}OK (Prometheus and Cortex datasources configured)${NC}"
        PASSED_TESTS=$((PASSED_TESTS+1))
    else
        echo -e "${RED}FAILED (Datasources not properly configured)${NC}"
        FAILED_TESTS=$((FAILED_TESTS+1))
    fi
    
    # Verify Cortex datasource is using the correct URL with port 9010
    TOTAL_TESTS=$((TOTAL_TESTS+1))
    
    echo -ne "${BLUE}Checking Cortex datasource URL:${NC} "
    
    local cortex_url=$(curl -s -u admin:admin http://localhost:3000/api/datasources 2>/dev/null | grep -o "\"url\":\"[^\"]*\"" | grep cortex | head -1 || echo "FAILED")
    
    if echo "$cortex_url" | grep -q "9010"; then
        echo -e "${GREEN}OK (Cortex datasource configured with port 9010)${NC}"
        PASSED_TESTS=$((PASSED_TESTS+1))
    else
        echo -e "${RED}FAILED (Cortex datasource not using port 9010)${NC}"
        FAILED_TESTS=$((FAILED_TESTS+1))
    fi
}

# Check AlertManager
check_alertmanager() {
    echo -e "\n${YELLOW}=== Checking AlertManager ===${NC}"
    
    check_container "alertmanager"
    check_endpoint "AlertManager Health API" "http://localhost:9093/-/healthy"
    
    # Check if AlertManager is properly configured
    TOTAL_TESTS=$((TOTAL_TESTS+1))
    
    echo -ne "${BLUE}Checking AlertManager configuration:${NC} "
    
    local alertmanager_status=$(curl -s http://localhost:9093/api/v2/status 2>/dev/null || echo "FAILED")
    
    if echo "$alertmanager_status" | grep -q "config"; then
        echo -e "${GREEN}OK (AlertManager configuration is loaded)${NC}"
        PASSED_TESTS=$((PASSED_TESTS+1))
    else
        echo -e "${RED}FAILED (AlertManager configuration not accessible)${NC}"
        FAILED_TESTS=$((FAILED_TESTS+1))
    fi
}

# Check NGINX and basic auth
check_nginx() {
    echo -e "\n${YELLOW}=== Checking NGINX and Basic Auth ===${NC}"

    if ! service_defined "nginx"; then
        echo -e "${YELLOW}Skipping NGINX checks: nginx service not present in docker-compose.yml${NC}"
        return
    fi
    
    check_container "nginx"
    
    # Check if NGINX configuration is valid
    TOTAL_TESTS=$((TOTAL_TESTS+1))
    
    echo -ne "${BLUE}Checking NGINX configuration files:${NC} "
    
    if [ -f "./config/nginx/conf.d/monitoring.conf" ] && [ -f "./config/nginx/conf.d/.htpasswd" ]; then
        echo -e "${GREEN}OK (Configuration files exist)${NC}"
        PASSED_TESTS=$((PASSED_TESTS+1))
    else
        echo -e "${RED}FAILED (Missing configuration files)${NC}"
        FAILED_TESTS=$((FAILED_TESTS+1))
    fi
}

# Main function
main() {
    echo -e "${BLUE}Starting comprehensive verification of the monitoring stack...${NC}"
    
    # Run all checks
    check_consul_cluster
    check_minio_cluster
    check_cortex_components
    check_prometheus_config
    check_grafana
    check_alertmanager
    check_nginx
    
    # Final result
    echo -e "\n${YELLOW}=== Verification Summary ===${NC}"
    echo -e "Total tests: $TOTAL_TESTS"
    echo -e "Passed: ${GREEN}$PASSED_TESTS${NC}"
    echo -e "Failed: ${RED}$FAILED_TESTS${NC}"
    
    if [ $FAILED_TESTS -eq 0 ]; then
        echo -e "\n${GREEN}All tests passed! The monitoring stack is properly deployed.${NC}"
        exit 0
    else
        echo -e "\n${RED}$FAILED_TESTS test(s) failed. Please check the output above for details.${NC}"
        exit 1
    fi
}

# Run the main function
main
