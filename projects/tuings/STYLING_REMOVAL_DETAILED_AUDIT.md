# Detailed Styling Removal Audit

## Complete Inventory of All Styling Tags

### File: src/tui/app.ts (25 styled locations)

#### Method: renderSidebar() [Lines 270-295]
```
Location | Line | Current Tag | Purpose | Replacement Strategy
---------|------|-------------|---------|---------------------
1        | 271  | {bold}      | "LISTS" header | Remove tag, keep text
2        | 279  | {bold,cyan} | Active list highlight | Remove (prefix char is enough)
3        | 287  | {yellow}    | "n" shortcut | Remove {yellow}, keep "n"
4        | 288  | {yellow}    | "/" shortcut | Remove {yellow}, keep "/"
5        | 289  | {yellow}    | "t" shortcut | Remove {yellow}, keep "t"
6        | 290  | {yellow}    | "r" shortcut | Remove {yellow}, keep "r"
7        | 291  | {yellow}    | "?" shortcut | Remove {yellow}, keep "?"
8        | 292  | {yellow}    | "q" shortcut | Remove {yellow}, keep "q"
```

#### Method: renderMainList() [Lines 297-349]
```
Location | Line | Current Tag | Purpose | Replacement Strategy
---------|------|-------------|---------|---------------------
9        | 300  | {bold,cyan} | List name header | Remove tag, keep text
10       | 306  | {yellow}    | Filter indicator | Remove tag, keep text
11       | 310  | {yellow}    | Search indicator | Remove tag, keep text
12       | 318  | {gray}      | "No tasks" message | Remove tag, keep text
13       | 324  | {bold,inverse} | Selected task highlight | Remove (use prefix char)
14       | 324  | {strikethrough,gray} | Completed task style | Remove (prefix char indicates completion)
15       | 335  | {gray}      | Due date in parentheses | Remove tag, keep text
```

#### Method: renderStatusBar() [Lines 351-375]
```
Location | Line | Current Tag | Purpose | Replacement Strategy
---------|------|-------------|---------|---------------------
16       | 355  | {green}     | Success message | Remove tag - blessed already handles via UI
17       | 361  | {red}       | Error message | Remove tag - blessed already handles via UI
```

#### Method: showTaskDetail() [Lines 377-433]
```
Location | Line | Current Tag | Purpose | Replacement Strategy
---------|------|-------------|---------|---------------------
18       | 394  | {bold,cyan} | Task title | Remove tag, keep text
19       | 399  | {bold}      | "Status:" label | Remove tag, keep text
20       | 399  | {yellow}    | Status value | Remove tag, keep text
21       | 403  | {bold}      | "List:" label | Remove tag, keep text
22       | 403  | {cyan}      | List name value | Remove tag, keep text
23       | 407  | {bold}      | "Due:" label | Remove tag, keep text
24       | 412  | {bold}      | "Tags:" label | Remove tag, keep text
25       | 414  | {cyan}      | Tag name | Remove tag, keep text
26       | 420  | {bold}      | "Notes:" label | Remove tag, keep text
27       | 421  | {gray}      | Notes content | Remove tag, keep text
28       | 424  | {yellow}    | "Press any key" message | Remove tag, keep text
```

#### Method: openSearch() [Lines 435-484]
```
Location | Line | Current Tag | Purpose | Replacement Strategy
---------|------|-------------|---------|---------------------
29       | 449  | {yellow}    | "Search" header | Remove tag, keep text
```

#### Method: showTagFilter() [Lines 486-588]
```
Location | Line | Current Tag | Purpose | Replacement Strategy
---------|------|-------------|---------|---------------------
30       | 495  | {yellow}    | "No tags available" msg | Remove tag, keep text
31       | 495  | {gray}      | "Press any key" instruction | Remove tag, keep text
32       | 526  | {bold,cyan} | "Select Tags" header | Remove tag, keep text
33       | 534  | {bold,inverse} | Selected tag highlight | Remove (use prefix char)
34       | 534  | {cyan}      | Filtered tag highlight | Remove tag, keep text
35       | 540  | {gray}      | Navigation instructions | Remove tag, keep text
```

#### Method: showHelp() [Lines 590-646]
```
Location | Line | Current Tag | Purpose | Replacement Strategy
---------|------|-------------|---------|---------------------
36       | 607  | {bold,cyan} | Help header | Remove tag, keep text
37       | 609  | {yellow}    | Section header "Navigation" | Remove tag, keep text
38       | 614  | {yellow}    | Section header "Lists" | Remove tag, keep text
39       | 620  | {yellow}    | Section header "Search & Filter" | Remove tag, keep text
40       | 626  | {yellow}    | Section header "General" | Remove tag, keep text
41       | 630  | {bold,cyan} | "Features" header | Remove tag, keep text
42       | 637  | {yellow}    | "Press any key to close" | Remove tag, keep text
```

---

### File: src/tui/components.ts (13 styled locations)

#### Function: createSearchDialog() [Lines 51-123]
```
Location | Line | Current Tag | Purpose | Replacement Strategy
---------|------|-------------|---------|---------------------
43       | 93   | {gray}      | Placeholder text "Type to search..." | Remove tag, keep text
44       | 105  | {yellow}    | "Searching for:" status | Remove tag, keep text
45       | 105  | {gray}      | "(results will update)" instruction | Remove tag, keep text
46       | 108  | {gray}      | Placeholder text "Type to search..." | Remove tag, keep text
```

#### Function: createTaskDetailDialog() [Lines 128-191]
```
Location | Line | Current Tag | Purpose | Replacement Strategy
---------|------|-------------|---------|---------------------
47       | 152  | {bold,cyan} | Task title | Remove tag, keep text
48       | 157  | {yellow}    | "Due:" label | Remove tag, keep text
49       | 162  | {bold}      | "Notes:" label | Remove tag, keep text
50       | 162  | {gray}      | Notes content | Remove tag, keep text
51       | 167  | {bold}      | "Tags:" label | Remove tag, keep text
52       | 169  | {cyan}      | Tag name with # prefix | Remove tag, keep text
53       | 175  | {bold}      | "Status:" label | Remove tag, keep text
54       | 179  | {bold}      | "List:" label | Remove tag, keep text
55       | 181  | {yellow}    | "Press any key to close" | Remove tag, keep text
```

#### Function: createTagFilterBar() [Lines 196-233]
```
Location | Line | Current Tag | Purpose | Replacement Strategy
---------|------|-------------|---------|---------------------
56       | 215  | {gray}      | "none" when no tags | Remove tag, keep text
57       | 221  | {inverse,cyan} | Selected tag highlight | Remove tag, keep text
58       | 223  | {cyan}      | Tag name | Remove tag, keep text
59       | 227  | {gray}      | "+N more tags" overflow | Remove tag, keep text
```

---

## stripMarkup() Usage Summary

### Locations:
1. `src/tui/app.ts:6-8` - Definition
2. `src/tui/components.ts:7-9` - Definition (duplicate)
3. `src/tui/app.ts:258` - Used in render(): `this.sidebar.setContent(stripMarkup(this.lastSidebarContent));`
4. `src/tui/app.ts:262` - Used in render(): `this.mainList.setContent(stripMarkup(this.lastMainListContent));`
5. `src/tui/app.ts:265` - Used in render(): `this.statusBar.setContent(stripMarkup(this.renderStatusBar()));`
6. `src/tui/components.ts:105` - Used in createSearchDialog(): `results.setContent(stripMarkup(...))`
7. `src/tui/components.ts:108` - Used in createSearchDialog(): `results.setContent(stripMarkup(...))`
8. `src/tui/components.ts:183` - Used in createTaskDetailDialog(): `dialog.setContent(stripMarkup(content));`
9. `src/tui/components.ts:231` - Used in createTagFilterBar(): `bar.setContent(stripMarkup(content));`

**Total: 2 definitions + 7 calls = 9 locations**

---

## Blessed Style Objects (Do NOT remove)

These are separate from markup tags and provide visual styling:

### In setupUI():
```typescript
// Sidebar
style: {
  border: { fg: 'blue' },
  focus: { border: { fg: 'white' } }
}

// Main list
style: {
  border: { fg: 'cyan' },
  focus: { border: { fg: 'white' } }
}

// Status bar
style: {
  bg: 'blue',
  fg: 'white'
}
```

These should be KEPT as they handle terminal styling directly via blessed.

---

## Summary Statistics

| Category | Count | Notes |
|----------|-------|-------|
| **Styled locations in app.ts** | 42 tags across 10 methods | 25 distinct locations with {tags} |
| **Styled locations in components.ts** | 9 tags across 3 functions | 13 distinct locations with {tags} |
| **Total styled content locations** | ~55 | ~20 unique tag types |
| **stripMarkup() definitions** | 2 | Identical in both files (duplicate) |
| **stripMarkup() calls** | 7 | All in render/setContent methods |
| **Blessed style objects** | 5 | KEEP THESE - not markup |

---

## Removal Strategy by Method

### PHASE 1: Components (simplest)
1. createSearchDialog() - 4 locations, low risk
2. createTaskDetailDialog() - 9 locations, low risk  
3. createTagFilterBar() - 4 locations, low risk

### PHASE 2: App Rendering (medium)
4. renderStatusBar() - 2 locations, easy
5. renderMainList() - 6 locations, need to preserve visual distinction
6. renderSidebar() - 8 locations, need to preserve visual distinction

### PHASE 3: App Dialogs (medium)
7. showTaskDetail() - 11 locations, mostly labels
8. openSearch() - 1 location, trivial
9. showTagFilter() - 7 locations, complex (selection state)
10. showHelp() - 7 locations, all in string literal

### PHASE 4: Cleanup
11. Delete stripMarkup() definitions (2 locations)
12. Remove stripMarkup() calls (7 locations)
13. Update test assertions if needed

---

## Key Concerns for Usability

### Selection Highlight (Critical)
**Current:** `{bold,inverse}` tag on selected item
**Problem:** Removing this removes visual feedback
**Solution:** Use Unicode marker instead:
- `▶` for selected item (instead of `{bold,inverse}text{/}`)
- Space before unselected items to align

### Task Completion Indicator (Critical)
**Current:** `{strikethrough,gray}` for completed tasks
**Problem:** Removing removes visual feedback
**Solution:** Use Unicode indicator:
- `✓` suffix for completed tasks
- Continue to show strikethrough text without markup

### Keyboard Shortcuts in Sidebar (Medium)
**Current:** `{yellow}n{/} New` etc.
**Problem:** Yellow color is visual distinction for shortcuts
**Solution:** Keep the shortcut letter visible, add spacing:
- `n New` (text is visible enough in monospace)
- Consider adding brackets: `[n] New`

### Status Messages (Low Risk)
**Current:** `{green}success{/}` and `{red}error{/}`
**Problem:** Color feedback for success/error
**Solution:** Add text prefix:
- `SUCCESS: Task created` (instead of green color)
- `ERROR: Title cannot be empty` (instead of red color)

---

## Order of Removal

**Recommended order (safest to riskiest):**

1. ✓ **openSearch()** - 1 tag, trivial
2. ✓ **createSearchDialog()** - 4 tags, isolated function
3. ✓ **renderStatusBar()** - 2 tags, simple
4. ✓ **createTaskDetailDialog()** - 9 tags, no state
5. ✓ **createTagFilterBar()** - 4 tags, no state
6. ✓ **showHelp()** - 7 tags, all in string
7. ⚠ **renderMainList()** - 6 tags, affects selection visuals
8. ⚠ **renderSidebar()** - 8 tags, affects shortcuts
9. ⚠ **showTaskDetail()** - 11 tags, detail view
10. ⚠ **showTagFilter()** - 7 tags, complex navigation
11. ✓ **stripMarkup() calls** - 7 removals
12. ✓ **stripMarkup() definitions** - 2 deletions

---

## Testing Strategy

### Before Each Phase:
```bash
npm run test:coverage
```

### After Components Phase:
```bash
npm run test:bdd
npm run test:coverage
# Should pass all 38 scenarios
```

### After App Rendering Phase:
```bash
npm run test:bdd
npm start
# Manual check: Can I navigate? See selection? See completion state?
```

### After All Cleanup:
```bash
npm run test:bdd
npm run test:coverage
npm start
# Full manual walkthrough of all UI interactions
```
