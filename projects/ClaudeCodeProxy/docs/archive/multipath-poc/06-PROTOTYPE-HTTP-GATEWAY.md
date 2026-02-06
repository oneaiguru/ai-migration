> ⚠️ **API‑billed mode** (uses Anthropic & Z.AI API keys). Keep separate from your subscription tests.

## gateway-haiku-router.js

```js
// poc/gateway-haiku-router.js
require('dotenv').config();
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const morgan = require('morgan');

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(morgan('dev'));

const ZAI_API = 'https://api.z.ai/api/anthropic';
const ANTH_API = 'https://api.anthropic.com';

function pickLane(body) {
  const model = (body?.model || '').toLowerCase();
  return model.includes('haiku') ? 'zai' : 'anth';
}

function makeProxy(target, apiKey) {
  return createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite: { '^/anthropic': '' },
    onProxyReq: (proxyReq, req) => {
      proxyReq.setHeader('content-type', 'application/json');
      proxyReq.setHeader('anthropic-version', '2023-06-01');
      if (apiKey) proxyReq.setHeader('x-api-key', apiKey);
      const body = JSON.stringify(req.body);
      proxyReq.setHeader('content-length', Buffer.byteLength(body));
      proxyReq.write(body);
    }
  });
}

app.post('/anthropic/v1/messages', (req, res, next) => {
  const lane = pickLane(req.body);
  if (lane === 'zai') {
    return makeProxy(ZAI_API, process.env.ZAI_API_KEY)(req, res, next);
  }
  return makeProxy(ANTH_API, process.env.ANTHROPIC_API_KEY)(req, res, next);
});

app.listen(3000, () => {
  console.log('HTTP gateway (API-billed) on :3000');
  console.log('POST /anthropic/v1/messages');
});
```

## package.json (gateway)

```json
{
  "name": "haiku-gateway-poc",
  "private": true,
  "type": "module",
  "scripts": {
    "gateway": "node poc/gateway-haiku-router.js"
  },
  "dependencies": {
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "http-proxy-middleware": "^3.0.1",
    "morgan": "^1.10.0"
  }
}
```

## .env.example

```dotenv
ZAI_API_KEY=replace_me
ANTHROPIC_API_KEY=replace_me
```

> Point Claude Code at `http://localhost:3000/anthropic` with `ANTHROPIC_BASE_URL` **only** if you accept API billing for both lanes.

---