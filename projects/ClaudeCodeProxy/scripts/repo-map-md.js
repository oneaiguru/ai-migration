#!/usr/bin/env node
// Render Markdown repo map from REPO_FILES.jsonl and optional REPO_SUMMARIES.jsonl
const fs = require('fs');
const path = require('path');

const filesPath = process.argv[2] || 'results/REPO_FILES.jsonl';
const summariesPath = process.argv[3] || 'results/REPO_SUMMARIES.jsonl';

const now = new Date();
function daysAgo(dt) {
  const d = new Date(dt);
  if (isNaN(d)) return null;
  return Math.floor((now - d) / (1000*60*60*24));
}

function readJsonl(p) {
  if (!fs.existsSync(p)) return [];
  return fs.readFileSync(p, 'utf8').trim().split(/\n+/).map(l=>{try{return JSON.parse(l)}catch{return null}}).filter(Boolean);
}

const files = readJsonl(filesPath);
const summaries = Object.fromEntries(readJsonl(summariesPath).map(r=>[r.path, r.summary]));

// Group by directory and age bucket
function dirOf(p) { return path.dirname(p); }
const groups = {};
for (const f of files) {
  const dir = dirOf(f.path);
  const age = daysAgo(f.date);
  let bucket = 'mid';
  if (age !== null) {
    if (age <= 1) bucket = 'recent'; else if (age > 30) bucket = 'old';
  }
  const key = `${bucket}::${dir}`;
  if (!groups[key]) groups[key] = [];
  groups[key].push(f);
}

function header(title) { return `\n## ${title}\n`; }
function subheader(title) { return `\n### ${title}\n`; }

let out = '# Repository Map\n';
out += `Generated: ${now.toISOString()}\n`;

const order = ['recent','mid','old'];
for (const bucket of order) {
  const titled = {recent:'Recent (≤1 day)', mid:'Mid (2–30 days)', old:'Old (>30 days)'}[bucket];
  out += header(titled);
  const dirs = Object.keys(groups).filter(k=>k.startsWith(bucket+'::')).map(k=>k.split('::')[1]).sort();
  for (const d of dirs) {
    out += subheader(d === '.' ? '(root)' : d);
    out += '\n| File | Last Commit | Author | Size | Summary |\n| --- | --- | --- | ---:| --- |\n';
    const items = groups[`${bucket}::${d}`].sort((a,b)=>a.path.localeCompare(b.path));
    for (const it of items) {
      const size = (it.size!=null)? it.size : '';
      const date = it.date || '';
      const author = it.author || '';
      const sum = (summaries[it.path] || (it.skipped? `skipped:${it.skipped}` : ''))
        .replace(/\n/g,' ').replace(/\s+/g,' ').trim();
      out += `| ${it.path} | ${date} | ${author} | ${size} | ${sum} |\n`;
    }
  }
}

process.stdout.write(out + '\n');

