**Local run (macOS/Linux)**

1. Install **Claude Code** (latest), **mitmproxy**, **jq**.
2. Trust mitm CA. Export:

   ```bash
   export HTTPS_PROXY=http://127.0.0.1:8080
   export NODE_EXTRA_CA_CERTS="$HOME/.mitmproxy/mitmproxy-ca-cert.pem"
   ```
3. **Terminal A** (Anthropic subscription):

   ```bash
   cd work/sub && claude
   ```
4. **Terminal B** (Z.AI lane):

   ```bash
   export ANTHROPIC_BASE_URL="https://api.z.ai/api/anthropic"
   export ANTHROPIC_AUTH_TOKEN="$ZAI_API_KEY"
   cd work/zai && claude
   ```
5. **MITM**:

   ```bash
   mitmdump -s services/mitm-subagent-offload/addons/haiku_glm_router.py -p 8080
   ```
6. In Anthropic terminal, spawn a **subagent** with haiku; verify MITM logs show `lane=zai`.

---