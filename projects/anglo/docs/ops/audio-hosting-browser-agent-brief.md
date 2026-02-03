# Browser Agent Brief: Audio Hosting Setup (v1.3)

Goal
- Set up audio hosting for english.dance on Timeweb Cloud S3 (primary) with SSL
- Create warm standby on Yandex Cloud Object Storage
- Provide the exact values to replace placeholders in `projects/anglo/docs/ops/audio-hosting-runbook.md`

Important rules
- Do not paste or share any secrets in chat logs.
- Store secrets in the operator's secret manager or local password vault.
- Only report non-sensitive outputs: bucket endpoints, domain binding confirmation, DNS records, and screenshots if needed.

## Inputs needed from operator (do NOT paste into chat)
- Access to domain registrar for english.dance (DNS records)
- Timeweb Cloud account with S3 access
- Yandex Cloud account with Object Storage access (optional CDN access if using custom HTTPS there)
- Billing method on both providers

## Step 1: Timeweb Cloud S3 primary
1) Create a bucket in RU region (Standard class).
   - Bucket name example: english-dance-audio
2) Set bucket public read (or policy allowing public GET for audio objects).
3) Configure CORS for audio playback and PWA caching:
   - Allowed origins: https://english.dance
   - Allowed methods: GET, HEAD
   - Allowed headers: Range, Origin, Accept, Content-Type
   - Expose headers: Accept-Ranges, Content-Range, Content-Length, ETag
4) Configure cache headers for audio objects:
   - Cache-Control: public, max-age=31536000, immutable
5) Bind custom domain audio.english.dance to the bucket:
   - Use Timeweb domain binding (CNAME target is Timeweb-provided bucket host)
   - Enable SSL certificate for audio.english.dance
6) Record the bucket endpoint and custom-domain binding details.

Output to report (non-sensitive)
- Timeweb bucket endpoint hostname to use as CNAME target
- Confirmation that audio.english.dance is bound and SSL is active
- Any required Timeweb-specific notes for DNS or SSL propagation time

## Step 2: DNS for audio.english.dance
In the domain registrar DNS:
- Create/Update CNAME record
  - Name: audio
  - Target: <TIMEWEB_BUCKET_HOSTNAME>
  - TTL: 300 (or 60 during cutover)
- Optionally create standby CNAME:
  - Name: audio-standby
  - Target: <YANDEX_BUCKET_HOSTNAME>
  - TTL: 300

Output to report (non-sensitive)
- Confirm the exact DNS record values as saved
- Expected propagation time

## Step 3: Yandex Cloud standby
1) Create a bucket in Object Storage (RU region).
2) Set public read access (or policy for public GET) for audio objects.
3) Configure the same CORS and cache headers as Timeweb.
4) If HTTPS custom domain is required on Yandex:
   - Set up Yandex CDN with a custom domain
   - Bind audio.english.dance or a standby subdomain (audio-standby.english.dance)
   - Enable SSL

Output to report (non-sensitive)
- Yandex bucket endpoint hostname
- Whether CDN is required for HTTPS custom domain
- Any required DNS for Yandex CDN if used

## Step 4: Credentials for sync (rclone)
1) Create access keys for Timeweb S3 and Yandex Object Storage.
2) Store them securely (do NOT paste into chat).
3) Configure rclone remotes on the operator machine:
   - timeweb: audio bucket
   - yandex: audio bucket

Output to report (non-sensitive)
- Remote names used in rclone config (no keys)
- Bucket names for each remote

## Step 5: Replace placeholders in runbook
Update `projects/anglo/docs/ops/audio-hosting-runbook.md`:
- Replace <TIMEWEB_BUCKET_HOSTNAME>
- Replace <YANDEX_BUCKET_HOSTNAME>
- Replace rclone remote names if different from defaults

Provide final values (non-sensitive) to the operator for replacement.

## Step 6: Validation
- Verify audio.english.dance serves a test file over HTTPS.
- Confirm CORS headers allow playback from https://english.dance.
- Optional: test with Range requests for streaming.

Output to report (non-sensitive)
- Working test URL
- Confirmation of HTTPS + CORS + Range support
