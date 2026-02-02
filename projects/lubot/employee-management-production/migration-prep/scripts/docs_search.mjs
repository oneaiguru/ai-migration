#!/usr/bin/env node
import fs from "fs";
import path from "path";
import process from "process";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../reference/docs");

function readFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...readFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      files.push(fullPath);
    }
  }
  return files;
}

function scoreMatch(content, query) {
  const lower = content.toLowerCase();
  const q = query.toLowerCase();
  if (!lower.includes(q)) return 0;
  let score = 0;
  const lines = content.split(/\r?\n/);
  lines.forEach((line, idx) => {
    if (line.toLowerCase().includes(q)) {
      // weight headings higher
      if (line.startsWith("#")) score += 5;
      else if (idx < 10) score += 3;
      else score += 1;
    }
  });
  return score;
}

function searchDocs(query) {
  const files = readFiles(ROOT);
  const hits = [];
  for (const file of files) {
    const raw = fs.readFileSync(file, "utf8");
    const score = scoreMatch(raw, query);
    if (score > 0) {
      hits.push({ file, score });
    }
  }
  return hits.sort((a, b) => b.score - a.score);
}

function formatOutput(results) {
  if (results.length === 0) {
    console.log("Нет совпадений");
    return;
  }
  for (const { file, score } of results.slice(0, 20)) {
    const relative = path.relative(ROOT, file);
    console.log(`${relative} (score: ${score})`);
  }
}

const query = process.argv[2];
if (!query) {
  console.error("Usage: docs_search.mjs <query>");
  process.exit(1);
}

formatOutput(searchDocs(query));
