# FreeGate VPN — Complete Micro-SaaS Product Specification

**Document Version:** 1.0.0  
**Target Build Time:** 2 Hours  
**Stack:** React + Next.js + Tailwind CSS + SQLite + Node.js Backend  
**Deployment:** 100% Localhost, Zero External Dependencies

---

# SECTION 1: PRODUCT DEFINITION

## 1.1 Product Identity

**Product Name:** FreeGate VPN

**Tagline:** "Your Gateway to the Open Internet"

**One-Line Pitch:** A premium VPN service designed for users in restricted regions, offering military-grade encryption, blazing-fast servers, and one-tap connection to bypass censorship.

**Domain Concept:** freegate-vpn.local (for localhost development)

## 1.2 The Problem We Solve

Millions of internet users in Russia, China, Iran, UAE, Turkey, Belarus, and other countries face severe internet restrictions. Government-mandated firewalls block access to:

- Social media platforms (Twitter/X, Facebook, Instagram)
- Messaging apps (Telegram, WhatsApp, Signal)
- News websites (BBC, CNN, independent media)
- Video platforms (YouTube, partially blocked or throttled)
- Professional tools (GitHub, Stack Overflow, occasionally)
- VoIP services (Skype, Discord, Zoom calls)

Existing VPN solutions often fail because:
1. They use detectable protocols that Deep Packet Inspection (DPI) can identify
2. Their servers get IP-blocked quickly
3. They're too complex for average users
4. They drain battery and slow down connections
5. They don't offer selective app routing

## 1.3 Our Solution

FreeGate VPN leverages the battle-tested Xray Core with advanced protocol obfuscation (VLESS, VMess, Trojan, Shadowsocks) combined with hev-socks5-tunnel for efficient packet handling. The existing codebase provides:

- **TUN Interface Management:** Creates virtual network interface capturing all device traffic
- **SOCKS5 Bridging:** Efficiently routes packets through the proxy
- **App Selection:** Users choose which apps use VPN (split tunneling)
- **Native Performance:** JNI bridge ensures minimal overhead
- **Protocol Flexibility:** Xray Core supports multiple obfuscation protocols

## 1.4 Target Customer Personas

### Primary Persona: "Alexei" — The Russian Professional

**Demographics:**
- Age: 28-45
- Location: Moscow, Saint Petersburg, Novosibirsk
- Occupation: IT Professional, Designer, Marketing Manager
- Income: Middle to upper-middle class
- Tech Savvy: Medium to High

**Pain Points:**
- Cannot access work tools (Figma, Notion, Slack restricted)
- Cannot make international video calls reliably
- News sources blocked, relies on VPN for information
- Previous VPNs stopped working after recent crackdowns
- Worried about government surveillance

**Goals:**
- Reliable, always-working VPN connection
- Fast speeds for video calls and streaming
- Easy to use without technical knowledge
- Secure payment options (crypto preferred)
- Mobile app that doesn't drain battery

### Secondary Persona: "Chen Wei" — The Chinese Student

**Demographics:**
- Age: 18-25
- Location: Beijing, Shanghai, Shenzhen
- Occupation: University Student, Young Professional
- Income: Entry-level
- Tech Savvy: High

**Pain Points:**
- Great Firewall blocks research resources
- Cannot access Google Scholar, GitHub fully
- Social media (Instagram, Twitter) completely blocked
- Gaming servers and Discord blocked
- VPNs frequently detected and blocked

**Goals:**
- Affordable VPN for student budget
- Works despite GFW upgrades
- Fast enough for gaming
- Mobile and desktop apps
- No logs policy for safety

### Tertiary Persona: "Fatima" — The Iranian Activist

**Demographics:**
- Age: 22-35
- Location: Tehran, Isfahan
- Occupation: Journalist, NGO Worker, Artist
- Income: Varies
- Tech Savvy: Medium

**Pain Points:**
- Internet shutdowns during protests
- Severe penalties for VPN use (but necessary)
- Many VPNs don't work during crackdowns
- Needs to communicate with international press
- Safety is paramount

**Goals:**
- Maximum security and anonymity
- Obfuscation that survives shutdowns
- Kill switch to prevent leaks
- Trusted provider (no logs)
- Works on limited bandwidth

## 1.5 Core Value Proposition

| Feature | FreeGate VPN | Generic VPN |
|---------|--------------|-------------|
| Protocol Obfuscation | VLESS/VMess/Trojan (DPI-resistant) | OpenVPN/WireGuard (easily detected) |
| Split Tunneling | Per-app routing | All-or-nothing |
| Server Network | Optimized for restricted regions | Generic global |
| Detection Resistance | Active obfuscation updates | Static protocols |
| Battery Usage | Optimized native JNI | Heavy battery drain |
| Setup Complexity | One-tap connect | Manual configuration |

## 1.6 Competitive Analysis

### Competitor 1: ExpressVPN
- **Strengths:** Large server network, good brand recognition, 24/7 support
- **Weaknesses:** Expensive ($12.95/mo), protocols sometimes detected, no per-app routing on all platforms
- **Our Advantage:** Xray-based protocols more resistant to DPI, more affordable, better split tunneling

### Competitor 2: Outline VPN (by Jigsaw/Google)
- **Strengths:** Free, open-source, Shadowsocks-based
- **Weaknesses:** Requires self-hosting servers, no app, technical setup needed
- **Our Advantage:** Managed service, mobile app, no technical knowledge required

### Competitor 3: Lantern
- **Strengths:** Free tier, designed for censorship circumvention
- **Weaknesses:** Slow speeds, limited server locations, ad-supported free tier
- **Our Advantage:** Faster Xray protocol, no ads, premium server network

### Competitor 4: Psiphon
- **Strengths:** Free, good for Iran/China, multiple protocols
- **Weaknesses:** Slow, connection drops, no premium option
- **Our Advantage:** Premium speeds, stable connections, professional support

## 1.7 Business Model

### Revenue Streams

1. **Subscription Plans:**
   - Free Tier: 500MB/day, 3 server locations, basic support
   - Premium ($4.99/mo): Unlimited data, 50+ locations, priority support
   - Ultimate ($9.99/mo): Unlimited + dedicated IP, streaming optimized, 24/7 support

2. **Annual Discounts:**
   - Premium Annual: $39.99/year (33% off)
   - Ultimate Annual: $79.99/year (33% off)

3. **Lifetime Deal (Launch Promotion):**
   - Lifetime Premium: $99.99 one-time
   - Lifetime Ultimate: $199.99 one-time

### Payment Methods (Mocked for Localhost)
- Credit Card (Stripe mock)
- PayPal (mock)
- Cryptocurrency (Bitcoin, USDT) - mock
- Regional payment methods (Qiwi for Russia, Alipay for China) - mock

## 1.8 Success Metrics (KPIs)

For the localhost demo, we'll simulate these metrics:

| Metric | Target | Mock Display |
|--------|--------|--------------|
| Daily Active Users | 10,000+ | Random 8,000-15,000 |
| Paid Conversion Rate | 5% | Show 4.8% |
| Monthly Churn | <3% | Show 2.1% |
| Avg Session Duration | 4+ hours | Show 5.2 hours |
| Server Uptime | 99.9% | Show 99.97% |
| Support Response Time | <2 hours | Show 47 minutes |
| App Store Rating | 4.5+ | Show 4.7 stars |

---

# SECTION 2: MARKET ANALYSIS

## 2.1 Total Addressable Market (TAM)

### Global VPN Market
- 2024 Market Size: $44.6 billion
- 2030 Projected: $137.7 billion
- CAGR: 17.4%

### Restricted Region Focus

**Russia:**
- Internet Users: 130 million
- VPN Usage Rate: 23% (post-2022 surge)
- Estimated VPN Users: 30 million
- Addressable Market: $450 million annually

**China:**
- Internet Users: 1.05 billion
- VPN Usage Rate: 14% (despite crackdowns)
- Estimated VPN Users: 147 million
- Addressable Market: $2.2 billion annually

**Iran:**
- Internet Users: 67 million
- VPN Usage Rate: 42% (highest globally)
- Estimated VPN Users: 28 million
- Addressable Market: $280 million annually

**UAE:**
- Internet Users: 9.9 million
- VPN Usage Rate: 35%
- Estimated VPN Users: 3.5 million
- Addressable Market: $70 million annually

**Turkey:**
- Internet Users: 69 million
- VPN Usage Rate: 32%
- Estimated VPN Users: 22 million
- Addressable Market: $220 million annually

### Serviceable Addressable Market (SAM)
Focusing on premium users willing to pay: ~$500 million annually

### Serviceable Obtainable Market (SOM)
Realistic first-year target with marketing: $2-5 million annually

## 2.2 Market Trends

### Trend 1: Increasing Government Censorship
- Russia banned major VPNs in 2023
- China's GFW upgrades quarterly
- Iran implements regular internet shutdowns
- This drives demand for more sophisticated solutions

### Trend 2: Protocol Arms Race
- Traditional VPN protocols (OpenVPN, L2TP) easily detected
- Xray/V2Ray protocols gaining popularity
- Constant cat-and-mouse with DPI systems
- Users seek providers with latest obfuscation

### Trend 3: Mobile-First Usage
- 78% of VPN usage in restricted regions is mobile
- Android dominates (85%+ in Russia, Iran)
- iOS secondary but growing
- Desktop use primarily for work

### Trend 4: Privacy Awareness Growth
- Post-Snowden, post-Cambridge Analytica awareness
- Users demand no-logs policies
- Jurisdiction matters (avoid Five Eyes)
- End-to-end encryption expected

### Trend 5: Streaming and Gaming
- Users want VPN for Netflix, Disney+, HBO access
- Gaming VPNs for reduced latency
- Video call quality critical
- Bandwidth expectations increasing

## 2.3 Regulatory Landscape

### Russia
- VPN use legal for individuals
- Providing VPN services requires Roskomnadzor registration
- Non-compliant VPNs blocked
- Our approach: Present as "secure networking tool"

### China
- VPN use in gray area (technically illegal without approval)
- Corporate VPNs allowed with permits
- Personal use tolerated but risky
- Our approach: Stealth protocols, no China-based infrastructure

### Iran
- VPN use widespread despite illegality
- Penalties rarely enforced for personal use
- Providers outside Iran not subject to laws
- Our approach: Maximum anonymity features

### UAE
- VPN use legal for legitimate purposes
- Illegal for accessing blocked content
- Providers must not enable illegal activity
- Our approach: Terms of service compliance language

## 2.4 Distribution Channels

### Primary: Google Play Store
- Direct APK download also available
- Sideloading common in restricted regions
- Alternative stores (APKPure, Aptoide)

### Secondary: Website Direct Download
- APK download from website
- Necessary when Play Store blocked
- Version parity with store version

### Tertiary: Word of Mouth
- Critical in restricted markets
- Referral program incentives
- Social media organic (Telegram groups, VK)

### Marketing Channels (Mocked for Demo)
- Telegram channel: @FreeGateVPN
- Twitter/X: @FreeGateVPN
- YouTube tutorials
- Tech blog reviews
- Reddit communities (r/vpn, r/privacy)

## 2.5 User Acquisition Strategy

### Phase 1: Launch (Months 1-3)
- Free tier attracts initial users
- Telegram group for support and community
- Tech influencer partnerships
- Reddit organic participation
- Target: 10,000 users

### Phase 2: Growth (Months 4-6)
- Referral program launch
- Limited-time lifetime deals
- YouTube ad campaigns (geo-targeted)
- App store optimization
- Target: 50,000 users

### Phase 3: Scale (Months 7-12)
- Paid social media campaigns
- Influencer affiliate program
- B2B corporate accounts
- White-label partnerships
- Target: 200,000 users

---

# SECTION 3: FEATURE MATRIX

## 3.1 Complete Feature List

| Feature | Priority | Complexity | Existing Code | Build Status |
|---------|----------|------------|---------------|--------------|
| **Core VPN Features** |||||
| TUN Interface Creation | P0 | High | ✅ Yes | Use directly |
| SOCKS5 Tunnel Bridge | P0 | High | ✅ Yes | Use directly |
| Xray Core Integration | P0 | High | ✅ Yes | Use directly |
| One-Tap Connect | P0 | Medium | ✅ Yes | Adapt |
| Auto-Reconnect | P0 | Medium | ⚠️ Partial | Enhance |
| Kill Switch | P1 | High | ❌ No | Build new |
| Split Tunneling (Per-App) | P0 | High | ✅ Yes | Use directly |
| Protocol Selection | P1 | Medium | ⚠️ Partial | Enhance |
| **Server Management** |||||
| Server List Display | P0 | Low | ❌ No | Build new |
| Server Ping/Latency | P1 | Medium | ❌ No | Build new |
| Server Load Display | P2 | Medium | ❌ No | Build new |
| Favorite Servers | P2 | Low | ❌ No | Build new |
| Recent Servers | P2 | Low | ❌ No | Build new |
| Auto-Select Best Server | P1 | Medium | ❌ No | Build new |
| Streaming-Optimized Servers | P2 | Low | ❌ No | Build new |
| **User Interface** |||||
| Connection Status Widget | P0 | Medium | ⚠️ Partial | Enhance |
| Data Usage Display | P1 | Medium | ✅ Yes | Adapt |
| Connection Timer | P2 | Low | ❌ No | Build new |
| Map View (Server Locations) | P3 | High | ❌ No | Build new |
| Dark/Light Theme | P2 | Low | ❌ No | Build new |
| Quick Settings Tile | P1 | Low | ✅ Yes | Use directly |
| Notification Controls | P0 | Low | ✅ Yes | Use directly |
| **Account & Subscription** |||||
| User Registration | P0 | Medium | ❌ No | Build new |
| Login/Logout | P0 | Medium | ❌ No | Build new |
| Profile Management | P2 | Low | ❌ No | Build new |
| Subscription Display | P0 | Low | ❌ No | Build new |
| Payment Processing (Mock) | P0 | High | ❌ No | Build new |
| Plan Upgrade/Downgrade | P1 | Medium | ❌ No | Build new |
| Usage Quota Display | P0 | Low | ❌ No | Build new |
| **Settings** |||||
| Protocol Configuration | P1 | Medium | ⚠️ Partial | Enhance |
| DNS Settings | P2 | Medium | ✅ Yes | Adapt |
| MTU Configuration | P3 | Low | ✅ Yes | Use directly |
| IPv6 Toggle | P2 | Low | ✅ Yes | Use directly |
| LAN Bypass Toggle | P2 | Low | ✅ Yes | Use directly |
| Auto-Connect on Boot | P2 | Medium | ❌ No | Build new |
| Auto-Connect on WiFi | P2 | Medium | ❌ No | Build new |
| Language Selection | P3 | Low | ❌ No | Build new |
| **Security Features** |||||
| Encryption Status Display | P2 | Low | ❌ No | Build new |
| Protocol Obfuscation | P0 | High | ✅ Yes | Use directly |
| IP Leak Protection | P1 | High | ⚠️ Partial | Enhance |
| DNS Leak Protection | P1 | High | ⚠️ Partial | Enhance |
| No-Logs Verification | P2 | Low | ❌ No | Build new |
| **Support & Help** |||||
| FAQ Section | P2 | Low | ❌ No | Build new |
| Contact Support | P2 | Low | ❌ No | Build new |
| Report Problem | P2 | Low | ❌ No | Build new |
| Connection Diagnostics | P2 | Medium | ❌ No | Build new |
| Speed Test | P3 | Medium | ❌ No | Build new |
| **Analytics (Admin)** |||||
| User Dashboard | P1 | High | ❌ No | Build new |
| Revenue Metrics | P1 | Medium | ❌ No | Build new |
| Server Health | P1 | Medium | ❌ No | Build new |
| User Activity Logs | P2 | Medium | ❌ No | Build new |

## 3.2 Feature Prioritization Rationale

### P0 (Must Have for MVP)
These features are essential for a functional VPN product:
- Without TUN/SOCKS5/Xray, there's no VPN
- Without one-tap connect, usability fails
- Without split tunneling, competitive disadvantage
- Without account system, no monetization
- Without subscription display, users confused

### P1 (Should Have)
Important for competitive product:
- Kill switch expected by security-conscious users
- Protocol selection needed for obfuscation
- Auto-select server improves UX
- IP/DNS leak protection for trust

### P2 (Nice to Have)
Enhancements for polish:
- Themes for personalization
- Favorites for power users
- Diagnostics for self-service support

### P3 (Future Consideration)
Can add post-MVP:
- Map view is visual but not functional
- Speed test is marketing feature
- Language selection for localization

## 3.3 Mapping Existing Code to Features

### Direct Use (No Modification)
```
TProxyService.kt → Core VPN service
hev_socks5_tunnel.cpp → JNI bridge
AppSelectionActivity.kt → Split tunneling UI
VpnTileService.kt → Quick settings
tunnel_config_template.yaml → Config generation
All layout XMLs → Base UI components
```

### Adapt (Minor Modifications)
```
TProxyService.startVPN() → Add server selection parameter
TProxyService notifications → Enhance with data usage
AppSelectionActivity → Add search/filter
Settings handling → Extend for new options
```

### Build New (From Scratch)
```
Server list management
Account/auth system
Subscription handling
Payment flow
Admin dashboard
All web components
```

---

# SECTION 4: USER JOURNEYS

## 4.1 Journey 1: New User — First Connection

### Step 1: Discovery
**Context:** User finds FreeGate through Telegram recommendation
**Action:** Opens Play Store or visits website
**Screen:** Play Store listing or landing page
**Emotion:** Curious but skeptical

### Step 2: Download
**Context:** Decides to try based on reviews/rating
**Action:** Clicks "Install" on Play Store
**Screen:** Download progress
**Emotion:** Hopeful

### Step 3: First Launch
**Context:** Opens app for first time
**Action:** App launches
**Screen:** Welcome/Onboarding Screen 1
**Content:**
- FreeGate logo animation
- "Welcome to FreeGate VPN"
- "Your gateway to the open internet"
- "Get started" button
**Emotion:** Engaged

### Step 4: Onboarding - Value Props
**Context:** Viewing onboarding
**Action:** Swipes through 3 screens
**Screen:** Onboarding Carousel

**Screen 1 - Security:**
- Shield icon
- "Military-Grade Encryption"
- "256-bit AES encryption protects all your data"
- Dot indicator: ● ○ ○

**Screen 2 - Speed:**
- Lightning bolt icon
- "Blazing Fast Servers"
- "50+ optimized servers in 30 countries"
- Dot indicator: ○ ● ○

**Screen 3 - Simplicity:**
- One-tap icon
- "One Tap to Connect"
- "No configuration needed. Just tap and go."
- Dot indicator: ○ ○ ●
- "Continue" button

**Emotion:** Impressed, understanding value

### Step 5: Account Creation Prompt
**Context:** After onboarding
**Action:** Chooses sign up method
**Screen:** Auth Options
**Content:**
- "Create Your Account"
- Email input field
- Password input field
- "Create Account" button
- Divider: "or continue with"
- "Continue as Guest" link (for free tier)
- "Already have an account? Log in"
**Emotion:** Slight friction but acceptable

### Step 6: Guest Mode (Free Tier)
**Context:** User wants to try before committing
**Action:** Clicks "Continue as Guest"
**Screen:** Guest Mode Confirmation
**Content:**
- "You're using FreeGate Free"
- "500MB daily limit"
- "3 server locations"
- "Create account anytime to upgrade"
- "Start Using FreeGate" button
**Emotion:** Relieved at easy option

### Step 7: VPN Permission Request
**Context:** Android requires VPN permission
**Action:** System dialog appears
**Screen:** Android VPN Permission Dialog
**Content:**
- "Connection request"
- "FreeGate VPN wants to set up a VPN connection that allows it to monitor network traffic. Only accept if you trust the source."
- "Cancel" / "OK" buttons
**Emotion:** Brief concern, then acceptance

### Step 8: Main Dashboard (Disconnected)
**Context:** Permission granted, ready to connect
**Action:** Views main screen
**Screen:** Main Dashboard - Disconnected State
**Content:**
- Status: "Not Connected"
- Large connect button (gray, inactive appearance)
- Current location: "Your IP is visible"
- Selected server: "Auto - Best Location"
- Server selector button
- Bottom navigation: Home | Servers | Settings | Account
**Emotion:** Ready to connect

### Step 9: First Connection
**Context:** Wants to connect
**Action:** Taps large connect button
**Screen:** Main Dashboard - Connecting State
**Content:**
- Status: "Connecting..."
- Connect button: Pulsing animation
- Progress text: "Establishing secure tunnel..."
- Server: "Netherlands - Amsterdam"
**Emotion:** Anticipation

### Step 10: Connected State
**Context:** Connection established
**Action:** Views connected dashboard
**Screen:** Main Dashboard - Connected State
**Content:**
- Status: "Connected" (green)
- Large disconnect button (green, active)
- New IP: "185.xxx.xxx.xxx"
- Location: "Netherlands"
- Timer: "00:00:15"
- Data used: "0 MB / 500 MB"
- Speed: "↓ 0 KB/s ↑ 0 KB/s"
**Emotion:** Success, relief

### Step 11: Verification
**Context:** Wants to confirm VPN works
**Action:** Opens browser, searches "what is my IP"
**Screen:** External browser
**Result:** Shows Netherlands IP address
**Emotion:** Trust established

### Step 12: Usage
**Context:** Uses blocked services
**Action:** Opens Telegram, YouTube, etc.
**Screen:** External apps
**Result:** All services work
**Emotion:** Satisfaction, value confirmed

## 4.2 Journey 2: Free User — Upgrade Flow

### Step 1: Quota Warning
**Context:** User approaching daily limit
**Action:** Receives notification
**Screen:** System Notification
**Content:**
- "FreeGate VPN"
- "You've used 400MB of your 500MB daily limit"
- "Tap to upgrade for unlimited data"
**Emotion:** Concerned

### Step 2: Dashboard Warning
**Context:** Opens app to check
**Action:** Views dashboard
**Screen:** Main Dashboard with Warning
**Content:**
- Yellow warning banner: "80% of daily limit used"
- Data: "400 MB / 500 MB"
- "Upgrade to Premium" button in banner
**Emotion:** Considering upgrade

### Step 3: Quota Exceeded
**Context:** Hits daily limit
**Action:** Connection slows/stops
**Screen:** Main Dashboard - Quota Exceeded
**Content:**
- Status: "Limit Reached"
- Red banner: "Daily limit exceeded"
- "Resets in 8 hours"
- "Upgrade Now for Unlimited" prominent button
**Emotion:** Frustrated but understanding

### Step 4: Upgrade Decision
**Context:** Decides to upgrade
**Action:** Taps upgrade button
**Screen:** Pricing Page
**Content:**
```
Choose Your Plan

[FREE]                    [PREMIUM]              [ULTIMATE]
$0/month                  $4.99/month            $9.99/month
                          Most Popular           Best Value
─────────────────────────────────────────────────────────────
✓ 500MB/day              ✓ Unlimited data       ✓ Unlimited data
✓ 3 locations            ✓ 50+ locations        ✓ 50+ locations
✓ Basic support          ✓ Priority support     ✓ 24/7 support
✗ Basic speeds           ✓ High-speed servers   ✓ Dedicated IP
✗ Ads                    ✓ No ads               ✓ Streaming optimized
                         ✓ 5 devices            ✓ 10 devices

[Current Plan]           [Select Plan]          [Select Plan]

──── Save 33% with Annual ────
Premium: $39.99/year     Ultimate: $79.99/year
```
**Emotion:** Evaluating options

### Step 5: Plan Selection
**Context:** Chooses Premium
**Action:** Taps "Select Plan" on Premium
**Screen:** Plan Confirmation
**Content:**
- "Premium Plan - $4.99/month"
- Features list recap
- "Billed monthly, cancel anytime"
- "Continue to Payment" button
**Emotion:** Committed

### Step 6: Payment Method
**Context:** Proceeding to payment
**Action:** Views payment options
**Screen:** Payment Methods
**Content:**
```
Select Payment Method

[Credit Card icon] Credit or Debit Card
[PayPal icon] PayPal
[Bitcoin icon] Bitcoin
[USDT icon] USDT (Tether)

Secure payment processed by Stripe
```
**Emotion:** Reassured by options

### Step 7: Card Entry (Mock)
**Context:** Selected credit card
**Action:** Enters card details
**Screen:** Card Entry Form
**Content:**
```
Card Information

Card Number: [________________]
Expiry: [MM/YY]    CVC: [___]
Name on Card: [________________]

Billing Address
Country: [Dropdown]
ZIP Code: [_______]

[ ] Save card for future payments

Total: $4.99

[Pay $4.99]
```
**Emotion:** Standard checkout expectation

### Step 8: Processing
**Context:** Submitted payment
**Action:** Waits for processing
**Screen:** Processing Screen
**Content:**
- Spinning indicator
- "Processing your payment..."
- "Please don't close this screen"
**Emotion:** Brief anxiety

### Step 9: Success
**Context:** Payment approved (mocked)
**Action:** Views confirmation
**Screen:** Payment Success
**Content:**
- Green checkmark animation
- "Welcome to Premium!"
- "Your subscription is now active"
- Receipt details
- "Start Using Premium" button
**Emotion:** Excitement, satisfaction

### Step 10: Premium Dashboard
**Context:** Returns to main screen
**Action:** Views updated dashboard
**Screen:** Main Dashboard - Premium
**Content:**
- Premium badge visible
- No data limit display
- All servers available
- "Connected to Premium Server"
**Emotion:** Value received

## 4.3 Journey 3: Power User — Split Tunneling Setup

### Step 1: Need Identification
**Context:** User wants banking app to bypass VPN
**Action:** Navigates to settings
**Screen:** Settings Page
**Content:**
- VPN Settings section
- "Split Tunneling" / "App Selection" option
**Emotion:** Purposeful

### Step 2: Access App Selection
**Context:** Wants to configure apps
**Action:** Taps "App Selection"
**Screen:** App Selection Activity
**Content:**
- Header: "Select Apps to Exclude"
- Search bar
- Loading spinner initially
- "Apps using VPN will be protected"
**Emotion:** Engaged

### Step 3: App List Loaded
**Context:** Apps loaded
**Action:** Views full list
**Screen:** App Selection - Loaded
**Content:**
```
Search apps...

─── System Apps ───
[icon] Chrome                    [checkbox]
[icon] Gmail                     [checkbox]
[icon] Google Maps               [checkbox]
[icon] Phone                     [checkbox]

─── Installed Apps ───
[icon] Banking App               [checkbox]
[icon] Instagram                 [checkbox]
[icon] Netflix                   [checkbox]
[icon] Telegram                  [checkbox]
[icon] WhatsApp                  [checkbox]
[icon] YouTube                   [checkbox]
```
**Emotion:** Organized view

### Step 4: Selection
**Context:** Wants to exclude banking app
**Action:** Checks banking app checkbox
**Screen:** App Selection - Item Checked
**Content:**
- Banking App row highlighted
- Checkbox filled
- Toast: "Banking App will bypass VPN"
**Emotion:** Control confirmed

### Step 5: Additional Exclusions
**Context:** Also wants maps for local routing
**Action:** Checks Google Maps
**Screen:** Updated list
**Content:**
- Two apps now checked
- Counter: "2 apps excluded"
**Emotion:** Efficient

### Step 6: Verify Configuration
**Context:** Wants to confirm settings
**Action:** Returns to main dashboard
**Screen:** Main Dashboard
**Content:**
- Settings indicator: "2 apps bypassing VPN"
- Connection status normal
**Emotion:** Assured

### Step 7: Test Configuration
**Context:** Verifies setup works
**Action:** Opens banking app and Telegram
**Result:**
- Banking app shows local IP
- Telegram shows VPN IP
**Emotion:** Perfect setup achieved

## 4.4 Journey 4: Server Selection

### Step 1: Default Connection
**Context:** Connected to auto-selected server
**Action:** Notices slow speeds
**Screen:** Main Dashboard
**Content:**
- Speed: "↓ 2.1 MB/s ↑ 0.5 MB/s"
- Server: "Auto - Singapore"
**Emotion:** Disappointed

### Step 2: Open Server List
**Context:** Wants to try different server
**Action:** Taps "Servers" in bottom nav
**Screen:** Server List
**Content:**
```
Servers

[Search icon] Search locations...

⭐ Favorites (0)

🕐 Recent
   Netherlands - Amsterdam    45ms    ●●●●○

📍 All Servers

🇺🇸 United States
   New York                   180ms   ●●●○○
   Los Angeles               210ms   ●●○○○
   Miami                     195ms   ●●●○○

🇳🇱 Netherlands
   Amsterdam                  45ms   ●●●●○  [Streaming]
   Rotterdam                  52ms   ●●●●○

🇩🇪 Germany
   Frankfurt                  48ms   ●●●●○
   Berlin                     55ms   ●●●○○

🇯🇵 Japan
   Tokyo                      85ms   ●●●●○  [Gaming]

🇸🇬 Singapore
   Singapore                 120ms   ●●●○○  [Current]

🇬🇧 United Kingdom
   London                     62ms   ●●●●○  [Streaming]
```
**Emotion:** Exploring options

### Step 3: Check Latency
**Context:** Looking for faster server
**Action:** Notices Netherlands has 45ms
**Screen:** Server List
**Content:**
- Netherlands highlighted with low ping
- Green indicator showing good load
**Emotion:** Found better option

### Step 4: Connect to New Server
**Context:** Selects Netherlands
**Action:** Taps Amsterdam server
**Screen:** Server Switching
**Content:**
- "Switching to Netherlands - Amsterdam..."
- Brief disconnection notice
**Emotion:** Anticipation

### Step 5: New Connection Established
**Context:** Connected to new server
**Action:** Views dashboard
**Screen:** Main Dashboard - New Server
**Content:**
- Status: "Connected"
- Server: "Netherlands - Amsterdam"
- Speed: "↓ 25.4 MB/s ↑ 12.1 MB/s"
- Latency: "45ms"
**Emotion:** Satisfaction with improvement

### Step 6: Add to Favorites
**Context:** Wants quick access later
**Action:** Long-press server or tap star
**Screen:** Server added to favorites
**Content:**
- Star icon filled
- Toast: "Added to Favorites"
**Emotion:** Personalization achieved

## 4.5 Journey 5: Account Management

### Step 1: Access Account
**Context:** Wants to manage subscription
**Action:** Taps "Account" in navigation
**Screen:** Account Page
**Content:**
```
Account

[Avatar] John Doe
john.doe@email.com
Premium Member since Jan 2024

──────────────────────────

Subscription
━━━━━━━━━━━━━━━━━━━━━━━━
Plan: Premium ($4.99/mo)
Status: Active
Next billing: Feb 15, 2024
Payment method: •••• 4242

[Manage Subscription]
[Update Payment Method]

──────────────────────────

Usage This Month
━━━━━━━━━━━━━━━━━━━━━━━━
Data: 45.2 GB
Connection time: 142 hours
Sessions: 89

──────────────────────────

Security
━━━━━━━━━━━━━━━━━━━━━━━━
[Change Password]
[Two-Factor Authentication]
[Active Sessions]

──────────────────────────

[Sign Out]
[Delete Account]
```
**Emotion:** In control

### Step 2: View Usage Details
**Context:** Curious about usage
**Action:** Taps usage section
**Screen:** Usage Details
**Content:**
```
Usage Details

January 2024

Daily Usage Chart [Bar graph showing daily data]

Peak Usage: Jan 15 - 8.2 GB
Average: 1.5 GB/day

By Server Location:
Netherlands     52%  ████████████
Germany         28%  ███████
United States   15%  ████
Other            5%  █

By App (if tracking enabled):
YouTube         35%
Netflix         25%
Telegram        20%
Browser         15%
Other            5%
```
**Emotion:** Informed

### Step 3: Manage Subscription
**Context:** Considering plan change
**Action:** Taps "Manage Subscription"
**Screen:** Subscription Management
**Content:**
```
Manage Subscription

Current Plan: Premium

Options:
[ ] Upgrade to Ultimate ($9.99/mo)
    + Dedicated IP
    + 10 devices
    + 24/7 priority support

[ ] Switch to Annual ($39.99/year)
    Save 33% - $20 savings

[ ] Cancel Subscription
    Your plan continues until Feb 15

[Save Changes]
```
**Emotion:** Options clear

### Step 4: Cancel Flow (Example)
**Context:** Considering cancellation
**Action:** Taps cancel subscription
**Screen:** Cancellation Flow
**Content:**
```
We're sorry to see you go

Before you cancel, would you like to:

[ ] Pause subscription for 1 month (free)
[ ] Switch to annual and save 33%
[ ] Talk to support about an issue

──────────────────────────

Reason for cancelling:
( ) Too expensive
( ) Not using enough
( ) Found alternative
( ) Technical issues
( ) Other: [________]

[Continue Cancellation] [Keep Subscription]
```
**Emotion:** Valued, reconsidering

---

# SECTION 5: PAGE-BY-PAGE SPECIFICATION

## 5.1 Landing Page (Web)

**PAGE:** Landing Page  
**URL:** /  
**PURPOSE:** Convert visitors to downloads/sign-ups

### Components

**Header (Fixed)**
```
Logo: FreeGate VPN (left)
Navigation: Features | Pricing | Download | Support (center)
CTA: "Get Started" button (right)
Mobile: Hamburger menu
```

**Hero Section**
```
Background: Gradient blue-purple with subtle network mesh animation
Headline: "Break Free from Internet Restrictions"
Subheadline: "Military-grade encryption. Lightning-fast servers. One tap to connect."
Primary CTA: "Download Free" (large green button)
Secondary CTA: "View Pricing" (outline button)
Trust badges: "50+ Servers | 30 Countries | No Logs"
Hero Image: Phone mockup showing app connected state
```

**Problem Section**
```
Headline: "Internet Freedom Shouldn't Be a Privilege"
Three columns:
1. Icon: Lock | "Blocked Websites" | "Access any website, anywhere"
2. Icon: Eye | "Privacy Concerns" | "Hide your activity from ISPs"
3. Icon: Speed | "Throttled Speeds" | "Stream without buffering"
```

**Features Section**
```
Headline: "Why Choose FreeGate?"

Feature cards (2x3 grid):
1. Shield icon | "Military-Grade Encryption"
   "256-bit AES encryption keeps your data safe"

2. Lightning icon | "50+ Global Servers"
   "Optimized servers in 30 countries"

3. App icon | "Split Tunneling"
   "Choose which apps use VPN"

4. Protocol icon | "Advanced Protocols"
   "VLESS, VMess, Trojan - undetectable"

5. Battery icon | "Battery Efficient"
   "Native code for minimal power use"

6. Support icon | "24/7 Support"
   "Real humans, real help, anytime"
```

**Social Proof Section**
```
Headline: "Trusted by 500,000+ Users"

Testimonial cards (3):
1. "Finally a VPN that works in China!"
   - Chen W., Shanghai ⭐⭐⭐⭐⭐

2. "Fast, reliable, and the app is beautiful"
   - Alexei K., Moscow ⭐⭐⭐⭐⭐

3. "Best VPN for streaming Netflix abroad"
   - Sarah M., Dubai ⭐⭐⭐⭐⭐

App store ratings:
Google Play: 4.7 ⭐ (12,000+ reviews)
```

**Pricing Preview Section**
```
Headline: "Simple, Transparent Pricing"

Three plan cards (abbreviated):
Free: $0 | 500MB/day | Get Started
Premium: $4.99/mo | Unlimited | Most Popular
Ultimate: $9.99/mo | + Dedicated IP | Best Value

Link: "Compare all features →"
```

**Download Section**
```
Headline: "Get FreeGate Now"
Subheadline: "Available on Android. iOS coming soon."

Download buttons:
- Google Play badge (links to store)
- "Download APK" button (direct download)
- QR code for mobile scanning

System requirements: "Android 7.0 or higher"
```

**FAQ Section**
```
Headline: "Frequently Asked Questions"

Accordion items:
Q: Is FreeGate VPN safe to use?
A: Yes, we use military-grade encryption...

Q: Will FreeGate work in China/Russia/Iran?
A: Yes, our advanced protocols are designed...

Q: Do you keep logs of my activity?
A: No, we maintain a strict no-logs policy...

Q: Can I use FreeGate on multiple devices?
A: Free: 1 device, Premium: 5, Ultimate: 10

Q: What payment methods do you accept?
A: Credit cards, PayPal, and cryptocurrency...
```

**Footer**
```
Columns:
1. Logo + brief description
2. Product: Features, Pricing, Download, API
3. Company: About, Blog, Careers, Press
4. Support: Help Center, Contact, Status
5. Legal: Privacy Policy, Terms of Service

Bottom bar:
© 2024 FreeGate VPN | Language selector | Social icons
```

### States

**Loading State:**
- Skeleton loaders for dynamic content
- Hero loads first, content progressive

**Error State:**
- If API fails, show cached content
- Error banner for critical issues

### API Calls
- GET /api/stats (server count, user count)
- GET /api/testimonials (featured reviews)

---

## 5.2 Pricing Page (Web)

**PAGE:** Pricing  
**URL:** /pricing  
**PURPOSE:** Convert visitors to paid plans

### Components

**Header**
Same as landing page

**Pricing Hero**
```
Headline: "Choose Your Plan"
Subheadline: "Start free, upgrade anytime. No commitments."
Toggle: [Monthly] / [Annual - Save 33%]
```

**Pricing Cards**
```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐              │
│  │     FREE     │    │   PREMIUM    │    │   ULTIMATE   │              │
│  │              │    │  Most Popular│    │  Best Value  │              │
│  │    $0/mo     │    │  $4.99/mo    │    │  $9.99/mo    │              │
│  │              │    │  $39.99/yr   │    │  $79.99/yr   │              │
│  │──────────────│    │──────────────│    │──────────────│              │
│  │ ✓ 500MB/day  │    │ ✓ Unlimited  │    │ ✓ Unlimited  │              │
│  │ ✓ 3 servers  │    │ ✓ 50+ servers│    │ ✓ 50+ servers│              │
│  │ ✓ 1 device   │    │ ✓ 5 devices  │    │ ✓ 10 devices │              │
│  │ ✓ Basic      │    │ ✓ Priority   │    │ ✓ 24/7       │              │
│  │   support    │    │   support    │    │   support    │              │
│  │ ✗ Ads        │    │ ✓ No ads     │    │ ✓ No ads     │              │
│  │ ✗ Limited    │    │ ✓ All        │    │ ✓ Dedicated  │              │
│  │   speeds     │    │   protocols  │    │   IP         │              │
│  │              │    │              │    │ ✓ Streaming  │              │
│  │              │    │              │    │   optimized  │              │
│  │──────────────│    │──────────────│    │──────────────│              │
│  │[Get Started] │    │[Start Free   │    │[Start Free   │              │
│  │              │    │ Trial]       │    │ Trial]       │              │
│  └──────────────┘    └──────────────┘    └──────────────┘              │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**Feature Comparison Table**
```
Full feature comparison table with all features listed
Checkmarks/X marks for each plan
Expandable for mobile
```

**Money-Back Guarantee**
```
Icon: Shield with checkmark
"30-Day Money-Back Guarantee"
"Try risk-free. Full refund if not satisfied."
```

**FAQ Section**
```
Pricing-specific FAQs:
- How does the free trial work?
- Can I change plans later?
- What happens when I cancel?
- Do you offer refunds?
- Is there a student discount?
```

**Enterprise CTA**
```
"Need a solution for your team?"
"Contact us for enterprise pricing"
[Contact Sales] button
```

### States

**Monthly/Annual Toggle:**
- Prices update dynamically
- Savings percentage shown

**Logged In:**
- Current plan highlighted
- "Current Plan" badge on user's plan
- Upgrade/downgrade buttons shown

### API Calls
- GET /api/plans (pricing data)
- GET /api/user/subscription (if logged in)

---

## 5.3 Sign Up Page (Web)

**PAGE:** Sign Up  
**URL:** /signup  
**PURPOSE:** Create new user account

### Components

**Minimal Header**
```
Logo only (centered)
"Already have an account? Log in" (right)
```

**Sign Up Form**
```
Card (centered, max-width 400px):

"Create Your Account"

[Email input]
[Password input] (with show/hide toggle)
[Confirm Password input]

Password requirements:
• At least 8 characters
• One uppercase letter
• One number

[ ] I agree to Terms of Service and Privacy Policy

[Create Account] button (full width)

─── or ───

[Continue with Google] (disabled/mock)
[Continue as Guest]
```

**Benefits Sidebar (Desktop)**
```
Why Join FreeGate?

✓ Free 500MB daily forever
✓ Sync across devices
✓ Priority support access
✓ Exclusive member deals
```

### States

**Empty:**
- All fields empty
- Submit button disabled

**Filling:**
- Real-time validation
- Password strength indicator

**Submitting:**
- Button shows spinner
- Fields disabled

**Error:**
- Field-level error messages
- "Email already exists" handling

**Success:**
- Redirect to onboarding/dashboard

### API Calls
- POST /api/auth/signup
- POST /api/auth/guest (for guest mode)

---

## 5.4 Login Page (Web)

**PAGE:** Login  
**URL:** /login  
**PURPOSE:** Authenticate existing users

### Components

**Login Form**
```
Card (centered):

"Welcome Back"

[Email input]
[Password input]

[ ] Remember me          Forgot password?

[Log In] button

─── or ───

[Continue with Google] (disabled)

Don't have an account? [Sign up]
```

### States

**Error States:**
- Invalid credentials
- Account locked
- Email not verified

### API Calls
- POST /api/auth/login
- POST /api/auth/forgot-password

---

## 5.5 Dashboard (Web Admin Panel)

**PAGE:** Admin Dashboard  
**URL:** /admin  
**PURPOSE:** Manage VPN service (admin only)

### Components

**Sidebar Navigation**
```
FreeGate Admin

Dashboard (active)
Users
Servers
Subscriptions
Analytics
Settings
```

**Stats Cards Row**
```
┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│   USERS     │ │   REVENUE   │ │   SERVERS   │ │   ACTIVE    │
│   12,456    │ │   $45,230   │ │    52/55    │ │    8,234    │
│   +5.2%     │ │   +12.3%    │ │   94.5% up  │ │   online    │
└─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘
```

**Revenue Chart**
```
Line chart showing last 30 days revenue
X-axis: Dates
Y-axis: Revenue ($)
Hover shows daily totals
```

**Recent Activity Feed**
```
Latest events:
• New user: john@email.com (2 min ago)
• Subscription: Premium purchased (5 min ago)
• Server: Frankfurt-02 back online (15 min ago)
• Support: Ticket #1234 resolved (1 hour ago)
```

**Server Health Grid**
```
Grid of server cards showing:
- Server name
- Location
- Load percentage
- Status indicator
- User count
```

### API Calls
- GET /api/admin/stats
- GET /api/admin/revenue
- GET /api/admin/activity
- GET /api/admin/servers

---

## 5.6 Mobile App — Main Dashboard

**PAGE:** Home Dashboard  
**URL:** N/A (Native screen)  
**PURPOSE:** Primary VPN control interface

### Components

**Status Bar Area**
```
[Battery] [Time] [Signal]
Premium ✓
```

**Connection Status Section**
```
Large circular button (center):
- Disconnected: Gray circle with power icon
- Connecting: Pulsing blue animation
- Connected: Green circle with checkmark

Status text below:
- "Tap to Connect"
- "Connecting..."
- "Connected - Secure"
```

**Connection Info Card**
```
When connected:
┌─────────────────────────────────┐
│ 🔒 Your connection is secure   │
│                                 │
│ IP: 185.xxx.xxx.xxx            │
│ Location: Netherlands          │
│ Protocol: VLESS                │
│                                 │
│ ↓ 25.4 MB/s    ↑ 12.1 MB/s    │
│ Session: 01:23:45              │
└─────────────────────────────────┘
```

**Server Selection Card**
```
┌─────────────────────────────────┐
│ [🇳🇱] Netherlands - Amsterdam   │
│      45ms • Optimal            ▶│
└─────────────────────────────────┘
Tap to open server list
```

**Quick Stats**
```
Today's Usage: 1.2 GB
This Month: 45.2 GB
```

**Bottom Navigation**
```
[🏠 Home] [🌍 Servers] [⚙️ Settings] [👤 Account]
```

### States

**Disconnected:**
- Gray color scheme
- "Your IP is visible" warning
- Connect button prominent

**Connecting:**
- Blue pulsing animation
- "Establishing secure tunnel..."
- Cancel option available

**Connected:**
- Green color scheme
- Connection details shown
- Disconnect button

**Error:**
- Red warning
- Error message
- Retry button

### API Calls
- POST /api/vpn/connect
- POST /api/vpn/disconnect
- GET /api/vpn/status
- GET /api/user/usage

---

## 5.7 Mobile App — Server List

**PAGE:** Servers  
**URL:** N/A  
**PURPOSE:** Browse and select VPN servers

### Components

**Header**
```
"Servers"
[Search icon] [Filter icon]
```

**Search Bar (Expandable)**
```
[🔍 Search countries or cities...]
```

**Server Sections**

**Favorites Section**
```
⭐ Favorites
Empty state: "Long press a server to add to favorites"
Or list of favorited servers
```

**Recent Section**
```
🕐 Recent
Last 5 connected servers with timestamp
```

**All Servers Section**
```
Grouped by country with flag emoji

🇺🇸 United States (5 servers)
├─ New York         180ms  ●●●○○  [→]
├─ Los Angeles      210ms  ●●○○○  [→]
├─ Miami            195ms  ●●●○○  [→]
├─ Chicago          188ms  ●●●○○  [→]
└─ Seattle          205ms  ●●○○○  [→]

🇳🇱 Netherlands (2 servers)
├─ Amsterdam        45ms   ●●●●○  [Streaming] [→]
└─ Rotterdam        52ms   ●●●●○  [→]

🇩🇪 Germany (3 servers)
├─ Frankfurt        48ms   ●●●●○  [→]
├─ Berlin           55ms   ●●●○○  [→]
└─ Munich           60ms   ●●●○○  [→]

[Continue for all 50+ servers]
```

**Server Item Details**
```
Each server row shows:
- Server name/city
- Ping latency (ms)
- Load indicator (5 dots)
- Special badges: [Streaming] [Gaming] [P2P]
- Tap to connect
- Long press for options (favorite, details)
```

### States

**Loading:**
- Skeleton loaders for server list
- "Checking server status..."

**Empty Search:**
- "No servers found"
- Suggestion to try different search

**Server Unavailable:**
- Grayed out appearance
- "Maintenance" badge

### API Calls
- GET /api/servers
- GET /api/servers/ping (batch ping)
- POST /api/user/favorites

---

## 5.8 Mobile App — Settings

**PAGE:** Settings  
**URL:** N/A  
**PURPOSE:** Configure VPN behavior

### Components

**Settings Sections**

**Connection Settings**
```
Connection
─────────────────────────────────
Auto-connect on startup      [Toggle]
Auto-connect on WiFi         [Toggle]
Kill Switch                  [Toggle]
  └ Block internet if VPN drops

Protocol                     [VLESS ▶]
  └ Tap to select: VLESS, VMess, Trojan, Shadowsocks
```

**Network Settings**
```
Network
─────────────────────────────────
Split Tunneling             [▶]
  └ 2 apps excluded
DNS Settings                [▶]
  └ Custom DNS: 1.1.1.1
IPv6                        [Toggle]
LAN Bypass                  [Toggle]
  └ Allow local network access
```

**Advanced Settings**
```
Advanced
─────────────────────────────────
MTU Size                    [1500 ▶]
SOCKS Port                  [10808 ▶]
Enable UDP                  [Toggle]
Debug Logging               [Toggle]
```

**Appearance**
```
Appearance
─────────────────────────────────
Theme                       [System ▶]
  └ Light / Dark / System
Language                    [English ▶]
```

**About**
```
About
─────────────────────────────────
Version                     1.0.0 (Build 123)
Check for Updates           [▶]
Licenses                    [▶]
Privacy Policy              [▶]
Terms of Service            [▶]
```

### Sub-screens

**Protocol Selection**
```
Select Protocol

( ) VLESS (Recommended)
    Best for censorship bypass

( ) VMess
    Classic V2Ray protocol

( ) Trojan
    HTTPS-based obfuscation

( ) Shadowsocks
    Lightweight and fast

[Save]
```

**DNS Settings**
```
DNS Configuration

( ) Automatic (VPN DNS)
( ) Cloudflare (1.1.1.1)
( ) Google (8.8.8.8)
( ) Custom

Custom DNS:
Primary:   [1.1.1.1        ]
Secondary: [1.0.0.1        ]

[Save]
```

### API Calls
- GET /api/user/settings
- PUT /api/user/settings
- GET /api/protocols

---

## 5.9 Mobile App — Account

**PAGE:** Account  
**URL:** N/A  
**PURPOSE:** Manage user account and subscription

### Components (Logged In)

**Profile Section**
```
┌─────────────────────────────────┐
│ [Avatar]                        │
│ John Doe                        │
│ john.doe@email.com             │
│                                 │
│ Premium Member                  │
│ Since January 2024             │
└─────────────────────────────────┘
```

**Subscription Section**
```
Subscription
─────────────────────────────────
Current Plan                Premium
Status                      Active ✓
Next Billing               Feb 15, 2024
Amount                      $4.99/month

[Manage Subscription]
[Upgrade to Ultimate]
```

**Usage Section**
```
Usage This Month
─────────────────────────────────
Data Used                   45.2 GB
Connection Time             142 hours
Sessions                    89

[View Detailed Usage]
```

**Account Settings**
```
Account
─────────────────────────────────
Edit Profile                [▶]
Change Password             [▶]
Two-Factor Auth             [Not enabled ▶]
Connected Devices           [3 devices ▶]
```

**Support Section**
```
Support
─────────────────────────────────
Help Center                 [▶]
Contact Support             [▶]
Report a Problem            [▶]
```

**Danger Zone**
```
─────────────────────────────────
[Sign Out]
[Delete Account]
```

### Components (Guest/Logged Out)

```
┌─────────────────────────────────┐
│ Create an account to:          │
│                                 │
│ ✓ Sync across devices          │
│ ✓ Upgrade to Premium           │
│ ✓ Access support               │
│                                 │
│ [Create Account]               │
│ [Log In]                       │
└─────────────────────────────────┘
```

### API Calls
- GET /api/user/profile
- GET /api/user/subscription
- GET /api/user/usage
- POST /api/auth/logout
- DELETE /api/user

---

## 5.10 Mobile App — App Selection (Split Tunneling)

**PAGE:** App Selection  
**URL:** N/A  
**PURPOSE:** Configure per-app VPN routing

### Components

**Header**
```
← App Selection
[Select All] [Deselect All]
```

**Mode Toggle**
```
┌─────────────────────────────────┐
│ VPN Mode:                       │
│ ( ) Include selected apps only  │
│ (●) Exclude selected apps       │
└─────────────────────────────────┘
```

**Search Bar**
```
[🔍 Search apps...]
```

**App List**
```
Selected (2)
─────────────────────────────────
[icon] Banking App          [✓]
[icon] Google Maps          [✓]

All Apps
─────────────────────────────────
[icon] Calculator           [ ]
[icon] Calendar             [ ]
[icon] Camera               [ ]
[icon] Chrome               [ ]
[icon] Contacts             [ ]
[icon] Facebook             [ ]
[icon] Gmail                [ ]
[icon] Instagram            [ ]
[icon] Messenger            [ ]
[icon] Netflix              [ ]
[icon] Phone                [ ]
[icon] Photos               [ ]
[icon] Settings             [ ]
[icon] Spotify              [ ]
[icon] Telegram             [ ]
[icon] TikTok               [ ]
[icon] Twitter              [ ]
[icon] WhatsApp             [ ]
[icon] YouTube              [ ]
[Continue alphabetically...]
```

**Each App Item**
```
┌─────────────────────────────────┐
│ [App Icon] App Name        [☐] │
│            com.package.name     │
└─────────────────────────────────┘
Tap row or checkbox to toggle
```

### States

**Loading:**
- Progress spinner
- "Loading installed apps..."

**Empty Search:**
- "No apps found matching '[query]'"

**Saving:**
- Brief "Saving..." toast
- Changes auto-save on toggle

### API Calls
- GET /api/user/apps (saved selections)
- PUT /api/user/apps
- Local: PackageManager.getInstalledApplications()

---

# SECTION 6: COMPLETE API SPECIFICATION

## 6.1 Authentication Endpoints

### POST /api/auth/signup
**Purpose:** Create new user account

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "confirmPassword": "SecurePass123",
  "acceptTerms": true
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "user": {
    "id": "usr_abc123",
    "email": "user@example.com",
    "plan": "free",
    "createdAt": "2024-01-15T10:30:00Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "expiresAt": "2024-01-16T10:30:00Z"
}
```

**Errors:**
- 400: `{ "error": "VALIDATION_ERROR", "message": "Password must be at least 8 characters" }`
- 409: `{ "error": "EMAIL_EXISTS", "message": "Email already registered" }`
- 500: `{ "error": "SERVER_ERROR", "message": "Unable to create account" }`

**Mock Behavior:**
- Accept any valid email format
- Store in SQLite
- Generate mock JWT token
- Always succeed unless email exists in DB

---

### POST /api/auth/login
**Purpose:** Authenticate user

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "rememberMe": true
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "user": {
    "id": "usr_abc123",
    "email": "user@example.com",
    "name": "John Doe",
    "plan": "premium",
    "planExpiresAt": "2024-02-15T00:00:00Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "expiresAt": "2024-01-22T10:30:00Z"
}
```

**Errors:**
- 401: `{ "error": "INVALID_CREDENTIALS", "message": "Invalid email or password" }`
- 403: `{ "error": "ACCOUNT_LOCKED", "message": "Account locked. Try again in 30 minutes" }`

**Mock Behavior:**
- Check email/password against SQLite
- Mock passwords: use "password123" for all test accounts
- Return token valid for 24 hours (7 days if rememberMe)

---

### POST /api/auth/logout
**Purpose:** Invalidate session

**Request Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

**Mock Behavior:**
- Always succeed
- No actual token invalidation (stateless mock)

---

### POST /api/auth/forgot-password
**Purpose:** Initiate password reset

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "If this email exists, a reset link has been sent"
}
```

**Mock Behavior:**
- Always return success (security through obscurity)
- Log reset request in DB

---

### POST /api/auth/guest
**Purpose:** Create guest session

**Response (201 Created):**
```json
{
  "success": true,
  "guestId": "guest_xyz789",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "quotaRemaining": 524288000,
  "quotaResetAt": "2024-01-16T00:00:00Z"
}
```

**Mock Behavior:**
- Generate unique guest ID
- 500MB daily quota (524288000 bytes)
- Guest sessions persist in SQLite

---

## 6.2 User Endpoints

### GET /api/user/profile
**Purpose:** Get current user profile

**Request Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "id": "usr_abc123",
  "email": "user@example.com",
  "name": "John Doe",
  "avatar": null,
  "plan": "premium",
  "planExpiresAt": "2024-02-15T00:00:00Z",
  "createdAt": "2024-01-01T00:00:00Z",
  "settings": {
    "theme": "system",
    "language": "en",
    "notifications": true
  }
}
```

---

### PUT /api/user/profile
**Purpose:** Update user profile

**Request Body:**
```json
{
  "name": "John Doe",
  "avatar": "base64_encoded_image_or_null"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "user": { /* updated user object */ }
}
```

---

### GET /api/user/subscription
**Purpose:** Get subscription details

**Response (200 OK):**
```json
{
  "plan": "premium",
  "status": "active",
  "startDate": "2024-01-15T00:00:00Z",
  "currentPeriodEnd": "2024-02-15T00:00:00Z",
  "cancelAtPeriodEnd": false,
  "paymentMethod": {
    "type": "card",
    "last4": "4242",
    "brand": "visa",
    "expiryMonth": 12,
    "expiryYear": 2025
  },
  "invoices": [
    {
      "id": "inv_001",
      "amount": 499,
      "currency": "usd",
      "status": "paid",
      "date": "2024-01-15T00:00:00Z"
    }
  ]
}
```

---

### GET /api/user/usage
**Purpose:** Get usage statistics

**Response (200 OK):**
```json
{
  "today": {
    "bytesDown": 1073741824,
    "bytesUp": 268435456,
    "connectionTime": 14400
  },
  "thisMonth": {
    "bytesDown": 48520000000,
    "bytesUp": 12130000000,
    "connectionTime": 511200,
    "sessions": 89
  },
  "quota": {
    "daily": null,
    "used": 48520000000,
    "remaining": null
  },
  "history": [
    {
      "date": "2024-01-14",
      "bytesDown": 2147483648,
      "bytesUp": 536870912
    }
  ]
}
```

**Free User Response:**
```json
{
  "quota": {
    "daily": 524288000,
    "used": 419430400,
    "remaining": 104857600,
    "resetsAt": "2024-01-16T00:00:00Z"
  }
}
```

---

### GET /api/user/settings
**Purpose:** Get user VPN settings

**Response (200 OK):**
```json
{
  "autoConnect": false,
  "autoConnectWifi": false,
  "killSwitch": true,
  "protocol": "vless",
  "splitTunneling": {
    "enabled": true,
    "mode": "exclude",
    "apps": ["com.bank.app", "com.google.maps"]
  },
  "dns": {
    "mode": "custom",
    "primary": "1.1.1.1",
    "secondary": "1.0.0.1"
  },
  "ipv6": false,
  "lanBypass": true,
  "mtu": 1500,
  "socksPort": 10808,
  "udpEnabled": true
}
```

---

### PUT /api/user/settings
**Purpose:** Update VPN settings

**Request Body:**
```json
{
  "killSwitch": true,
  "protocol": "vmess",
  "dns": {
    "mode": "cloudflare"
  }
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "settings": { /* updated settings */ }
}
```

---

### GET /api/user/devices
**Purpose:** List connected devices

**Response (200 OK):**
```json
{
  "devices": [
    {
      "id": "dev_001",
      "name": "Samsung Galaxy S23",
      "type": "android",
      "lastActive": "2024-01-15T10:30:00Z",
      "current": true
    },
    {
      "id": "dev_002",
      "name": "OnePlus 11",
      "type": "android",
      "lastActive": "2024-01-14T18:00:00Z",
      "current": false
    }
  ],
  "limit": 5
}
```

---

### DELETE /api/user/devices/:id
**Purpose:** Remove device

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Device removed"
}
```

---

## 6.3 Server Endpoints

### GET /api/servers
**Purpose:** List all VPN servers

**Response (200 OK):**
```json
{
  "servers": [
    {
      "id": "srv_nl_ams_01",
      "name": "Amsterdam",
      "country": "Netherlands",
      "countryCode": "NL",
      "city": "Amsterdam",
      "ip": "185.xxx.xxx.xxx",
      "port": 443,
      "protocol": "vless",
      "load": 45,
      "ping": null,
      "tags": ["streaming", "recommended"],
      "premium": false,
      "status": "online"
    },
    {
      "id": "srv_de_fra_01",
      "name": "Frankfurt",
      "country": "Germany",
      "countryCode": "DE",
      "city": "Frankfurt",
      "ip": "195.xxx.xxx.xxx",
      "port": 443,
      "protocol": "vless",
      "load": 32,
      "ping": null,
      "tags": [],
      "premium": false,
      "status": "online"
    },
    {
      "id": "srv_us_nyc_01",
      "name": "New York",
      "country": "United States",
      "countryCode": "US",
      "city": "New York",
      "ip": "104.xxx.xxx.xxx",
      "port": 443,
      "protocol": "vless",
      "load": 67,
      "ping": null,
      "tags": ["streaming"],
      "premium": true,
      "status": "online"
    }
  ],
  "count": 52
}
```

**Query Parameters:**
- `country`: Filter by country code
- `premium`: Filter premium only
- `tags`: Filter by tags (comma-separated)

---

### POST /api/servers/ping
**Purpose:** Batch ping servers

**Request Body:**
```json
{
  "serverIds": ["srv_nl_ams_01", "srv_de_fra_01", "srv_us_nyc_01"]
}
```

**Response (200 OK):**
```json
{
  "pings": {
    "srv_nl_ams_01": 45,
    "srv_de_fra_01": 48,
    "srv_us_nyc_01": 180
  }
}
```

**Mock Behavior:**
- Generate random pings based on geographic distance
- Netherlands: 40-60ms
- Germany: 45-65ms
- US: 150-220ms
- Japan: 80-120ms
- Singapore: 100-150ms

---

### GET /api/servers/:id/config
**Purpose:** Get server connection config

**Response (200 OK):**
```json
{
  "serverId": "srv_nl_ams_01",
  "protocol": "vless",
  "config": {
    "address": "185.xxx.xxx.xxx",
    "port": 443,
    "id": "uuid-goes-here",
    "encryption": "none",
    "flow": "xtls-rprx-vision",
    "network": "tcp",
    "security": "tls",
    "sni": "example.com"
  }
}
```

---

### GET /api/user/favorites
**Purpose:** Get user's favorite servers

**Response (200 OK):**
```json
{
  "favorites": ["srv_nl_ams_01", "srv_de_fra_01"]
}
```

---

### POST /api/user/favorites
**Purpose:** Add server to favorites

**Request Body:**
```json
{
  "serverId": "srv_nl_ams_01"
}
```

---

### DELETE /api/user/favorites/:serverId
**Purpose:** Remove from favorites

---

## 6.4 VPN Connection Endpoints

### POST /api/vpn/connect
**Purpose:** Initiate VPN connection (for logging/quota)

**Request Body:**
```json
{
  "serverId": "srv_nl_ams_01",
  "protocol": "vless",
  "deviceId": "dev_001"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "session": {
    "id": "sess_abc123",
    "serverId": "srv_nl_ams_01",
    "startTime": "2024-01-15T10:30:00Z",
    "quotaRemaining": null
  },
  "config": {
    /* Xray config for this server */
  }
}
```

**Free User Response:**
```json
{
  "success": true,
  "session": {
    "id": "sess_abc123",
    "quotaRemaining": 104857600
  }
}
```

**Quota Exceeded Response (403):**
```json
{
  "error": "QUOTA_EXCEEDED",
  "message": "Daily limit reached",
  "quotaResetAt": "2024-01-16T00:00:00Z",
  "upgradeUrl": "/pricing"
}
```

---

### POST /api/vpn/disconnect
**Purpose:** End VPN session

**Request Body:**
```json
{
  "sessionId": "sess_abc123",
  "bytesDown": 1073741824,
  "bytesUp": 268435456,
  "duration": 3600
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "session": {
    "id": "sess_abc123",
    "duration": 3600,
    "bytesDown": 1073741824,
    "bytesUp": 268435456
  }
}
```

---

### GET /api/vpn/status
**Purpose:** Check current VPN session

**Response (200 OK):**
```json
{
  "connected": true,
  "session": {
    "id": "sess_abc123",
    "serverId": "srv_nl_ams_01",
    "serverName": "Netherlands - Amsterdam",
    "startTime": "2024-01-15T10:30:00Z",
    "duration": 3600,
    "bytesDown": 1073741824,
    "bytesUp": 268435456
  }
}
```

**Not Connected Response:**
```json
{
  "connected": false,
  "session": null
}
```

---

## 6.5 Payment Endpoints (Mock)

### GET /api/plans
**Purpose:** Get available subscription plans

**Response (200 OK):**
```json
{
  "plans": [
    {
      "id": "free",
      "name": "Free",
      "price": 0,
      "interval": "month",
      "features": [
        "500MB daily limit",
        "3 server locations",
        "1 device",
        "Basic support",
        "Ads"
      ],
      "limits": {
        "dailyQuota": 524288000,
        "servers": 3,
        "devices": 1
      }
    },
    {
      "id": "premium_monthly",
      "name": "Premium",
      "price": 499,
      "interval": "month",
      "popular": true,
      "features": [
        "Unlimited data",
        "50+ servers",
        "5 devices",
        "Priority support",
        "No ads",
        "All protocols"
      ],
      "limits": {
        "dailyQuota": null,
        "servers": null,
        "devices": 5
      }
    },
    {
      "id": "premium_annual",
      "name": "Premium Annual",
      "price": 3999,
      "interval": "year",
      "savings": 33,
      "features": [/* same as premium */],
      "limits": {/* same as premium */}
    },
    {
      "id": "ultimate_monthly",
      "name": "Ultimate",
      "price": 999,
      "interval": "month",
      "features": [
        "Unlimited data",
        "50+ servers",
        "10 devices",
        "24/7 support",
        "No ads",
        "Dedicated IP",
        "Streaming optimized"
      ],
      "limits": {
        "dailyQuota": null,
        "servers": null,
        "devices": 10,
        "dedicatedIp": true
      }
    },
    {
      "id": "ultimate_annual",
      "name": "Ultimate Annual",
      "price": 7999,
      "interval": "year",
      "savings": 33,
      "features": [/* same as ultimate */],
      "limits": {/* same as ultimate */}
    }
  ]
}
```

---

### POST /api/payments/create-checkout
**Purpose:** Create payment session (mock)

**Request Body:**
```json
{
  "planId": "premium_monthly",
  "paymentMethod": "card"
}
```

**Response (200 OK):**
```json
{
  "checkoutId": "chk_abc123",
  "clientSecret": "mock_secret_xyz",
  "amount": 499,
  "currency": "usd"
}
```

**Mock Behavior:**
- Generate mock checkout ID
- No actual Stripe integration
- Return success immediately

---

### POST /api/payments/confirm
**Purpose:** Confirm payment (mock)

**Request Body:**
```json
{
  "checkoutId": "chk_abc123",
  "paymentDetails": {
    "cardNumber": "4242424242424242",
    "expMonth": 12,
    "expYear": 2025,
    "cvc": "123"
  }
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "subscription": {
    "id": "sub_abc123",
    "plan": "premium",
    "status": "active",
    "currentPeriodEnd": "2024-02-15T00:00:00Z"
  },
  "receipt": {
    "id": "rcpt_abc123",
    "amount": 499,
    "date": "2024-01-15T10:30:00Z"
  }
}
```

**Mock Behavior:**
- Any card number starting with 4 succeeds
- Card 4000000000000002 simulates decline
- Update user plan in database

---

### POST /api/payments/cancel
**Purpose:** Cancel subscription

**Response (200 OK):**
```json
{
  "success": true,
  "subscription": {
    "status": "active",
    "cancelAtPeriodEnd": true,
    "currentPeriodEnd": "2024-02-15T00:00:00Z"
  },
  "message": "Your subscription will remain active until Feb 15, 2024"
}
```

---

## 6.6 Admin Endpoints

### GET /api/admin/stats
**Purpose:** Dashboard statistics

**Response (200 OK):**
```json
{
  "users": {
    "total": 12456,
    "active": 8234,
    "premium": 623,
    "ultimate": 89,
    "growth": 5.2
  },
  "revenue": {
    "thisMonth": 45230,
    "lastMonth": 40280,
    "growth": 12.3
  },
  "servers": {
    "total": 55,
    "online": 52,
    "load": 45
  },
  "connections": {
    "active": 8234,
    "peak24h": 12456
  }
}
```

---

### GET /api/admin/users
**Purpose:** List users with pagination

**Query Parameters:**
- `page`: Page number (default 1)
- `limit`: Items per page (default 20)
- `search`: Search by email
- `plan`: Filter by plan
- `sort`: Sort field
- `order`: asc/desc

**Response (200 OK):**
```json
{
  "users": [
    {
      "id": "usr_001",
      "email": "user1@example.com",
      "name": "John Doe",
      "plan": "premium",
      "status": "active",
      "createdAt": "2024-01-01T00:00:00Z",
      "lastActive": "2024-01-15T10:30:00Z",
      "usage": {
        "thisMonth": 45200000000
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 12456,
    "pages": 623
  }
}
```

---

### GET /api/admin/revenue
**Purpose:** Revenue analytics

**Query Parameters:**
- `period`: day/week/month/year

**Response (200 OK):**
```json
{
  "total": 45230,
  "breakdown": {
    "premium_monthly": 28540,
    "premium_annual": 8990,
    "ultimate_monthly": 5400,
    "ultimate_annual": 2300
  },
  "chart": [
    { "date": "2024-01-01", "amount": 1523 },
    { "date": "2024-01-02", "amount": 1687 }
  ],
  "metrics": {
    "arpu": 6.23,
    "churn": 2.1,
    "ltv": 74.76
  }
}
```

---

### GET /api/admin/servers
**Purpose:** Server management

**Response (200 OK):**
```json
{
  "servers": [
    {
      "id": "srv_nl_ams_01",
      "name": "Amsterdam 01",
      "country": "Netherlands",
      "ip": "185.xxx.xxx.xxx",
      "status": "online",
      "load": 45,
      "users": 234,
      "bandwidth": {
        "in": 125000000,
        "out": 890000000
      },
      "uptime": 99.97
    }
  ]
}
```

---

### POST /api/admin/servers
**Purpose:** Add new server

### PUT /api/admin/servers/:id
**Purpose:** Update server

### DELETE /api/admin/servers/:id
**Purpose:** Remove server

---

# SECTION 7: DATABASE SCHEMA

## 7.1 Complete SQLite Schema

```sql
-- ============================================
-- FreeGate VPN Database Schema
-- SQLite 3.x Compatible
-- ============================================

-- Enable foreign keys
PRAGMA foreign_keys = ON;

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE users (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT,
    avatar_url TEXT,
    plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'premium', 'ultimate')),
    plan_interval TEXT CHECK (plan_interval IN ('month', 'year', 'lifetime')),
    plan_started_at DATETIME,
    plan_expires_at DATETIME,
    plan_cancel_at_period_end INTEGER DEFAULT 0,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    is_admin INTEGER DEFAULT 0,
    is_guest INTEGER DEFAULT 0,
    guest_id TEXT UNIQUE,
    email_verified INTEGER DEFAULT 0,
    email_verification_token TEXT,
    password_reset_token TEXT,
    password_reset_expires DATETIME,
    two_factor_enabled INTEGER DEFAULT 0,
    two_factor_secret TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login_at DATETIME,
    deleted_at DATETIME
);

-- Indexes for users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_plan ON users(plan);
CREATE INDEX idx_users_guest_id ON users(guest_id);
CREATE INDEX idx_users_created_at ON users(created_at);

-- ============================================
-- USER SETTINGS TABLE
-- ============================================
CREATE TABLE user_settings (
    user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    auto_connect INTEGER DEFAULT 0,
    auto_connect_wifi INTEGER DEFAULT 0,
    kill_switch INTEGER DEFAULT 1,
    protocol TEXT DEFAULT 'vless' CHECK (protocol IN ('vless', 'vmess', 'trojan', 'shadowsocks')),
    split_tunneling_enabled INTEGER DEFAULT 0,
    split_tunneling_mode TEXT DEFAULT 'exclude' CHECK (split_tunneling_mode IN ('include', 'exclude')),
    split_tunneling_apps TEXT DEFAULT '[]', -- JSON array of package names
    dns_mode TEXT DEFAULT 'auto' CHECK (dns_mode IN ('auto', 'cloudflare', 'google', 'custom')),
    dns_primary TEXT DEFAULT '1.1.1.1',
    dns_secondary TEXT DEFAULT '1.0.0.1',
    ipv6_enabled INTEGER DEFAULT 0,
    lan_bypass INTEGER DEFAULT 1,
    mtu INTEGER DEFAULT 1500,
    socks_port INTEGER DEFAULT 10808,
    udp_enabled INTEGER DEFAULT 1,
    theme TEXT DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
    language TEXT DEFAULT 'en',
    notifications_enabled INTEGER DEFAULT 1,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- DEVICES TABLE
-- ============================================
CREATE TABLE devices (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('android', 'ios', 'windows', 'macos', 'linux')),
    device_identifier TEXT NOT NULL,
    push_token TEXT,
    last_ip TEXT,
    last_active_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, device_identifier)
);

CREATE INDEX idx_devices_user_id ON devices(user_id);

-- ============================================
-- SERVERS TABLE
-- ============================================
CREATE TABLE servers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    country TEXT NOT NULL,
    country_code TEXT NOT NULL,
    city TEXT NOT NULL,
    ip_address TEXT NOT NULL,
    port INTEGER NOT NULL DEFAULT 443,
    protocol TEXT NOT NULL DEFAULT 'vless',
    config_json TEXT NOT NULL, -- Full Xray config
    load_percent INTEGER DEFAULT 0,
    max_users INTEGER DEFAULT 1000,
    current_users INTEGER DEFAULT 0,
    bandwidth_limit_gbps REAL DEFAULT 10.0,
    is_premium INTEGER DEFAULT 0,
    tags TEXT DEFAULT '[]', -- JSON array: ["streaming", "gaming", "p2p"]
    status TEXT DEFAULT 'online' CHECK (status IN ('online', 'offline', 'maintenance')),
    uptime_percent REAL DEFAULT 100.0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_servers_country ON servers(country_code);
CREATE INDEX idx_servers_status ON servers(status);
CREATE INDEX idx_servers_premium ON servers(is_premium);

-- ============================================
-- USER FAVORITE SERVERS TABLE
-- ============================================
CREATE TABLE user_favorite_servers (
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    server_id TEXT NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, server_id)
);

-- ============================================
-- VPN SESSIONS TABLE
-- ============================================
CREATE TABLE vpn_sessions (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    device_id TEXT REFERENCES devices(id) ON DELETE SET NULL,
    server_id TEXT NOT NULL REFERENCES servers(id),
    protocol TEXT NOT NULL,
    started_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ended_at DATETIME,
    duration_seconds INTEGER,
    bytes_down INTEGER DEFAULT 0,
    bytes_up INTEGER DEFAULT 0,
    disconnect_reason TEXT,
    client_ip TEXT,
    assigned_ip TEXT
);

CREATE INDEX idx_sessions_user_id ON vpn_sessions(user_id);
CREATE INDEX idx_sessions_started_at ON vpn_sessions(started_at);
CREATE INDEX idx_sessions_server_id ON vpn_sessions(server_id);

-- ============================================
-- USAGE QUOTAS TABLE
-- ============================================
CREATE TABLE usage_quotas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    bytes_used INTEGER DEFAULT 0,
    quota_limit INTEGER, -- NULL for unlimited
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, date)
);

CREATE INDEX idx_quotas_user_date ON usage_quotas(user_id, date);

-- ============================================
-- PAYMENTS TABLE
-- ============================================
CREATE TABLE payments (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    stripe_payment_id TEXT,
    amount_cents INTEGER NOT NULL,
    currency TEXT DEFAULT 'usd',
    status TEXT NOT NULL CHECK (status IN ('pending', 'succeeded', 'failed', 'refunded')),
    plan_id TEXT NOT NULL,
    payment_method TEXT,
    card_last4 TEXT,
    card_brand TEXT,
    receipt_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_created_at ON payments(created_at);

-- ============================================
-- INVO