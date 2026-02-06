```md
# Licensing Test Plan

## Unit
- Verify good/bad signature, wrong `kid`, expired, malformed JSON.
- Canonicalization invariants (field order, whitespace).

## Integration
- Issuer device flow begin/poll; rate limits; expiry.
- CLI `cc license login --loopback` happy path (uses a temporary localhost port).
- CLI `cc license set <PACK>` with a golden pack.

## End-to-End
- Community → trial → community via `make smoke-license`.
- `/readyz` shows `reason:"license"` when gated.
- Routing flips for premium features.

## Negative
- Missing pack → community mode.
- Tampered pack → reject; keep last-known-good.
````