Below is a **decision-ready product plan and engineering roadmap** that turns the research into concrete, staged work for our coding agent—evolving CCC from a Claude-first proxy into a **universal model orchestrator** with planner→doer→reviewer pipelines, automatic escalation/fallback, strong observability, and predictable cost.

I assume all previously assigned tasks are complete (per your update), and I’ve aligned next work to the files and areas we’ve already touched this session.

---

## 0) One-line vision (keep “do one thing well”)

> **Always pick the right model/tool and take the next right action on your code with full visibility, predictable cost, and zero workflow friction.**

---

## 1) Who we’re building for (personas + JTBD)

* **Solo power user (indie / startup dev):** wants a single CLI + minimal IDE glue; saves money by mixing GLM/open models with GPT-5/Claude when needed; expects fast loops and reliable completions.
* **Team lead / staff engineer:** needs repeatable pipelines (plan→build→test→review) and sharable bundles; wants auditability, cost controls, and easy handoffs (PRs, diffs, metrics).
* **Platform/infra team (enterprise):** needs policy packs, licensing gates, sandboxing, logs/metrics SLI, packaging (brew/winget/deb), and headless/CI operation.

**Jobs-to-be-done**

1. *“Draft → implement → test → review”* for changes that touch many files.
2. *“Get unstuck fast”* via automatic model/tool escalation when the current path loops or fails.
3. *“Run long tasks overnight”* with observability, safe defaults, and resumability.
4. *“Control cost without babysitting”*—route cheap first, pay only when quality demands it.

---

## 2) Product pillars (what must be true)

1. **Multi-model routing** (Claude, GPT-5/Codex, GLM-4.6, OpenRouter, local/Ollama) + **auto escalation/fallback**.
2. **Planner→Doer→Reviewer pipelines** as first-class, not a prompt hack.
3. **Observability & control:** live step log, usage meter, partial-output persistence, reproducible bundles.
4. **Context discipline:** auto summarization, retrieval for code, lazy MCP tool schemas, per-agent budgets.
5. **Reliability & safety:** health/ready endpoints, log rotation, header isolation, no body logging, sandbox.
6. **Integrations:** thin VS Code extension, PR reviewer, Slack bot, simple web status.
7. **Extensibility:** providers.yaml + plugins/subagents config; “pipelines as code” (YAML/JSON).

---

## 3) North-star metrics & SLIs (so we know it works)

* **Task Completion Rate (TCR):** % pipelines that reach “reviewable diff/PR”. Target ≥80% for “medium” tasks.
* **Human-edits after agent PR:** median edit lines <20% of PR size.
* **Mean Time to First Good Diff (MTFGD):** ≤7 min for medium tasks.
* **Auto-escalation win rate:** % of escalations that convert a failure/loop into success ≥60%.
* **Cost per completed task** (est. tokens x price) with 95% within configured budget.
* **Stability:** SSE completeness 99.9%; zero cross-lane header leaks; no crashes without partial-output preservation.

---

## 4) 90-day roadmap (release trains)

> Each “R” has clear ship criteria, ~2 weeks each. Keep scope thin, testable, and stackable.

### **R0 (Weeks 1–2): Hardening & parity** — *foundation you can demo every day*

**Deliverables**

* **Health**: `/healthz`, `/readyz`, `/metrics` (Prometheus).
* **Log rotation**: size+time hybrid; rotate to profile dir; CLI `cc usage` and `cc logs`.
* **Partial-output persistence**: stream to logfile and keep last page in crash cases.
* **Usage meter**: per-session budget banner; colorized warnings at 75/90/100%.
* **Policy pack v1**: verify signature + TTL; hot-reload; safe fallback.
* **CLI polish**: `ccp-start|env|logs|stop|status`, `cc verify` (wrap present scripts).

**Acceptance**

* Start/stop cleanly; `readyz` reports provider probe OK; rotate logs under load; crash yields persisted partial; `cc verify` passes.

> Touchpoints: `services/go-anth-shim/cmd/ccp/main.go`, `logrotate.go`, `scripts/summarize-usage.js`, `scripts/logs-rotate.sh`, brew formula.

---

### **R1 (Weeks 3–4): Multi-model connectors + routing MVP**

**Deliverables**

* **providers.yaml** in `~/.config/ccp/` (or project override):

  ```yaml
  providers:
    anthropic: { key_env: ANTHROPIC_AUTH_TOKEN, base_url: https://api.anthropic.com }
    openai:    { key_env: OPENAI_API_KEY, model_map: { gpt-5-pro: gpt-5-pro } }
    glm:       { key_env: ZHIPU_API_KEY,  via: openrouter|zhipu, model_map: { glm-4-6: glm-4-6 } }
    local:     { via: ollama,             models: [codellama, qwen2.5-coder] }
  ```
* **Router**: rule engine reads *policy pack* + *providers.yaml*:

  * route by model pattern, cost ceiling, task type (plan/build/test/review).
* **Manual model switch**: `/model gpt-5-pro` in CLI; prints cost multiple & context.
* **Fallback basic**: if 429/5xx/timeouts → alternate route once.

**Acceptance**

* Haiku→ZAI, Sonnet/Opus→Anth lane preserved; GPT-5 and GLM calls succeed; manual switch works; fallback triggered in chaos test.

> Touchpoints: router module, provider clients, config loader, docs update.

---

### **R2 (Weeks 5–6): Planner→Doer→Reviewer pipelines (built-in)**

**Deliverables**

* **Built-in roles** with defaults and separate budgets:

  * **Planner (Claude-leaning)**: no write tools; long context; generates task breakdown + acceptance tests.
  * **Doer (GLM-4.6 default, escalates)**: write tools, compile/run/test tools.
  * **Reviewer (GPT-5 default)**: diff/PR critique; style & safety gates.
* **Pipeline DSL**:

  ```yaml
  pipeline:
    - role: planner
    - role: doer
    - role: reviewer
  ```

  Run via `ccp run --pipeline plan-build-test-review`.
* **Artifacts**: `results/PLAN.md`, `results/Diff.patch`, `results/REVIEW.md`.

**Acceptance**

* On a medium feature, pipeline produces a plan, a diff that compiles, and a reviewer report; bundle includes all artifacts; TCR baseline ≥60%.

> Touchpoints: subagent config, tool permissions, run-loop, results writing.

---

### **R3 (Weeks 7–8): Observability & control**

**Deliverables**

* **Event bus + /events SSE**: emit `decision`, `tool_call`, `retry`, `escalate`, `cost_update`.
* **TUI** (CLI): live to-do list & “thinking” preview; step timings; current budget.
* **Auto-retry chains** with halting conditions, backoffs; per-role limits.
* **Crash-resumption**: `cc resume <rid>` picks up from last good step.

**Acceptance**

* You can *see* every step; cancel/continue; resume after crash; retries bounded and logged; partial outputs preserved.

> Touchpoints: event structs (extend `METRICS-SCHEMA.md`), CLI renderer, resume store.

---

### **R4 (Weeks 9–10): Context discipline & memory**

**Deliverables**

* **Lazy MCP schema**: only inject selected tool schemas on first invocation.
* **Auto summarizer**: compress history at thresholds; per-role context budgets.
* **Code retrieval**: ripgrep + embeddings for *on-demand* code context (not inline dump).
* **Memory**: project `.agents.md` + per-project memory store; opt-in personal memory.

**Acceptance**

* Token usage drops ≥30% on long runs with same outcomes; no “context limit exceeded” on tasks that previously failed.

> Touchpoints: tool registry, summarizer module, RAG shim, config flags.

---

### **R5 (Weeks 11–12): Thin IDE + PR + Slack + packaging**

**Deliverables**

* **VS Code extension (thin)**: connects to local daemon; shows steps; “approve action” button; insert/commit diffs.
* **PR reviewer bot**: GitHub app to run Reviewer role on PRs and comment.
* **Slack**: `/ccp run` & status updates for long tasks.
* **Packaging**: brew (done), winget, deb; codesign/notarize notes.

**Acceptance**

* End-to-end demo: start in VS Code, run pipeline, see TUI steps, get PR + review comments; Slack shows progress; installers verified.

---

## 5) Escalation & fallback logic (initial heuristics)

**Signals we’re stuck (any N within M minutes):**

* Same exception class repeats ≥2 times.
* Diff churn without compile success across 2 cycles.
* Planner “uncertainty” self-report high; Doer rates “confidence low”.
* Budget under-utilized but time high.

**Actions**

1. **Retry chain** with altered tactic (e.g., narrower change, run tests earlier).
2. **Escalate model** (Doer → GPT-5) or **bring Reviewer in early** to diagnose.
3. **Fallback** to cheaper model for repetitive/refactor steps after success.

**Guardrails**

* Per-role retry limits; per-task budget caps; require confirm if crossing cap.

---

## 6) Detailed engineering backlog (granular, testable tickets)

> **Legend:** S (≤0.5d), M (1–2d), L (3–5d). Each item includes acceptance criteria.

### A) Orchestrator core

* [M] **providers.yaml loader** with schema validation. *AC:* invalid keys rejected; env overrides work.
* [M] **Provider clients**: Anthropic, OpenAI, OpenRouter, Ollama. *AC:* unit tests with fakes; 429/5xx handling.
* [M] **Router v1**: rule eval by model pattern & cost; dry-run mode. *AC:* deterministic routing in tests.
* [S] **Budget manager**: per-session token→$ projection; CLI warnings. *AC:* 75/90/100% banners.
* [M] **Fallback basic**: one alternate route on 429/5xx/timeout. *AC:* integration test flips path.
* [S] **Header isolation**: confirm ZAI creds never on Anth lane (already enforced; add test). *AC:* grep proofs pass.

### B) Pipelines & roles

* [M] **Role configs** (planner/doer/reviewer) with tool permissions. *AC:* role isolation verified.
* [M] **Pipeline runner** with checkpoints & artifacts. *AC:* PLAN.md, Diff.patch, REVIEW.md generated.
* [S] **CLI `ccp run --pipeline`** with template selection. *AC:* minimal two-step pipeline works.
* [M] **Reviewer rules**: style, safety, risk checklist. *AC:* flags obvious issues in sample PR.

### C) Observability & control

* [M] **Event bus** + `/events` SSE; back-buffer for late subscribers. *AC:* TUI shows steps; reconnect resumes.
* [M] **TUI**: to-do, current action, elapsed, budget. *AC:* tested on 80x24; no redraw glitches.
* [S] **Partial-output file** with tail resume. *AC:* kill midway → `cc resume` prints last page then continues.
* [S] **Metrics counters**: completions, retries, escalations. *AC:* /metrics exposes Prometheus gauges.

### D) Context & tools

* [M] **Lazy tool schemas** registry. *AC:* only used tools appear in prompt snapshot.
* [M] **Auto summarizer** with rolling window + pinning. *AC:* token budget respected; important items pinned.
* [M] **Code RAG**: ripgrep + embeddings filter fed into prompt *only when referenced*. *AC:* large repo queries succeed without hitting limit.
* [S] **Per-role budgets**: hard caps + soft warn. *AC:* planner cannot starve doer.

### E) Reliability & safety

* [S] **/healthz** (up), **/readyz** (provider probe), **/metrics**. *AC:* kubectl probes happy.
* [M] **Log rotation** unify `logrotate.go` and `scripts/logs-rotate.sh`; keep N copies per profile. *AC:* rotation under load without loss.
* [M] **SSE integrity tests** (+ H1/H2 toggle paths). *AC:* zero truncations in 1k streams.
* [M] **Policy pack verify** (Ed25519) + TTL; hot reload. *AC:* bad sig rejected; fallback remains.
* [M] **Sandbox hooks** (Linux): flags in place; tests stubbed. *AC:* deny tests scaffolded (no body logs invariant).

### F) Integrations

* [M] **VS Code thin**: webview shows steps; IPC to daemon; apply diff. *AC:* hello-world feature works.
* [M] **PR reviewer bot** (GitHub App) calling Reviewer role; comments on PR. *AC:* runs in CI on PR open.
* [S] **Slack notifier**: /ccp status & webhook progress updates. *AC:* message per step change.

### G) Packaging & release

* [S] **brew** formula finalize (path updated). *AC:* `brew install ccp` local tap passes.
* [M] **winget** manifest. *AC:* install on Win runner.
* [M] **deb** package with systemd unit (optional). *AC:* installs & starts daemon.

### H) Docs & ops

* [S] Update **docs/PROD-TESTS**, **OPS-GUIDE**, **ONE-PAGER** with multi-model & pipelines.
* [S] Add **docs/POLICY-PACK.md** (schema + example).
* [S] Add **docs/PIPELINES.md** (DSL + samples).
* [S] Expand **TROUBLESHOOTING.md** (escalation/fallback matrix).

---

## 7) Thin-slice “this week” (ready to ship)

> **Goal:** a user can start CCC, run a 3-step pipeline, watch it, switch models, and get a PR/diff—**today**.

1. Ship **R0 core** (health, rotation, usage meter, partial output).
2. Add **providers.yaml** (Anthropic + OpenAI) and manual `/model` switch.
3. Provide **mini pipeline**: Planner (Claude) → Doer (GLM via OpenRouter) → Reviewer (GPT-5), with a sample task:

   * *“Extract foo logic into service, add unit tests, update README.”*
4. CLI TUI shows steps and budget; `make bundle` includes PLAN/Diff/Review & logs.
5. **Acceptance session:** run on a real repo; produce PR; cost under set cap; no crashes; resume works.

---

## 8) “State machine” for escalation (reference implementation sketch)

```
state = {role, attempt, err_k, confidence, budget_left}

on_step_end:
  if success: next_step()
  else:
    if repeated(err_k, k=2) or confidence < τ or attempt > A_max:
       if can_escalate(role): switch_model(role, higher_tier); attempt=0
       else if can_invoke_reviewer(): run_reviewer_diagnosis()
       else: fail_with_action_items()
    else:
       backoff_retry(role, mutate_plan())
```

* **mutate_plan():** narrow scope, change test order, switch tool, fetch docs.
* **can_escalate():** within budget, higher tier present.
* **can_invoke_reviewer():** reviewer budget remains, not already invoked.

---

## 9) Code review focus (targeted, file-specific checks)

> I didn’t open the zip here; this is a **concrete audit checklist** you/next agent can run now against the exact files you listed.

**services/go-anth-shim/cmd/ccp/main.go**

* ✅ `/healthz`, `/readyz`, `/metrics` handlers return fast; graceful shutdown with ctx timeout.
* ✅ **SSE proxying** doesn’t buffer; flushes; honors H1/H2 toggle; backpressure safe.
* ✅ **Policy pack**: verify Ed25519; ignore unsigned/expired; TTL cache dir in profile.
* ✅ **Header isolation**: ZAI headers never set on Anth lane; unit test by log grep.
* ✅ **Config precedence**: env → providers.yaml → policy defaults; log on override.
* ✅ **Panic safety**: recover middleware that logs and preserves partial output.

**services/go-anth-shim/cmd/ccp/logrotate.go**

* ✅ Rotate by size *or* age; atomic rename; fsync; compress old; keep N by profile.
* ✅ Back-pressure safe during rotation (no write loss), tested with concurrent writers.
* ✅ Monotonic filename schema with timestamp; time zone UTC.

**services/go-anth-shim/cmd/licissuer/main.go**

* ✅ Device flow: codes are high-entropy; poll token opaque; rate-limited; expiry honored.
* ✅ Invite persistence safe on crash; JSON state versioned; negative tests for replay.
* ✅ **CORS** (if browser): allow localhost dev origin; no wildcard in prod.
* ✅ **Key rotation** path tested; KID propagated; signature verify stable.
* ✅ **Abuse controls**: IP throttling; minimal logs; no PII in logs.

**scripts/summarize-usage.js**

* ✅ Stream and chunk large JSONL; avoid OOM; CLI flag for input file; p95/p50 by lane; decisions vs completions split.
* ✅ Add **escalation stats**, **retry counts**, **cost projection**.

**scripts/shell/ccc-aliases.sh**

* ✅ Idempotent install; zsh/bash detection; safe PATH injection; profile awareness (prod/dev).
* ✅ `ccp-status` prints ports, env, active models, budget.

**packaging/homebrew/Formula/ccp.rb**

* ✅ Uses tagged releases; sha256 updated; notarization note; caveats for providers.yaml.

**docs** (already improved this session): ensure new features appear in **ONE-PAGER**, **OPS-GUIDE**, **PROD-TESTS**, **PIPELINES**, **POLICY-PACK**.

---

## 10) Risks & mitigations

* **Model API churn / rate limits** → provider adapter layer + fallback; chaos tests weekly.
* **Token cost surprises** → budget manager + defaults conservative; warn & require confirm to exceed.
* **User trust (limits, crashes)** → transparent usage meter; partial persistence; no silent failure.
* **Security** → invariant: no body logs; redact secrets; header isolation tests in CI; sandbox “deny 5” tests.
* **Scope creep** → ship every 2 weeks (R0–R5), each independently valuable.

---

## 11) What to do today (checklist)

* [x] Implement **/healthz /readyz /metrics** and wire into `Makefile verify`.
* [x] Add **usage meter** + banners to CLI; persist partial outputs.
* [ ] Land **providers.yaml**, Anthropic+OpenAI connectors; `/model` switch command.
* [ ] Deliver **mini pipeline** (Plan→Do→Review) + one demo task + bundle.
* [ ] Update **ONE-PAGER / OPS-GUIDE / PROD-TESTS** with the new flow.

Once those 5 are in, we have a demo-worthy universal orchestrator slice. From there, proceed through R1→R5 to reach the full vision.

---

### Final note

This plan is deliberately **thin-sliced** and **testable** at every step. It transforms the research themes (multi-model, escalation, observability, cost, integration) into concrete increments that we can demo, measure, and iterate.

If you want, I can turn the backlog above into **GitHub issues** (grouped by milestone R0–R5, with acceptance criteria) and draft the **providers.yaml** + **pipeline YAML** starter files so the next agent begins coding immediately.
