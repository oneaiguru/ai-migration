# Visual Reference: Before & After Removal

This document shows exact code changes needed for each method, so we can work methodically.

---

## PHASE 1: Simple Removals (No Logic Changes)

### Task: openSearch() - Line 449

**BEFORE:**
```typescript
searchBox.setContent('{yellow}Search{/}\n\nType query below:\n');
```

**AFTER:**
```typescript
searchBox.setContent('Search\n\nType query below:\n');
```

---

### Task: createSearchDialog() - Lines 93, 105, 108

#### Change 1: Line 93
**BEFORE:**
```typescript
content: '{gray}Type to search...{/}',
```

**AFTER:**
```typescript
content: 'Type to search...',
```

#### Change 2: Line 105
**BEFORE:**
```typescript
results.setContent(stripMarkup(`{yellow}Searching for: "${query}"{/}\n{gray}(results will update){/}`));
```

**AFTER:**
```typescript
results.setContent(`Searching for: "${query}"\n(results will update)`);
```

#### Change 3: Line 108
**BEFORE:**
```typescript
results.setContent(stripMarkup('{gray}Type to search...{/}'));
```

**AFTER:**
```typescript
results.setContent('Type to search...');
```

---

### Task: renderStatusBar() - Lines 355, 361

#### Change 1: Line 355 (success message)
**BEFORE:**
```typescript
return ` {green}Task created successfully{/}`;
```

**AFTER:**
```typescript
return ` SUCCESS: Task created`;
```

#### Change 2: Line 361 (error message)
**BEFORE:**
```typescript
return ` {red}${error}{/}`;
```

**AFTER:**
```typescript
return ` ERROR: ${error}`;
```

---

## PHASE 2: Component Functions (No Logic Changes)

### Task: createTaskDetailDialog() - 9 Removals

**Location breakdown:**
- Line 152: `{bold,cyan}` around task.title
- Line 157: `{yellow}` around "Due:" label
- Line 162: `{bold}` + `{gray}` around "Notes:"
- Line 167: `{bold}` around "Tags:"
- Line 169: `{cyan}` around tag name
- Line 175: `{bold}` around "Status:"
- Line 179: `{bold}` around "List:"
- Line 181: `{yellow}` around "Press any key"
- Line 183: stripMarkup() call

**BEFORE (Lines 149-183):**
```typescript
let content = '';

// Title
content += `{bold,cyan}${task.title}{/}\n`;
content += '─'.repeat(60) + '\n\n';

// Due date
if (task.dueDate) {
  content += `{yellow}Due:{/} ${formatDate(task.dueDate)}\n`;
}

// Notes
if (task.notes) {
  content += `\n{bold}Notes:{/}\n{gray}${task.notes}{/}\n`;
}

// Tags
if (task.tags && task.tags.length > 0) {
  content += `\n{bold}Tags:{/}\n`;
  for (const tag of task.tags) {
    content += `  {cyan}#${tag}{/}\n`;
  }
}

// Status
const statusText = task.status === 0 ? 'Active' : task.status === 1 ? 'Completed' : 'Cancelled';
content += `\n{bold}Status:{/} ${statusText}\n`;

// List
const listName = task.list?.charAt(0).toUpperCase() + task.list?.slice(1) || 'Unknown';
content += `{bold}List:{/} ${listName}\n`;

content += '\n{yellow}Press any key to close{/}';

dialog.setContent(stripMarkup(content));
```

**AFTER (Lines 149-183):**
```typescript
let content = '';

// Title
content += `${task.title}\n`;
content += '─'.repeat(60) + '\n\n';

// Due date
if (task.dueDate) {
  content += `Due: ${formatDate(task.dueDate)}\n`;
}

// Notes
if (task.notes) {
  content += `\nNotes:\n${task.notes}\n`;
}

// Tags
if (task.tags && task.tags.length > 0) {
  content += `\nTags:\n`;
  for (const tag of task.tags) {
    content += `  #${tag}\n`;
  }
}

// Status
const statusText = task.status === 0 ? 'Active' : task.status === 1 ? 'Completed' : 'Cancelled';
content += `\nStatus: ${statusText}\n`;

// List
const listName = task.list?.charAt(0).toUpperCase() + task.list?.slice(1) || 'Unknown';
content += `List: ${listName}\n`;

content += '\nPress any key to close';

dialog.setContent(content);
```

---

### Task: createTagFilterBar() - 4 Removals

**Location breakdown:**
- Line 215: `{gray}` around "none"
- Line 221: `{inverse,cyan}` around selected tag
- Line 223: `{cyan}` around tag name
- Line 227: `{gray}` around "+N more"
- Line 231: stripMarkup() call

**BEFORE (Lines 213-231):**
```typescript
let content = ' Tags: ';
if (tags.length === 0) {
  content += '{gray}none{/}';
} else {
  const displayTags = tags.slice(0, 8);
  for (const tag of displayTags) {
    const isSelected = selectedTags.has(tag.id);
    if (isSelected) {
      content += `{inverse,cyan}${tag.title}{/} `;
    } else {
      content += `{cyan}${tag.title}{/} `;
    }
  }
  if (tags.length > 8) {
    content += `{gray}+${tags.length - 8}{/}`;
  }
}

bar.setContent(stripMarkup(content));
return bar;
```

**AFTER (Lines 213-231):**
```typescript
let content = ' Tags: ';
if (tags.length === 0) {
  content += 'none';
} else {
  const displayTags = tags.slice(0, 8);
  for (const tag of displayTags) {
    const isSelected = selectedTags.has(tag.id);
    if (isSelected) {
      content += `[${tag.title}] `;
    } else {
      content += `${tag.title} `;
    }
  }
  if (tags.length > 8) {
    content += `+${tags.length - 8}`;
  }
}

bar.setContent(content);
return bar;
```

---

### Task: showHelp() - 7 Removals (in one string)

**Location: Lines 607-637**

**BEFORE:**
```typescript
const content = `{bold,cyan}KEYBOARD SHORTCUTS - THINGS TUI{/}

{yellow}Navigation{/}
  ↑/k          Move up
  ↓/j          Move down
  Enter        View task details

{yellow}Lists{/}
  1            Show Today
  2            Show Upcoming
  3            Show Anytime
  4            Show Someday

{yellow}Search & Filter{/}
  /            Open search dialog
  t            Tag filter
  c            Clear filters
  r            Refresh tasks

{yellow}General{/}
  ?            Show this help
  q            Quit

{bold,cyan}Features{/}
• View tasks organized by list (Today, Upcoming, Anytime, Someday)
• Search tasks by title or notes with /
• Filter tasks by tags with t
• View detailed task information with Enter
• Keyboard-driven workflow

{yellow}Press any key to close{/}`;
```

**AFTER:**
```typescript
const content = `KEYBOARD SHORTCUTS - THINGS TUI

Navigation
  ↑/k          Move up
  ↓/j          Move down
  Enter        View task details

Lists
  1            Show Today
  2            Show Upcoming
  3            Show Anytime
  4            Show Someday

Search & Filter
  /            Open search dialog
  t            Tag filter
  c            Clear filters
  r            Refresh tasks

General
  ?            Show this help
  q            Quit

Features
• View tasks organized by list (Today, Upcoming, Anytime, Someday)
• Search tasks by title or notes with /
• Filter tasks by tags with t
• View detailed task information with Enter
• Keyboard-driven workflow

Press any key to close`;
```

---

## PHASE 3: Complex Rendering Methods

### Task: renderMainList() - 6 Removals + Selection Logic

**Critical:** This method needs special handling to preserve selection visibility.

**Location breakdown:**
- Line 300: `{bold,cyan}` around list name - just remove
- Line 306: `{yellow}` around "Filtered:" indicator - just remove
- Line 310: `{yellow}` around "Search:" indicator - just remove
- Line 318: `{gray}` around "No tasks" - just remove
- Line 324: `{bold,inverse}` for selected items - REPLACE with prefix char
- Line 324: `{strikethrough,gray}` for completed items - REPLACE with prefix char
- Line 335: `{gray}` around due date - just remove

**BEFORE (Lines 297-349):**
```typescript
protected renderMainList(): string {
  let content = '';
  const listName = LIST_NAMES[this.currentList];
  content += `{bold,cyan} ${listName} {/}`;

  if (this.selectedTags.size > 0) {
    const tagNames = Array.from(this.selectedTags)
      .map(id => this.tags.find(t => t.id === id)?.title || id)
      .join(', ');
    content += ` {yellow}[Filtered: ${tagNames}]{/}`;
  }

  if (this.searchQuery) {
    content += ` {yellow}[Search: "${this.searchQuery}"]{/}`;
  }

  content += '\n';
  const mainListWidth = typeof this.mainList.width === 'number' ? Math.max(0, this.mainList.width) : 80;
  content += '─'.repeat(Math.max(1, Math.min(80, mainListWidth))) + '\n\n';

  if (this.tasks.length === 0) {
    content += '{gray}No tasks{/}\n';
  } else {
    this.tasks.forEach((task, i) => {
      const isSelected = i === this.selectedIndex;
      const isCompleted = task.status === 2;
      const prefix = isSelected ? '► ' : '  ';
      const style = isSelected ? '{bold,inverse}' : (isCompleted ? '{strikethrough,gray}' : '');
      const endStyle = isSelected || isCompleted ? '{/}' : '';

      // Format title
      const mainListWidth = typeof this.mainList.width === 'number' ? this.mainList.width : 80;
      const maxWidth = Math.min(50, mainListWidth - 10);
      const title = truncate(task.title, maxWidth);

      // Add due date if available
      let dueDateStr = '';
      if (task.dueDate) {
        dueDateStr = ` {gray}(${formatDate(task.dueDate)}){/}`;
      }

      // Add completion indicator
      let completionIndicator = '';
      if (isCompleted) {
        completionIndicator = ' ✓';
      }

      content += `${style}${prefix}${title}${completionIndicator}${dueDateStr}${endStyle}\n`;
    });
  }

  return content;
}
```

**AFTER (Lines 297-349):**
```typescript
protected renderMainList(): string {
  let content = '';
  const listName = LIST_NAMES[this.currentList];
  content += ` ${listName} `;

  if (this.selectedTags.size > 0) {
    const tagNames = Array.from(this.selectedTags)
      .map(id => this.tags.find(t => t.id === id)?.title || id)
      .join(', ');
    content += ` [Filtered: ${tagNames}]`;
  }

  if (this.searchQuery) {
    content += ` [Search: "${this.searchQuery}"]`;
  }

  content += '\n';
  const mainListWidth = typeof this.mainList.width === 'number' ? Math.max(0, this.mainList.width) : 80;
  content += '─'.repeat(Math.max(1, Math.min(80, mainListWidth))) + '\n\n';

  if (this.tasks.length === 0) {
    content += 'No tasks\n';
  } else {
    this.tasks.forEach((task, i) => {
      const isSelected = i === this.selectedIndex;
      const isCompleted = task.status === 2;
      // Selection: ▶ for selected, space for unselected
      // Completion: space prefix for active, ✓ suffix for completed
      const prefix = isSelected ? '▶' : (isCompleted ? '✓' : '·');

      // Format title
      const mainListWidth = typeof this.mainList.width === 'number' ? this.mainList.width : 80;
      const maxWidth = Math.min(50, mainListWidth - 10);
      const title = truncate(task.title, maxWidth);

      // Add due date if available
      let dueDateStr = '';
      if (task.dueDate) {
        dueDateStr = ` (${formatDate(task.dueDate)})`;
      }

      content += `${prefix} ${title}${dueDateStr}\n`;
    });
  }

  return content;
}
```

---

### Task: renderSidebar() - 8 Removals + Selection Logic

**Location breakdown:**
- Line 271: `{bold}` around "LISTS" header - just remove
- Line 279: `{bold,cyan}` for active list - REPLACE with different prefix
- Lines 287-292: `{yellow}` around shortcut keys - just remove tags

**BEFORE (Lines 270-295):**
```typescript
protected renderSidebar(): string {
  let content = '\n{bold}LISTS{/}\n';
  content += '─────────────\n\n';

  for (const [key, list] of Object.entries(LIST_NAMES)) {
    if (list === 'Search Results') continue;

    const isActive = this.currentList === key;
    const prefix = isActive ? '▶ ' : '  ';
    const style = isActive ? '{bold,cyan}' : '';
    const endStyle = isActive ? '{/}' : '';
    const shortcut = Object.entries(LIST_KEYS).find(([_, v]) => v === key)?.[0] || '?';

    content += `${style}${prefix}${shortcut} ${list}${endStyle}\n`;
  }

  content += '\n─────────────\n';
  content += '\n{yellow}n{/} New\n';
  content += '{yellow}/{/} Search\n';
  content += '{yellow}t{/} Tags\n';
  content += '{yellow}r{/} Refresh\n';
  content += '{yellow}?{/} Help\n';
  content += '{yellow}q{/} Quit\n';

  return content;
}
```

**AFTER (Lines 270-295):**
```typescript
protected renderSidebar(): string {
  let content = '\nLISTS\n';
  content += '─────────────\n\n';

  for (const [key, list] of Object.entries(LIST_NAMES)) {
    if (list === 'Search Results') continue;

    const isActive = this.currentList === key;
    const prefix = isActive ? '▶' : ' ';
    const shortcut = Object.entries(LIST_KEYS).find(([_, v]) => v === key)?.[0] || '?';

    content += `${prefix} ${shortcut} ${list}\n`;
  }

  content += '\n─────────────\n';
  content += '\nn New\n';
  content += '/ Search\n';
  content += 't Tags\n';
  content += 'r Refresh\n';
  content += '? Help\n';
  content += 'q Quit\n';

  return content;
}
```

---

### Task: showTaskDetail() - 11 Removals

**Location breakdown:**
- Line 394: `{bold,cyan}` around title - remove
- Line 399: `{bold}` around "Status:" - remove
- Line 399: `{yellow}` around status value - remove
- Line 403: `{bold}` around "List:" - remove
- Line 403: `{cyan}` around list value - remove
- Line 407: `{bold}` around "Due:" - remove
- Line 412: `{bold}` around "Tags:" - remove
- Line 414: `{cyan}` around tag - remove
- Line 420: `{bold}` around "Notes:" - remove
- Line 421: `{gray}` around notes - remove
- Line 424: `{yellow}` around "Press any key" - remove

**BEFORE (Lines 394-424):**
```typescript
let content = `{bold,cyan}${task.title}{/}\n`;
content += '─'.repeat(70) + '\n\n';

// Status
const statusText = task.status === 0 ? 'Active' : task.status === 2 ? 'Completed' : 'Cancelled';
content += `{bold}Status:{/} {yellow}${statusText}{/}\n`;

// List
const listName = task.list?.charAt(0).toUpperCase() + task.list?.slice(1) || 'Unknown';
content += `{bold}List:{/} {cyan}${listName}{/}\n`;

// Due date
if (task.dueDate) {
  content += `{bold}Due:{/} ${formatDate(task.dueDate)}\n`;
}

// Tags
if (task.tags && task.tags.length > 0) {
  content += `\n{bold}Tags:{/}\n`;
  for (const tag of task.tags) {
    content += `  {cyan}#${tag}{/}\n`;
  }
}

// Notes
if (task.notes) {
  content += `\n{bold}Notes:{/}\n`;
  content += `{gray}${task.notes}{/}\n`;
}

content += '\n{yellow}Press any key to close{/}';
```

**AFTER (Lines 394-424):**
```typescript
let content = `${task.title}\n`;
content += '─'.repeat(70) + '\n\n';

// Status
const statusText = task.status === 0 ? 'Active' : task.status === 2 ? 'Completed' : 'Cancelled';
content += `Status: ${statusText}\n`;

// List
const listName = task.list?.charAt(0).toUpperCase() + task.list?.slice(1) || 'Unknown';
content += `List: ${listName}\n`;

// Due date
if (task.dueDate) {
  content += `Due: ${formatDate(task.dueDate)}\n`;
}

// Tags
if (task.tags && task.tags.length > 0) {
  content += `\nTags:\n`;
  for (const tag of task.tags) {
    content += `  #${tag}\n`;
  }
}

// Notes
if (task.notes) {
  content += `\nNotes:\n`;
  content += `${task.notes}\n`;
}

content += '\nPress any key to close';
```

---

### Task: showTagFilter() - 7 Removals + Selection Logic

**Location breakdown:**
- Line 495: `{yellow}` + `{gray}` in error message - just remove
- Line 526: `{bold,cyan}` around header - remove
- Line 534: `{bold,inverse}` for selected tag - REPLACE with marker
- Line 534: `{cyan}` for filtered tag - REPLACE with marker
- Line 540: `{gray}` around instructions - just remove

**BEFORE (Lines 495, 525-540):**
```typescript
// Line 495 in error case:
content: '{yellow}No tags available{/}\n\n{gray}Press any key to close{/}',

// Lines 525-540 in renderTags():
let content = '{bold,cyan}Select Tags (Enter to confirm){/}\n';
content += '─'.repeat(60) + '\n\n';

this.tags.forEach((tag, i) => {
  const isSelected = i === selectedTagIndex;
  const isFiltered = this.selectedTags.has(tag.id);
  const prefix = isSelected ? '▶ ' : '  ';
  const marker = isFiltered ? '[✓] ' : '[ ] ';
  const style = isSelected ? '{bold,inverse}' : isFiltered ? '{cyan}' : '';
  const endStyle = isSelected || isFiltered ? '{/}' : '';

  content += `${style}${prefix}${marker}${tag.title}${endStyle}\n`;
});

content += '\n{gray}↑/↓ to navigate, Space to toggle, Enter to confirm{/}';
filterBox.setContent(content);
```

**AFTER (Lines 495, 525-540):**
```typescript
// Line 495 in error case:
content: 'No tags available\n\nPress any key to close',

// Lines 525-540 in renderTags():
let content = 'Select Tags (Enter to confirm)\n';
content += '─'.repeat(60) + '\n\n';

this.tags.forEach((tag, i) => {
  const isSelected = i === selectedTagIndex;
  const isFiltered = this.selectedTags.has(tag.id);
  const prefix = isSelected ? '▶' : ' ';
  const marker = isFiltered ? '[✓]' : '[ ]';

  content += `${prefix} ${marker} ${tag.title}\n`;
});

content += '\n↑/↓ to navigate, Space to toggle, Enter to confirm';
filterBox.setContent(content);
```

---

## CLEANUP PHASE

### Task: Remove stripMarkup() Calls (7 locations)

**Location 1: app.ts line 258**
**BEFORE:** `this.sidebar.setContent(stripMarkup(this.lastSidebarContent));`
**AFTER:** `this.sidebar.setContent(this.lastSidebarContent);`

**Location 2: app.ts line 262**
**BEFORE:** `this.mainList.setContent(stripMarkup(this.lastMainListContent));`
**AFTER:** `this.mainList.setContent(this.lastMainListContent);`

**Location 3: app.ts line 265**
**BEFORE:** `this.statusBar.setContent(stripMarkup(this.renderStatusBar()));`
**AFTER:** `this.statusBar.setContent(this.renderStatusBar());`

**Location 4: components.ts line 105**
**BEFORE:** `results.setContent(stripMarkup(...));`
**AFTER:** `results.setContent(...);`

**Location 5: components.ts line 108**
**BEFORE:** `results.setContent(stripMarkup(...));`
**AFTER:** `results.setContent(...);`

**Location 6: components.ts line 183**
**BEFORE:** `dialog.setContent(stripMarkup(content));`
**AFTER:** `dialog.setContent(content);`

**Location 7: components.ts line 231**
**BEFORE:** `bar.setContent(stripMarkup(content));`
**AFTER:** `bar.setContent(content);`

---

### Task: Delete stripMarkup() Definitions

**Location 1: app.ts lines 6-8**
**DELETE:**
```typescript
function stripMarkup(content: string): string {
  return content.replace(/{[^}]+}/g, '');
}
```

**Location 2: components.ts lines 7-9**
**DELETE:**
```typescript
function stripMarkup(content: string): string {
  return content.replace(/{[^}]+}/g, '');
}
```

---

## Verification Checklist

After all changes:

```bash
# 1. Verify no markup remains
grep -r "{bold\|{yellow\|{cyan\|{gray\|{green\|{red\|{white\|{inverse\|{strike" src/tui/
# Should return: (no results)

# 2. Verify stripMarkup is gone
grep -r "stripMarkup" src/tui/
# Should return: (no results)

# 3. Run tests
npm run test:bdd
# Should pass all 38 scenarios

# 4. Check coverage
npm run test:coverage
# Should maintain or improve coverage

# 5. Manual test
npm start
# Walk through:
# - Can I navigate (up/down)? ✓
# - Can I see selection (▶ prefix)? ✓
# - Can I see completion (✓ prefix)? ✓
# - Can I see active list in sidebar? ✓
# - Do shortcuts still work (1/2/3/4, n, /, t, etc.)? ✓
```
