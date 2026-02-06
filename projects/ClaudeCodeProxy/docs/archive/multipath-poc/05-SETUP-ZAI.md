## Steps

1. Obtain Z.AI API key.
2. `cd work/zai`
3. Create `~/.claude/settings.json` (Z.AI instance) with:

   ```json
   {
     "env": {
       "ANTHROPIC_AUTH_TOKEN": "YOUR_ZAI_API_KEY",
       "ANTHROPIC_BASE_URL": "https://api.z.ai/api/anthropic",
       "ANTHROPIC_DEFAULT_HAIKU_MODEL": "glm-4.5-air",
       "ANTHROPIC_DEFAULT_SONNET_MODEL": "glm-4.6",
       "ANTHROPIC_DEFAULT_OPUS_MODEL": "glm-4.6"
     }
   }
   ```
4. Sanity check:

   ```bash
   claude -p "/status" --output-format json
   ```

> You can adjust mappings later; defaults shown align with Z.AI guidance.

---