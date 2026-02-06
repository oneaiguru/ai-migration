> Optional helper to **observe** model usage via trace files (when running `claude -c` or “trace mode”).

## trace-watcher.js

```js
// poc/trace-watcher.js
import chokidar from 'chokidar';
import fs from 'node:fs';
import path from 'node:path';

const TRACE_DIRS = [ './work/sub/.claude-trace', './work/zai/.claude-trace' ];

TRACE_DIRS.forEach(d => fs.mkdirSync(d, { recursive: true }));

function tailJsonl(file) {
  const stream = fs.createReadStream(file, { encoding: 'utf8' });
  let buf = '';
  stream.on('data', chunk => {
    buf += chunk;
    const lines = buf.split('\n');
    buf = lines.pop() || '';
    for (const line of lines) {
      try {
        const obj = JSON.parse(line);
        if (obj?.request?.model) {
          console.log(`[TRACE] ${path.dirname(file)} model=${obj.request.model}`);
        }
      } catch {}
    }
  });
}

for (const dir of TRACE_DIRS) {
  chokidar.watch(dir, { ignoreInitial: false, depth: 1 })
    .on('add', f => {
      if (f.endsWith('.jsonl')) tailJsonl(f);
    });
}
```

## package.json (watcher)

```json
{
  "name": "trace-watcher-poc",
  "private": true,
  "type": "module",
  "scripts": {
    "watch": "node poc/trace-watcher.js"
  },
  "dependencies": {
    "chokidar": "^3.6.0"
  }
}
```

---