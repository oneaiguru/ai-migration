# MASTER TASKS: PHASE 5 - TWA WRAPPER + RUSTORE RELEASE
# All tasks are executable with complete code. No TODOs or stubs.
# Run order: AGENT_29 -> AGENT_30 -> AGENT_31
# Prereqs: Phase 1-4 completed.

# ============================================================
# STANDARDS
# ============================================================

- Canonical: This file is the single source of truth for Phase 5 tasks; ignore other variants.
- Use apps/pwa for PWA changes and apps/twa for the wrapper.
- Keep Android package name, asset links, and keystore fingerprint consistent.
- Do not commit keystores; commit assetlinks.json with the release fingerprint.
- Use the production PWA host for bubblewrap config and asset links.
- Avoid background dev servers in verification steps.

---

# ============================================================
# AGENT_29_PWA_MANIFEST_TWA.md
# ============================================================

# Task: PWA Manifest Updates for TWA

**Model:** haiku
**Task ID:** twa_029
**Modifies:** 1 file
**Creates:** 0 files
**Depends On:** Phase 1 complete

## Modify File: apps/pwa/vite.config.ts

Add the following fields to the existing manifest object (keep current values for name, short_name, description, lang, theme_color, background_color, display, and icons):

```typescript
id: '/',
start_url: '/?source=pwa',
scope: '/',
display_override: ['standalone', 'minimal-ui'],
orientation: 'portrait',
categories: ['education'],
```

## Verification

```bash
pnpm -C apps/pwa typecheck
pnpm -C apps/pwa build
```

## Success Criteria

- manifest includes id/start_url/scope/display_override
- PWA build succeeds

---

# ============================================================
# AGENT_30_TWA_WRAPPER_ASSETLINKS.md
# ============================================================

# Task: TWA Wrapper Scaffold + Asset Links

**Model:** sonnet
**Task ID:** twa_030
**Modifies:** 1 file
**Creates:** 4 files
**Depends On:** AGENT_29

## Modify File: .gitignore

Append:

```
# TWA wrapper
apps/twa/keystore/
apps/twa/android/.gradle/
apps/twa/android/**/build/
apps/twa/android/local.properties
apps/twa/android/.idea/
```

## Create File: apps/twa/README.md

```markdown
# TWA Wrapper (RuStore)

Prereqs
- Node.js 20+
- JDK 17+
- Android SDK (cmdline-tools)
- A production PWA host that serves manifest.webmanifest

Decisions (must be consistent)
- PWA host domain (example: app.example.ru)
- Android package name (example: com.duolingoru.app)
- Release keystore path + alias

Steps
1) Generate release keystore (do not commit):

   keytool -genkeypair \
     -alias duolingoru \
     -keyalg RSA -keysize 2048 -validity 36500 \
     -keystore apps/twa/keystore/release.keystore

2) Get SHA-256 fingerprint:

   keytool -list -v -keystore apps/twa/keystore/release.keystore | grep SHA256

3) Update apps/pwa/public/.well-known/assetlinks.json with:
   - package_name = your Android package name
   - sha256_cert_fingerprints = fingerprint from Step 2

4) Copy apps/twa/bubblewrap.template.json -> apps/twa/bubblewrap.json
   and fill in host, applicationId, and keystore fields.

5) Run placeholder validation:

   node apps/twa/scripts/validate-placeholders.mjs

6) Ensure no placeholder strings remain in assetlinks.json before commit.

7) Generate wrapper:

   npx @bubblewrap/cli init \
     --config apps/twa/bubblewrap.json \
     --directory apps/twa/android

8) Build AAB:

   npx @bubblewrap/cli build \
     --config apps/twa/bubblewrap.json

9) Smoke test on device:
   - Install from AAB/APK
   - Verify it opens the PWA in full screen
   - Verify navigation stays in-app for in-scope URLs
```

## Create File: apps/twa/bubblewrap.template.json

```json
{
  "applicationId": "com.duolingoru.app",
  "host": "REPLACE_WITH_PWA_HOST",
  "name": "Yazychok",
  "shortName": "Yazychok",
  "launcherName": "Yazychok",
  "startUrl": "/?source=twa",
  "display": "standalone",
  "orientation": "portrait",
  "themeColor": "#58cc02",
  "backgroundColor": "#ffffff",
  "iconUrl": "https://REPLACE_WITH_PWA_HOST/icons/icon-512.png",
  "maskableIconUrl": "https://REPLACE_WITH_PWA_HOST/icons/icon-512.png",
  "monochromeIconUrl": "https://REPLACE_WITH_PWA_HOST/icons/icon-512.png",
  "splashScreenFadeOutDuration": 300,
  "signingKey": {
    "path": "apps/twa/keystore/release.keystore",
    "alias": "duolingoru"
  }
}
```

## Create Directory: apps/pwa/public/.well-known

```bash
mkdir -p apps/pwa/public/.well-known
```

## Create File: apps/pwa/public/.well-known/assetlinks.json

```json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "com.duolingoru.app",
      "sha256_cert_fingerprints": ["REPLACE_WITH_RELEASE_SHA256"]
    }
  }
]
```

## Create File: apps/twa/scripts/validate-placeholders.mjs

```javascript
import fs from 'fs';

const placeholders = ['REPLACE_WITH_PWA_HOST', 'REPLACE_WITH_RELEASE_SHA256'];
const files = [
  'apps/twa/bubblewrap.json',
  'apps/pwa/public/.well-known/assetlinks.json',
];

let hasError = false;
for (const file of files) {
  if (!fs.existsSync(file)) {
    console.error(`[twa] missing ${file}`);
    hasError = true;
    continue;
  }
  const contents = fs.readFileSync(file, 'utf8');
  for (const token of placeholders) {
    if (contents.includes(token)) {
      console.error(`[twa] ${file} still contains ${token}`);
      hasError = true;
    }
  }
}

if (hasError) {
  process.exit(1);
}

console.log('[twa] placeholder validation passed');
```

## Verification

```bash
pnpm -C apps/pwa build
ls apps/pwa/public/.well-known/assetlinks.json
ls apps/twa/bubblewrap.template.json
echo "Placeholder validation deferred to release - see RELEASE_CHECKLIST.md"
```

## Success Criteria

- assetlinks.json is served from /.well-known/assetlinks.json
- bubblewrap.template.json exists with placeholder values
- release-time validation steps are documented in RELEASE_CHECKLIST.md

---

# ============================================================
# AGENT_31_RUSTORE_RELEASE.md
# ============================================================

# Task: RuStore Release Checklist

**Model:** haiku
**Task ID:** twa_031
**Creates:** 1 file
**Depends On:** AGENT_30

## Create File: apps/twa/RELEASE_CHECKLIST.md

```markdown
# RuStore Release Checklist

Build
- Build AAB via bubblewrap
- Verify signing uses release keystore
- Verify versionCode/versionName

Asset Links
- Confirm https://<host>/.well-known/assetlinks.json is live
- Confirm package name and SHA-256 fingerprint match the release keystore

Pre-Release Validation
- Copy template to final config:
  - `cp apps/twa/bubblewrap.template.json apps/twa/bubblewrap.json`
- Update bubblewrap.json with production host + package name
- Update assetlinks.json with the release SHA-256 fingerprint
- Run placeholder validation:
  - `node apps/twa/scripts/validate-placeholders.mjs`
- Verify no placeholders remain:
  - `grep -R "REPLACE_WITH" apps/twa/bubblewrap.json apps/pwa/public/.well-known`

Device Smoke Test
- Install and open the TWA
- Confirm navigation stays in-app for in-scope URLs
- Confirm fallback opens external browser for out-of-scope URLs
- Verify web-based payments (Max) flow works end-to-end in TWA:
  - Mir card payment path (incl. 3DS if used)
  - SBP payment path (opens bank app, returns to TWA)
  - Entitlement unlock visible within <10 seconds after confirmation
  - "Restore purchases / Sync entitlements" works if callback fails
- Verify web push notifications continue to work in TWA

Store Listing
- App name, short description, and full description in Russian
- Privacy policy URL
- Screenshots (phone + tablet if required)
- APK/AAB upload
- Content rating and age rating
- Support email and website

Release Notes
- Include version number
- Mention core features + offline support + Max upgrade (Mir/SBP web checkout)
- Mention "Audio works without VPN" as the key RU value prop
```

## Success Criteria

- Release checklist exists and is complete
