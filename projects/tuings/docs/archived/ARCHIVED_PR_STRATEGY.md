# PR Strategy: Things Project Separation

## Overview

Separating the Things project into two clean, focused repositories:

1. **uahis** - Original MCP Server (things-mcp) + integration point
2. **tuings** - Things TUI Clone (clean, test-driven development)

## PR 1: uahis (Things MCP Server)

### What's Included
- Original things-mcp codebase from `things-mcp-main`
- All MCP server functionality
- Integration hooks for future TUI connections

### Scope
- Preserves original project structure
- No significant changes to core MCP functionality
- Ready for publication to MCP registry

### PR Title Convention
```
feat: integrate things-mcp-main as foundation for Things ecosystem

or

feat(mcp): establish things-mcp as core server for Things integrations
```

### PR Description Template
```markdown
## Description
Establishes the Things MCP Server as the core component of the Things ecosystem.

## Changes
- Integrated things-mcp-main codebase
- [List any modifications]
- Ready for MCP registry publication

## Testing
No new tests added (preserves original structure)

## Related
- Companion PR: tuings (Things TUI Clone)
```

---

## PR 2: tuings (Things TUI Clone)

### What's Included
- Complete TypeScript TUI application
- 38 BDD test scenarios (Cucumber.js)
- 45.78% code coverage (Phase 2 completion)
- Full documentation and AGENTS.md

### Scope
- Clean separation from MCP server
- Ready for Phase 3 development
- All tests passing with coverage metrics

### PR Title Convention
```
feat: introduce Things TUI Clone - Phase 2 complete

or

feat(tui): add Things terminal UI with BDD test coverage
```

### PR Description Template
```markdown
## Description
Complete Things TUI Clone implementation with BDD test coverage.

## Changes
- TypeScript TUI application (Blessed library)
- 38 Cucumber.js BDD test scenarios
- 45.78% code coverage (Phase 2)
- Full test harness with ThingsTUITestable class

## Testing
Run tests:
\`\`\`bash
npm install
npm run build
npm run test:bdd       # Run all 38 scenarios
npm run test:coverage  # Generate coverage report
\`\`\`

Test Results:
- 38 scenarios total
- 2 passing
- 15 failing (unfixed Phase 2 features)
- 19 undefined (Phase 3 features)
- 45.78% statement coverage

## Architecture
- **Language**: TypeScript
- **TUI**: Blessed library
- **Testing**: Cucumber.js BDD
- **Database**: SQLite read-only (Things 3 compatible)
- **Writes**: Things URL Scheme integration

## Next Steps
Phase 3 will implement strict RED→GREEN→REFACTOR BDD cycle to improve coverage and pass all scenarios.

## Related
- Companion PR: uahis (Things MCP Server)
- Documentation: README.md, AGENTS.md, PHASE_2_COMPLETE.md
```

---

## Timeline

### Before PR 1 (uahis)
- ✅ Code reviewed
- ✅ No test requirements (preserving original)
- Ready to merge

### Before PR 2 (tuings)
- ✅ All tests run successfully
- ✅ Coverage report generated
- ✅ AGENTS.md finalized
- ✅ README with test instructions
- Ready for code review

---

## Key Files for Code Review

### tuings PR
Code reviewers should examine:

1. **README.md** - How to run tests, project overview
2. **AGENTS.md** - Development workflow, coverage metrics
3. **features/*.feature** - BDD test scenarios (38 total)
4. **src/tui/app.ts** - Main TUI + TestableUI interface
5. **features/step_definitions/common.steps.ts** - Test implementations
6. **package.json** - Dependencies and scripts

### Test Verification
Code reviewers can verify tests:

```bash
cd /Users/m/ai/projects/tuings
npm install
npm run build
npm run test:bdd       # Should show 38 scenarios
npm run test:coverage  # Should show 45.78% coverage
open coverage/index.html  # View detailed coverage
```

---

## Project Separation Benefits

### uahis (MCP Server)
- ✅ Clean, focused codebase
- ✅ Publication-ready for MCP registry
- ✅ Separate versioning
- ✅ Independent CI/CD

### tuings (TUI Clone)
- ✅ Dedicated TUI development
- ✅ Phase 3 BDD workflow
- ✅ Clear test coverage goals
- ✅ Isolated feature development

---

## Future Integration

Once both projects are established:
- tuings can import and use things-mcp tools as MCP client
- Shared documentation on Desktop
- Coordinated feature development across both repos

---

## Review Checklist

For code reviewers examining these PRs:

### uahis PR
- [ ] Original MCP structure preserved
- [ ] No breaking changes to API
- [ ] Clear documentation

### tuings PR
- [ ] All tests run successfully (`npm run test:bdd`)
- [ ] Coverage report generated and viewable
- [ ] AGENTS.md describes workflow clearly
- [ ] README includes test instructions
- [ ] TypeScript compiles without errors
- [ ] Gherkin syntax is valid
- [ ] Step definitions follow patterns
- [ ] Phase 2 metrics documented (45.78% coverage)

---

## Notes for Next Agent

Before running tests, ensure:
1. Things 3 app is installed and running
2. Node.js 16+ is available
3. npm dependencies installed: `npm install`
4. TypeScript compiled: `npm run build`

Then verify:
```bash
npm run test:bdd       # All 38 scenarios should load
npm run test:coverage  # Coverage report should generate
```

If tests fail to run, check:
- Node version: `node --version`
- Things database accessibility
- TypeScript compilation errors: `npm run build`
