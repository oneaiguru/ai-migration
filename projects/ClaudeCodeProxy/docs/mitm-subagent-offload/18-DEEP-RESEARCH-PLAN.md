**Scope (confirm or reject)**

1. Proxy reliability on **Claude Code 2.0.14+** (inference traffic + streaming).
2. MITM header/body visibility; host retarget + HTTP/2 reconnection rules.
3. Response envelope parity (Anthropic ↔ Z.AI) for `messages` + tools.
4. ToS/Policy posture: local debugging vs token replay; acceptable use lines.
5. Version pinning + OS caveats (macOS, Linux; Windows optional).

**Deliverables**

* `COMPAT-Anthropic-vs-ZAI.md`
* `PROXY-BEHAVIOR-MATRIX.md`
* `LEGAL-NOTES-SUMMARY.md`
* `RECOMMENDATION.md` (go/no-go for per‑turn routing after P0)

---