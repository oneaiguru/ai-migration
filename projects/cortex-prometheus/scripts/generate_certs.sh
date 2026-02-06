#!/bin/bash
# Generate TLS certificates for secure communication

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CERTS_DIR="${SCRIPT_DIR}/../certs"

# Color output for better readability
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}[INFO]${NC} Generating TLS certificates for secure communication"

# Create the certs directory if it doesn't exist
if [ ! -d "${CERTS_DIR}" ]; then
    mkdir -p "${CERTS_DIR}"
    echo -e "${GREEN}[SUCCESS]${NC} Created certs directory at ${CERTS_DIR}"
fi

# Generate CA certificate
if [ ! -f "${CERTS_DIR}/ca.key" ]; then
    echo -e "${BLUE}[INFO]${NC} Generating CA key and certificate..."
    openssl genrsa -out "${CERTS_DIR}/ca.key" 2048
    openssl req -x509 -new -nodes -key "${CERTS_DIR}/ca.key" -sha256 -days 1095 -out "${CERTS_DIR}/ca.crt" \
        -subj "/C=US/ST=State/L=City/O=Monitoring/CN=Monitoring-CA"
    echo -e "${GREEN}[SUCCESS]${NC} Generated CA certificate"
else
    echo -e "${YELLOW}[WARNING]${NC} CA certificate already exists, skipping"
fi

# Generate server certificate for HTTPS/TLS
if [ ! -f "${CERTS_DIR}/server.key" ]; then
    echo -e "${BLUE}[INFO]${NC} Generating server key and certificate..."

    # Create server key
    openssl genrsa -out "${CERTS_DIR}/server.key" 2048

    # Create config file for SAN
    cat > "${CERTS_DIR}/server.conf" << EOF
[req]
req_extensions = v3_req
distinguished_name = req_distinguished_name

[req_distinguished_name]

[v3_req]
basicConstraints = CA:FALSE
keyUsage = nonRepudiation, digitalSignature, keyEncipherment
extendedKeyUsage = serverAuth
subjectAltName = @alt_names

[alt_names]
DNS.1 = localhost
DNS.2 = prometheus
DNS.3 = cortex-distributor
DNS.4 = cortex-query-frontend
DNS.5 = grafana
DNS.6 = alertmanager
DNS.7 = minio
DNS.8 = consul-server-1
DNS.9 = grafana.example.com
DNS.10 = monitoring.local
IP.1 = 127.0.0.1
EOF

    # Create CSR
    openssl req -new -key "${CERTS_DIR}/server.key" -out "${CERTS_DIR}/server.csr" \
        -subj "/C=US/ST=State/L=City/O=Monitoring/CN=grafana.example.com" \
        -config "${CERTS_DIR}/server.conf"

    # Sign the certificate with our CA
    openssl x509 -req -in "${CERTS_DIR}/server.csr" -CA "${CERTS_DIR}/ca.crt" -CAkey "${CERTS_DIR}/ca.key" \
        -CAcreateserial -out "${CERTS_DIR}/server.crt" -days 1095 -sha256 \
        -extensions v3_req -extfile "${CERTS_DIR}/server.conf"

    # Clean up
    rm -f "${CERTS_DIR}/server.csr"

    echo -e "${GREEN}[SUCCESS]${NC} Generated server certificate for TLS termination"
else
    echo -e "${YELLOW}[WARNING]${NC} Server certificate already exists, skipping"
fi

# Set proper permissions
chmod 600 "${CERTS_DIR}"/*.key
chmod 644 "${CERTS_DIR}"/*.crt

echo -e "${GREEN}[SUCCESS]${NC} TLS certificates generated successfully"
echo -e "${YELLOW}[NOTE]${NC} For production, consider using certificates from a trusted CA"
echo -e "${BLUE}[INFO]${NC} Certificates are stored in ${CERTS_DIR}"

# Generate Consul gossip encryption key if it doesn't exist
if [ ! -f "${SCRIPT_DIR}/../.env" ] || ! grep -q "CONSUL_GOSSIP_KEY" "${SCRIPT_DIR}/../.env"; then
    echo -e "${BLUE}[INFO]${NC} Generating Consul gossip encryption key..."

    # Generate a random key
    GOSSIP_KEY=$(openssl rand -base64 32)

    # Add to .env file
    if [ ! -f "${SCRIPT_DIR}/../.env" ]; then
        echo "CONSUL_GOSSIP_KEY=${GOSSIP_KEY}" > "${SCRIPT_DIR}/../.env"
    else
        # Check if the key already exists
        if grep -q "CONSUL_GOSSIP_KEY" "${SCRIPT_DIR}/../.env"; then
            # Replace existing key
            sed -i "s/CONSUL_GOSSIP_KEY=.*/CONSUL_GOSSIP_KEY=${GOSSIP_KEY}/" "${SCRIPT_DIR}/../.env"
        else
            # Append new key
            echo "CONSUL_GOSSIP_KEY=${GOSSIP_KEY}" >> "${SCRIPT_DIR}/../.env"
        fi
    fi

    echo -e "${GREEN}[SUCCESS]${NC} Consul gossip encryption key added to .env file"
else
    echo -e "${YELLOW}[WARNING]${NC} Consul gossip encryption key already exists in .env file"
fi

echo -e "${GREEN}[SUCCESS]${NC} All security certificates and keys generated"
