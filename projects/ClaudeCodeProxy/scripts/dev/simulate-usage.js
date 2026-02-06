```js
#!/usr/bin/env node
/**
 * Synthetic usage generator for local HUD testing (dev only).
 * Requires CCP_DEV_ENABLE=1 on the shim to enable /v1/dev/sim-usage.
 *
 * Usage:
 *   node scripts/dev/simulate-usage.js --model claude-haiku-4.5 --in 500 --out 800 --repeat 100 --interval 50
 */
const http = require("http");

function arg(name, def) {
  const i = process.argv.indexOf("--" + name);
  if (i === -1) return def;
  const v = process.argv[i + 1];
  return v ?? def;
}
const model = arg("model", "claude-haiku-4.5");
const inTok = parseInt(arg("in", "1000"), 10);
const outTok = parseInt(arg("out", "1500"), 10);
const repeat = parseInt(arg("repeat", "10"), 10);
const seconds = parseInt(arg("seconds", "10"), 10);
const interval = parseInt(arg("interval", "10"), 10);
const host = arg("host", "127.0.0.1");
const port = parseInt(arg("port", "8082"), 10);

const payload = JSON.stringify({
  model, in: inTok, out: outTok, repeat, seconds, interval_ms: interval
});

const req = http.request({
  host, port, path: "/v1/dev/sim-usage", method: "POST",
  headers: { "content-type": "application/json", "content-length": Buffer.byteLength(payload) }
}, res => {
  let data = "";
  res.on("data", d => data += d);
  res.on("end", () => { console.log(res.statusCode, data); });
});
req.on("error", e => { console.error("error:", e.message); process.exit(1); });
req.write(payload); req.end();
```

---

**How to integrate (summary):**

* Add `quotas.go` and `metrics.go` to the `services/go-anth-shim/cmd/ccp/` folder and call `InitQuotas()` and `WireQuotaHTTP(mux)` from your `main.go` after the mux is created. Also register `mux.HandleFunc("/metrics", httpMetrics)`.
* Append the `bin/cc` and `scripts/shell/ccc-aliases.sh` snippets.
* Create `configs/quotas.json` (copy from example; tune).
* For local testing set `CCP_DEV_ENABLE=1` and run `node scripts/dev/simulate-usage.js ...`.
* Update docs are included above.