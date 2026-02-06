# Schema Evolution (Additive‑Only v1)

Policy
- Current event/snapshot schema is `v1` and evolves additively only.
- New fields: allowed; must be optional; keep flat names unless documented.
- Unknown fields: consumers must ignore.
- Breaking changes: bump to `v2` with a new path and a migration guide.

Process
1) Propose additive fields in an alignment gate entry.
2) Land code + fixtures; update schema docs.
3) Notify consumers; add tests that tolerate unknown fields.

References
- `docs/System/contracts/USAGE_EVENT_SCHEMA.md`

