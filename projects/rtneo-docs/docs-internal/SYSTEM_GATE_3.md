**Short answer:** Use a **separate private repo under a separate GitHub account/org** for client delivery, fed by a **sanitized, one‑way export** from your internal repo. This gives the cleanest separation of identities, history, and content. Keep your current internal repo as is.

Below is a crisp plan you can hand to the agent to implement—with minimal change to your current workflow.

------

## Recommendation (ranked)

1. **Best:** Internal repo (current) ➜ **Delivery repo under a neutral/alt GH account or org** (private).
   - Pros: cleanest isolation; no profile/repo cross‑exposure; easy to transfer to client later.
   - Cons: one more account to manage.
2. **Next best:** Internal repo ➜ **Delivery repo under the same account** (private).
   - Pros: simpler.
   - Cons: clients see your main profile; higher chance of accidental cross‑linking.
3. **If client has a GH org:** export directly into **their org’s repo**.
   - Pros: maximum trust & control for client.
   - Cons: requires their involvement up front.

**Choose #1.** Then, transfer the delivery repo to the client’s org after acceptance (optional).

------

## What goes to the **delivery repo** (allowlist)

- Code to run: `scripts/**`, `src/**` (if present), minimal helpers.
- Tests and gates: `tests/**`, `.tools/spec_sync.py`, `.tools/docs_check.py`, `.github/workflows/ci.yml`.
- Specs lite: `specs/bdd/features/**`, `specs/unit-md/**` (only behavior/unit briefs; no internal prompts).
- Client docs (RU only): `docs/ru/System/{Onboarding_ru.md, Repo_Layout_ru.md, Testing_ru.md, CI_CD_ru.md, Release_ru.md}`.
- Top‑level: `README.md` (RU), `LICENSE` (if applicable), `.gitignore`, `requirements*.txt`.

**Never include:** `docs-internal/**`, any prompt/agent notes, exploratory drafts, raw data (`data/raw/**`), XLSX originals.

------

## One‑way export pipeline (tagged release ➜ push to delivery repo)

Add a new GH Action **in the internal repo**:

```
.github/workflows/deliver.yml
name: deliver-client-snapshot
on:
  push:
    tags:
      - "v*"
      - "deliver-*"

jobs:
  build-and-export:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0 }

      # 1) Gate: tests, spec-sync, docs-check (reuse your existing CI commands)
      - name: Python setup
        uses: actions/setup-python@v5
        with: { python-version: '3.11' }
      - run: pip install -r requirements-dev.txt
      - run: pytest -q --cov=scripts --cov-report=xml
      - run: python .tools/spec_sync.py
      - run: python .tools/docs_check.py

      # 2) Build sanitized export tree
      - name: Build export tree
        run: |
          set -euo pipefail
          rm -rf export && mkdir -p export
          mkdir -p export/.github/workflows export/.tools export/specs/bdd/features export/specs/unit-md export/docs/ru/System
          # allowlist copy
          rsync -a scripts/ export/scripts/ || true
          rsync -a src/ export/src/ || true
          rsync -a tests/ export/tests/
          rsync -a specs/bdd/features/ export/specs/bdd/features/
          rsync -a specs/unit-md/ export/specs/unit-md/
          rsync -a .tools/spec_sync.py export/.tools/spec_sync.py
          rsync -a .tools/docs_check.py export/.tools/docs_check.py
          rsync -a .github/workflows/ci.yml export/.github/workflows/ci.yml
          # RU docs must already be prepared:
          rsync -a docs/ru/System/ export/docs/ru/System/
          cp README.md export/README.md || true
          cp .gitignore export/.gitignore || true
          cp requirements*.txt export/ 2>/dev/null || true

      # 3) Safety scan (block internal leakage)
      - name: Sanity scan
        run: |
          set -euo pipefail
          cd export
          ! grep -R -i -E 'docs-internal|prompt|agent|claude|yss2|sys\.markdown|htp\.kg.*internal' || (echo "Leakage detected"; exit 1)

      # 4) Push to delivery repo (via deploy key or PAT)
      - name: Push snapshot to delivery repo
        env:
          DELIVERY_REPO: ${{ secrets.DELIVERY_REPO }}   # e.g. altuser/forecasting
          DELIVERY_PAT:  ${{ secrets.DELIVERY_PAT }}    # fine-grained PAT for that repo only
        run: |
          set -euo pipefail
          cd export
          git init
          git config user.name "release-bot"
          git config user.email "releases@bot.local"
          git add -A
          git commit -m "deliver: ${GITHUB_REF_NAME}"
          git branch -M main
          git remote add origin https://x-access-token:${DELIVERY_PAT}@github.com/${DELIVERY_REPO}.git
          git push -f origin main
```

> **Secrets to create (in internal repo):**
>  `DELIVERY_REPO` = `altusername/forecasting` (or org/repo), `DELIVERY_PAT` = fine‑grained PAT from the **alt account** with *contents:write* to that single repo.
>  *(Alternative: SSH deploy key with write access on the delivery repo.)*

------

## Minimal policies to add now

- **DELIVERY_POLICY.md (internal):**
  - RU docs updated only at paid milestones; internal docs remain English.
  - Delivery repo must always pass: tests, spec‑sync, docs‑check, coverage.
  - Delivery is **snapshot‑only**; no internal history/branches mirrored.
- **CODEOWNERS (delivery repo):** restrict `scripts/**`, `specs/**`, `docs/ru/**` to your review.
- **Branch protection (delivery repo):**
  - Require PRs (if you collaborate there as well) or push from the Action only.
  - Required checks: the single CI job (reuse the same gates).

------

## Quick decision guide for you

- **Do we use another username?**
   **Yes.** Create a neutral **alt account or private org** for delivery. It avoids any link to your internal work/profile and lets you cleanly transfer repo ownership to the client later.
- **One repo or two?**
   **Two repos.** Keep internal fast and messy; delivery clean and minimal. Export is automated and gated.

------

## Action items (for the current agent)

1. Create the **alt GH account/org** and the **private delivery repo** (empty).
2. Add a fine‑grained **PAT** for that repo; store in internal repo secrets (`DELIVERY_REPO`, `DELIVERY_PAT`).
3. Add the **deliver.yml** workflow above to the internal repo.
4. Prepare **RU docs** at `docs/ru/System/*` (clone of your English structure, translated).
5. Cut a tag `deliver-v0.1.0` → ensure the Action produces the delivery repo snapshot.
6. Verify the delivery repo CI is green; no internal files/strings present.

------

## Tiny visual (export model)

```mermaid
flowchart LR
  A[Internal repo private] -->|tag: deliver-| B[GH Action: tests+gates]
  B --> C[Sanitized export tree]
  C -->|push| D[Delivery repo alt account]
  D --> E[Client access  transfer]
```

If you want, I can also draft the Russian `docs/ru/System/*` skeleton texts next, ready to paste.