# claude-trace Wrapper (No Auto-Browser)

Copied from `~/Documents/replica/tools/claude-trace-fork/wrapper.sh` (keeps historical behavior where the index is rebuilt after each run and avoids auto-opening the HTML trace). Use it by calling the wrapper with the same arguments you would pass to `claude-trace`:

```bash
scripts/claude-trace/wrapper.sh --run-with --dangerously-skip-permissions -p "task"
```

Use `--update-index` to regenerate the aggregated HTML index without launching a session.

Make sure `node` is available and the forked `claude-trace` CLI (dist/cli.js and generate-index.js) is present in the same directory if you intend to reuse the full fork; this repo only keeps the wrapper for reference.
