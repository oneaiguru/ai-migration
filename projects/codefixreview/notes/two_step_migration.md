# Two-step migration note

We will refine the product by treating each legacy repo as a “client” in a temporary sandbox before moving into the monorepo:

1) Stage in a temporary repo per legacy project (outside the monorepo). Run the full automated loop there (import, Codex review/fix, refactors) until clean.
2) Once stable, produce a single concise PR into the monorepo. This keeps the monorepo lean and avoids importing the intermediate review/refactor history.

Benefits: cleaner monorepo history, clearer product validation on each repo, and a realistic “client” workflow for automation testing.
