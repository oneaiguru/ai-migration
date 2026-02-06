# MICRO-SAAS PRODUCT SPECIFICATION
## Data Migration Platform: "MigrateFlow"

---

## 1. PRODUCT DEFINITION

### Product Name
**MigrateFlow** — Effortless Financial Data Migration

### One-Line Pitch
"Migrate your financial data between accounting systems in minutes, not months."

### Target Customer Persona
**Primary:** Small-to-medium business owners (10-200 employees) who are switching accounting/financial management software and need to migrate historical data including transactions, contacts, bank accounts, and categories.

**Secondary:** Freelance bookkeepers and accountants who manage migrations for multiple clients.

**Pain Points:**
- Manual data migration is error-prone and time-consuming
- Fear of losing historical financial data
- No technical expertise to write custom migration scripts
- Need audit trails and validation before committing migrations

### Core Value Proposition
Transform complex data migrations from a weeks-long technical nightmare into a guided, visual, validated process that anyone can complete in under an hour.

### 3 Competitor Examples
1. **Fivetran** — Enterprise data pipeline tool (too complex, too expensive for SMBs)
2. **Airbyte** — Open-source data integration (requires technical setup)
3. **Import2** — CRM migration specialist (limited to CRM data only)

---

## 2. FEATURE MATRIX

| Feature | Priority | Complexity | Existing Code Covers? | Notes |
|---------|----------|------------|----------------------|-------|
| CSV file upload & parsing | P0 | Medium | ✅ Yes | DataExporter class handles CSV |
| Field mapping interface | P0 | High | ⚠️ Partial | Config exists, needs UI |
| Data validation & preview | P0 | Medium | ✅ Yes | csv-validator.php |
| Migration execution | P0 | High | ✅ Yes | migrate.php handles this |
| Progress tracking | P0 | Medium | ✅ Yes | Logger class exists |
| ID mapping persistence | P0 | Medium | ✅ Yes | IdMapper class |
| Error handling & retry | P0 | Medium | ✅ Yes | AdeskApi has retry logic |
| User authentication | P0 | Low | ❌ No | Need to build |
| Dashboard/overview | P0 | Medium | ❌ No | Need to build |
| Project management | P1 | Medium | ❌ No | Need to build |
| Migration history | P1 | Low | ⚠️ Partial | Logs exist, needs UI |
| Rollback capability | P1 | High | ❌ No | Need to build |
| Multiple source formats | P1 | Medium | ⚠️ Partial | Only CSV currently |
| Scheduled migrations | P2 | Medium | ❌ No | Future feature |
| Team collaboration | P2 | High | ❌ No | Future feature |
| API access | P2 | Medium | ❌ No | Future feature |
| Custom transformations | P2 | High | ❌ No | Future feature |
| Pricing/billing | P0 | Low | ❌ No | Mock implementation |
| Onboarding wizard | P0 | Medium | ❌ No | Need to build |

---

## 3. USER JOURNEYS

### Journey 1: New User Sign Up → First Migration

**Step 1: Landing Page**
- User arrives at homepage
- Sees hero section with value prop
- Clicks "Start Free Trial" button

**Step 2: Sign Up**
- Modal appears with email/password form
- User enters credentials
- Clicks "Create Account"
- Auto-logged in, redirected to onboarding

**Step 3: Onboarding Wizard**
- Screen 1: "What system are you migrating FROM?" (dropdown)
- Screen 2: "What system are you migrating TO?" (dropdown)
- Screen 3: "Upload your first data file" (drag-drop zone)
- Screen 4: "Great! Let's map your fields" (auto-detected preview)
- Clicks "Go to Dashboard"

**Step 4: Dashboard**
- Sees project card for their migration
- Status: "Ready to Configure"
- Clicks "Configure Migration"

**Step 5: Migration Configuration**
- Left panel: Source data preview (table)
- Right panel: Destination field mapping
- User drag-drops fields to map them
- Clicks "Validate Data"

**Step 6: Validation Results**
- Shows validation report
- Green checkmarks for valid rows
- Red X for invalid rows with error details
- User fixes issues or proceeds
- Clicks "Start Migration"

**Step 7: Migration Progress**
- Real-time progress bar
- Entity-by-entity status
- Log stream showing actions
- Estimated time remaining

**Step 8: Migration Complete**
- Success screen with summary
- "X records migrated successfully"
- "Y records had warnings"
- Download detailed report button
- Prompt: "Upgrade to Pro for unlimited migrations"

### Journey 2: Returning User → Check Migration Status

**Step 1:** User logs in
**Step 2:** Dashboard shows all projects
**Step 3:** Clicks on active migration
**Step 4:** Sees detailed status and logs
**Step 5:** Can pause/resume/cancel

### Journey 3: User Upgrades Plan

**Step 1:** User clicks "Upgrade" in dashboard
**Step 2:** Pricing page shows 3 tiers
**Step 3:** User selects "Pro" plan
**Step 4:** Checkout form appears (mocked)
**Step 5:** User enters fake card details
**Step 6:** "Payment Successful" screen
**Step 7:** Dashboard now shows "Pro" badge
**Step 8:** Migration limits increased

---

## 4. FULL PAGE-BY-PAGE SPECIFICATION

### PAGE: Landing Page
```
URL: /
PURPOSE: Convert visitors to sign-ups

COMPONENTS:
- Header:
  - Logo (left): "MigrateFlow" text logo
  - Nav (center): Features, Pricing, Documentation
  - CTA (right): "Login" text link, "Start Free" primary button

- Hero Section:
  - Headline: "Migrate Financial Data Without the Headache"
  - Subheadline: "Move transactions, contacts, and accounts between systems in minutes. No coding required."
  - Primary CTA: "Start Free Trial" (large button, primary color)
  - Secondary CTA: "Watch Demo" (text link with play icon)
  - Hero Image: Animated illustration of data flowing between two systems

- Social Proof Bar:
  - "Trusted by 2,500+ businesses"
  - 5 fake company logos (grayscale)

- Features Grid (3 columns):
  - Feature 1: "Smart Field Mapping" - Icon + description
  - Feature 2: "Validation Before Migration" - Icon + description  
  - Feature 3: "Complete Audit Trail" - Icon + description

- How It Works (4 steps):
  - Step 1: "Upload your data files"
  - Step 2: "Map fields to destination"
  - Step 3: "Validate and preview"
  - Step 4: "Execute migration"

- Testimonial Section:
  - 3 fake testimonial cards with photos, names, companies

- Pricing Preview:
  - "Plans starting at $0/month"
  - "View Pricing" link

- Footer:
  - Logo, copyright
  - Links: Privacy, Terms, Contact
  - Social icons (non-functional)

STATES:
- Default: Full page visible
- Scrolled: Header becomes sticky with shadow

ACTIONS:
- "Start Free Trial" → Opens signup modal
- "Login" → Opens login modal
- "Watch Demo" → Opens video modal (placeholder)
- "View Pricing" → Scrolls to /pricing

API CALLS: None
```

### PAGE: Authentication Modal
```
URL: / (modal overlay)
PURPOSE: User registration and login

COMPONENTS:
- Modal Container:
  - Close X button (top right)
  - Tab switcher: "Sign Up" | "Login"

- Sign Up Tab:
  - Email input field
  - Password input field (with show/hide toggle)
  - "Create Account" primary button
  - Divider: "or continue with"
  - Google button (mocked, shows toast)
  - Terms checkbox: "I agree to Terms and Privacy Policy"

- Login Tab:
  - Email input field
  - Password input field
  - "Forgot password?" link (shows toast)
  - "Login" primary button

STATES:
- Default: Sign Up tab active
- Loading: Button shows spinner
- Error: Red border on invalid fields, error message below
- Success: Modal closes, redirects

ACTIONS:
- "Create Account" → POST /api/auth/register → Redirect to /onboarding
- "Login" → POST /api/auth/login → Redirect to /dashboard
- Close → Closes modal
- Google → Shows "Coming soon" toast

API CALLS:
- POST /api/auth/register
- POST /api/auth/login
```

### PAGE: Onboarding Wizard
```
URL: /onboarding
PURPOSE: Collect initial migration context, first file upload

COMPONENTS:
- Progress Bar:
  - 4 steps indicator
  - Current step highlighted

- Step 1 - Source System:
  - Headline: "What system are you migrating FROM?"
  - Dropdown with options:
    - VIPFLAT
    - QuickBooks
    - Xero
    - Wave
    - FreshBooks
    - Custom CSV
  - "Next" button

- Step 2 - Destination System:
  - Headline: "What system are you migrating TO?"
  - Dropdown with options:
    - Adesk
    - QuickBooks
    - Xero
    - Custom API
  - "Back" and "Next" buttons

- Step 3 - First Upload:
  - Headline: "Upload your first data file"
  - Drag-and-drop zone (dashed border)
  - Or "browse files" link
  - Accepted formats: CSV, XLSX
  - "Back" and "Next" buttons

- Step 4 - Preview:
  - Headline: "Here's what we found"
  - Data preview table (first 5 rows)
  - Detected columns list
  - Record count
  - "Back" and "Go to Dashboard" buttons

STATES:
- Each step: Active, Completed, Pending
- File upload: Empty, Dragging, Processing, Complete, Error
- Preview: Loading, Loaded, Error

ACTIONS:
- Next → Advances step, saves to session
- Back → Goes to previous step
- File drop → Uploads and parses file
- "Go to Dashboard" → Creates project, redirects

API CALLS:
- POST /api/files/upload
- GET /api/files/:id/preview
- POST /api/projects/create
```

### PAGE: Dashboard
```
URL: /dashboard
PURPOSE: Overview of all migration projects

COMPONENTS:
- Header:
  - Logo (left)
  - "New Migration" button
  - User avatar dropdown (right): Settings, Billing, Logout

- Sidebar:
  - Dashboard (active)
  - Migrations
  - History
  - Settings
  - Upgrade badge (if free plan)

- Main Content:
  - Welcome banner: "Welcome back, [Name]!"
  - Stats row (4 cards):
    - Total Migrations
    - Records Migrated
    - Success Rate
    - Current Plan

  - Projects Grid:
    - Project cards showing:
      - Project name
      - Source → Destination
      - Status badge (Draft, In Progress, Completed, Failed)
      - Last activity date
      - Progress bar (if in progress)
      - "Continue" or "View" button

  - Empty State (if no projects):
    - Illustration
    - "No migrations yet"
    - "Create your first migration" button

STATES:
- Loading: Skeleton cards
- Empty: Empty state illustration
- Has projects: Grid of cards

ACTIONS:
- "New Migration" → Opens /migrations/new
- Project card click → Opens /migrations/:id
- Avatar dropdown → Shows menu

API CALLS:
- GET /api/projects
- GET /api/stats
```

### PAGE: Migration Configuration
```
URL: /migrations/:id
PURPOSE: Configure field mappings and validate data

COMPONENTS:
- Header:
  - Breadcrumb: Dashboard > Migration Name
  - Status badge
  - "Run Migration" button (disabled until valid)

- Tabs:
  - Data Files
  - Field Mapping
  - Validation
  - Settings

- Data Files Tab:
  - File list with upload date, row count, status
  - "Upload Additional File" button
  - File type selector (Contacts, Transactions, etc.)

- Field Mapping Tab:
  - Left panel: Source columns (draggable)
  - Right panel: Destination fields (drop targets)
  - Auto-map button
  - Visual connection lines between mapped fields
  - Required fields highlighted

- Validation Tab:
  - "Run Validation" button
  - Results table:
    - Row number
    - Status (✓ or ✗)
    - Issues found
  - Summary stats
  - "Download Report" button

- Settings Tab:
  - Migration name input
  - Batch size slider
  - Error handling: Stop on error / Continue with errors
  - Delete source data checkbox (mocked)

STATES:
- Not configured: Field mapping empty
- Partially configured: Some fields mapped
- Ready: All required fields mapped, validation passed
- Running: Progress overlay

ACTIONS:
- Drag field → Creates mapping
- Auto-map → Attempts smart matching
- Run Validation → POST /api/migrations/:id/validate
- Run Migration → POST /api/migrations/:id/run

API CALLS:
- GET /api/migrations/:id
- PUT /api/migrations/:id/mappings
- POST /api/migrations/:id/validate
- POST /api/migrations/:id/run
```

### PAGE: Migration Progress
```
URL: /migrations/:id/progress
PURPOSE: Real-time migration execution monitoring

COMPONENTS:
- Header:
  - Migration name
  - Overall progress percentage
  - "Pause" / "Cancel" buttons

- Progress Section:
  - Overall progress bar
  - Time elapsed / estimated remaining
  - Records processed / total

- Entity Progress:
  - Expandable sections for each entity type:
    - Categories (100/100 ✓)
    - Contractors (450/500 ↻)
    - Bank Accounts (50/50 ✓)
    - Transactions (0/2000 ⏳)
  - Each shows: progress bar, count, status icon

- Live Log:
  - Scrolling log output
  - Timestamp, level (INFO/WARN/ERROR), message
  - Filter by level
  - "Download Full Log" button

- Error Panel (if errors):
  - Error count badge
  - List of failed records
  - Retry individual / Retry all buttons

STATES:
- Running: Progress animating
- Paused: Progress frozen, resume button
- Completed: Success message, summary stats
- Failed: Error message, retry options

ACTIONS:
- Pause → POST /api/migrations/:id/pause
- Cancel → POST /api/migrations/:id/cancel (with confirmation)
- Retry → POST /api/migrations/:id/retry

API CALLS:
- GET /api/migrations/:id/status (polling every 2s)
- WebSocket alternative for real-time updates
```

### PAGE: Pricing
```
URL: /pricing
PURPOSE: Display plans and handle upgrades

COMPONENTS:
- Header: Standard nav

- Headline: "Simple, Transparent Pricing"
- Subheadline: "Start free, upgrade when you need more"

- Toggle: Monthly / Annual (20% savings badge)

- Pricing Cards (3 columns):

  Card 1 - Free:
  - Price: $0/month
  - Features:
    - 1 migration project
    - Up to 1,000 records
    - CSV import only
    - Email support
  - CTA: "Get Started" (if logged out) / "Current Plan" (if on free)

  Card 2 - Pro (highlighted):
  - Price: $29/month (or $279/year)
  - "Most Popular" badge
  - Features:
    - Unlimited projects
    - Up to 50,000 records/month
    - All import formats
    - Priority support
    - Rollback capability
  - CTA: "Upgrade to Pro"

  Card 3 - Enterprise:
  - Price: $99/month (or $950/year)
  - Features:
    - Everything in Pro
    - Unlimited records
    - API access
    - Dedicated support
    - Custom integrations
  - CTA: "Upgrade to Enterprise"

- FAQ Section:
  - 5 common questions with expandable answers

- Footer: Standard

STATES:
- Logged out: CTAs say "Get Started"
- Logged in (Free): Free card shows "Current Plan"
- Logged in (Pro): Pro card shows "Current Plan"

ACTIONS:
- Toggle → Switches pricing display
- "Upgrade to Pro" → Opens checkout modal
- FAQ items → Expand/collapse

API CALLS: None (static page)
```

### PAGE: Checkout Modal
```
URL: /pricing (modal)
PURPOSE: Collect payment info (mocked)

COMPONENTS:
- Modal:
  - Plan summary (name, price)
  - Form:
    - Card number input (fake validation)
    - Expiry date (MM/YY)
    - CVC
    - Name on card
    - Billing address (optional)
  - Order summary
  - "Subscribe" button
  - "Cancel" link

STATES:
- Default: Form empty
- Validating: Button shows spinner
- Success: Shows success message, closes after 2s
- Error: Shows error message (simulate declined)

ACTIONS:
- "Subscribe" → Simulates payment (always succeeds unless card ends in 0000)
- "Cancel" → Closes modal

API CALLS:
- POST /api/billing/subscribe (mocked)
```

### PAGE: Settings
```
URL: /settings
PURPOSE: User account and preferences

COMPONENTS:
- Sidebar: Same as dashboard

- Tabs: Profile, Notifications, Billing, API Keys

- Profile Tab:
  - Avatar upload
  - Name input
  - Email input (read-only)
  - Change password section
  - "Save Changes" button

- Notifications Tab:
  - Toggle: Email on migration complete
  - Toggle: Email on migration failed
  - Toggle: Weekly summary

- Billing Tab:
  - Current plan display
  - Next billing date
  - Payment method (masked card)
  - "Update Payment Method" button
  - "Cancel Subscription" button
  - Invoice history table

- API Keys Tab (Pro+):
  - API key display (masked)
  - "Regenerate Key" button
  - Usage stats

STATES:
- Loading: Skeleton
- Saving: Button spinner
- Saved: Success toast

ACTIONS:
- Save → PUT /api/users/me
- Regenerate → POST /api/keys/regenerate

API CALLS:
- GET /api/users/me
- PUT /api/users/me
- GET /api/billing/invoices
```

---

## 5. COMPLETE API SPECIFICATION

### Authentication

```
ENDPOINT: POST /api/auth/register
PURPOSE: Create new user account
REQUEST BODY: {
  "email": "string (required, valid email)",
  "password": "string (required, min 8 chars)",
  "name": "string (optional)"
}
RESPONSE: {
  "success": true,
  "user": {
    "id": "uuid",
    "email": "string",
    "name": "string",
    "plan": "free",
    "createdAt": "ISO8601"
  },
  "token": "jwt_string"
}
ERRORS:
- 400: { "error": "Invalid email format" }
- 400: { "error": "Password too short" }
- 409: { "error": "Email already registered" }
MOCK BEHAVIOR: Always succeeds, generates UUID, returns mock JWT
```

```
ENDPOINT: POST /api/auth/login
PURPOSE: Authenticate existing user
REQUEST BODY: {
  "email": "string (required)",
  "password": "string (required)"
}
RESPONSE: {
  "success": true,
  "user": { ... },
  "token": "jwt_string"
}
ERRORS:
- 401: { "error": "Invalid credentials" }
MOCK BEHAVIOR: Check against seeded users, any password works
```

```
ENDPOINT: POST /api/auth/logout
PURPOSE: Invalidate session
REQUEST BODY: None
RESPONSE: { "success": true }
MOCK BEHAVIOR: Always succeeds
```

```
ENDPOINT: GET /api/auth/me
PURPOSE: Get current user
RESPONSE: {
  "user": { ... }
}
ERRORS:
- 401: { "error": "Not authenticated" }
MOCK BEHAVIOR: Returns user from token
```

### Projects

```
ENDPOINT: GET /api/projects
PURPOSE: List all user's migration projects
QUERY PARAMS:
  - status: "draft" | "running" | "completed" | "failed" (optional)
  - limit: number (default 20)
  - offset: number (default 0)
RESPONSE: {
  "projects": [
    {
      "id": "uuid",
      "name": "string",
      "sourceSystem": "string",
      "destinationSystem": "string",
      "status": "draft",
      "recordCount": 0,
      "migratedCount": 0,
      "createdAt": "ISO8601",
      "updatedAt": "ISO8601"
    }
  ],
  "total": 5,
  "limit": 20,
  "offset": 0
}
MOCK BEHAVIOR: Returns seeded projects for user
```

```
ENDPOINT: POST /api/projects
PURPOSE: Create new migration project
REQUEST BODY: {
  "name": "string (required)",
  "sourceSystem": "string (required)",
  "destinationSystem": "string (required)"
}
RESPONSE: {
  "project": { ... }
}
MOCK BEHAVIOR: Creates project in SQLite, returns it
```

```
ENDPOINT: GET /api/projects/:id
PURPOSE: Get project details
RESPONSE: {
  "project": {
    "id": "uuid",
    "name": "string",
    "sourceSystem": "string",
    "destinationSystem": "string",
    "status": "draft",
    "config": {
      "batchSize": 100,
      "errorHandling": "continue"
    },
    "files": [ ... ],
    "mappings": { ... },
    "stats": {
      "totalRecords": 5000,
      "migratedRecords": 2500,
      "failedRecords": 12,
      "startedAt": "ISO8601",
      "completedAt": null
    }
  }
}
MOCK BEHAVIOR: Returns project from SQLite
```

```
ENDPOINT: PUT /api/projects/:id
PURPOSE: Update project settings
REQUEST BODY: {
  "name": "string (optional)",
  "config": { ... } (optional)
}
RESPONSE: { "project": { ... } }
MOCK BEHAVIOR: Updates SQLite, returns updated
```

```
ENDPOINT: DELETE /api/projects/:id
PURPOSE: Delete project and all data
RESPONSE: { "success": true }
MOCK BEHAVIOR: Soft delete in SQLite
```

### Files

```
ENDPOINT: POST /api/files/upload
PURPOSE: Upload data file for migration
REQUEST: multipart/form-data
  - file: File (required)
  - projectId: string (required)
  - fileType: "contacts" | "transactions" | "accounts" | "categories" (required)
RESPONSE: {
  "file": {
    "id": "uuid",
    "name": "string",
    "type": "contacts",
    "size": 1024,
    "rowCount": 500,
    "columns": ["id", "name", "email"],
    "uploadedAt": "ISO8601"
  }
}
ERRORS:
- 400: { "error": "Invalid file format" }
- 413: { "error": "File too large" }
MOCK BEHAVIOR: Parse CSV, store in uploads folder, save metadata
```

```
ENDPOINT: GET /api/files/:id/preview
PURPOSE: Get preview of file contents
QUERY PARAMS:
  - rows: number (default 10)
RESPONSE: {
  "columns": ["id", "name", "email"],
  "rows": [
    ["1", "John Doe", "john@example.com"],
    ...
  ],
  "totalRows": 500
}
MOCK BEHAVIOR: Read first N rows from stored file
```

```
ENDPOINT: DELETE /api/files/:id
PURPOSE: Remove uploaded file
RESPONSE: { "success": true }
MOCK BEHAVIOR: Delete file and metadata
```

### Mappings

```
ENDPOINT: GET /api/projects/:id/mappings
PURPOSE: Get field mappings for project
RESPONSE: {
  "mappings": {
    "contacts": {
      "sourceField": "destinationField",
      "name": "name",
      "email": "email",
      "phone": "phone_number"
    },
    "transactions": { ... }
  }
}
MOCK BEHAVIOR: Return from SQLite
```

```
ENDPOINT: PUT /api/projects/:id/mappings
PURPOSE: Save field mappings
REQUEST BODY: {
  "mappings": {
    "contacts": {
      "name": "name",
      "email": "email"
    }
  }
}
RESPONSE: { "success": true, "mappings": { ... } }
MOCK BEHAVIOR: Store in SQLite
```

```
ENDPOINT: POST /api/projects/:id/mappings/auto
PURPOSE: Auto-detect field mappings
RESPONSE: {
  "suggestions": {
    "contacts": {
      "name": { "source": "name", "confidence": 1.0 },
      "email": { "source": "email_address", "confidence": 0.9 }
    }
  }
}
MOCK BEHAVIOR: Simple string matching algorithm
```

### Validation

```
ENDPOINT: POST /api/projects/:id/validate
PURPOSE: Validate data before migration
REQUEST BODY: {
  "fileTypes": ["contacts", "transactions"] (optional, all if empty)
}
RESPONSE: {
  "valid": false,
  "results": {
    "contacts": {
      "valid": true,
      "totalRows": 500,
      "validRows": 500,
      "errors": []
    },
    "transactions": {
      "valid": false,
      "totalRows": 2000,
      "validRows": 1985,
      "errors": [
        { "row": 156, "field": "amount", "error": "Invalid number format" },
        { "row": 789, "field": "date", "error": "Invalid date format" }
      ]
    }
  }
}
MOCK BEHAVIOR: Run validation logic from existing code
```

### Migration Execution

```
ENDPOINT: POST /api/migrations/:id/run
PURPOSE: Start migration execution
REQUEST BODY: {
  "dryRun": false (optional)
}
RESPONSE: {
  "executionId": "uuid",
  "status": "running"
}
MOCK BEHAVIOR: Start background job, return immediately
```

```
ENDPOINT: GET /api/migrations/:id/status
PURPOSE: Get migration progress
RESPONSE: {
  "status": "running",
  "progress": {
    "overall": 45,
    "entities": {
      "categories": { "total": 50, "completed": 50, "failed": 0, "status": "completed" },
      "contacts": { "total": 500, "completed": 225, "failed": 2, "status": "running" },
      "transactions": { "total": 2000, "completed": 0, "failed": 0, "status": "pending" }
    }
  },
  "startedAt": "ISO8601",
  "estimatedCompletion": "ISO8601",
  "logs": [
    { "timestamp": "ISO8601", "level": "info", "message": "Started contacts migration" }
  ]
}
MOCK BEHAVIOR: Simulate progress over time
```

```
ENDPOINT: POST /api/migrations/:id/pause
PURPOSE: Pause running migration
RESPONSE: { "status": "paused" }
MOCK BEHAVIOR: Update status in SQLite
```

```
ENDPOINT: POST /api/migrations/:id/resume
PURPOSE: Resume paused migration
RESPONSE: { "status": "running" }
MOCK BEHAVIOR: Update status, continue background job
```

```
ENDPOINT: POST /api/migrations/:id/cancel
PURPOSE: Cancel migration
RESPONSE: { "status": "cancelled" }
MOCK BEHAVIOR: Stop job, update status
```

```
ENDPOINT: POST /api/migrations/:id/retry
PURPOSE: Retry failed records
REQUEST BODY: {
  "recordIds": ["uuid"] (optional, all failed if empty)
}
RESPONSE: { "status": "running", "retrying": 15 }
MOCK BEHAVIOR: Re-queue failed records
```

### Stats

```
ENDPOINT: GET /api/stats
PURPOSE: Get user dashboard stats
RESPONSE: {
  "totalProjects": 5,
  "totalRecordsMigrated": 15000,
  "successRate": 99.2,
  "currentPlan": "pro",
  "recordsThisMonth": 5000,
  "recordLimit": 50000
}
MOCK BEHAVIOR: Aggregate from SQLite
```

### Billing (Mocked)

```
ENDPOINT: GET /api/billing/plan
PURPOSE: Get current plan details
RESPONSE: {
  "plan": "free",
  "limits": {
    "projects": 1,
    "recordsPerMonth": 1000
  },
  "usage": {
    "projects": 1,
    "recordsThisMonth": 450
  },
  "nextBillingDate": null
}
MOCK BEHAVIOR: Return from user record
```

```
ENDPOINT: POST /api/billing/subscribe
PURPOSE: Subscribe to paid plan
REQUEST BODY: {
  "plan": "pro",
  "paymentMethod": {
    "cardNumber": "4242424242424242",
    "expiry": "12/25",
    "cvc": "123"
  },
  "billingInterval": "monthly"
}
RESPONSE: {
  "success": true,
  "plan": "pro",
  "nextBillingDate": "ISO8601"
}
ERRORS:
- 400: { "error": "Payment declined" } (if card ends in 0000)
MOCK BEHAVIOR: Update user plan in SQLite
```

```
ENDPOINT: POST /api/billing/cancel
PURPOSE: Cancel subscription
RESPONSE: {
  "success": true,
  "plan": "free",
  "effectiveDate": "ISO8601"
}
MOCK BEHAVIOR: Set plan to free, future date
```

```
ENDPOINT: GET /api/billing/invoices
PURPOSE: Get invoice history
RESPONSE: {
  "invoices": [
    {
      "id": "uuid",
      "date": "ISO8601",
      "amount": 29.00,
      "status": "paid",
      "downloadUrl": "/api/billing/invoices/uuid/pdf"
    }
  ]
}
MOCK BEHAVIOR: Return seeded invoices
```

---

## 6. DATABASE SCHEMA

```sql
-- Users table
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT,
    plan TEXT DEFAULT 'free' CHECK(plan IN ('free', 'pro', 'enterprise')),
    plan_started_at TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Projects table
CREATE TABLE projects (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    name TEXT NOT NULL,
    source_system TEXT NOT NULL,
    destination_system TEXT NOT NULL,
    status TEXT DEFAULT 'draft' CHECK(status IN ('draft', 'configured', 'running', 'paused', 'completed', 'failed', 'cancelled')),
    config TEXT DEFAULT '{}', -- JSON
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    deleted_at TEXT
);

-- Files table
CREATE TABLE files (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL REFERENCES projects(id),
    name TEXT NOT NULL,
    file_type TEXT NOT NULL CHECK(file_type IN ('contacts', 'transactions', 'accounts', 'categories', 'transfers', 'users')),
    file_path TEXT NOT NULL,
    size_bytes INTEGER NOT NULL,
    row_count INTEGER,
    columns TEXT, -- JSON array
    uploaded_at TEXT DEFAULT (datetime('now'))
);

-- Mappings table
CREATE TABLE mappings (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL REFERENCES projects(id),
    file_type TEXT NOT NULL,
    source_field TEXT NOT NULL,
    destination_field TEXT NOT NULL,
    transform TEXT, -- JSON for any transformations
    created_at TEXT DEFAULT (datetime('now')),
    UNIQUE(project_id, file_type, source_field)
);

-- Migration executions table
CREATE TABLE executions (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL REFERENCES projects(id),
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'running', 'paused', 'completed', 'failed', 'cancelled')),
    started_at TEXT,
    completed_at TEXT,
    total_records INTEGER DEFAULT 0,
    migrated_records INTEGER DEFAULT 0,
    failed_records INTEGER DEFAULT 0,
    error_message TEXT
);

-- Entity progress within execution
CREATE TABLE execution_entities (
    id TEXT PRIMARY KEY,
    execution_id TEXT NOT NULL REFERENCES executions(id),
    entity_type TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    total_records INTEGER DEFAULT 0,
    completed_records INTEGER DEFAULT 0,
    failed_records INTEGER DEFAULT 0,
    started_at TEXT,
    completed_at TEXT
);

-- ID mappings (from existing code)
CREATE TABLE id_mappings (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL REFERENCES projects(id),
    entity_type TEXT NOT NULL,
    source_id TEXT NOT NULL,
    destination_id TEXT NOT NULL,
    metadata TEXT, -- JSON
    created_at TEXT DEFAULT (datetime('now')),
    UNIQUE(project_id, entity_type, source_id)
);

-- Migration logs
CREATE TABLE logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    execution_id TEXT NOT NULL REFERENCES executions(id),
    level TEXT NOT NULL CHECK(level IN ('debug', 'info', 'warning', 'error')),
    message TEXT NOT NULL,
    metadata TEXT, -- JSON
    created_at TEXT DEFAULT (datetime('now'))
);

-- Billing (mocked)
CREATE TABLE invoices (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    amount REAL NOT NULL,
    status TEXT DEFAULT 'paid',
    created_at TEXT DEFAULT (datetime('now'))
);

-- Sessions (for auth)
CREATE TABLE sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    token TEXT UNIQUE NOT NULL,
    expires_at TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
);

-- Indexes
CREATE INDEX idx_projects_user ON projects(user_id);
CREATE INDEX idx_files_project ON files(project_id);
CREATE INDEX idx_mappings_project ON mappings(project_id);
CREATE INDEX idx_executions_project ON executions(project_id);
CREATE INDEX idx_logs_execution ON logs(execution_id);
CREATE INDEX idx_id_mappings_project ON id_mappings(project_id);
```

---

## 7. MOCK DATA STRATEGY

### Seed Users (10 users)
```javascript
const users = [
  { id: 'user-001', email: 'demo@migrateflow.com', name: 'Demo User', plan: 'pro' },
  { id: 'user-002', email: 'free@example.com', name: 'Free User', plan: 'free' },
  { id: 'user-003', email: 'enterprise@bigcorp.com', name: 'Enterprise Admin', plan: 'enterprise' },
  // ... 7 more with varied plans
];
```

### Seed Projects (per user)
- Demo user: 3 projects (1 completed, 1 running, 1 draft)
- Free user: 1 project (at limit)
- Each project has realistic names: "Q4 2024 Migration", "Customer Import", etc.

### Seed Files
- Pre-generated CSV files with 100-1000 rows each
- Realistic data: fake names, emails, amounts, dates
- Some intentional errors for validation testing

### Seed Migration History
- Completed migrations with success/failure stats
- Log entries showing realistic progression
- ID mappings showing source → destination

### Realistic Scenarios
1. **Happy Path**: Project with all data valid, completes 100%
2. **Partial Failure**: Project with 5% failures, shows error handling
3. **Large Dataset**: Project with 10,000+ records, shows pagination
4. **In Progress**: Project mid-migration with live updates

---

## 8. UI/UX SPECIFICATIONS

### Color Scheme
```css
:root {
  --primary-50: #EEF2FF;
  --primary-100: #E0E7FF;
  --primary-500: #6366F1;  /* Main primary - Indigo */
  --primary-600: #4F46E5;
  --primary-700: #4338CA;
  
  --success-50: #ECFDF5;
  --success-500: #10B981;  /* Green */
  --success-700: #047857;
  
  --warning-50: #FFFBEB;
  --warning-500: #F59E0B;  /* Amber */
  
  --error-50: #FEF2F2;
  --error-500: #EF4444;    /* Red */
  --error-700: #B91C1C;
  
  --gray-50: #F9FAFB;
  --gray-100: #F3F4F6;
  --gray-200: #E5E7EB;
  --gray-300: #D1D5DB;
  --gray-400: #9CA3AF;
  --gray-500: #6B7280;
  --gray-600: #4B5563;
  --gray-700: #374151;
  --gray-800: #1F2937;
  --gray-900: #111827;
}
```

### Typography
```css
/* Font Family */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;

/* Headings */
h1: 2.25rem (36px), font-weight: 700, line-height: 1.2
h2: 1.875rem (30px), font-weight: 600, line-height: 1.3
h3: 1.5rem (24px), font-weight: 600, line-height: 1.4
h4: 1.25rem (20px), font-weight: 500, line-height: 1.4

/* Body */
body: 1rem (16px), font-weight: 400, line-height: 1.5
small: 0.875rem (14px), font-weight: 400, line-height: 1.5
xs: 0.75rem (12px), font-weight: 400, line-height: 1.5
```

### Component Classes (Tailwind)
```
/* Buttons */
.btn-primary: bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium
.btn-secondary: bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg
.btn-ghost: text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-4 py-2 rounded-lg

/* Cards */
.card: bg-white rounded-xl shadow-sm border border-gray-200 p-6

/* Inputs */
.input: w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500

/* Badges */
.badge-success: bg-success-50 text-success-700 px-2 py-1 rounded-full text-xs font-medium
.badge-warning: bg-warning-50 text-warning-700 px-2 py-1 rounded-full text-xs font-medium
.badge-error: bg-error-50 text-error-700 px-2 py-1 rounded-full text-xs font-medium
```

### Responsive Breakpoints
```css
sm: 640px   /* Mobile landscape */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
```

### States

**Loading State:**
- Skeleton with pulse animation
- Gray rectangles matching content layout
- No text, just shapes

**Empty State:**
- Centered illustration (SVG)
- Heading: "No [items] yet"
- Description text
- Primary action button

**Error State:**
- Red border on component
- Error icon (exclamation circle)
- Error message in red text
- Retry action if applicable

**Success State:**
- Green checkmark icon
- Success message
- Auto-dismiss after 3 seconds (toasts)

---

## 9. FILE STRUCTURE

```
/migrateflow
├── /frontend
│   ├── /public
│   │   ├── favicon.ico
│   │   ├── logo.svg
│   │   └── /images
│   │       ├── hero-illustration.svg
│   │       ├── empty-state.svg
│   │       └── onboarding-1.svg
│   │
│   ├── /src
│   │   ├── /components
│   │   │   ├── /ui
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── Input.jsx
│   │   │   │   ├── Card.jsx
│   │   │   │   ├── Badge.jsx
│   │   │   │   ├── Modal.jsx
│   │   │   │   ├── Dropdown.jsx
│   │   │   │   ├── Toast.jsx
│   │   │   │   ├── Skeleton.jsx
│   │   │   │   ├── ProgressBar.jsx
│   │   │   │   ├── Table.jsx
│   │   │   │   └── Tabs.jsx
│   │   │   │
│   │   │   ├── /layout
│   │   │   │   ├── Header.jsx
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   ├── Footer.jsx
│   │   │   │   └── DashboardLayout.jsx
│   │   │   │
│   │   │   ├── /auth
│   │   │   │   ├── AuthModal.jsx
│   │   │   │   ├── LoginForm.jsx
│   │   │   │   └── RegisterForm.jsx
│   │   │   │
│   │   │   ├── /dashboard
│   │   │   │   ├── StatsCards.jsx
│   │   │   │   ├── ProjectCard.jsx
│   │   │   │   ├── ProjectGrid.jsx
│   │   │   │   └── EmptyState.jsx
│   │   │   │
│   │   │   ├── /migration
│   │   │   │   ├── FileUploader.jsx
│   │   │   │   ├── FieldMapper.jsx
│   │   │   │   ├── MappingLine.jsx
│   │   │   │   ├── ValidationResults.jsx
│   │   │   │   ├── ProgressTracker.jsx
│   │   │   │   ├── LogViewer.jsx
│   │   │   │   └── EntityProgress.jsx
│   │   │   │
│   │   │   ├── /onboarding
│   │   │   │   ├── OnboardingWizard.jsx
│   │   │   │   ├── StepIndicator.jsx
│   │   │   │   ├── SystemSelector.jsx
│   │   │   │   └── FileDropzone.jsx
│   │   │   │
│   │   │   ├── /pricing
│   │   │   │   ├── PricingCard.jsx
│   │   │   │   ├── PricingToggle.jsx
│   │   │   │   ├── CheckoutModal.jsx
│   │   │   │   └── FeatureList.jsx
│   │   │   │
│   │   │   └── /settings
│   │   │       ├── ProfileForm.jsx
│   │   │       ├── BillingInfo.jsx
│   │   │       └── NotificationSettings.jsx
│   │   │
│   │   ├── /pages
│   │   │   ├── index.jsx                 (Landing page)
│   │   │   ├── pricing.jsx
│   │   │   ├── onboarding.jsx
│   │   │   ├── dashboard.jsx
│   │   │   ├── /migrations
│   │   │   │   ├── index.jsx             (List)
│   │   │   │   ├── new.jsx               (Create)
│   │   │   │   ├── [id].jsx              (Configure)
│   │   │   │   └── [id]/progress.jsx     (Progress view)
│   │   │   └── /settings
│   │   │       └── index.jsx
│   │   │
│   │   ├── /hooks
│   │   │   ├── useAuth.js
│   │   │   ├── useProjects.js
│   │   │   ├── useMigration.js
│   │   │   └── useToast.js
│   │   │
│   │   ├── /lib
│   │   │   ├── api.js                    (API client)
│   │   │   ├── auth.js                   (Auth helpers)
│   │   │   └── utils.js
│   │   │
│   │   ├── /styles
│   │   │   └── globals.css
│   │   │
│   │   └── /context
│   │       ├── AuthContext.jsx
│   │       └── ToastContext.jsx
│   │
│   ├── next.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── package.json
│
├── /backend
│   ├── /src
│   │   ├── index.js                      (Express app entry)
│   │   │
│   │   ├── /routes
│   │   │   ├── auth.js
│   │   │   ├── projects.js
│   │   │   ├── files.js
│   │   │   ├── mappings.js
│   │   │   ├── migrations.js
│   │   │   ├── stats.js
│   │   │   └── billing.js
│   │   │
│   │   ├── /controllers
│   │   │   ├── authController.js
│   │   │   ├── projectController.js
│   │   │   ├── fileController.js
│   │   │   ├── mappingController.js
│   │   │   ├── migrationController.js
│   │   │   ├── statsController.js
│   │   │   └── billingController.js
│   │   │
│   │   ├── /services
│   │   │   ├── migrationEngine.js        (Core from existing code)
│   │   │   ├── csvParser.js              (From DataExporter)
│   │   │   ├── validator.js              (From csv-validator)
│   │   │   ├── fieldMapper.js            (Auto-mapping logic)
│   │   │   └── mockDestination.js        (Mock API responses)
│   │   │
│   │   ├── /middleware
│   │   │   ├── auth.js
│   │   │   ├── errorHandler.js
│   │   │   └── upload.js                 (Multer config)
│   │   │
│   │   ├── /models
│   │   │   ├── User.js
│   │   │   ├── Project.js
│   │   │   ├── File.js
│   │   │   ├── Mapping.js
│   │   │   ├── Execution.js
│   │   │   └── Log.js
│   │   │
│   │   ├── /utils
│   │   │   ├── db.js                     (SQLite connection)
│   │   │   ├── logger.js                 (From Logger class)
│   │   │   └── idMapper.js               (From IdMapper class)
│   │   │
│   │   └── /jobs
│   │       └── migrationWorker.js        (Background job processor)
│   │
│   ├── package.json
│   └── .env.example
│
├── /database
│   ├── schema.sql
│   ├── seed.sql
│   └── migrations/
│       └── 001_initial.sql
│
├── /uploads                              (Uploaded files)
│   └── .gitkeep
│
├── /data                                 (Sample data)
│   ├── sample_contacts.csv
│   ├── sample_transactions.csv
│   └── sample_accounts.csv
│
├── docker-compose.yml                    (Optional)
├── README.md
└── package.json                          (Root workspace)
```

---

## 10. IMPLEMENTATION SEQUENCE

### Phase 1: Foundation (45 min)
1. Initialize project structure with `npm init` workspace
2. Set up Next.js frontend with Tailwind CSS
3. Set up Express backend with basic middleware
4. Create SQLite database and run schema.sql
5. Implement basic API client in frontend
6. Create UI component library (Button, Input, Card, Modal)

### Phase 2: Authentication (20 min)
7. Create users table seed data
8. Implement POST /api/auth/register endpoint
9. Implement POST /api/auth/login endpoint
10. Create AuthContext and useAuth hook
11. Build AuthModal with Login/Register forms
12. Add protected route middleware

### Phase 3: Dashboard Core (25 min)
13. Implement GET /api/projects endpoint
14. Implement GET /api/stats endpoint
15. Build DashboardLayout with Header and Sidebar
16. Create StatsCards component
17. Build ProjectCard and ProjectGrid
18. Add EmptyState component

### Phase 4: Project Creation (20 min)
19. Implement POST /api/projects endpoint
20. Build OnboardingWizard container
21. Create SystemSelector component
22. Build FileDropzone component
23. Implement POST /api/files/upload endpoint
24. Create file preview display

### Phase 5: Migration Configuration (30 min)
25. Implement GET /api/projects/:id endpoint
26. Build migration configuration page layout
27. Create FileUploader component
28. Implement PUT /api/projects/:id/mappings endpoint
29. Build FieldMapper with drag-drop
30. Create MappingLine visual connector
31. Implement POST /api/projects/:id/mappings/auto endpoint

### Phase 6: Validation (15 min)
32. Port csv-validator logic to validator.js service
33. Implement POST /api/projects/:id/validate endpoint
34. Build ValidationResults component
35. Add error row highlighting

### Phase 7: Migration Execution (25 min)
36. Port migration engine from existing PHP code to Node.js
37. Create mockDestination service (simulates API calls)
38. Implement POST /api/migrations/:id/run endpoint
39. Set up background job processing
40. Build ProgressTracker component
41. Create EntityProgress component
42. Build LogViewer with real-time updates
43. Implement pause/resume/cancel endpoints

### Phase 8: Pricing & Billing (15 min)
44. Build PricingCard components
45. Create pricing page with 3 tiers
46. Build CheckoutModal with form
47. Implement POST /api/billing/subscribe (mocked)
48. Add plan badges to dashboard

### Phase 9: Settings (10 min)
49. Build settings page with tabs
50. Create ProfileForm
51. Create BillingInfo display
52. Wire up plan management

### Phase 10: Landing Page (15 min)
53. Build hero section
54. Create features grid
55. Add testimonials section
56. Build footer
57. Add responsive adjustments

### Phase 11: Polish (10 min)
58. Add loading skeletons throughout
59. Implement toast notifications
60. Add error boundaries
61. Test all user flows
62. Seed demo data

---

## 11. MOCK PAYMENT FLOW

### Pricing Tiers

| Plan | Monthly | Annual | Features |
|------|---------|--------|----------|
| Free | $0 | $0 | 1 project, 1,000 records, CSV only, Email support |
| Pro | $29 | $279 | Unlimited projects, 50K records/mo, All formats, Priority support, Rollback |
| Enterprise | $99 | $950 | Everything in Pro, Unlimited records, API access, Dedicated support |

### Checkout Flow

1. User clicks "Upgrade to Pro" on pricing page
2. CheckoutModal opens with:
   - Plan summary: "Pro Plan - $29/month"
   - Card form (number, expiry, CVC, name)
   - Total with any discount
3. User enters: `4242 4242 4242 4242` (any valid-looking number)
4. Clicks "Subscribe"
5. 2 second loading spinner
6. If card ends in `0000`: Show "Payment declined" error
7. Otherwise: Show "Payment successful!" message
8. Modal closes, dashboard shows "Pro" badge
9. User limits updated in database

### Dashboard Changes After Upgrade

- Plan badge changes from "Free" to "Pro"
- Stats card shows new limits: "50,000 records/month"
- "Upgrade" button in sidebar disappears
- New "Manage Subscription" link appears in settings

### Invoice Generation

After successful subscription:
- Create invoice record in database
- Add to billing history
- Show in Settings > Billing tab

---

## 12. INTEGRATION INSTRUCTIONS FOR MY CODE

### Files to Use Directly

| Original File | New Location | Usage |
|---------------|--------------|-------|
| `classes/Logger.php` | `backend/src/utils/logger.js` | Port to JS, keep same interface |
| `classes/IdMapper.php` | `backend/src/utils/idMapper.js` | Port to JS, use SQLite instead of JSON |
| `classes/DataExporter.php` | `backend/src/services/csvParser.js` | Port CSV parsing logic |
| `csv-validator.php` | `backend/src/services/validator.js` | Port validation rules |
| `config.php` | `backend/src/config/fieldMappings.js` | Convert field mappings to JS object |

### Functions to Wrap/Adapt

**From migrate.php:**
- `migrateCategories()` → `migrationEngine.migrateEntity('categories', ...)`
- `migrateContractors()` → `migrationEngine.migrateEntity('contractors', ...)`
- `migrateIncomeTransactions()` → `migrationEngine.migrateEntity('income', ...)`
- `normalizeTransactionType()` → Keep as utility function
- `resolveRelatedTransactionId()` → Part of idMapper service

**From AdeskApi.php:**
- All API methods → Replace with `mockDestination.js` that simulates responses
- `createContractor()` → `mockDestination.createRecord('contractors', data)`
- `createTransaction()` → `mockDestination.createRecord('transactions', data)`
- Return format matches real Adesk API

### Parts to Ignore

- Shell scripts (`*.sh`) - Not needed for web app
- `check_api_status.php` - Replace with simpler health check
- `check_legal_entities.php` - Not relevant for mock
- `.env.example` - Create new one for web app

### How Existing Code Becomes the Engine

```javascript
// backend/src/services/migrationEngine.js

class MigrationEngine {
  constructor(projectId, db, logger, idMapper) {
    this.projectId = projectId;
    this.db = db;
    this.logger = logger; // From Logger class
    this.idMapper = idMapper; // From IdMapper class
  }

  async runMigration() {
    // Get project configuration
    const project = await this.db.getProject(this.projectId);
    const files = await this.db.getProjectFiles(this.projectId);
    const mappings = await this.db.getProjectMappings(this.projectId);

    // Migration order from original code
    const entityOrder = [
      'categories',
      'contractors', 
      'bank_accounts',
      'users',
      'projects',
      'income_transactions',
      'expense_transactions',
      'transfers'
    ];

    for (const entityType of entityOrder) {
      await this.migrateEntity(entityType, files, mappings);
    }
  }

  async migrateEntity(entityType, files, mappings) {
    // Port logic from migrateContractors(), migrateCategories(), etc.
    const file = files.find(f => f.file_type === entityType);
    if (!file) return;

    const data = await csvParser.parse(file.file_path);
    const mapped = this.applyMappings(data, mappings[entityType]);
    
    for (const record of mapped) {
      const result = await mockDestination.createRecord(entityType, record);
      if (result.success) {
        await this.idMapper.addMapping(entityType, record.id, result.id);
        this.logger.info(`Migrated ${entityType} ${record.id}`);
      }
    }
  }
}
```

---

## 13. SINGLE-PROMPT CODING INSTRUCTION

Copy and paste this exact prompt to your coding agent:

---

**BUILD INSTRUCTION FOR CODING AGENT**

Build "MigrateFlow" - a data migration SaaS platform that runs 100% locally. The complete specification follows.

**TECH STACK:**
- Frontend: Next.js 14 + Tailwind CSS + React
- Backend: Express.js + Node.js
- Database: SQLite (file-based)
- Auth: Local mock (no OAuth)
- Payments: Mocked Stripe-like UI

**START SEQUENCE:**
1. Create `/migrateflow` root folder
2. Initialize Next.js in `/frontend` with Tailwind
3. Initialize Express in `/backend`
4. Create SQLite database with schema (provided below)
5. Build in this order: Components → Auth → Dashboard → Migration Config → Validation → Execution → Pricing → Landing

**EXISTING CODE:**
The migration logic exists in PHP files I'll provide. Port these to JavaScript:
- `Logger.php` → `logger.js` (same interface)
- `IdMapper.php` → `idMapper.js` (use SQLite)
- `DataExporter.php` → `csvParser.js` (CSV parsing)
- `csv-validator.php` → `validator.js` (validation rules)
- `migrate.php` → `migrationEngine.js` (core logic)
- `AdeskApi.php` → `mockDestination.js` (simulate API responses)

**CRITICAL RULES:**
- No external APIs - mock everything
- Single `npm run dev` starts both frontend and backend
- All data persists in SQLite file
- Payment checkout is UI-only, always succeeds (unless card ends 0000)
- Use exact colors: Primary #6366F1, Success #10B981, Error #EF4444

**DATABASE SCHEMA:**
[Include full schema from Section 6]

**API ENDPOINTS:**
[Include all endpoints from Section 5]

**FILE STRUCTURE:**
[Include complete structure from Section 9]

**UI SPECIFICATIONS:**
- Font: Inter
- Use Tailwind utility classes
- Loading states: Skeleton with pulse
- Empty states: Centered illustration + CTA
- Toasts for success/error feedback

Create every file. Make it production-quality. Start with `/backend/src/index.js` and work through the implementation sequence.

---

This specification is complete. A coding agent can now build the entire application without asking clarifying questions.
