# Private Packaging Overview

> Internal use only. Do not publish public formulas or manifests while the project remains in stealth.

## Build artifacts

```bash
# produces dist/ccp-<version>-darwin-universal.tar.gz
scripts/release/build-artifacts.sh 0.1.0
sha256 dist/ccp-0.1.0-darwin-universal.tar.gz
```

Keep `dist/` outside of version control or add it to `.gitignore`.

## Homebrew tap (private)

1. Copy `packaging/homebrew/Formula/ccp.rb` into your **private** tap repository. Update `url` to point at an internal blob store and set the SHA256.
2. Add that tap as a private git remote (e.g., GitHub Enterprise) and install with `brew install <org>/private/ccp`.
3. Never submit the formula to the public Homebrew/core repo while in stealth mode.

## Winget manifest (private feed)

`packaging/winget/ccp-private.yaml` is a template. Replace the URL/SHA with internal storage and host it from a private winget repository. Do **not** open a PR to the public `microsoft/winget-pkgs` repo.

## Signing / notarization

See `docs/Packaging/SIGNING-CHECKLIST.md` for the end-to-end signing flow.

- macOS helper: `scripts/release/sign-macos.sh` (wraps `codesign`).
- Windows helper: `scripts/release/sign-windows.ps1` (wraps `signtool`).

Keep certificates, passwords, and release assets on private infrastructure.
