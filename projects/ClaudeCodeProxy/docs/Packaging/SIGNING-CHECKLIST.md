# Signing & Notarization Checklist (Private Builds)

> Internal use only. Do not publish artifacts or credentials while the project remains in stealth.

## macOS (codesign + notarize)

1. **Prepare environment**
   ```bash
   export CODESIGN_ID="Developer ID Application: <Org Name> (<TeamID>)"
   export NOTARY_APPLE_ID="user@example.com"
   export NOTARY_TEAM_ID="<TeamID>"
   export NOTARY_PW="@keychain:AC_PASSWORD"   # or use notarytool keychain profile
   ```
2. **Sign the binary/tarball**
   ```bash
   scripts/release/build-artifacts.sh 0.1.0
   scripts/release/sign-macos.sh dist/ccp-0.1.0-darwin-universal.tar.gz
   ```
   `sign-macos.sh` wraps `codesign --options runtime --timestamp ...` and `codesign --verify`.
3. **Submit for notarization (optional)**
   ```bash
   xcrun notarytool submit dist/ccp-0.1.0-darwin-universal.tar.gz \
     --apple-id "$NOTARY_APPLE_ID" \
     --team-id "$NOTARY_TEAM_ID" \
     --password "$NOTARY_PW" --wait
   ```
4. **Staple result** (if notarized tarball is expanded, staple the binary)
   ```bash
   tar -xzf dist/ccp-0.1.0-darwin-universal.tar.gz -C /tmp
   xcrun stapler staple /tmp/ccp/ccp
   ```
5. **Record hashes & upload**
   - `shasum -a 256 dist/ccp-0.1.0-darwin-universal.tar.gz`
   - Store signatures + notarization log in private storage.

## Windows (signtool)

1. Ensure certificate installed/accessible (PFX + password).
2. Update `scripts/release/sign-windows.ps1` with certificate thumbprint or PFX path.
3. Sign the installer or executable:
   ```powershell
   powershell -ExecutionPolicy Bypass -File scripts/release/sign-windows.ps1 `
     -Path dist\ccp-0.1.0-win-x64.exe `
     -TimestampUrl "http://timestamp.digicert.com"
   ```
4. Verify signature:
   ```powershell
   Get-AuthenticodeSignature dist\ccp-0.1.0-win-x64.exe
   ```

## Distribution

- Upload signed artifacts to private storage (S3 bucket, internal CDN, etc.).
- Update `packaging/homebrew/Formula/ccp.rb` and `packaging/winget/ccp-private.yaml` with the new version, URL, and SHA256.
- Never publish to public taps/feeds until launch.

## Release notes

- Record version, commit SHA, SHA256, signing certificate used, and storage location in the internal release ledger.
- Rotate credentials and review signing scripts quarterly.
