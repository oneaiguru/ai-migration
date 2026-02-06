# VPN Integration Guide

This guide explains how to integrate the hev-socks5-tunnel library with Xray to create a full system-wide VPN that routes all device traffic through the proxy.

## Overview of Components

The VPN solution consists of three main components:

1. **Android VPN Service** (TProxyService.kt): Creates a TUN interface and manages the VPN lifecycle
2. **hev-socks5-tunnel**: Bridges between the TUN interface and the SOCKS5 proxy
3. **Xray Core**: Provides the SOCKS5 proxy that handles the actual traffic routing

## Packet Flow

The packet flow through the VPN works as follows:

```
┌───────────────┐     ┌───────────────┐     ┌───────────────┐     ┌───────────────┐
│ Android Apps  │────>│  TUN Interface │────>│ hev-socks5-   │────>│  Xray Core    │────> Internet
│ (All Traffic) │     │ (VpnService)   │     │ tunnel        │     │ (SOCKS5 Proxy)│
└───────────────┘     └───────────────┘     └───────────────┘     └───────────────┘
```

1. **App Traffic Capture**:
   - Android's VpnService creates a virtual TUN interface
   - All apps' network traffic is redirected to this interface based on routing rules
   - Apps can be selectively included/excluded from the VPN

2. **TUN to SOCKS5 Bridging (hev-socks5-tunnel)**:
   - The hev-socks5-tunnel reads raw IP packets from the TUN interface
   - It processes these packets and extracts the connection information (source/destination)
   - For each connection, it creates a corresponding SOCKS5 connection
   - The tunnel maintains a mapping between TUN connections and SOCKS5 connections

3. **Proxy Handling (Xray Core)**:
   - Xray Core receives the SOCKS5 connections
   - It processes these connections according to its routing rules
   - Traffic is forwarded to the appropriate outbound connection
   - Return traffic follows the reverse path

## Implementation Details

### 1. TUN Interface Setup (in TProxyService.kt)

The TUN interface is configured with:
- IP address and routing rules (see `startVPN()` method)
- DNS servers
- MTU settings
- App bypass rules

### 2. hev-socks5-tunnel Integration

The JNI bridge (hev_socks5_tunnel.cpp) handles:
- Starting the tunnel in a separate thread
- Passing the TUN file descriptor to the tunnel
- Configuration file path
- Cleanup and statistics

### 3. SOCKS5 Configuration

The tunnel needs to know:
- The SOCKS5 proxy address and port (typically 127.0.0.1:10808)
- Authentication details if required
- UDP handling mode

## How to Complete the Integration

1. **Obtain hev-socks5-tunnel Library**:
   - Download prebuilt binaries or build from source: https://github.com/heiher/hev-socks5-tunnel
   - Compile for Android target architectures (arm64-v8a, armeabi-v7a, x86, x86_64)

2. **Replace Placeholder Files**:
   - Replace `empty_hev_tunnel.c` with the actual library binary
   - Or link against the prebuilt hev-socks5-tunnel library

3. **Configure Xray**:
   - Ensure Xray is configured with a proper inbound SOCKS5 protocol handler
   - Example minimal configuration:
   ```json
   {
     "inbounds": [
       {
         "port": 10808,
         "protocol": "socks",
         "settings": {
           "udp": true
         }
       }
     ],
     "outbounds": [
       {
         "protocol": "your-protocol",
         "settings": {
           // Your outbound settings
         }
       }
     ]
   }
   ```

4. **Test the VPN**:
   - Start the VPN service
   - Verify connection using external IP checks
   - Test UDP functionality (DNS, video calls, etc.)
   - Check for leaks

## Troubleshooting

1. **DNS Leaks**: Ensure DNS requests are properly routed through the VPN
2. **Connection Issues**: Check logs for errors in the JNI bridge or tunnel
3. **App Bypass Issues**: Verify app selection logic is working correctly

## Advanced Notes

### Performance Considerations

- The MTU should be properly set to avoid fragmentation
- Consider using the `setBlocking(true)` flag for better performance
- The tunnel thread should have priority to avoid packet loss

### Security Notes

- Always verify the integrity of binary libraries
- Consider validating outbound connections
- Keep Xray Core updated to the latest version

### Memory Management

- Watch for memory leaks in the JNI bridge
- The tunnel should release resources properly when stopped
- Monitor tunnel statistics to check for abnormal behavior