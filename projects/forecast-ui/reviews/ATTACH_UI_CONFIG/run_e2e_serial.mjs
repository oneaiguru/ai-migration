#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';

const baseUrl = process.env.E2E_BASE_URL || 'https://mytko-forecast-ui.vercel.app';
const specs = fs.readdirSync('tests/e2e').filter(f => f.endsWith('.spec.ts'));

const results = [];
let total = 0;
for (const spec of specs) {
  const started = Date.now();
  const env = {
    ...process.env,
    E2E_BASE_URL: baseUrl,
    PW_TIMEOUT_MS: process.env.PW_TIMEOUT_MS || '30000',
    PW_EXPECT_TIMEOUT_MS: process.env.PW_EXPECT_TIMEOUT_MS || '10000',
  };
  const r = spawnSync('npx', ['playwright', 'test', `tests/e2e/${spec}`, '--workers=1'], { stdio: 'inherit', env });
  const dur = (Date.now() - started) / 1000;
  total += dur;
  results.push({ spec, seconds: dur, code: r.status ?? 0 });
  // Do not break on failure; continue and record timings per spec
}

const outDir = 'tests/e2e';
fs.mkdirSync(outDir, { recursive: true });
const stamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
let md = `${stamp}\nTotal time: ${total.toFixed(1)}s\n`;
for (const r of results) md += `${r.spec}\n${r.seconds.toFixed(1)}s\n`;
fs.writeFileSync(`${outDir}/TIMINGS.md`, md, 'utf8');
console.log('\nWrote timings to', `${outDir}/TIMINGS.md`);
process.exit(results.some(r => r.code !== 0) ? 1 : 0);
