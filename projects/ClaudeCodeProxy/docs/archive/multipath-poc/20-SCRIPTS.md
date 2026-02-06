## scripts/start-broker.sh

```bash
#!/usr/bin/env bash
set -euo pipefail
export ZAI_API_KEY=${ZAI_API_KEY:-"REPLACE"}
mkdir -p work/sub work/zai logs
node poc/dual-cli-router.js
```

## scripts/run-gateway.sh

```bash
#!/usr/bin/env bash
set -euo pipefail
export ZAI_API_KEY=${ZAI_API_KEY:-"REPLACE"}
export ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY:-"REPLACE"}
mkdir -p logs
node poc/gateway-haiku-router.js
```

## scripts/capture-headers.js

```js
// scripts/capture-headers.js
const express = require('express');
const app = express();
app.use(express.json({ limit: '50mb' }));
app.all('*', (req, res) => {
  console.log('---', req.method, req.path);
  console.log('H:', req.headers);
  console.log('B:', JSON.stringify(req.body).slice(0, 2000));
  res.json({ ok: true });
});
app.listen(3000, ()=>console.log('capture on :3000'));
```

---