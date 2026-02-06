# FleetPulse - Complete SaaS Product Specification

## 1. PRODUCT DEFINITION

**Product Name:** FleetPulse

**One-line Pitch:** Real-time fleet infrastructure monitoring for carsharing, rental, and delivery companies—deployed in 5 minutes, not 5 weeks.

**Target Customer Persona:**
- **Primary:** Fleet Operations Manager at carsharing/vehicle rental company (50-500 vehicles)
- **Secondary:** CTO/DevOps lead at delivery/logistics startup
- **Pain Points:** Expensive enterprise monitoring tools, complex Prometheus setup, no fleet-specific dashboards, alert fatigue
- **Budget:** $500-2000/month for monitoring infrastructure
- **Technical Level:** Can SSH into servers but doesn't want to maintain Prometheus/Grafana

**Core Value Proposition:**
Turn your existing vehicle telematics data into actionable fleet health insights. Pre-built dashboards for vehicle uptime, OBD-II metrics, charging station status, and driver behavior—with intelligent alerting that reduces false alarms by 80%.

**3 Competitor Examples:**
1. **Samsara** - Enterprise fleet management ($30+/vehicle/month, overkill for small fleets)
2. **Geotab** - Hardware-focused, requires their devices
3. **Datadog** - Generic monitoring, no fleet-specific features, expensive at scale

---

## 2. FEATURE MATRIX

| Feature | Priority | Complexity | Existing Code Covers? | Build Effort |
|---------|----------|------------|----------------------|--------------|
| User authentication & multi-tenancy | P0 | High | No | 8 hours |
| Dashboard: Fleet Overview | P0 | Medium | Partial (Grafana) | 4 hours |
| Dashboard: Vehicle Health | P0 | Medium | No | 6 hours |
| Dashboard: Charging Stations | P0 | Medium | No | 4 hours |
| Alert Rules: Vehicle Offline | P0 | Low | Yes (prometheus-rules.yml) | 1 hour |
| Alert Rules: Battery Critical | P0 | Low | Partial | 2 hours |
| Alert Rules: Maintenance Due | P1 | Medium | No | 3 hours |
| Notification Channels (Email/Slack/Telegram) | P0 | Low | Yes (alertmanager.yml) | 1 hour |
| Host Agent Installer (Linux/Windows) | P0 | Low | Yes (install scripts) | 2 hours |
| API: Add/Remove Vehicles | P1 | Medium | Partial (add_hosts.sh) | 4 hours |
| Pricing Page with 3 Tiers | P0 | Low | No | 3 hours |
| Mock Payment/Subscription Flow | P0 | Medium | No | 4 hours |
| Onboarding Wizard | P1 | Medium | No | 5 hours |
| Custom Alert Rules Builder | P2 | High | No | 8 hours |
| Report Generation (PDF) | P2 | Medium | No | 6 hours |
| Mobile-responsive Dashboard | P1 | Medium | Partial | 4 hours |
| SSO/SAML Integration | P3 | High | No | Not in MVP |
| White-label Option | P3 | High | No | Not in MVP |

---

## 3. USER JOURNEYS

### Journey 1: New User Signup → First Vehicle Monitored

```
STEP 1: Landing Page
- User sees hero: "Monitor Your Fleet in 5 Minutes"
- Clicks "Start Free Trial" button

STEP 2: Signup Form
- Email, Password, Company Name
- Fleet Size dropdown (1-50, 51-200, 201-500, 500+)
- Click "Create Account"

STEP 3: Email Verification
- Check email, click verification link
- Redirected to onboarding

STEP 4: Onboarding Step 1 - Company Profile
- Company name (pre-filled)
- Industry: Carsharing / Rental / Delivery / Other
- Timezone selection
- Click "Next"

STEP 5: Onboarding Step 2 - Add First Vehicle
- Option A: "Install Agent on Vehicle Computer"
  - Shows curl command for Linux or PowerShell for Windows
  - Agent auto-registers with unique vehicle ID
- Option B: "Add Manually"
  - Enter IP address and port
- Shows "Waiting for connection..." spinner
- Success: "Vehicle connected!"

STEP 6: Onboarding Step 3 - Configure Alerts
- Pre-selected defaults:
  ☑ Vehicle offline > 5 minutes
  ☑ Battery below 20%
  ☑ CPU temperature > 80°C
- Add notification email (pre-filled with signup email)
- Click "Finish Setup"

STEP 7: Dashboard
- Redirected to Fleet Overview dashboard
- Shows 1 vehicle with green status
- Confetti animation + "Your fleet is now being monitored!"
```

### Journey 2: Daily Monitoring Check

```
STEP 1: Login
- Enter email/password
- Redirected to Fleet Overview

STEP 2: Fleet Overview Dashboard
- See grid of all vehicles with status indicators
- Green = Online, Yellow = Warning, Red = Critical
- Click on specific vehicle card

STEP 3: Vehicle Detail Page
- Live metrics: CPU, Memory, Disk, Network
- OBD-II section: Battery voltage, mileage, engine temp
- Last 24h uptime graph
- Recent alerts for this vehicle

STEP 4: Check Alerts
- Click "Alerts" in sidebar
- See list of recent alerts with severity
- Click to acknowledge/resolve
```

### Journey 3: Upgrade to Paid Plan

```
STEP 1: Hit Limit
- Toast notification: "You've reached 10 vehicles on Free tier"
- Click "Upgrade Now"

STEP 2: Pricing Page
- See 3 tiers: Starter, Professional, Enterprise
- Current plan highlighted
- Click "Choose Professional"

STEP 3: Checkout
- Billing details form
- Credit card input (mocked)
- Click "Subscribe - $99/month"

STEP 4: Confirmation
- "Payment successful!" screen
- "Your plan is now Professional"
- Redirected to dashboard with expanded limits
```

---

## 4. FULL PAGE-BY-PAGE SPECIFICATION

### PAGE: Landing Page
```
URL: /
PURPOSE: Convert visitors to signups

COMPONENTS:
- Header:
  - Logo (left): "FleetPulse" with pulse icon
  - Nav links (center): Features, Pricing, Docs
  - CTA buttons (right): "Login" (ghost), "Start Free Trial" (primary)

- Hero Section:
  - Headline: "Fleet Monitoring That Actually Works"
  - Subheadline: "Real-time visibility into every vehicle. Set up in 5 minutes."
  - CTA: "Start Free Trial - No Credit Card Required"
  - Hero image: Dashboard screenshot with vehicle grid

- Social Proof Bar:
  - "Trusted by 50+ fleet operators"
  - Logos: [Mock logos for carsharing companies]

- Features Grid (3 columns):
  1. "Real-Time Monitoring" - Icon: pulse
     "Know instantly when a vehicle goes offline or needs attention"
  2. "Smart Alerts" - Icon: bell
     "Reduce alert fatigue with intelligent grouping and escalation"
  3. "Fleet Dashboards" - Icon: chart
     "Pre-built views for fleet health, utilization, and maintenance"

- Pricing Preview:
  - "Starting at $0/month for up to 10 vehicles"
  - "View Pricing" link

- Footer:
  - Links: Privacy, Terms, Contact, Status
  - © 2026 FleetPulse

STATES:
- Default: As described
- Mobile: Hamburger menu, stacked sections

API CALLS: None
```

### PAGE: Signup
```
URL: /signup
PURPOSE: Create new account

COMPONENTS:
- Header: Logo only (centered)

- Signup Card (centered):
  - Title: "Create your FleetPulse account"
  - Form fields:
    - Email (required, email validation)
    - Password (required, min 8 chars, show/hide toggle)
    - Company Name (required)
    - Fleet Size (dropdown): "1-10", "11-50", "51-200", "201-500", "500+"
  - Checkbox: "I agree to Terms and Privacy Policy"
  - Button: "Create Account" (primary, full-width)
  - Divider: "or"
  - "Already have an account? Log in"

- Footer: Minimal (Privacy, Terms links)

STATES:
- Default: Empty form
- Validating: Button shows spinner
- Error: Red border on invalid fields, error message below
- Success: Redirect to /verify-email

API CALLS:
- POST /api/auth/signup
```

### PAGE: Login
```
URL: /login
PURPOSE: Authenticate existing users

COMPONENTS:
- Header: Logo only (centered)

- Login Card (centered):
  - Title: "Welcome back"
  - Form fields:
    - Email (required)
    - Password (required, show/hide toggle)
  - "Forgot password?" link
  - Button: "Log In" (primary, full-width)
  - Divider: "or"
  - "Don't have an account? Sign up"

STATES:
- Default: Empty form
- Loading: Button spinner
- Error: "Invalid email or password" message
- Success: Redirect to /dashboard

API CALLS:
- POST /api/auth/login
```

### PAGE: Dashboard - Fleet Overview
```
URL: /dashboard
PURPOSE: Show all vehicles at a glance

COMPONENTS:
- Sidebar (left, 240px):
  - Logo at top
  - Nav items:
    - Fleet Overview (active)
    - Vehicles
    - Charging Stations
    - Alerts
    - Settings
  - Bottom: User avatar + dropdown (Profile, Logout)
  - Plan badge: "Free - 3/10 vehicles"

- Top Bar:
  - Page title: "Fleet Overview"
  - Time range selector: "Last 24h" dropdown
  - Refresh button
  - "Add Vehicle" button (primary)

- Stats Row (4 cards):
  - Total Vehicles: 47
  - Online: 45 (green)
  - Warnings: 2 (yellow)
  - Critical: 0 (red)

- Vehicle Grid:
  - Cards in 4-column grid
  - Each card shows:
    - Vehicle ID/Name
    - Status indicator (colored dot)
    - Mini sparkline (last 1h CPU)
    - Last seen: "2 min ago"
  - Click to go to vehicle detail

- Map View Toggle:
  - Switch between Grid and Map view
  - Map shows vehicle locations (mocked pins)

STATES:
- Loading: Skeleton cards
- Empty: "No vehicles yet. Add your first vehicle."
- Error: "Failed to load fleet data. Retry."

API CALLS:
- GET /api/vehicles
- GET /api/metrics/summary
```

### PAGE: Vehicle Detail
```
URL: /dashboard/vehicles/:id
PURPOSE: Deep dive into single vehicle metrics

COMPONENTS:
- Sidebar: Same as Fleet Overview

- Top Bar:
  - Breadcrumb: "Fleet Overview > Vehicle ABC-123"
  - Status badge: "Online" (green)
  - Actions: "Edit", "Remove", "Silence Alerts"

- Info Card:
  - Vehicle ID: ABC-123
  - IP Address: 192.168.1.50
  - Agent Version: 1.2.0
  - Last Boot: 2026-01-20 08:30

- Metrics Grid (2x3):
  - CPU Usage: Gauge + sparkline
  - Memory Usage: Gauge + sparkline
  - Disk Usage: Bar chart
  - Network I/O: Line chart
  - Battery Voltage: Single stat (12.4V)
  - Uptime: "5 days, 3 hours"

- OBD-II Section (if available):
  - Mileage: 45,230 km
  - Engine Temp: 85°C
  - Fuel Level: 65%
  - Error Codes: None

- Recent Alerts Table:
  - Columns: Time, Alert, Severity, Status
  - Last 10 alerts for this vehicle

STATES:
- Loading: Skeleton
- Offline: Banner "Vehicle offline since [time]"
- No OBD data: Section hidden

API CALLS:
- GET /api/vehicles/:id
- GET /api/vehicles/:id/metrics?range=24h
- GET /api/vehicles/:id/alerts?limit=10
```

### PAGE: Alerts
```
URL: /dashboard/alerts
PURPOSE: View and manage all alerts

COMPONENTS:
- Sidebar: Same

- Top Bar:
  - Title: "Alerts"
  - Filters: Status (All/Firing/Resolved), Severity (All/Critical/Warning)
  - "Alert Rules" button (secondary)

- Alerts Table:
  - Columns: Status, Severity, Alert Name, Vehicle, Triggered, Duration, Actions
  - Status: Firing (red) / Resolved (green)
  - Actions: Acknowledge, Silence

- Pagination: 25 per page

STATES:
- Loading: Table skeleton
- Empty: "No alerts. Your fleet is healthy!"
- Filtered empty: "No alerts match your filters"

API CALLS:
- GET /api/alerts?status=&severity=&page=
- POST /api/alerts/:id/acknowledge
```

### PAGE: Alert Rules
```
URL: /dashboard/alerts/rules
PURPOSE: Configure alerting thresholds

COMPONENTS:
- Sidebar: Same

- Top Bar:
  - Title: "Alert Rules"
  - "Create Rule" button (primary)

- Rules Table:
  - Columns: Rule Name, Condition, Severity, Status, Actions
  - Example: "Vehicle Offline | up == 0 for 5m | Critical | Enabled"
  - Actions: Edit, Disable, Delete

- Default Rules Section:
  - Pre-configured rules (read-only, can only enable/disable)
  - "Vehicle Offline", "High CPU", "Low Disk", "Battery Critical"

STATES:
- Loading: Skeleton
- Empty: Should never be empty (defaults exist)

API CALLS:
- GET /api/alert-rules
- PUT /api/alert-rules/:id
- DELETE /api/alert-rules/:id
```

### PAGE: Settings
```
URL: /dashboard/settings
PURPOSE: Account and notification settings

COMPONENTS:
- Sidebar: Same

- Tabs:
  - Profile
  - Notifications
  - Team (disabled on Free)
  - Billing

- Profile Tab:
  - Company Name (editable)
  - Email (read-only)
  - Timezone dropdown
  - "Save Changes" button

- Notifications Tab:
  - Email Notifications: Toggle + email list
  - Slack Integration: "Connect Slack" button
  - Telegram: Bot token input
  - Webhook URL: Custom URL input

- Billing Tab:
  - Current Plan: "Free (3/10 vehicles)"
  - "Upgrade Plan" button
  - Invoice history table (empty for free)

STATES:
- Default: Current values loaded
- Saving: Button spinner
- Saved: Success toast

API CALLS:
- GET /api/settings
- PUT /api/settings
- POST /api/integrations/slack
```

### PAGE: Pricing
```
URL: /pricing
PURPOSE: Show plans and convert to paid

COMPONENTS:
- Header: Same as landing

- Pricing Grid (3 columns):
  
  STARTER (Free):
  - $0/month
  - Up to 10 vehicles
  - 7-day data retention
  - Email alerts only
  - Community support
  - [Current Plan] or [Get Started]

  PROFESSIONAL:
  - $99/month
  - Up to 100 vehicles
  - 30-day data retention
  - Email + Slack + Telegram
  - Custom alert rules
  - Priority support
  - [Choose Professional]

  ENTERPRISE:
  - $299/month
  - Unlimited vehicles
  - 90-day data retention
  - All integrations
  - API access
  - SSO/SAML
  - Dedicated support
  - [Choose Enterprise]

- FAQ Section:
  - "Can I change plans anytime?"
  - "What happens if I exceed my vehicle limit?"
  - "Do you offer annual billing?"

- Footer: Same as landing

STATES:
- Logged out: All CTAs say "Start Free Trial"
- Logged in: Current plan highlighted, CTAs change

API CALLS: None (static page)
```

### PAGE: Checkout
```
URL: /checkout/:plan
PURPOSE: Mock payment flow

COMPONENTS:
- Header: Logo only

- Checkout Card:
  - Plan summary: "Professional Plan - $99/month"
  - Billing form:
    - Name on card
    - Card number (fake input, accepts any 16 digits)
    - Expiry (MM/YY)
    - CVC (3 digits)
  - Billing address:
    - Country dropdown
    - ZIP code
  - Order summary:
    - Professional Plan: $99.00
    - Tax: $0.00
    - Total: $99.00/month
  - "Subscribe Now" button

STATES:
- Default: Empty form
- Processing: Button spinner, "Processing payment..."
- Success: Redirect to /checkout/success
- Error: "Payment failed" (never shown in mock)

API CALLS:
- POST /api/subscriptions (mocked, always succeeds)
```

### PAGE: Checkout Success
```
URL: /checkout/success
PURPOSE: Confirm subscription

COMPONENTS:
- Success Card (centered):
  - Checkmark icon (green, animated)
  - "Payment Successful!"
  - "Your Professional plan is now active."
  - Plan details:
    - Up to 100 vehicles
    - 30-day data retention
    - All notification channels
  - "Go to Dashboard" button (primary)

STATES: Single state

API CALLS: None
```

### PAGE: Add Vehicle
```
URL: /dashboard/vehicles/add
PURPOSE: Register new vehicle for monitoring

COMPONENTS:
- Modal or full page:
  
  - Title: "Add a Vehicle"
  
  - Tab 1: Install Agent (default)
    - Instructions:
      "Run this command on your vehicle's computer:"
    - Code block (Linux):
      curl -sSL https://fleetpulse.local/install.sh | sudo bash -s -- --token=abc123
    - Code block (Windows):
      irm https://fleetpulse.local/install.ps1 | iex -Token abc123
    - "Waiting for connection..." with spinner
    - On connect: "Vehicle connected!" with vehicle ID

  - Tab 2: Manual Entry
    - Vehicle Name/ID (optional)
    - IP Address (required)
    - Port (default: 9100)
    - "Test Connection" button
    - "Add Vehicle" button

STATES:
- Default: Install tab shown
- Waiting: Spinner while polling for new agents
- Connected: Success message, auto-redirect in 3s
- Error: "Could not connect to vehicle"

API CALLS:
- POST /api/vehicles
- GET /api/vehicles/pending (polling)
```

---

## 5. COMPLETE API SPECIFICATION

### Authentication

```
ENDPOINT: POST /api/auth/signup
PURPOSE: Create new user account
REQUEST BODY:
{
  "email": "user@company.com",
  "password": "securepass123",
  "companyName": "FastCars Inc",
  "fleetSize": "51-200"
}
RESPONSE (201):
{
  "success": true,
  "message": "Verification email sent",
  "userId": "usr_abc123"
}
ERRORS:
- 400: { "error": "Email already registered" }
- 400: { "error": "Password too weak" }
MOCK BEHAVIOR: Always succeeds, stores in SQLite
```

```
ENDPOINT: POST /api/auth/login
PURPOSE: Authenticate user
REQUEST BODY:
{
  "email": "user@company.com",
  "password": "securepass123"
}
RESPONSE (200):
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": "usr_abc123",
    "email": "user@company.com",
    "companyName": "FastCars Inc",
    "plan": "free",
    "vehicleLimit": 10
  }
}
ERRORS:
- 401: { "error": "Invalid credentials" }
MOCK BEHAVIOR: Check against SQLite users table
```

```
ENDPOINT: POST /api/auth/logout
PURPOSE: Invalidate session
REQUEST BODY: None
RESPONSE (200):
{
  "success": true
}
MOCK BEHAVIOR: Clear session cookie
```

### Vehicles

```
ENDPOINT: GET /api/vehicles
PURPOSE: List all vehicles for tenant
REQUEST HEADERS: Authorization: Bearer <token>
QUERY PARAMS:
- status: "online" | "offline" | "warning" | "critical"
- page: number (default 1)
- limit: number (default 50)
RESPONSE (200):
{
  "vehicles": [
    {
      "id": "veh_001",
      "name": "ABC-123",
      "ipAddress": "192.168.1.50",
      "port": 9100,
      "status": "online",
      "lastSeen": "2026-01-22T10:30:00Z",
      "metrics": {
        "cpu": 45.2,
        "memory": 62.1,
        "disk": 34.5
      }
    }
  ],
  "total": 47,
  "page": 1,
  "limit": 50
}
ERRORS:
- 401: Unauthorized
MOCK BEHAVIOR: Return seeded vehicles from SQLite
```

```
ENDPOINT: POST /api/vehicles
PURPOSE: Add new vehicle
REQUEST BODY:
{
  "name": "ABC-123",
  "ipAddress": "192.168.1.50",
  "port": 9100
}
RESPONSE (201):
{
  "success": true,
  "vehicle": {
    "id": "veh_047",
    "name": "ABC-123",
    "ipAddress": "192.168.1.50",
    "port": 9100,
    "status": "pending",
    "agentToken": "agt_xyz789"
  }
}
ERRORS:
- 400: { "error": "Vehicle limit reached" }
- 400: { "error": "IP address already registered" }
MOCK BEHAVIOR: Insert into SQLite, check limits
```

```
ENDPOINT: GET /api/vehicles/:id
PURPOSE: Get single vehicle details
RESPONSE (200):
{
  "id": "veh_001",
  "name": "ABC-123",
  "ipAddress": "192.168.1.50",
  "port": 9100,
  "status": "online",
  "lastSeen": "2026-01-22T10:30:00Z",
  "agentVersion": "1.2.0",
  "lastBoot": "2026-01-20T08:30:00Z",
  "obd": {
    "mileage": 45230,
    "engineTemp": 85,
    "fuelLevel": 65,
    "batteryVoltage": 12.4,
    "errorCodes": []
  }
}
ERRORS:
- 404: { "error": "Vehicle not found" }
```

```
ENDPOINT: GET /api/vehicles/:id/metrics
PURPOSE: Get time-series metrics for vehicle
QUERY PARAMS:
- range: "1h" | "6h" | "24h" | "7d" | "30d"
- metrics: "cpu,memory,disk,network" (comma-separated)
RESPONSE (200):
{
  "vehicleId": "veh_001",
  "range": "24h",
  "data": {
    "cpu": [
      { "timestamp": "2026-01-21T10:00:00Z", "value": 42.3 },
      { "timestamp": "2026-01-21T11:00:00Z", "value": 45.1 }
    ],
    "memory": [...],
    "disk": [...],
    "network": [...]
  }
}
MOCK BEHAVIOR: Generate random realistic data points
```

```
ENDPOINT: DELETE /api/vehicles/:id
PURPOSE: Remove vehicle from monitoring
RESPONSE (200):
{
  "success": true,
  "message": "Vehicle removed"
}
ERRORS:
- 404: Vehicle not found
```

### Alerts

```
ENDPOINT: GET /api/alerts
PURPOSE: List alerts
QUERY PARAMS:
- status: "firing" | "resolved" | "all"
- severity: "critical" | "warning" | "all"
- vehicleId: optional filter
- page, limit
RESPONSE (200):
{
  "alerts": [
    {
      "id": "alt_001",
      "name": "HighCpuLoad",
      "vehicleId": "veh_001",
      "vehicleName": "ABC-123",
      "severity": "warning",
      "status": "firing",
      "message": "CPU usage above 80% for 10 minutes",
      "triggeredAt": "2026-01-22T09:45:00Z",
      "acknowledgedAt": null,
      "resolvedAt": null
    }
  ],
  "total": 5
}
```

```
ENDPOINT: POST /api/alerts/:id/acknowledge
PURPOSE: Acknowledge alert
REQUEST BODY:
{
  "note": "Looking into it"
}
RESPONSE (200):
{
  "success": true,
  "acknowledgedAt": "2026-01-22T10:00:00Z"
}
```

```
ENDPOINT: GET /api/alert-rules
PURPOSE: List configured alert rules
RESPONSE (200):
{
  "rules": [
    {
      "id": "rule_001",
      "name": "Vehicle Offline",
      "expression": "up == 0",
      "duration": "5m",
      "severity": "critical",
      "enabled": true,
      "isDefault": true
    },
    {
      "id": "rule_002",
      "name": "High CPU Load",
      "expression": "cpu_usage > 80",
      "duration": "10m",
      "severity": "warning",
      "enabled": true,
      "isDefault": true
    }
  ]
}
```

```
ENDPOINT: PUT /api/alert-rules/:id
PURPOSE: Update alert rule
REQUEST BODY:
{
  "enabled": false
}
RESPONSE (200):
{
  "success": true,
  "rule": { ... }
}
```

### Settings

```
ENDPOINT: GET /api/settings
PURPOSE: Get user/org settings
RESPONSE (200):
{
  "company": {
    "name": "FastCars Inc",
    "timezone": "America/New_York"
  },
  "notifications": {
    "email": {
      "enabled": true,
      "addresses": ["ops@fastcars.com"]
    },
    "slack": {
      "enabled": false,
      "webhookUrl": null
    },
    "telegram": {
      "enabled": false,
      "botToken": null,
      "chatId": null
    }
  }
}
```

```
ENDPOINT: PUT /api/settings
PURPOSE: Update settings
REQUEST BODY:
{
  "company": {
    "name": "FastCars Inc",
    "timezone": "Europe/Berlin"
  },
  "notifications": {
    "email": {
      "enabled": true,
      "addresses": ["ops@fastcars.com", "alerts@fastcars.com"]
    }
  }
}
RESPONSE (200):
{
  "success": true
}
```

### Subscriptions

```
ENDPOINT: GET /api/subscription
PURPOSE: Get current subscription status
RESPONSE (200):
{
  "plan": "free",
  "vehicleLimit": 10,
  "vehicleCount": 3,
  "dataRetentionDays": 7,
  "features": ["email_alerts"],
  "billingCycle": null,
  "nextBillingDate": null
}
```

```
ENDPOINT: POST /api/subscription
PURPOSE: Create/upgrade subscription (mocked)
REQUEST BODY:
{
  "plan": "professional",
  "paymentMethod": {
    "cardNumber": "4111111111111111",
    "expiry": "12/28",
    "cvc": "123"
  }
}
RESPONSE (200):
{
  "success": true,
  "plan": "professional",
  "vehicleLimit": 100,
  "message": "Subscription activated"
}
MOCK BEHAVIOR: Always succeeds, updates user plan in SQLite
```

### Metrics Summary

```
ENDPOINT: GET /api/metrics/summary
PURPOSE: Get fleet-wide metrics summary
RESPONSE (200):
{
  "totalVehicles": 47,
  "online": 45,
  "offline": 0,
  "warning": 2,
  "critical": 0,
  "avgCpu": 38.5,
  "avgMemory": 52.3,
  "avgDisk": 41.2,
  "alertsToday": 3
}
```

---

## 6. DATABASE SCHEMA

```sql
-- SQLite Schema for FleetPulse

-- Users table
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    company_name TEXT NOT NULL,
    fleet_size TEXT,
    timezone TEXT DEFAULT 'UTC',
    plan TEXT DEFAULT 'free',
    vehicle_limit INTEGER DEFAULT 10,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    email_verified BOOLEAN DEFAULT 0
);

-- Sessions table
CREATE TABLE sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    token TEXT UNIQUE NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Vehicles table
CREATE TABLE vehicles (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT,
    ip_address TEXT NOT NULL,
    port INTEGER DEFAULT 9100,
    agent_token TEXT UNIQUE,
    status TEXT DEFAULT 'pending',
    last_seen DATETIME,
    agent_version TEXT,
    last_boot DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE(user_id, ip_address, port)
);

-- Vehicle metrics (time-series, simplified)
CREATE TABLE vehicle_metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    vehicle_id TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    cpu_usage REAL,
    memory_usage REAL,
    disk_usage REAL,
    network_in REAL,
    network_out REAL,
    battery_voltage REAL,
    engine_temp REAL,
    mileage INTEGER,
    fuel_level REAL,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
);

-- Create index for metrics queries
CREATE INDEX idx_vehicle_metrics_lookup 
ON vehicle_metrics(vehicle_id, timestamp DESC);

-- Alert rules table
CREATE TABLE alert_rules (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    expression TEXT NOT NULL,
    duration TEXT DEFAULT '5m',
    severity TEXT DEFAULT 'warning',
    enabled BOOLEAN DEFAULT 1,
    is_default BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Alerts table
CREATE TABLE alerts (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    vehicle_id TEXT NOT NULL,
    rule_id TEXT,
    name TEXT NOT NULL,
    severity TEXT NOT NULL,
    status TEXT DEFAULT 'firing',
    message TEXT,
    triggered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    acknowledged_at DATETIME,
    acknowledged_by TEXT,
    acknowledged_note TEXT,
    resolved_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id),
    FOREIGN KEY (rule_id) REFERENCES alert_rules(id)
);

-- Notification settings table
CREATE TABLE notification_settings (
    id TEXT PRIMARY KEY,
    user_id TEXT UNIQUE NOT NULL,
    email_enabled BOOLEAN DEFAULT 1,
    email_addresses TEXT,  -- JSON array
    slack_enabled BOOLEAN DEFAULT 0,
    slack_webhook_url TEXT,
    telegram_enabled BOOLEAN DEFAULT 0,
    telegram_bot_token TEXT,
    telegram_chat_id TEXT,
    webhook_enabled BOOLEAN DEFAULT 0,
    webhook_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Subscriptions table
CREATE TABLE subscriptions (
    id TEXT PRIMARY KEY,
    user_id TEXT UNIQUE NOT NULL,
    plan TEXT DEFAULT 'free',
    status TEXT DEFAULT 'active',
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Audit log for tracking changes
CREATE TABLE audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT,
    action TEXT NOT NULL,
    entity_type TEXT,
    entity_id TEXT,
    details TEXT,  -- JSON
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## 7. MOCK DATA STRATEGY

### Seed Data Script

```javascript
// seed.js - Run on startup to populate demo data

const DEMO_VEHICLES = [
  { name: 'CAR-001', status: 'online', cpu: 35, memory: 45, disk: 28 },
  { name: 'CAR-002', status: 'online', cpu: 42, memory: 58, disk: 31 },
  { name: 'CAR-003', status: 'online', cpu: 28, memory: 41, disk: 22 },
  { name: 'CAR-004', status: 'warning', cpu: 82, memory: 75, disk: 45 },
  { name: 'CAR-005', status: 'online', cpu: 15, memory: 32, disk: 19 },
  { name: 'VAN-001', status: 'online', cpu: 55, memory: 62, disk: 38 },
  { name: 'VAN-002', status: 'offline', cpu: 0, memory: 0, disk: 0 },
  { name: 'BIKE-001', status: 'online', cpu: 12, memory: 25, disk: 15 },
  { name: 'SCOOT-001', status: 'online', cpu: 8, memory: 18, disk: 12 },
  { name: 'SCOOT-002', status: 'warning', cpu: 5, memory: 92, disk: 88 },
];

const DEMO_ALERTS = [
  { vehicle: 'CAR-004', name: 'HighCpuLoad', severity: 'warning', status: 'firing' },
  { vehicle: 'VAN-002', name: 'VehicleOffline', severity: 'critical', status: 'firing' },
  { vehicle: 'SCOOT-002', name: 'LowDiskSpace', severity: 'warning', status: 'firing' },
  { vehicle: 'CAR-001', name: 'HighMemoryUsage', severity: 'warning', status: 'resolved' },
];

const DEFAULT_ALERT_RULES = [
  { name: 'Vehicle Offline', expression: 'up == 0', duration: '5m', severity: 'critical', isDefault: true },
  { name: 'High CPU Load', expression: 'cpu_usage > 80', duration: '10m', severity: 'warning', isDefault: true },
  { name: 'High Memory Usage', expression: 'memory_usage > 85', duration: '10m', severity: 'warning', isDefault: true },
  { name: 'Low Disk Space', expression: 'disk_usage > 90', duration: '5m', severity: 'warning', isDefault: true },
  { name: 'Battery Critical', expression: 'battery_voltage < 11.5', duration: '5m', severity: 'critical', isDefault: true },
];
```

### Demo User Account

```
Email: demo@fleetpulse.local
Password: demo123
Company: Demo Fleet Co
Plan: professional (for demo purposes)
Vehicles: 10 pre-seeded
```

### Metric Generation

```javascript
// Generate realistic time-series data
function generateMetricHistory(hours = 24) {
  const data = [];
  const now = Date.now();
  const baseValue = 30 + Math.random() * 30; // 30-60 base
  
  for (let i = hours * 4; i >= 0; i--) { // 15-min intervals
    const timestamp = new Date(now - i * 15 * 60 * 1000);
    const noise = (Math.random() - 0.5) * 20;
    const timeOfDay = timestamp.getHours();
    const dayFactor = timeOfDay >= 8 && timeOfDay <= 18 ? 1.3 : 0.7;
    
    data.push({
      timestamp: timestamp.toISOString(),
      value: Math.max(0, Math.min(100, baseValue * dayFactor + noise))
    });
  }
  return data;
}
```

---

## 8. UI/UX SPECIFICATIONS

### Color Scheme

```css
:root {
  /* Primary */
  --primary-500: #3B82F6;  /* Blue - main actions */
  --primary-600: #2563EB;  /* Blue - hover */
  --primary-100: #DBEAFE;  /* Blue - backgrounds */
  
  /* Status Colors */
  --success-500: #22C55E;  /* Green - online/healthy */
  --success-100: #DCFCE7;
  --warning-500: #F59E0B;  /* Amber - warnings */
  --warning-100: #FEF3C7;
  --error-500: #EF4444;    /* Red - critical/errors */
  --error-100: #FEE2E2;
  
  /* Neutrals */
  --gray-900: #111827;     /* Text primary */
  --gray-700: #374151;     /* Text secondary */
  --gray-500: #6B7280;     /* Text muted */
  --gray-300: #D1D5DB;     /* Borders */
  --gray-100: #F3F4F6;     /* Backgrounds */
  --gray-50: #F9FAFB;      /* Page background */
  --white: #FFFFFF;
  
  /* Semantic */
  --sidebar-bg: #1F2937;   /* Dark gray sidebar */
  --sidebar-text: #E5E7EB;
  --card-shadow: 0 1px 3px rgba(0,0,0,0.1);
}
```

### Typography

```css
/* Font Stack */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Scale */
--text-xs: 0.75rem;    /* 12px - labels */
--text-sm: 0.875rem;   /* 14px - body small */
--text-base: 1rem;     /* 16px - body */
--text-lg: 1.125rem;   /* 18px - subheadings */
--text-xl: 1.25rem;    /* 20px - card titles */
--text-2xl: 1.5rem;    /* 24px - page titles */
--text-3xl: 1.875rem;  /* 30px - hero */
--text-4xl: 2.25rem;   /* 36px - landing hero */

/* Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### Component Patterns (Tailwind)

```css
/* Buttons */
.btn-primary: bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg font-medium
.btn-secondary: bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium
.btn-ghost: text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-4 py-2 rounded-lg

/* Cards */
.card: bg-white rounded-xl shadow-sm border border-gray-200 p-6

/* Inputs */
.input: w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500

/* Status Badges */
.badge-online: bg-success-100 text-success-700 px-2 py-1 rounded-full text-sm
.badge-warning: bg-warning-100 text-warning-700 px-2 py-1 rounded-full text-sm
.badge-critical: bg-error-100 text-error-700 px-2 py-1 rounded-full text-sm
.badge-offline: bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-sm

/* Sidebar */
.sidebar: w-60 bg-sidebar-bg text-sidebar-text min-h-screen
.sidebar-item: px-4 py-3 hover:bg-gray-700 rounded-lg cursor-pointer
.sidebar-item-active: bg-primary-500 text-white
```

### Responsive Breakpoints

```css
/* Tailwind defaults */
sm: 640px   /* Mobile landscape */
md: 768px   /* Tablet portrait */
lg: 1024px  /* Tablet landscape / small desktop */
xl: 1280px  /* Desktop */
2xl: 1536px /* Large desktop */

/* Layout behavior */
- Mobile (<768px): Sidebar collapses to hamburger menu
- Tablet (768-1024px): Sidebar overlays content
- Desktop (>1024px): Fixed sidebar, content scrolls
```

### Loading/Empty/Error States

```
Loading:
- Skeleton with pulse animation
- Gray rectangles matching content shape
- 200ms delay before showing (prevent flash)

Empty:
- Centered icon (outlined, gray)
- "No [items] yet" heading
- Brief description
- CTA button if applicable

Error:
- Red banner at top or inline
- Error icon
- "Something went wrong" + specific message
- "Try again" button
```

---

## 9. FILE STRUCTURE

```
/fleetpulse
├── /frontend
│   ├── /src
│   │   ├── /components
│   │   │   ├── /ui
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Card.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   ├── Badge.tsx
│   │   │   │   ├── Modal.tsx
│   │   │   │   ├── Table.tsx
│   │   │   │   ├── Dropdown.tsx
│   │   │   │   ├── Tabs.tsx
│   │   │   │   ├── Toast.tsx
│   │   │   │   └── Skeleton.tsx
│   │   │   ├── /layout
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── DashboardLayout.tsx
│   │   │   │   └── PublicLayout.tsx
│   │   │   ├── /dashboard
│   │   │   │   ├── StatsCard.tsx
│   │   │   │   ├── VehicleCard.tsx
│   │   │   │   ├── VehicleGrid.tsx
│   │   │   │   ├── MetricsChart.tsx
│   │   │   │   ├── AlertsTable.tsx
│   │   │   │   └── StatusIndicator.tsx
│   │   │   ├── /forms
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   ├── SignupForm.tsx
│   │   │   │   ├── AddVehicleForm.tsx
│   │   │   │   ├── AlertRuleForm.tsx
│   │   │   │   └── SettingsForm.tsx
│   │   │   └── /onboarding
│   │   │       ├── OnboardingWizard.tsx
│   │   │       ├── StepCompanyProfile.tsx
│   │   │       ├── StepAddVehicle.tsx
│   │   │       └── StepConfigureAlerts.tsx
│   │   ├── /pages
│   │   │   ├── index.tsx                 (Landing)
│   │   │   ├── pricing.tsx
│   │   │   ├── login.tsx
│   │   │   ├── signup.tsx
│   │   │   ├── verify-email.tsx
│   │   │   ├── onboarding.tsx
│   │   │   ├── /dashboard
│   │   │   │   ├── index.tsx             (Fleet Overview)
│   │   │   │   ├── /vehicles
│   │   │   │   │   ├── index.tsx         (Vehicle List)
│   │   │   │   │   ├── [id].tsx          (Vehicle Detail)
│   │   │   │   │   └── add.tsx
│   │   │   │   ├── /alerts
│   │   │   │   │   ├── index.tsx
│   │   │   │   │   └── rules.tsx
│   │   │   │   └── settings.tsx
│   │   │   └── /checkout
│   │   │       ├── [plan].tsx
│   │   │       └── success.tsx
│   │   ├── /hooks
│   │   │   ├── useAuth.ts
│   │   │   ├── useVehicles.ts
│   │   │   ├── useAlerts.ts
│   │   │   ├── useMetrics.ts
│   │   │   └── useToast.ts
│   │   ├── /lib
│   │   │   ├── api.ts                    (API client)
│   │   │   ├── auth.ts                   (Auth utilities)
│   │   │   └── utils.ts
│   │   ├── /styles
│   │   │   └── globals.css
│   │   └── /types
│   │       └── index.ts
│   ├── package.json
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── next.config.js
│
├── /backend
│   ├── /src
│   │   ├── app.py                        (Main Flask app)
│   │   ├── /routes
│   │   │   ├── __init__.py
│   │   │   ├── auth.py
│   │   │   ├── vehicles.py
│   │   │   ├── alerts.py
│   │   │   ├── metrics.py
│   │   │   ├── settings.py
│   │   │   └── subscriptions.py
│   │   ├── /models
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   ├── vehicle.py
│   │   │   ├── alert.py
│   │   │   └── subscription.py
│   │   ├── /services
│   │   │   ├── __init__.py
│   │   │   ├── auth_service.py
│   │   │   ├── vehicle_service.py
│   │   │   ├── metrics_service.py
│   │   │   └── alert_service.py
│   │   ├── /utils
│   │   │   ├── __init__.py
│   │   │   ├── db.py
│   │   │   └── helpers.py
│   │   └── config.py
│   ├── requirements.txt
│   └── seed.py
│
├── /database
│   ├── schema.sql
│   └── seed.sql
│
├── /prometheus-config                    (From existing codebase)
│   ├── prometheus.yml
│   ├── alertmanager.yml
│   └── /rules
│       └── fleet-rules.yml
│
├── /scripts
│   ├── install-agent.sh                  (Adapted from install_node_exporter.sh)
│   └── install-agent.ps1                 (Adapted from install_windows_exporter.ps1)
│
├── docker-compose.yml
├── README.md
└── .env.example
```

---

## 10. IMPLEMENTATION SEQUENCE

```
PHASE 1: Core Backend (2 hours)
1. Set up Flask backend with SQLite
2. Implement database schema (schema.sql)
3. Create auth routes (signup, login, logout)
4. Create vehicles CRUD routes
5. Implement mock metrics generation
6. Add seed data script

PHASE 2: Frontend Foundation (1.5 hours)
7. Set up Next.js with Tailwind
8. Create UI components (Button, Card, Input, Badge)
9. Create layout components (Sidebar, Header, DashboardLayout)
10. Implement auth pages (Login, Signup)
11. Set up API client and auth hooks

PHASE 3: Dashboard Core (1.5 hours)
12. Build Fleet Overview page with StatsCards
13. Create VehicleGrid and VehicleCard components
14. Implement Vehicle Detail page with MetricsChart
15. Add loading/empty/error states

PHASE 4: Alerts System (1 hour)
16. Create Alerts listing page
17. Implement AlertsTable with filtering
18. Build Alert Rules page
19. Add acknowledge/silence functionality

PHASE 5: Settings & Subscription (1 hour)
20. Build Settings page with tabs
21. Create notification settings form
22. Implement Pricing page
23. Build mock Checkout flow
24. Add subscription status to dashboard

PHASE 6: Onboarding & Polish (1 hour)
25. Create Landing page
26. Build Onboarding wizard
27. Implement Add Vehicle modal
28. Add agent installation scripts
29. Polish responsive design
30. Test complete user journey
```

---

## 11. MOCK PAYMENT FLOW

### Pricing Tiers

| Feature | Starter (Free) | Professional | Enterprise |
|---------|----------------|--------------|------------|
| Price | $0/mo | $99/mo | $299/mo |
| Vehicles | Up to 10 | Up to 100 | Unlimited |
| Data Retention | 7 days | 30 days | 90 days |
| Alert Channels | Email only | Email, Slack, Telegram | All + Webhook |
| Custom Rules | No | Yes | Yes |
| API Access | No | Limited | Full |
| Support | Community | Priority | Dedicated |

### Checkout Flow Implementation

```typescript
// Frontend: checkout/[plan].tsx
const handleSubscribe = async () => {
  setProcessing(true);
  
  // Simulate payment processing delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Call mock API
  const res = await api.post('/api/subscription', {
    plan: selectedPlan,
    paymentMethod: {
      cardNumber: cardNumber.replace(/\s/g, ''),
      expiry,
      cvc
    }
  });
  
  if (res.success) {
    router.push('/checkout/success');
  }
};
```

```python
# Backend: routes/subscriptions.py
@bp.route('/api/subscription', methods=['POST'])
@require_auth
def create_subscription():
    data = request.json
    plan = data.get('plan')
    
    # Mock: Always succeed
    limits = {
        'professional': {'vehicles': 100, 'retention': 30},
        'enterprise': {'vehicles': 9999, 'retention': 90}
    }
    
    # Update user
    db.execute('''
        UPDATE users 
        SET plan = ?, vehicle_limit = ?
        WHERE id = ?
    ''', [plan, limits[plan]['vehicles'], g.user_id])
    
    return jsonify({
        'success': True,
        'plan': plan,
        'vehicleLimit': limits[plan]['vehicles']
    })
```

### Dashboard Subscription Status

```tsx
// In Sidebar component
<div className="px-4 py-2 bg-gray-800 rounded-lg mt-auto">
  <div className="text-xs text-gray-400">Current Plan</div>
  <div className="flex items-center justify-between">
    <span className="font-medium capitalize">{user.plan}</span>
    <span className="text-xs text-gray-400">
      {vehicleCount}/{vehicleLimit} vehicles
    </span>
  </div>
  {user.plan === 'free' && (
    <Link href="/pricing" className="text-xs text-primary-400 hover:underline">
      Upgrade →
    </Link>
  )}
</div>
```

---

## 12. INTEGRATION INSTRUCTIONS FOR EXISTING CODE

### Files to Use Directly

| Source File | Use As | Notes |
|-------------|--------|-------|
| `scripts/install_node_exporter.sh` | `scripts/install-agent.sh` | Modify to register with FleetPulse API |
| `scripts/install_windows_exporter.ps1` | `scripts/install-agent.ps1` | Modify to register with FleetPulse API |
| `config/prometheus-rules.yml` | `prometheus-config/rules/fleet-rules.yml` | Rename alerts to fleet-specific names |
| `config/alertmanager/alertmanager.yml` | Reference for notification templates | Extract email/Slack/Telegram patterns |

### Functions to Adapt

```python
# From add_hosts.sh logic → backend/services/vehicle_service.py
def add_vehicle(user_id, ip_address, port, name=None):
    """
    Adapts the logic from add_hosts.sh to:
    1. Validate vehicle limit
    2. Generate agent token
    3. Insert into database
    4. Return installation instructions
    """
    pass

# From prometheus-rules.yml → backend/services/alert_service.py  
def get_default_rules():
    """
    Returns the default alert rules based on prometheus-rules.yml:
    - InstanceDown → VehicleOffline
    - HighCpuLoad → HighCpuLoad
    - HighMemoryUsage → HighMemoryUsage
    - LowDiskSpace → LowDiskSpace
    """
    pass
```

### What to Ignore

- `docker-compose.yml` - We'll create a simpler one for local dev
- `kubernetes/` manifests - Not needed for localhost SaaS
- `config/cortex/` - Overkill for MVP, use simple SQLite storage
- `config/nginx/` - Not needed for localhost
- `scripts/generate_certs.sh` - No TLS for localhost MVP

### How Existing Code Becomes the Engine

```
┌──────────────────────────────────────────────────────────┐
│                    FleetPulse SaaS                        │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐  │
│  │   React UI   │───▶│  Flask API  │───▶│   SQLite    │  │
│  │  (New Code)  │    │  (New Code) │    │  (Metrics)  │  │
│  └─────────────┘    └─────────────┘    └─────────────┘  │
│                            │                             │
│                            ▼                             │
│  ┌───────────────────────────────────────────────────┐  │
│  │              EXISTING CODEBASE                     │  │
│  │  ┌────────────────┐  ┌────────────────────────┐   │  │
│  │  │ install_node   │  │  prometheus-rules.yml  │   │  │
│  │  │ _exporter.sh   │  │  (Alert rule patterns) │   │  │
│  │  │ (Agent setup)  │  └────────────────────────┘   │  │
│  │  └────────────────┘                               │  │
│  │  ┌────────────────┐  ┌────────────────────────┐   │  │
│  │  │ alertmanager   │  │   Technical docs       │   │  │
│  │  │ .yml (Notif)   │  │   (Domain knowledge)   │   │  │
│  │  └────────────────┘  └────────────────────────┘   │  │
│  └───────────────────────────────────────────────────┘  │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## 13. SINGLE-PROMPT CODING INSTRUCTION

Copy and paste this to your coding agent:

---

**Build FleetPulse - a fleet monitoring SaaS for carsharing and delivery companies.**

**Tech Stack:**
- Frontend: Next.js 14 + TypeScript + Tailwind CSS
- Backend: Python Flask + SQLite
- Single command: `docker-compose up` or `npm run dev` + `python app.py`

**Core Features (in order):**
1. Auth system (signup/login/logout with JWT in cookies)
2. Multi-tenant vehicle management (CRUD with user isolation)
3. Mock metrics generation (CPU, memory, disk, battery voltage)
4. Dashboard with Fleet Overview, Vehicle Detail, Alerts pages
5. Alert rules engine (evaluate rules against metrics)
6. Settings page with notification config
7. Pricing page with 3 tiers (Free/Pro/Enterprise)
8. Mock checkout flow (always succeeds)

**Database:** SQLite with tables: users, sessions, vehicles, vehicle_metrics, alert_rules, alerts, notification_settings, subscriptions

**Key Constraints:**
- 100% localhost, no external APIs
- All payments mocked
- Seed 10 demo vehicles with realistic data
- Demo account: demo@fleetpulse.local / demo123

**UI Requirements:**
- Primary color: #3B82F6 (blue)
- Status colors: green (#22C55E), amber (#F59E0B), red (#EF4444)
- Dark sidebar (#1F2937), light content area
- Responsive: sidebar collapses on mobile

**Existing Code to Adapt:**
- The agent installation scripts exist at `scripts/install_node_exporter.sh` - adapt to register vehicles with FleetPulse API
- Alert rule patterns exist in `config/prometheus-rules.yml` - use as templates

**Start by creating:**
1. `/backend/src/app.py` - Flask app with CORS, SQLite init
2. `/backend/database/schema.sql` - Full schema
3. `/frontend/src/pages/index.tsx` - Landing page
4. Then follow the implementation sequence for remaining 27 files

**Success Criteria:** User can sign up, add a vehicle, see it on dashboard with live-updating metrics, receive a mock alert, and upgrade to paid plan - all on localhost.

---
