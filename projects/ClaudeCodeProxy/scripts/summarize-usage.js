#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function quantile(arr, q) {
  if (!arr.length) return null;
  const s = arr.slice().sort((a,b)=>a-b);
  const pos = (s.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  return s[base + 1] !== undefined ? s[base] + rest * (s[base + 1] - s[base]) : s[base];
}

function avg(arr) {
  if (!arr.length) return null;
  const total = arr.reduce((sum, value) => sum + value, 0);
  return +(total / arr.length).toFixed(2);
}

const defaultDir = process.env.CCP_LOGS_DIR || path.join(process.cwd(), 'logs');
const file = process.argv[2] || path.join(defaultDir, 'usage.jsonl');
const lines = fs.existsSync(file) ? fs.readFileSync(file, 'utf8').trim().split(/\n+/) : [];

const state = {
  total: 0,
  errs: 0,
  lats: [],
  byLane: {},
  byErrType: {},
  byLaneErrType: {},
  ops: {},            // ops[lane][op] -> {count, errs, lats}
  headerModes: {},    // headerModes[mode] -> {count, lats}
  byLaneH2: {},       // byLaneH2[lane][h2] -> {count, lats, errs}
  decisions: { total:0, to_zai:0 },
  sse: {}             // sse[lane] -> {count, chunks:[], bytes:total, durations:[]}
};

function bump(map, key, inc=1) {
  map[key] = (map[key]||0) + inc;
}

for (const line of lines) {
  let j; try { j = JSON.parse(line); } catch { continue; }
  if (j.event === 'decision') {
    state.decisions.total++;
    if (j.upstream === 'zai') state.decisions.to_zai++;
    continue;
  }
  if (typeof j.status !== 'number') continue;
  state.total++;

  const lane = j.lane || 'unknown';
  if (!state.byLane[lane]) state.byLane[lane] = {count:0, errs:0, in:0, out:0, lats:[]};
  state.byLane[lane].count++;
  state.byLane[lane].in += j.input_tokens||0;
  state.byLane[lane].out += j.output_tokens||0;
  const isErr = (j.status||200) >= 400;
  if (isErr) {
    state.byLane[lane].errs++;
    state.errs++;
    if (j.err_type) bump(state.byErrType, j.err_type);
    if (!state.byLaneErrType[lane]) state.byLaneErrType[lane] = {};
    if (j.err_type) bump(state.byLaneErrType[lane], j.err_type);
  }

  if (j.latency_ms != null) { state.lats.push(j.latency_ms); state.byLane[lane].lats.push(j.latency_ms); }

  // ops (stream vs nonstream)
  const op = j.op || (j.reason === 'streaming' ? 'stream' : 'nonstream');
  if (!state.ops[lane]) state.ops[lane] = {};
  if (!state.ops[lane][op]) state.ops[lane][op] = {count:0, errs:0, lats:[]};
  state.ops[lane][op].count++;
  if (isErr) state.ops[lane][op].errs++;
  if (j.latency_ms != null) state.ops[lane][op].lats.push(j.latency_ms);

  if (j.sse_chunks && j.sse_chunks > 0) {
    if (!state.sse[lane]) state.sse[lane] = {count:0, chunks:[], bytes:0, durations:[]};
    state.sse[lane].count++;
    state.sse[lane].chunks.push(j.sse_chunks);
    state.sse[lane].bytes += j.sse_bytes || 0;
    if (j.sse_duration_ms != null) state.sse[lane].durations.push(j.sse_duration_ms);
  }

  // header mode (zai only)
  if (lane === 'zai' && j.header_mode) {
    if (!state.headerModes[j.header_mode]) state.headerModes[j.header_mode] = {count:0, lats:[]};
    state.headerModes[j.header_mode].count++;
    if (j.latency_ms != null) state.headerModes[j.header_mode].lats.push(j.latency_ms);
  }

  // h2 flag by lane
  const h2 = (typeof j.h2 === 'boolean') ? j.h2 : null;
  if (h2 != null) {
    if (!state.byLaneH2[lane]) state.byLaneH2[lane] = {};
    const key = h2 ? 'h2' : 'h1';
    if (!state.byLaneH2[lane][key]) state.byLaneH2[lane][key] = {count:0, errs:0, lats:[]};
    state.byLaneH2[lane][key].count++;
    if (isErr) state.byLaneH2[lane][key].errs++;
    if (j.latency_ms != null) state.byLaneH2[lane][key].lats.push(j.latency_ms);
  }
}

const summary = {
  total: state.total,
  errs: state.errs,
  p50: quantile(state.lats,0.5),
  p95: quantile(state.lats,0.95),
  byLane: {},
  byErrType: state.byErrType,
  byLaneErrType: {},
  decisions: {
    total: state.decisions.total,
    to_zai: state.decisions.to_zai,
    pct_to_zai: state.decisions.total ? +(100*state.decisions.to_zai/state.decisions.total).toFixed(1) : null
  },
  ops: {},
  headerModes: {},
  byLaneH2: {},
  sse: {}
};

for (const [k,v] of Object.entries(state.byLane)) {
  summary.byLane[k] = {
    count: v.count,
    errs: v.errs,
    in: v.in,
    out: v.out,
    p50: quantile(v.lats,0.5),
    p95: quantile(v.lats,0.95)
  };
}
for (const [k,v] of Object.entries(state.byLaneErrType)) {
  summary.byLaneErrType[k] = v;
}
for (const [lane,ops] of Object.entries(state.ops)) {
  summary.ops[lane] = {};
  for (const [op,ov] of Object.entries(ops)) {
    summary.ops[lane][op] = { count: ov.count, errs: ov.errs, p50: quantile(ov.lats,0.5), p95: quantile(ov.lats,0.95) };
  }
}
for (const [mode, mv] of Object.entries(state.headerModes)) {
  summary.headerModes[mode] = { count: mv.count, p50: quantile(mv.lats,0.5), p95: quantile(mv.lats,0.95) };
}
for (const [lane, hv] of Object.entries(state.byLaneH2)) {
  summary.byLaneH2[lane] = {};
  for (const [rk, rv] of Object.entries(hv)) {
    summary.byLaneH2[lane][rk] = { count: rv.count, errs: rv.errs, p50: quantile(rv.lats,0.5), p95: quantile(rv.lats,0.95) };
  }
}

for (const [lane, bucket] of Object.entries(state.sse)) {
  summary.sse[lane] = {
    count: bucket.count,
    avg_chunks: avg(bucket.chunks),
    p95_chunks: quantile(bucket.chunks, 0.95),
    avg_duration_ms: avg(bucket.durations),
    p95_duration_ms: quantile(bucket.durations, 0.95),
    total_bytes: bucket.bytes
  };
}

console.log(JSON.stringify(summary,null,2));
