## Steps

1. `npm i -g @anthropic-ai/claude-code`
2. `cd work/sub`
3. `claude` → complete subscription login (OAuth via terminal).
4. **Do not** set `ANTHROPIC_AUTH_TOKEN` for SUB.
5. Sanity check:

   ```bash
   claude -p "/status" --output-format json
   ```

> Notes: This path preserves **subscription billing** for Sonnet/Opus.

---