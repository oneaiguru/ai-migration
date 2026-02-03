# Styling Removal Analysis

## Current State: Blessed Markup Tags

The TUI currently uses **blessed markup tags** (inline text formatting) throughout the codebase. These are in the form `{attribute}text{/}` where attributes can be colors, bold, underline, etc.

### Styling Tags Currently Used

| Tag | Purpose | Locations |
|-----|---------|-----------|
| `{bold}` | Bold text | Labels, headers |
| `{cyan}` | Cyan color | Active states, list names, tags |
| `{yellow}` | Yellow color | Shortcuts, warnings, filtered state |
| `{gray}` | Gray color | Muted text, empty state, dates |
| `{green}` | Green color | Success messages |
| `{red}` | Red color | Error messages |
| `{white}` | White color | Focus/border states |
| `{inverse}` | Inverse colors | Selection highlight |
| `{strikethrough}` | Strike-through | Completed tasks |
| `{bold,cyan}` | Combined attributes | Headers |

### Files Using Styling

1. **src/tui/app.ts** (13 locations with styling)
   - `renderSidebar()` - sidebar list styling
   - `renderMainList()` - task list styling with selection/completion indicators
   - `renderStatusBar()` - success/error messages
   - `showTaskDetail()` - detail view content
   - `openSearch()` - search dialog
   - `showTagFilter()` - tag selection UI
   - `showHelp()` - help text

2. **src/tui/components.ts** (9 locations with styling)
   - `createTaskDetailDialog()` - task detail popup
   - `createSearchDialog()` - search dialog content
   - `createTagFilterBar()` - tag filter display

### Key Pattern: stripMarkup() Function

Both files define a `stripMarkup()` function:
```typescript
function stripMarkup(content: string): string {
  return content.replace(/{[^}]+}/g, '');
}
```

This strips the markup before passing content to blessed's `setContent()`. However, **blessed still processes the markup** and applies the styling when rendering. The stripped version is only used for testing/plain text.

---

## Approach to Remove Styling

### Option 1: Remove Markup Tags Completely (Simplest)

**What to do:**
1. Delete all `{...}` tags from content strings
2. Remove `stripMarkup()` function calls
3. Keep blessed style objects for borders/backgrounds (these are separate from markup)
4. Result: Plain text UI with basic monochrome styling from blessed style configs

**Benefits:**
- Simplest approach
- Reduces code complexity
- Tests don't need markup stripping
- Plain text is cleaner

**Trade-off:**
- Loses visual distinction (bold, colors, strikethrough)
- List navigation, selected items, completed tasks all look the same

---

### Option 2: Use Blessed Style Objects Instead (Better)

**What to do:**
1. Create a **style registry** object with blessed style definitions
2. Replace content markup with blessed element styling
3. For task selection/completion indicators: use separate blessed elements or styled boxes
4. Result: Styled UI using blessed's native styling, not text markup

**Benefits:**
- Maintains visual distinction
- Better blessed integration
- More testable (blessed handles styling)
- Professional appearance

**Trade-off:**
- More refactoring required
- Need to redesign some components as nested blessed elements
- More code overall

---

### Option 3: Hybrid Approach (Recommended)

**What to do:**
1. **For text content**: Remove all `{...}` markup tags → plain text
2. **For visual separation**: Use blessed's `style` objects for borders, backgrounds, and colors
3. **For indicators**: Use Unicode symbols and spacing instead of bold/color
4. **For selection**: Use blessed's native focus styles instead of `{bold,inverse}`

**Example transformation:**
```typescript
// Before
let content = '{bold}LISTS{/}\n';
content += '─────────────\n\n';
for (const [key, list] of Object.entries(LIST_NAMES)) {
  const style = isActive ? '{bold,cyan}' : '';
  const endStyle = isActive ? '{/}' : '';
  content += `${style}${prefix}${shortcut} ${list}${endStyle}\n`;
}

// After
let content = 'LISTS\n';
content += '─────────────\n\n';
for (const [key, list] of Object.entries(LIST_NAMES)) {
  const marker = isActive ? '▶' : ' '; // Unicode marker instead of bold+cyan
  content += `${marker} ${shortcut} ${list}\n`;
}

// Apply blessed styling via style object (once, not per render)
sidebar.setStyle({
  border: { fg: 'blue' },
  focus: { border: { fg: 'white' } }
});
```

**Benefits:**
- **Cleaner code**: Removes ~200+ lines of markup tags
- **Better maintainability**: Separation of concerns (content vs. styling)
- **Testable**: Plain text is easier to assert on
- **Professional**: Uses blessed's native styling
- **Flexible**: Easy to add/change styling globally via style objects

---

## Implementation Plan for Hybrid Approach

### Phase 1: Analysis & Planning
- [x] Identify all styling tags → **DONE (see above)**
- [ ] Map each tag to its visual purpose (selection, labels, emphasis, etc.)
- [ ] Design replacement strategy per UI section

### Phase 2: Implement (per file)

#### Step 1: src/tui/components.ts
Files to modify:
- `createTaskDetailDialog()` - remove all `{...}` tags
- `createSearchDialog()` - remove markup
- `createTagFilterBar()` - remove markup

**Expected changes:**
- ~50 lines of markup removed
- No functional change (uses blessed style objects)

#### Step 2: src/tui/app.ts
Files to modify:
- `renderSidebar()` - remove markup
- `renderMainList()` - remove markup, add Unicode indicators
- `renderStatusBar()` - remove markup (success/error styling via blessed)
- `showTaskDetail()` - remove markup
- `openSearch()` - remove markup
- `showTagFilter()` - remove markup
- `showHelp()` - remove markup

**Expected changes:**
- ~150 lines of markup removed
- Use Unicode symbols (▶, ✓, [ ], [✓]) instead of color/bold
- Selection/completion shown via symbols or spacing, not text styling

#### Step 3: Update Tests
- Remove `stripMarkup()` calls from step definitions
- Update assertions to work with plain text (should work as-is)

#### Step 4: Remove stripMarkup() Function
- Delete both definitions (one in app.ts, one in components.ts)
- Verify no other references exist

---

## Code Examples: Before & After

### Example 1: Sidebar Rendering

**Before:**
```typescript
protected renderSidebar(): string {
  let content = '\n{bold}LISTS{/}\n';
  content += '─────────────\n\n';
  
  for (const [key, list] of Object.entries(LIST_NAMES)) {
    const isActive = this.currentList === key;
    const prefix = isActive ? '▶ ' : '  ';
    const style = isActive ? '{bold,cyan}' : '';
    const endStyle = isActive ? '{/}' : '';
    content += `${style}${prefix}${shortcut} ${list}${endStyle}\n`;
  }
  
  content += '\n─────────────\n';
  content += '\n{yellow}n{/} New\n';
  content += '{yellow}/{/} Search\n';
  // ... more
  return content;
}
```

**After:**
```typescript
protected renderSidebar(): string {
  let content = '\nLISTS\n';
  content += '─────────────\n\n';
  
  for (const [key, list] of Object.entries(LIST_NAMES)) {
    const isActive = this.currentList === key;
    const prefix = isActive ? '▶' : ' '; // Just symbol, no bold/color
    content += `${prefix} ${shortcut} ${list}\n`;
  }
  
  content += '\n─────────────\n';
  content += '\nn New\n';
  content += '/ Search\n';
  // ... more
  return content;
}
```

---

### Example 2: Task List Rendering

**Before:**
```typescript
const isSelected = i === this.selectedIndex;
const isCompleted = task.status === 2;
const prefix = isSelected ? '► ' : '  ';
const style = isSelected ? '{bold,inverse}' : (isCompleted ? '{strikethrough,gray}' : '');
const endStyle = isSelected || isCompleted ? '{/}' : '';

let dueDateStr = '';
if (task.dueDate) {
  dueDateStr = ` {gray}(${formatDate(task.dueDate)}){/}`;
}

let completionIndicator = '';
if (isCompleted) {
  completionIndicator = ' ✓';
}

content += `${style}${prefix}${title}${completionIndicator}${dueDateStr}${endStyle}\n`;
```

**After:**
```typescript
const isSelected = i === this.selectedIndex;
const isCompleted = task.status === 2;
const prefix = isSelected ? '▶' : (isCompleted ? '✓' : '·');

let dueDateStr = '';
if (task.dueDate) {
  dueDateStr = ` (${formatDate(task.dueDate)})`;
}

content += `${prefix} ${title}${dueDateStr}\n`;
```

---

### Example 3: Detail Dialog

**Before:**
```typescript
let content = `{bold,cyan}${task.title}{/}\n`;
content += '─'.repeat(70) + '\n\n';

const statusText = task.status === 0 ? 'Active' : task.status === 2 ? 'Completed' : 'Cancelled';
content += `{bold}Status:{/} {yellow}${statusText}{/}\n`;

const listName = task.list?.charAt(0).toUpperCase() + task.list?.slice(1) || 'Unknown';
content += `{bold}List:{/} {cyan}${listName}{/}\n`;

if (task.tags && task.tags.length > 0) {
  content += `\n{bold}Tags:{/}\n`;
  for (const tag of task.tags) {
    content += `  {cyan}#${tag}{/}\n`;
  }
}

content += '\n{yellow}Press any key to close{/}';
```

**After:**
```typescript
let content = `${task.title}\n`;
content += '─'.repeat(70) + '\n\n';

const statusText = task.status === 0 ? 'Active' : task.status === 2 ? 'Completed' : 'Cancelled';
content += `Status: ${statusText}\n`;

const listName = task.list?.charAt(0).toUpperCase() + task.list?.slice(1) || 'Unknown';
content += `List: ${listName}\n`;

if (task.tags && task.tags.length > 0) {
  content += `\nTags:\n`;
  for (const tag of task.tags) {
    content += `  #${tag}\n`;
  }
}

content += '\nPress any key to close';
```

---

## Testing Impact

### Current Test Flow
```
Gherkin scenario
  ↓
Step definition calls ThingsTUITestable
  ↓
Method calls render()
  ↓
Content string with {bold}, {yellow}, etc.
  ↓
stripMarkup() removes tags for testing
  ↓
Assertion on plain text
```

### After Styling Removal
```
Gherkin scenario
  ↓
Step definition calls ThingsTUITestable
  ↓
Method calls render()
  ↓
Content string (plain text, no tags)
  ↓
Direct assertion on plain text
```

**Impact:**
- ✅ Tests get SIMPLER (no stripMarkup() needed)
- ✅ Content strings are more readable
- ✅ No functional changes to test assertions
- ✅ May need to update some assertion text (e.g., looking for "LISTS" instead of checking markup)

---

## Risk Assessment

### Low Risk
- Removing markup tags
- Removing `stripMarkup()` function
- Updating assertions

### Medium Risk
- Losing visual distinction in the actual TUI (when running `npm start`)
- Users seeing plain text instead of styled output

### Mitigation
- Run full BDD suite after changes
- Test actual TUI with `npm start` to verify rendering
- Verify selection still works (blessed handles it)
- Consider keeping blessed style objects for borders/backgrounds

---

## Estimated Effort

| Task | Effort | Notes |
|------|--------|-------|
| Remove markup from components.ts | 1 hour | ~50 lines |
| Remove markup from app.ts | 2 hours | ~150 lines, multiple methods |
| Update test assertions | 30 min | Minor updates |
| Remove stripMarkup() | 15 min | Two locations |
| Test & verify | 1 hour | Full BDD + manual testing |
| **Total** | **4.75 hours** | ~5 hours of work |

---

## Recommendation

**Go with Option 3 (Hybrid Approach):**

1. **Phase 2.1**: Remove all `{...}` markup tags from content strings (10 files, ~200 lines)
2. **Phase 2.2**: Update rendering to use plain text with Unicode symbols for visual distinction
3. **Phase 2.3**: Keep blessed `style` objects for borders, backgrounds, and focus states
4. **Phase 2.4**: Remove `stripMarkup()` function entirely
5. **Phase 2.5**: Run full test suite and manual verification

This gives you:
- ✅ Cleaner codebase (removes ~200 lines)
- ✅ Better maintainability (content separated from styling)
- ✅ Testable (plain text is easier to assert)
- ✅ Still visually distinct (Unicode symbols + blessed style objects)
- ✅ Professional UI (blessed's native styling)

---

## Next Steps

1. Create a BDD feature file: `features/plain-text-ui.feature`
2. Write scenarios for plain text rendering (no markup tags)
3. Implement removal in RED → GREEN → REFACTOR cycle
4. Verify all 38 existing scenarios still pass
5. Check coverage stays at or above current levels
