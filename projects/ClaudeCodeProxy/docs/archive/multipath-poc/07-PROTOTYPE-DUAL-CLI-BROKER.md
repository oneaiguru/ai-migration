## dual-cli-router.js

```js
// poc/dual-cli-router.js
import { spawn } from 'node:child_process';
import express from 'express';
import morgan from 'morgan';
import { mkdirSync } from 'node:fs';

const app = express();
app.use(express.json({ limit: '5mb' }));
app.use(morgan('dev'));

// Two working directories keep contexts isolated
const WORK_SUB = process.env.WORK_SUB || './work/sub';
const WORK_ZAI = process.env.WORK_ZAI || './work/zai';
mkdirSync(WORK_SUB, { recursive: true });
mkdirSync(WORK_ZAI, { recursive: true });

// ZAI env overrides for its CLI instance
const ZAI_ENV = {
  ...process.env,
  ANTHROPIC_BASE_URL: 'https://api.z.ai/api/anthropic',
  ANTHROPIC_AUTH_TOKEN: process.env.ZAI_API_KEY || ''
};

function runClaude({ prompt, cwd, env }) {
  return new Promise((resolve, reject) => {
    const args = ['-p', '--output-format', 'json', prompt];
    const child = spawn('claude', args, { cwd, env, stdio: ['ignore', 'pipe', 'pipe'] });
    let out = '', err = '';
    child.stdout.on('data', d => (out += d.toString()));
    child.stderr.on('data', d => (err += d.toString()));
    child.on('close', code => {
      if (code !== 0) return reject(new Error(err || `exit ${code}`));
      resolve(out.trim());
    });
  });
}

app.post('/run', async (req, res) => {
  const { prompt, model } = req.body;
  const isHaiku = (model || '').toLowerCase().includes('haiku');
  try {
    const result = await runClaude({
      prompt,
      cwd: isHaiku ? WORK_ZAI : WORK_SUB,
      env: isHaiku ? ZAI_ENV : process.env
    });
    res.type('application/json').send(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(4000, () => console.log('Dual-CLI broker listening on :4000'));
```

## package.json (broker)

```json
{
  "name": "dual-cli-broker-poc",
  "private": true,
  "type": "module",
  "scripts": {
    "broker": "node poc/dual-cli-router.js"
  },
  "dependencies": {
    "express": "^4.19.2",
    "morgan": "^1.10.0"
  }
}
```

## Example

```bash
export ZAI_API_KEY=your_zai_key
mkdir -p work/sub work/zai
# First, open `work/sub` in a separate terminal and run: claude (login once)
# Then the broker can drive prompts:
node poc/dual-cli-router.js
curl -s localhost:4000/run -H 'content-type: application/json' \
  -d '{"prompt":"echo hello","model":"haiku"}' | jq .
curl -s localhost:4000/run -H 'content-type: application/json' \
  -d '{"prompt":"echo world","model":"sonnet"}' | jq .
```

---