import blessed from 'blessed';
import type { Task, Tag } from '../database/types.js';

/**
 * Formats a date timestamp for display
 */
export function formatDate(timestamp?: number): string {
  if (!timestamp) return '';
  try {
    const date = new Date(timestamp * 1000);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const day = date.getDate();
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });

    if (date.toDateString() === today.toDateString()) {
      return `Today`;
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow`;
    } else {
      return `${dayName} ${month} ${day}`;
    }
  } catch {
    return '';
  }
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) {
    return text;
  }
  return text.substring(0, length - 1) + '…';
}

/**
 * Create a search dialog box
 */
export function createSearchDialog(
  screen: blessed.Widgets.Screen,
  onSearch: (query: string) => void,
  onClose: () => void
): blessed.Widgets.BoxElement {
  const dialog = blessed.box({
    parent: screen,
    top: 'center',
    left: 'center',
    width: 60,
    height: 10,
    border: 'line',
    style: {
      border: { fg: 'cyan', bg: 'black' },
      focus: { border: { fg: 'white' } }
    },
    keys: true,
    focusable: true
  });

  let query = '';

  const input = blessed.textbox({
    parent: dialog,
    top: 1,
    left: 2,
    right: 2,
    height: 1,
    keys: true,
    mouse: true,
    style: {
      focus: { bg: 'blue', fg: 'white' }
    }
  });

  const results = blessed.box({
    parent: dialog,
    top: 3,
    left: 1,
    right: 1,
    bottom: 1,
    scrollable: true,
    content: '{gray}Type to search...{/}',
    style: {
      fg: 'white'
    }
  });

  // Focus input immediately
  input.focus();

  input.on('change', (text) => {
    query = text;
    if (query.length > 0) {
      results.setContent(`{yellow}Searching for: "${query}"{/}\n{gray}(results will update){/}`);
      onSearch(query);
    } else {
      results.setContent('{gray}Type to search...{/}');
    }
  });

  input.key(['escape', 'C-c'], () => {
    dialog.destroy();
    onClose();
  });

  input.key(['enter'], () => {
    dialog.destroy();
    onClose();
  });

  return dialog;
}

/**
 * Create a task detail popup with full information
 */
export function createTaskDetailDialog(
  screen: blessed.Widgets.Screen,
  task: Task,
  onClose: () => void
): blessed.Widgets.BoxElement {
  const dialog = blessed.box({
    parent: screen,
    top: 2,
    left: 3,
    right: 3,
    bottom: 2,
    border: 'line',
    scrollable: true,
    keys: true,
    mouse: true,
    style: {
      border: { fg: 'cyan' },
      focus: { border: { fg: 'white' } }
    }
  });

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

  dialog.setContent(content);

  dialog.key(['enter', 'escape', 'q'], () => {
    dialog.destroy();
    onClose();
  });

  return dialog;
}

/**
 * Create a tag filter display
 */
export function createTagFilterBar(
  screen: blessed.Widgets.Screen,
  tags: Tag[],
  selectedTags: Set<string>,
  onTagToggle: (tagId: string) => void
): blessed.Widgets.BoxElement {
  const bar = blessed.box({
    parent: screen,
    left: 20,
    top: 1,
    right: 0,
    height: 1,
    style: {
      fg: 'white'
    }
  });

  let content = ' Tags: ';
  if (tags.length === 0) {
    content += '{gray}none{/}';
  } else {
    const displayTags = tags.slice(0, 8); // Show first 8 tags to avoid overflow
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

  bar.setContent(content);
  return bar;
}
