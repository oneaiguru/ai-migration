#!/usr/bin/env node
import { execSync } from 'node:child_process';
import fs from 'node:fs';

const REG_PATH = 'reviews/REVIEWED_FILES.yml';
if (!fs.existsSync(REG_PATH)) {
  console.log('No review registry found; skipping');
  process.exit(0);
}

const txt = fs.readFileSync(REG_PATH, 'utf8');
// very small YAML subset parser for our structure
const entries = [];
let cur = null;
for (const raw of txt.split(/\r?\n/)) {
  const line = raw.trim();
  if (line.startsWith('- path:')) {
    if (cur) entries.push(cur);
    cur = { path: line.replace('- path:', '').trim(), status: 'approved', hash: '' };
  } else if (cur && line.startsWith('status:')) {
    cur.status = line.replace('status:', '').trim();
  } else if (cur && line.startsWith('hash:')) {
    cur.hash = line.replace('hash:', '').trim();
  }
}
if (cur) entries.push(cur);

let failures = 0;
for (const e of entries) {
  if (e.status !== 'approved') continue;
  if (!e.path || !e.hash) continue;
  if (!fs.existsSync(e.path)) continue;
  const blob = execSync(`git hash-object ${e.path}`).toString().trim();
  if (!blob.startsWith(e.hash)) {
    console.error(`REVIEW REGISTRY: ${e.path} hash changed (${blob.slice(0,7)} vs ${e.hash}). Mark needs-re-review or update hash.`);
    failures++;
  }
}

if (failures > 0) {
  process.exit(1);
}
console.log('Review registry check: OK');

