#!/bin/bash
# Script for installing and configuring Prometheus Node Exporter
# Usage: sudo ./install_node_exporter.sh

set -e

# Check if the script has root privileges
if [ "$EUID" -ne 0 ]; then
  echo "Please run this script with sudo or as root"
  exit 1
fi

# Installation parameters
NODE_EXPORTER_VERSION="1.8.0"
NODE_EXPORTER_USER="node_exporter"
NODE_EXPORTER_GROUP="node_exporter"
NODE_EXPORTER_DIR="/opt/node_exporter"

echo "Starting installation of Node Exporter version ${NODE_EXPORTER_VERSION}..."

# Create user and group
if ! getent group ${NODE_EXPORTER_GROUP} > /dev/null; then
  groupadd --system ${NODE_EXPORTER_GROUP}
  echo "Group ${NODE_EXPORTER_GROUP} created"
fi

if ! getent passwd ${NODE_EXPORTER_USER} > /dev/null; then
  useradd --system -g ${NODE_EXPORTER_GROUP} -s /bin/false ${NODE_EXPORTER_USER}
  echo "User ${NODE_EXPORTER_USER} created"
fi

# Create directory for Node Exporter
mkdir -p ${NODE_EXPORTER_DIR}

# Download and extract Node Exporter
cd /tmp
echo "Downloading Node Exporter..."
curl -LO "https://github.com/prometheus/node_exporter/releases/download/v${NODE_EXPORTER_VERSION}/node_exporter-${NODE_EXPORTER_VERSION}.linux-amd64.tar.gz"
tar xvf "node_exporter-${NODE_EXPORTER_VERSION}.linux-amd64.tar.gz"
cp "node_exporter-${NODE_EXPORTER_VERSION}.linux-amd64/node_exporter" ${NODE_EXPORTER_DIR}/
chown -R ${NODE_EXPORTER_USER}:${NODE_EXPORTER_GROUP} ${NODE_EXPORTER_DIR}

# Configure systemd service
echo "Configuring systemd service..."
cat > /etc/systemd/system/node_exporter.service << EOF
[Unit]
Description=Prometheus Node Exporter
After=network.target

[Service]
User=${NODE_EXPORTER_USER}
Group=${NODE_EXPORTER_GROUP}
Type=simple
ExecStart=${NODE_EXPORTER_DIR}/node_exporter --collector.systemd --collector.processes

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd, enable and start the service
systemctl daemon-reload
systemctl enable node_exporter
systemctl start node_exporter

# Check status
if systemctl is-active --quiet node_exporter; then
  echo "Node Exporter successfully installed and started!"
  echo "Metrics are available at: http://$(hostname -I | awk '{print $1}'):9100/metrics"
else
  echo "Error: Node Exporter failed to start. Check the logs with: journalctl -u node_exporter"
  exit 1
fi

# Configure firewall if ufw is installed
if command -v ufw > /dev/null; then
  ufw allow 9100/tcp
  echo "Firewall rule added for port 9100"
fi

# Create a file with system information for reference
mkdir -p /tmp/node_exporter_info
cat > /tmp/node_exporter_info/host_info.txt << EOF
Host: $(hostname)
IP Address: $(hostname -I | awk '{print $1}')
Node Exporter Port: 9100
Installation Date: $(date)
Node Exporter Version: ${NODE_EXPORTER_VERSION}
EOF

echo "Installation information saved to /tmp/node_exporter_info/host_info.txt"
echo "Installation completed!"
