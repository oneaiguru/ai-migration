# ASR Cost Model vs Cloud STT (2025-11-12)

Reference: Deep-research report (lines 11‑13) plus ongoing pricing deck.

## Cloud STT Baseline
- Typical pricing: **$0.20–$1.20 per audio hour** (AssemblyAI, Google, Soniox references).
- Call volume: 10k–45k calls/month (≈300–1,500 calls/day). Assuming 5 minutes/call → 50,000–225,000 minutes monthly.
- Estimated cost: **$167–$4,500 per month** depending on vendor tier, before storage/egress fees.

## Local GPU Stack (faster-whisper)
- Hardware: single RTX 4090 (≈$2,000 one-time) + workstation.
- Opex: electricity + ops labor; incremental minutes are effectively free.
- Accuracy: significantly higher than legacy Vosk CPU setups; matches premium SaaS STT per DR report.

## Conclusion
- For sustained usage (>300k minutes/month) the on-prem faster-whisper stack reaches ROI within 1–2 months compared to per-minute APIs.
- We still support optional fallback routing to SaaS STT for edge cases, but default economics favor local inference.
