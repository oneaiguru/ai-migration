import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.join(process.cwd(), 'src');
const MAX_LINES = 400;
const allowHeader = /@allow-large-file:/;

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.isFile() && p.endsWith('.tsx')) checkFile(p);
  }
}

const violations = [];
function checkFile(file) {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split(/\r?\n/).length;
  if (lines > MAX_LINES && !allowHeader.test(content.split(/\r?\n/, 3).join('\n'))) {
    violations.push({ file, lines });
  }
}

walk(ROOT);
if (violations.length) {
  console.error('Files exceeding', MAX_LINES, 'lines without @allow-large-file header:');
  for (const v of violations) console.error('-', v.file, `(${v.lines} lines)`);
  process.exit(1);
}
console.log('File size check passed.');

