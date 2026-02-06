## 	Where we are (prod‑readiness snapshot)

**Working now:**

- Go shim routes **every Haiku to Z.AI**; Sonnet/Opus remain on Anthropic with **OAuth header passthrough from the Claude CLI** (no extra token exports needed). Logs show clean lane hygiene and SSE pass‑through from your last run.
- One‑touch ergonomics match Python MITM: `ccc-on` (or `make go-proxy` + `source scripts/go-env.sh`) + `claude …` + `make summarize`/`make verify-routing`. (You already demonstrated this with correct lane counts & hygiene greps.)

**Gaps to close for “micro‑SaaS”:**

- Packaging & distribution (Homebrew, winget, deb/rpm).
- Minimal control‑plane (“policy pack”) so routing prefs (e.g., *no CN providers*, US‑only) are server‑driven, not hard‑coded.
- Rotation for `logs/` and `results/` + an *always‑present* health endpoint.
- L2 sandboxing (Linux) integrated into the **Unified Test Harness** with runtime flags and denial tests (ptrace/bpf/mount/unshare/keyctl/TIOCSTI). 

I’m calling this **Developer Preview / Beta‑ready** today; the items below move it to **micro‑SaaS** quickly.

------

## Micro‑SaaS MVP (deliver this first)

**MVP goals:** stay local‑first, no CA/MITM required, **fast install**, and a minimal server‑anchored policy so you can change routing without shipping a new binary. This aligns with the consolidated hand‑off’s non‑interactive, acceptance‑gate discipline. 

### A) Productize the binary & CLI

- **Rename** the shim binary to `ccp` (Claude Code Proxy) and expose:
  - `ccp serve` – starts Anthropic‑compatible shim on `:8082` by default.
  - `ccp doctor` – checks env (ZAI key present, policy fetched, health of upstreams).
  - `ccp verify` – runs the quick, non‑interactive probes and prints lane hygiene summary (reuse your Node summarizer).
- **Health endpoints:**
  - `GET /healthz` (process up), `GET /readyz` (policy loaded + upstream probe OK).

### B) Minimal control‑plane (“policy pack”)

- **Server:** host `policy.json` (static to start; later signed) with:

  ```json
  {
    "routes": [
      {"matchModel": "claude-haiku-4.*", "provider": "zai", "headerMode": "x-api-key"}
    ],
    "constraints": {"disallowProviders": ["cn"], "requireJurisdiction": "us"},
    "timeouts": {"connectMs": 1500, "readMs": 120000}
  }
  ```

- **Client:** shim reads `CCP_POLICY_URL` at boot (fallback to embedded default).

  - Cache to disk with TTL (e.g., 15 min).
  - **Flags**: `CCP_REQUIRE_US_ONLY=1`, `CCP_BLOCK_CN=1`, `CCP_HEADER_MODE=zai|auth`.

- **Purpose:** lets you flip routing or block a jurisdiction **without** a new release.

*(This mirrors the “server‑anchored policy” idea we discussed earlier, while keeping the MVP small and reversible.)*

### C) Distribution

- **Homebrew tap:** `brew tap <you>/ccp && brew install ccp` (universal darwin build, notarized).
- **winget + choco** manifests (Windows) with signed exe.
- **Linux**: static builds + `deb`, `rpm` (or `nix flake`).
- **Docker**: `ghcr.io/<you>/ccp:latest` minimal image.

### D) Logs & results hygiene

- Add **size/time‑based rotation** for `logs/usage.jsonl` and keep last N bundles in `results/`.
- Keep current JSONL schema stable (you already documented it), so `scripts/summarize-usage.js` stays valid.

### E) Definition of Done (MVP)

- `ccp doctor` passes; **quick proof** via `make repro-go-quick` succeeds (**one 200 per lane, no body logs, no header cross‑leak**); bundle lands in `~/Downloads`. 

------

## Security track in parallel — **spawn L2‑Seccomp now** (L1‑managed)

Per L0’s directive, L1 must **spawn & manage** L2 **immediately** and integrate its outputs into the **Unified Test Harness** and runtime flags. **Invariants remain**: *lane hygiene, no body logs, SSE preserved*. 

**L2 inputs & scope (as directed):**

- Inputs: `docs_linux/Seccomp_Base_Profile.md`, `docs_linux/BwrapDesign_MentalModel.md`, Unified Harness spec.
- Deliverables: **cBPF profile(s)**, **bwrap loader usage**, **5 denial tests** (mount, unshare, perf/bpf, ptrace|keyctl, TIOCSTI), and a single‑page report + artifacts. 

**What I (L1) will wire for L2:**

- **Runtime flags (shim):**
  - `CCP_SANDBOX=none|seccomp|bwrap`
  - `CCP_SECCOMP_PROFILE=/path/profile.json`
  - `CCP_BWRAP_ARGS="--unshare-net --ro-bind /etc /etc …"`
- **Unified harness integration:**
  - Add `make sandbox-deny-tests` to run the 5 required denials; fail if any forbidden syscall succeeds.
  - Record results into `results/SANDBOX_*.json` and surface a **one‑pager** in `results/SANDBOX-REPORT.md`.
- **Escalation loop:** if a denial test fails in CI (nested containers), L2 raises to L1 with **suggested policy toggles** (e.g., relax `bpf` on kernels without backports). 

------

## Unified Test Harness (tighten & keep non‑interactive)

We’ll follow the consolidated hand‑off’s rules: **silent, non‑interactive**, short timeouts, H1 fallback if needed, loop until the acceptance gates are met. Retain the exact commands/artefacts paths so the next agent can run them verbatim. 

**Harness surfaces (Go path):**

- `make repro-go-quick` → 1× Sonnet + 1× Haiku, summarize to `results/METRICS_go_repro_quick.json`.
- `make overnight-go` (optional) → loops with timeouts/H1 toggle until both lanes produce a 200; snapshot logs to `logs/usage_overnight_final.jsonl`; bundle to `~/Downloads`.
- `make repro-py` remains as a reference (P0 proofs).
- Acceptance gates (unchanged): **no Haiku on Anth lane, no Z.AI header on Anth lane, at least one 200 per lane, results JSON present, SSE preserved**. 

------

## Concrete repo tasks I will drive next

1. **Micro‑SaaS surfaces**
   - `cmd/ccp/serve`: add `/healthz` & `/readyz`; add `CCP_POLICY_URL` fetch + on‑disk TTL cache; env flags `CCP_REQUIRE_US_ONLY`, `CCP_BLOCK_CN`, `CCP_HEADER_MODE`.
   - `ccp doctor` & `ccp verify` subcommands (wrap existing quick probes + summarizer).
   - Log rotation (size/time) for `logs/usage.jsonl`.
2. **Packaging**
   - **CI** matrix builds (darwin‑amd64/arm64, linux‑amd64/arm64, windows‑amd64).
   - Homebrew tap + winget manifests; draft codesign/notarize notes into `docs/PACKAGING.md`.
3. **Harness wiring**
   - `make repro-go-quick`, `make overnight-go` (ensure they run with the new `ccp verify`).
   - Update `docs/PROD-TESTS.md` with the micro‑SaaS commands (Go‑only path).
4. **L2‑Seccomp integration (spawned now)**
   - Create `scripts/seccomp/` with deny tests; read L2’s cBPF/bwrap artifacts & wire flags.
   - Add `make sandbox-deny-tests` to the unified harness and publish `results/SANDBOX-REPORT.md`. 
5. **Docs**
   - `docs/SAFETY.md` — re‑state “no body logs”, SSE preservation, header isolation as **non‑negotiable** invariants.
   - `docs/POLICY-PACK.md` — tiny JSON schema + example + how to pin `CCP_POLICY_URL`.
