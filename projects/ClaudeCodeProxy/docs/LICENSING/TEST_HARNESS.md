**Goal.** Give CI and local dev a no‑network way to exercise **license pack** UX:

* `cc license set <PACK>` persists a pack to `~/.config/ccp/license.pack`.
* `cc license status` prints plan/kid/expiry (or a friendly error).

**Run.**

* `./docs/LICENSING/harness/smoke.sh` (placeholder pack).
* Replace `packs/trial_license.pack` with a real pack when testing the gate.
* Optional: `./docs/LICENSING/harness/ccp_verify.sh` if the shim binary is built.

**Cross‑refs.** See LICENSING ADRs and execution plan for the real issuer/device flow; harness is only a scaffold.

---