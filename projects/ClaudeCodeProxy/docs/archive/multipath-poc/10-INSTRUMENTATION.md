## usage-logger.js

```js
// poc/usage-logger.js
import fs from 'node:fs';

export function logUsage({ lane, model, tokensIn=0, tokensOut=0, ok=true }) {
  const line = JSON.stringify({
    ts: new Date().toISOString(),
    lane, model, tokensIn, tokensOut, ok
  });
  fs.appendFileSync('./logs/usage.jsonl', line + '\n');
}
```

> Integrate into broker/gateway when you parse `response.usage`.

---