# Subscription Modes

## Community (free)
- No license provided (`CC_LICENSE_JSON`/`CC_LICENSE_SIG` unset).
- Haiku requests stay on the Anthropic lane (Z.AI offload disabled).
- Signed policy packs still load, but any `lane="zai"` entry is ignored without the `zai_offload` feature.

## Pro (licensed)
- Supply a signed license JSON + signature (Ed25519) via flags or env:
  ```bash
  export CC_LICENSE_JSON=/path/to/license.json
  export CC_LICENSE_SIG=/path/to/license.sig
  ./services/go-anth-shim/bin/ccp serve --port 8082
  ```
- On successful verify the shim logs `plan` + `features`; Haiku → Z.AI routing is restored when `zai_offload` is present.
- Licenses may optionally bind to a device hash (hostname + GOOS/GOARCH). Leave `device` blank when you wish to allow multi-host use.

## Flags & env
- `--license-json`, `--license-sig` (or `CC_LICENSE_JSON`, `CC_LICENSE_SIG`).
- Missing/incomplete/invalid pairs fall back to Community mode and log the reason.

## Policy packs
- The same signed policy pack infrastructure applies to both tiers.
- Community pack can map all models to the Anth lane; premium packs may route Haiku to Z.AI, but the license gate still decides at runtime.

## Invariants
- Lane hygiene: Anth lane never receives Z.AI credentials.
- SSE streams are unbuffered; no body content is logged.
- Usage logs include `decision:"license_block"` when Haiku is downgraded because the license is absent or missing features.
