# Audio Hosting Runbook (v1.3)

Scope
- Primary: Timeweb Cloud S3 (RU region, Standard class)
- Hostname: audio.english.dance
- Fallback: Yandex Cloud Object Storage (optional Yandex CDN for HTTPS custom domain)
- Cutover: DNS CNAME swap, dual-host for 7 days, RU SIM verification

## DNS records (english.dance zone)
Primary record
- Type: CNAME
- Name: audio
- Target: <TIMEWEB_BUCKET_HOSTNAME>
- TTL: 300

Standby record (not active)
- Type: CNAME
- Name: audio-standby
- Target: <YANDEX_BUCKET_HOSTNAME>
- TTL: 300

Notes
- Use the bucket hostname from each provider console.
- Keep audio.english.dance stable; only change the CNAME target during cutover.
- In Timeweb, bind the domain to the bucket and enable SSL for audio.english.dance.

## TTL policy
- Normal operation: 300 seconds
- Cutover prep: lower to 60 seconds at least 24 hours before switching
- Post-cutover: restore to 300 seconds after validation

## CORS and cache headers
CORS (S3 or CDN)
- Allow origins: https://english.dance (add any additional first-party origins explicitly)
- Allow methods: GET, HEAD
- Allow headers: Range, Origin, Accept, Content-Type
- Expose headers: Accept-Ranges, Content-Range, Content-Length, ETag

Cache headers
- Audio files: Cache-Control: public, max-age=31536000, immutable
- Manifests/index (if any): Cache-Control: public, max-age=300

## Minimal sync script (Timeweb -> Yandex)
Save as scripts/audio_sync.sh and run from a CI job or a controlled host.

```bash
#!/usr/bin/env bash
set -euo pipefail

SRC_REMOTE="timeweb:audio-bucket"
DST_REMOTE="yandex:audio-bucket"

rclone sync --checksum --delete-after --transfers 8 --checkers 16 "$SRC_REMOTE" "$DST_REMOTE"
```

Prereqs
- rclone configured with S3 credentials for Timeweb and Yandex in ~/.config/rclone/rclone.conf
- Buckets already created with public read for audio objects (or signed URLs if later required)

## Cutover checklist
- Lower TTL to 60 seconds at least 24 hours before cutover.
- Run sync and verify object counts and checksums.
- Switch CNAME target to the standby origin.
- Validate on RU SIMs (Beeline/MTS/Megafon), VPN off.
- Keep dual-host for 7 days while monitoring error rate.
- Update CI allowlist + release notes.
- Restore TTL to 300 seconds after stability is confirmed.
