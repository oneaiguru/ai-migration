<#
.SYNOPSIS
    Installs and configures Windows Exporter for Prometheus
.DESCRIPTION
    This script downloads and installs the Windows Exporter MSI package,
    configures it with the specified collectors, and opens the necessary firewall port.
.PARAMETER Version
    The version of Windows Exporter to install (default: 0.30.0)
.PARAMETER Port
    The port on which Windows Exporter will listen (default: 9182)
.PARAMETER AllowedIPs
    Comma-separated list of IP addresses or subnets allowed to connect to Windows Exporter
.PARAMETER Collectors
    Comma-separated list of collectors to enable (default: cpu,cs,logical_disk,memory,net,os,thermalzone,system,textfile)
.EXAMPLE
    .\install_windows_exporter.ps1
    Installs Windows Exporter with default settings
.EXAMPLE
    .\install_windows_exporter.ps1 -AllowedIPs "192.168.1.10,10.0.0.0/24"
    Installs Windows Exporter and restricts access to specified IP addresses
.EXAMPLE
    .\install_windows_exporter.ps1 -Collectors "cpu,memory,net,iis,mssql"
    Installs Windows Exporter with custom collectors including IIS and MSSQL
#>

param (
    [string]$Version = "0.30.0",
    [int]$Port = 9182,
    [string]$AllowedIPs = "",
    [string]$Collectors = "cpu,cs,logical_disk,memory,net,os,thermalzone,system,textfile"
)

# Check if script is running as Administrator
$IsAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $IsAdmin) {
    Write-Host "This script must be run as Administrator. Please restart with elevated privileges." -ForegroundColor Red
    exit 1
}

# Define temp directory and MSI path
$TempDir = [System.IO.Path]::GetTempPath()
$MsiPath = Join-Path $TempDir "windows_exporter-$Version-amd64.msi"

Write-Host "Windows Exporter Installation" -ForegroundColor Cyan
Write-Host "===========================" -ForegroundColor Cyan
Write-Host "Version:    $Version"
Write-Host "Port:       $Port"
Write-Host "Collectors: $Collectors"
if ($AllowedIPs) {
    Write-Host "Allowed IPs: $AllowedIPs"
} else {
    Write-Host "Allowed IPs: All (no restriction)"
}
Write-Host "===========================`n" -ForegroundColor Cyan

# Download Windows Exporter
try {
    $ProgressPreference = 'SilentlyContinue'  # Hide progress bar to speed up download
    Write-Host "Downloading Windows Exporter from GitHub..." -ForegroundColor Yellow
    Invoke-WebRequest -Uri "https://github.com/prometheus-community/windows_exporter/releases/download/v$Version/windows_exporter-$Version-amd64.msi" -OutFile $MsiPath
    $ProgressPreference = 'Continue'  # Restore progress bar

    if (Test-Path $MsiPath) {
        Write-Host "Download completed successfully." -ForegroundColor Green
    } else {
        throw "MSI file was not downloaded."
    }
}
catch {
    Write-Host "Error downloading Windows Exporter: $_" -ForegroundColor Red
    exit 1
}

# Check if Windows Exporter is already installed
$InstalledProduct = Get-WmiObject -Class Win32_Product | Where-Object { $_.Name -like "*windows_exporter*" }
if ($InstalledProduct) {
    $InstalledVersion = $InstalledProduct.Version
    Write-Host "Windows Exporter version $InstalledVersion is already installed." -ForegroundColor Yellow

    $Confirmation = Read-Host "Do you want to uninstall it and continue with the installation? (y/n)"
    if ($Confirmation -eq 'y') {
        Write-Host "Uninstalling existing Windows Exporter..." -ForegroundColor Yellow
        Start-Process msiexec.exe -ArgumentList "/x $($InstalledProduct.IdentifyingNumber) /qn" -Wait -NoNewWindow
        Write-Host "Uninstallation completed." -ForegroundColor Green
    } else {
        Write-Host "Installation aborted by user." -ForegroundColor Yellow
        exit 0
    }
}

# Install Windows Exporter
try {
    Write-Host "Installing Windows Exporter..." -ForegroundColor Yellow

    # Prepare arguments
    $Arguments = "/i `"$MsiPath`" ENABLED_COLLECTORS=$Collectors LISTEN_PORT=$Port /qn"

    # Run installer
    $Process = Start-Process msiexec.exe -ArgumentList $Arguments -Wait -NoNewWindow -PassThru

    if ($Process.ExitCode -eq 0) {
        Write-Host "Installation completed successfully." -ForegroundColor Green
    } else {
        throw "MSI installer returned error code: $($Process.ExitCode)"
    }
}
catch {
    Write-Host "Error installing Windows Exporter: $_" -ForegroundColor Red
    exit 1
}

# Wait for service to be registered
Write-Host "Waiting for service to be registered..." -ForegroundColor Yellow
$Attempts = 0
$MaxAttempts = 10
$ServiceFound = $false

while (-not $ServiceFound -and $Attempts -lt $MaxAttempts) {
    $Service = Get-Service windows_exporter -ErrorAction SilentlyContinue
    if ($Service) {
        $ServiceFound = $true
    } else {
        $Attempts++
        Start-Sleep -Seconds 2
    }
}

if (-not $ServiceFound) {
    Write-Host "Warning: Service 'windows_exporter' not found after installation. It might have a different name or failed to install." -ForegroundColor Yellow
}

# Configure service to delay start after reboot to avoid startup issues
try {
    if ($ServiceFound) {
        Write-Host "Configuring service startup delay..." -ForegroundColor Yellow
        $ServiceKey = "HKLM:\SYSTEM\CurrentControlSet\Services\windows_exporter"
        if (Test-Path $ServiceKey) {
            Set-ItemProperty -Path $ServiceKey -Name "DelayedAutostart" -Value 1 -Type DWORD
            Write-Host "Service configured for delayed autostart." -ForegroundColor Green
        }
    }
}
catch {
    Write-Host "Warning: Could not configure service startup delay: $_" -ForegroundColor Yellow
}

# Configure firewall rule
try {
    Write-Host "Configuring firewall rule..." -ForegroundColor Yellow

    # Check if rule exists
    $RuleName = "Windows Exporter ($Port)"
    $ExistingRule = Get-NetFirewallRule -DisplayName $RuleName -ErrorAction SilentlyContinue

    if ($ExistingRule) {
        Write-Host "Updating existing firewall rule..." -ForegroundColor Yellow
        Set-NetFirewallRule -DisplayName $RuleName -Enabled True

        # Update allowed IPs if specified
        if ($AllowedIPs) {
            $RemoteAddresses = $AllowedIPs.Split(',') | ForEach-Object { $_.Trim() }
            Set-NetFirewallRule -DisplayName $RuleName -RemoteAddress $RemoteAddresses
        } else {
            # Reset to any IP if not specified
            Set-NetFirewallRule -DisplayName $RuleName -RemoteAddress Any
        }
    }
    else {
        Write-Host "Creating new firewall rule..." -ForegroundColor Yellow
        $Params = @{
            DisplayName = $RuleName
            Direction = "Inbound"
            Action = "Allow"
            Protocol = "TCP"
            LocalPort = $Port
            Program = "C:\Program Files\windows_exporter\windows_exporter.exe"
            Enabled = $true
        }

        # Add allowed IPs if specified
        if ($AllowedIPs) {
            $RemoteAddresses = $AllowedIPs.Split(',') | ForEach-Object { $_.Trim() }
            $Params.Add("RemoteAddress", $RemoteAddresses)
        }

        New-NetFirewallRule @Params | Out-Null
    }

    Write-Host "Firewall rule configured successfully." -ForegroundColor Green
}
catch {
    Write-Host "Error configuring firewall: $_" -ForegroundColor Red
    # Continue execution as this is not critical
}

# Verify installation
try {
    Write-Host "Verifying installation..." -ForegroundColor Yellow
    $Service = Get-Service windows_exporter -ErrorAction SilentlyContinue

    if ($Service -and $Service.Status -eq "Running") {
        Write-Host "Windows Exporter is installed and running on port $Port." -ForegroundColor Green
    }
    else {
        Write-Host "Windows Exporter service is not running. Attempting to start..." -ForegroundColor Yellow
        Start-Service windows_exporter -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 3

        $Service = Get-Service windows_exporter -ErrorAction SilentlyContinue
        if ($Service -and $Service.Status -eq "Running") {
            Write-Host "Windows Exporter is now running on port $Port." -ForegroundColor Green
        }
        else {
            Write-Host "Failed to start Windows Exporter service." -ForegroundColor Red
            Write-Host "You may need to restart your computer and check the service status again." -ForegroundColor Yellow
        }
    }

    # Test endpoint if service is running
    if ($Service -and $Service.Status -eq "Running") {
        # Test if endpoint is responding
        try {
            $StatusCode = Invoke-WebRequest -Uri "http://localhost:$Port/metrics" -Method Head -UseBasicParsing -TimeoutSec 5 | Select-Object -ExpandProperty StatusCode
            if ($StatusCode -eq 200) {
                Write-Host "Metrics endpoint is accessible at: http://localhost:$Port/metrics" -ForegroundColor Green
            }
        }
        catch {
            Write-Host "Warning: Could not access metrics endpoint. Firewall or other network settings might be blocking access." -ForegroundColor Yellow
        }
    }
}
catch {
    Write-Host "Error verifying installation: $_" -ForegroundColor Red
}

# Clean up
Remove-Item $MsiPath -Force -ErrorAction SilentlyContinue

# Display collectors information
Write-Host "`nEnabled collectors:" -ForegroundColor Cyan
$CollectorsList = $Collectors.Split(',')
foreach ($Collector in $CollectorsList) {
    Write-Host "- $Collector"
}

# Print summary
Write-Host "`nInstallation Summary:" -ForegroundColor Cyan
Write-Host "=====================" -ForegroundColor Cyan
Write-Host "Windows Exporter version: $Version"
Write-Host "Listening on: http://$(hostname):$Port/metrics"
Write-Host "Service name: windows_exporter"
Write-Host "Firewall rule: $RuleName"
if ($AllowedIPs) {
    Write-Host "Access restricted to: $AllowedIPs"
} else {
    Write-Host "Access allowed from: Any IP"
}
Write-Host "`nInstallation completed." -ForegroundColor Green

# Prompt for testing
$TestMetrics = Read-Host "Do you want to view a sample of the metrics? (y/n)"
if ($TestMetrics -eq 'y') {
    try {
        $Metrics = Invoke-WebRequest -Uri "http://localhost:$Port/metrics" -UseBasicParsing | Select-Object -ExpandProperty Content
        $SampleLines = $Metrics -split "`n" | Select-Object -First 20
        Write-Host "`nSample metrics (first 20 lines):" -ForegroundColor Cyan
        Write-Host "----------------------------" -ForegroundColor Cyan
        $SampleLines
        Write-Host "----------------------------" -ForegroundColor Cyan
        Write-Host "[...] Additional metrics available at http://localhost:$Port/metrics" -ForegroundColor Cyan
    }
    catch {
        Write-Host "Could not retrieve metrics: $_" -ForegroundColor Red
    }
}

# Explain Prometheus Agent mode setup
Write-Host "`nPrometheus Agent Mode (for high-scale deployments):" -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Cyan
Write-Host "If you have thousands of Windows hosts, consider using Prometheus Agent mode"
Write-Host "to forward metrics directly to Cortex and reduce central Prometheus load."
Write-Host "Download Prometheus (v2.52.0+), then run with:"
Write-Host "prometheus.exe --config.file=agent.yml --enable-feature=agent"
Write-Host "`nExample agent.yml:" -ForegroundColor Yellow
Write-Host "----------------"
Write-Host "scrape_configs:"
Write-Host "  - job_name: 'windows'"
Write-Host "    static_configs:"
Write-Host "      - targets: ['localhost:$Port']"
Write-Host "remote_write:"
Write-Host "  - url: 'http://your-cortex-distributor:9009/api/v1/push'"
Write-Host "    basic_auth:"
Write-Host "      username_file: 'cortex_user.txt'"
Write-Host "      password_file: 'cortex_password.txt'"
Write-Host "----------------"
