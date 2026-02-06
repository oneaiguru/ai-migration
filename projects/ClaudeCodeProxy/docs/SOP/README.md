# Standard Operating Procedures (SOP)

This directory holds step-by-step playbooks for recurring operations. Each SOP should describe:
- **Purpose** – why the procedure exists.
- **Prerequisites** – tools, credentials, or environment setup required.
- **Procedure** – numbered steps that can be followed without additional context.
- **Verification** – how to confirm the procedure succeeded.
- **Rollback** – how to undo the change if needed.

## Index

| SOP | Description |
|-----|-------------|
| [Environment profile setup](../ops/environment-profiles.md) | Configure `prod` vs `dev` profiles, including wrapper commands and directory layout. |
| [Proxy alias playbook](proxy-aliases.md) | Using `ccgo`, `ccmitm`, `ccstock`, etc., to toggle the shim/mitm/stock endpoints. |
| [Routing expansion](ROUTING_EXPANSION.md) | How to add providers/models safely with tests, UAT scripts, and docs. |
| [Capture helper](CAPTURE-HELPER.md) | How to capture `rid` and partial stream files for triage. |

To add a new SOP:
1. Create a Markdown file alongside this README (e.g., `docs/SOP/deploy-proxy.md`).
2. Follow the template above.
3. Update the table to link the new SOP.
