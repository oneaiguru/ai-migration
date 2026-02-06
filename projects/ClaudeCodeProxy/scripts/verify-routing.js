#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const defaultDir = process.env.CCP_LOGS_DIR || 'logs';
const file = process.argv[2] || path.join(defaultDir, 'usage.jsonl');
if (!fs.existsSync(file)) {
  console.error(`[verify-routing] missing ${file}`);
  process.exit(1);
}
const lines = fs.readFileSync(file, 'utf8').trim().split(/\n+/);
let decisions = { total:0, to_zai:0 };
const completions = { anthropic:0, zai:0, unknown:0 };
for (const line of lines) {
  let j; try { j = JSON.parse(line); } catch { continue; }
  if (j.event === 'decision') {
    decisions.total++;
    if (j.upstream === 'zai') decisions.to_zai++;
    continue;
  }
  if (typeof j.status === 'number') {
    const lane = j.lane || 'unknown';
    if (!completions[lane]) completions[lane] = 0;
    completions[lane]++;
  }
}
const pct = decisions.total ? ((100*decisions.to_zai/decisions.total).toFixed(1)+'%') : 'n/a';
console.log(`[verify-routing] decisions: ${decisions.to_zai}/${decisions.total} to_zai (${pct})`);
console.log(`[verify-routing] completions by lane: anthropic=${completions.anthropic||0} zai=${completions.zai||0} unknown=${completions.unknown||0}`);
