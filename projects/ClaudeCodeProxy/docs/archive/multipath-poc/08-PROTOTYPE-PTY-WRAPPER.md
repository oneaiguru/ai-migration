> **Goal:** One terminal; type `/haiku` or `/sonnet` to flip active lane.

## pty-wrapper.js

```js
// poc/pty-wrapper.js
import pty from 'node-pty';
import readline from 'node:readline';

const ZAI_ENV = {
  ...process.env,
  ANTHROPIC_BASE_URL: 'https://api.z.ai/api/anthropic',
  ANTHROPIC_AUTH_TOKEN: process.env.ZAI_API_KEY || ''
};

function spawnClaude(env, cwd) {
  return pty.spawn('claude', [], {
    name: 'xterm-color',
    cols: process.stdout.columns || 120,
    rows: process.stdout.rows || 30,
    cwd,
    env
  });
}

const sub = spawnClaude(process.env, './work/sub');
const zai = spawnClaude(ZAI_ENV, './work/zai');
let active = sub;

sub.onData(d => { if (active === sub) process.stdout.write(d); });
zai.onData(d => { if (active === zai) process.stdout.write(d); });

readline.emitKeypressEvents(process.stdin);
if (process.stdin.isTTY) process.stdin.setRawMode(true);

console.log('[PTY] Type /haiku or /sonnet to switch lanes. CTRL+C to exit.');

process.stdin.on('data', chunk => {
  const s = chunk.toString();
  if (s.trim() === '/haiku') {
    active = zai;
    console.log('\n[PTY] Switched to Z.AI lane (haiku).\n');
    return;
  }
  if (s.trim() === '/sonnet') {
    active = sub;
    console.log('\n[PTY] Switched to Subscription lane (sonnet/opus).\n');
    return;
  }
  active.write(s);
});
```

## package.json (pty)

```json
{
  "name": "pty-wrapper-poc",
  "private": true,
  "type": "module",
  "scripts": {
    "pty": "node poc/pty-wrapper.js"
  },
  "dependencies": {
    "node-pty": "^1.0.0"
  }
}
```

---