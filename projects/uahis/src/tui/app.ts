import blessed from 'blessed';
import { getDatabase, closeDatabase } from '../database/things-db.js';
import type { Task, Tag } from '../database/types.js';
import { formatDate, truncate, createSearchDialog, createTaskDetailDialog, createTagFilterBar } from './components.js';

type ListType = 'today' | 'upcoming' | 'anytime' | 'someday' | 'search';

const LIST_KEYS: Record<'1' | '2' | '3' | '4', ListType> = {
  '1': 'today',
  '2': 'upcoming',
  '3': 'anytime',
  '4': 'someday'
};

const LIST_NAMES: Record<ListType, string> = {
  today: 'Today',
  upcoming: 'Upcoming',
  anytime: 'Anytime',
  someday: 'Someday',
  search: 'Search Results'
};

class ThingsTUI {
  protected screen: blessed.Widgets.Screen;
  protected db = getDatabase();
  protected currentList: ListType = 'today';
  protected tasks: Task[] = [];
  protected selectedIndex: number = 0;
  protected tags: Tag[] = [];
  protected selectedTags: Set<string> = new Set();
  protected searchQuery: string = '';

  // UI Elements
  protected sidebar!: blessed.Widgets.BoxElement;
  protected mainList!: blessed.Widgets.BoxElement;
  protected statusBar!: blessed.Widgets.BoxElement;
  private tagBar?: blessed.Widgets.BoxElement;

  constructor() {
    this.screen = blessed.screen({
      mouse: true,
      keyboard: true,
      title: 'Things TUI'
    });

    this.setupUI();
    this.setupKeyHandlers();
    this.loadTags();
    this.loadTasks();
    this.render();
  }

  protected setupUI(): void {
    // Sidebar (left panel)
    this.sidebar = blessed.box({
      parent: this.screen,
      left: 0,
      top: 0,
      width: 20,
      height: '100%-1',
      border: 'line',
      style: {
        border: {
          fg: 'blue'
        },
        focus: {
          border: {
            fg: 'white'
          }
        }
      }
    });

    // Main list (right panel)
    this.mainList = blessed.box({
      parent: this.screen,
      left: 20,
      top: 0,
      right: 0,
      height: '100%-1',
      border: 'line',
      scrollable: true,
      keys: true,
      vi: true,
      mouse: true,
      style: {
        border: {
          fg: 'cyan'
        },
        focus: {
          border: {
            fg: 'white'
          }
        }
      }
    });

    // Status bar (bottom)
    this.statusBar = blessed.box({
      parent: this.screen,
      left: 0,
      top: '100%-1',
      right: 0,
      height: 1,
      style: {
        bg: 'blue',
        fg: 'white'
      }
    });
  }

  protected setupKeyHandlers(): void {
    this.screen.key(['q', 'C-c'], () => {
      closeDatabase();
      this.screen.destroy();
      process.exit(0);
    });

    // List switching
    this.screen.key(['1', '2', '3', '4'], (ch) => {
      const key = ch as keyof typeof LIST_KEYS;
      this.currentList = LIST_KEYS[key];
      this.selectedIndex = 0;
      this.searchQuery = '';
      this.selectedTags.clear();
      this.loadTasks();
      this.render();
    });

    // Navigation
    this.screen.key(['down', 'j'], () => {
      if (this.selectedIndex < this.tasks.length - 1) {
        this.selectedIndex++;
        this.render();
      }
    });

    this.screen.key(['up', 'k'], () => {
      if (this.selectedIndex > 0) {
        this.selectedIndex--;
        this.render();
      }
    });

    // Task detail view
    this.screen.key(['enter'], () => {
      if (this.tasks[this.selectedIndex]) {
        const task = this.tasks[this.selectedIndex];
        this.showTaskDetail(task);
      }
    });

    // Search
    this.screen.key(['/', 'C-f'], () => {
      this.openSearch();
    });

    // Tag filtering
    this.screen.key(['t'], () => {
      this.showTagFilter();
    });

    // Help
    this.screen.key(['?'], () => {
      this.showHelp();
    });

    // Refresh
    this.screen.key(['r'], () => {
      this.loadTasks();
      this.render();
    });
  }

  protected loadTags(): void {
    try {
      this.tags = this.db.getTags();
    } catch (error) {
      console.error('[TUI] Error loading tags:', error);
      this.tags = [];
    }
  }

  protected loadTasks(): void {
    try {
      let tasks: Task[] = [];

      if (this.currentList === 'search') {
        tasks = this.db.searchTasks(this.searchQuery);
      } else {
        switch (this.currentList) {
          case 'today':
            tasks = this.db.getTodayTasks();
            break;
          case 'upcoming':
            tasks = this.db.getUpcomingTasks();
            break;
          case 'anytime':
            tasks = this.db.getAnytimeTasks();
            break;
          case 'someday':
            tasks = this.db.getSomedayTasks();
            break;
        }
      }

      // Filter by selected tags if any
      if (this.selectedTags.size > 0) {
        tasks = tasks.filter(task => {
          if (!task.tags || task.tags.length === 0) {
            return false;
          }
          // Include task if it has ANY of the selected tags
          return task.tags.some(tag => this.selectedTags.has(tag));
        });
      }

      this.tasks = tasks;
    } catch (error) {
      console.error('[TUI] Error loading tasks:', error);
      this.tasks = [];
    }
  }

  protected render(): void {
    // Render sidebar
    this.sidebar.setContent(this.renderSidebar());

    // Render main list
    this.mainList.setContent(this.renderMainList());

    // Render status bar
    this.statusBar.setContent(this.renderStatusBar());

    this.screen.render();
  }

  protected renderSidebar(): string {
    let content = '\n{bold}LISTS{/}\n';
    content += '─────────────\n\n';

    for (const [key, list] of Object.entries(LIST_NAMES)) {
      if (list === 'Search Results') continue; // Skip search in sidebar

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
        const prefix = isSelected ? '► ' : '  ';
        const style = isSelected ? '{bold,inverse}' : '';
        const endStyle = isSelected ? '{/}' : '';

        // Format title
        const mainListWidth = typeof this.mainList.width === 'number' ? this.mainList.width : 80;
        const maxWidth = Math.min(50, mainListWidth - 10);
        const title = truncate(task.title, maxWidth);

        // Add due date if available
        let dueDateStr = '';
        if (task.dueDate) {
          dueDateStr = ` {gray}(${formatDate(task.dueDate)}){/}`;
        }

        content += `${style}${prefix}${title}${dueDateStr}${endStyle}\n`;
      });
    }

    return content;
  }

  protected renderStatusBar(): string {
    const taskCount = this.tasks.length;
    const selectedNum = taskCount > 0 ? this.selectedIndex + 1 : 0;
    const status = taskCount > 0 ? `${selectedNum}/${taskCount}` : 'empty';

    let shortcuts = '↑↓/jk: Navigate | Enter: Detail | 1-4: Lists | /: Search | t: Tags | ?: Help | q: Quit';

    if (this.selectedTags.size > 0) {
      shortcuts = `${this.selectedTags.size} tag(s) selected | c: Clear filters | ${shortcuts}`;
    }

    return ` ${shortcuts}  [${status}]`;
  }

  private showTaskDetail(task: Task): void {
    const detailBox = blessed.box({
      parent: this.screen,
      top: 'center',
      left: 'center',
      width: 80,
      height: 25,
      border: 'line',
      scrollable: true,
      keys: true,
      style: {
        border: {
          fg: 'white'
        }
      }
    });

    let content = `{bold,cyan}${task.title}{/}\n`;
    content += '─'.repeat(70) + '\n\n';

    // Status
    const statusText = task.status === 0 ? 'Active' : task.status === 1 ? 'Completed' : 'Cancelled';
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

    detailBox.setContent(content);
    detailBox.key(['enter', 'escape', 'q'], () => {
      detailBox.destroy();
      this.screen.render();
    });

    this.screen.render();
  }

  private openSearch(): void {
    const searchBox = blessed.box({
      parent: this.screen,
      top: 'center',
      left: 'center',
      width: 60,
      height: 10,
      border: 'line',
      style: {
        border: { fg: 'cyan' }
      },
      keys: true
    });

    searchBox.setContent('{yellow}Search{/}\n\nType query below:\n');

    const input = blessed.textbox({
      parent: searchBox,
      top: 4,
      left: 1,
      right: 1,
      height: 1,
      keys: true,
      style: {
        focus: { bg: 'blue', fg: 'white' }
      }
    });

    input.focus();

    input.key(['escape', 'C-c'], () => {
      searchBox.destroy();
      this.screen.render();
    });

    input.key(['enter'], () => {
      const query = input.getValue();
      searchBox.destroy();

      if (query && query.length > 0) {
        this.searchQuery = query;
        this.currentList = 'search';
        this.selectedIndex = 0;
        this.loadTasks();
      }

      this.screen.render();
      this.render();
    });
  }

  private showTagFilter(): void {
    if (this.tags.length === 0) {
      const msg = blessed.box({
        parent: this.screen,
        top: 'center',
        left: 'center',
        width: 50,
        height: 5,
        border: 'line',
        content: '{yellow}No tags available{/}\n\n{gray}Press any key to close{/}',
        keys: true
      });

      msg.key(['enter', 'escape', 'q'], () => {
        msg.destroy();
        this.screen.render();
      });

      this.screen.render();
      return;
    }

    const filterBox = blessed.box({
      parent: this.screen,
      top: 'center',
      left: 'center',
      width: 70,
      height: Math.min(this.tags.length + 6, 20),
      border: 'line',
      scrollable: true,
      keys: true,
      mouse: true,
      style: {
        border: { fg: 'cyan' }
      }
    });

    let selectedTagIndex = 0;

    const renderTags = () => {
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
    };

    renderTags();

    filterBox.key(['up', 'k'], () => {
      if (selectedTagIndex > 0) {
        selectedTagIndex--;
        renderTags();
        this.screen.render();
      }
    });

    filterBox.key(['down', 'j'], () => {
      if (selectedTagIndex < this.tags.length - 1) {
        selectedTagIndex++;
        renderTags();
        this.screen.render();
      }
    });

    filterBox.key(['space'], () => {
      const tag = this.tags[selectedTagIndex];
      if (this.selectedTags.has(tag.id)) {
        this.selectedTags.delete(tag.id);
      } else {
        this.selectedTags.add(tag.id);
      }
      renderTags();
      this.screen.render();
    });

    filterBox.key(['c', 'C'], () => {
      this.selectedTags.clear();
      renderTags();
      this.screen.render();
    });

    filterBox.key(['enter', 'escape', 'q'], () => {
      filterBox.destroy();
      this.selectedIndex = 0;
      this.loadTasks();
      this.screen.render();
      this.render();
    });

    this.screen.render();
  }

  private showHelp(): void {
    const helpBox = blessed.box({
      parent: this.screen,
      top: 'center',
      left: 'center',
      width: 80,
      height: 26,
      border: 'line',
      scrollable: true,
      keys: true,
      style: {
        border: {
          fg: 'white'
        }
      }
    });

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

    helpBox.setContent(content);
    helpBox.key(['enter', 'escape', 'q', '?'], () => {
      helpBox.destroy();
      this.screen.render();
    });

    this.screen.render();
  }

  run(): void {
    this.screen.render();
  }
}

// Testing/Simulation API (for BDD tests)
export class ThingsTUITestable extends ThingsTUI {
  async initialize(): Promise<void> {
    this.loadTasks();
    this.render();
  }

  async simulateKeyPress(key: string): Promise<void> {
    await new Promise<void>((resolve) => {
      this.handleKeyPress(key);
      setTimeout(resolve, 50);
    });
  }

  async typeText(text: string): Promise<void> {
    for (const char of text) {
      this.handleKeyPress(char);
      await new Promise(resolve => setTimeout(resolve, 10));
    }
  }

  selectTask(index: number): void {
    this.selectedIndex = Math.max(0, Math.min(index, this.tasks.length - 1));
    this.render();
  }

  selectTag(tagId: string): void {
    if (this.selectedTags.has(tagId)) {
      this.selectedTags.delete(tagId);
    } else {
      this.selectedTags.add(tagId);
    }
    this.loadTasks();
    this.render();
  }

  setTagFilterIndex(index: number): void {
    // For tag navigation
    this.selectedIndex = index;
  }

  getSelectedTask(): Task | null {
    return this.tasks[this.selectedIndex] ?? null;
  }

  getVisibleTasks(): Task[] {
    return [...this.tasks];
  }

  getTodayTasks(): Task[] {
    return this.db.getTodayTasks();
  }

  getAllTasks(): Task[] {
    return [
      ...this.db.getTodayTasks(),
      ...this.db.getUpcomingTasks(),
      ...this.db.getAnytimeTasks(),
      ...this.db.getSomedayTasks()
    ];
  }

  getTags(): Tag[] {
    return this.tags;
  }

  getSelectedIndex(): number {
    return this.selectedIndex;
  }

  getCurrentList(): string {
    return LIST_NAMES[this.currentList];
  }

  getStatusBar(): string {
    return this.renderStatusBar();
  }

  getMainListContent(): string {
    return this.renderMainList();
  }

  getDetailViewContent(): string {
    // Return last rendered detail content
    return (this as any).lastDetailContent ?? '';
  }

  isSearchDialogVisible(): boolean {
    return (this as any).searchDialogOpen ?? false;
  }

  isDetailViewVisible(): boolean {
    return (this as any).detailViewOpen ?? false;
  }

  isTagFilterVisible(): boolean {
    return (this as any).tagFilterOpen ?? false;
  }

  isInputFocused(): boolean {
    return (this as any).inputFocused ?? false;
  }

  private handleKeyPress(key: string): void {
    // Route key press through same handlers as real input
    const handlers: Record<string, () => void> = {
      'q': () => { /* quit - skip for tests */ },
      '1': () => { this.currentList = 'today'; this.selectedIndex = 0; this.loadTasks(); },
      '2': () => { this.currentList = 'upcoming'; this.selectedIndex = 0; this.loadTasks(); },
      '3': () => { this.currentList = 'anytime'; this.selectedIndex = 0; this.loadTasks(); },
      '4': () => { this.currentList = 'someday'; this.selectedIndex = 0; this.loadTasks(); },
      'up': () => { if (this.selectedIndex > 0) this.selectedIndex--; },
      'k': () => { if (this.selectedIndex > 0) this.selectedIndex--; },
      'down': () => { if (this.selectedIndex < this.tasks.length - 1) this.selectedIndex++; },
      'j': () => { if (this.selectedIndex < this.tasks.length - 1) this.selectedIndex++; },
      'enter': () => { if (this.tasks[this.selectedIndex]) (this as any).detailViewOpen = true; },
      'escape': () => { (this as any).detailViewOpen = false; (this as any).searchDialogOpen = false; },
      '/': () => { (this as any).searchDialogOpen = true; },
      't': () => { (this as any).tagFilterOpen = true; },
      'c': () => { this.selectedTags.clear(); this.loadTasks(); },
      'r': () => { this.loadTasks(); },
      '?': () => { /* help - skip for tests */ },
    };

    const handler = handlers[key];
    if (handler) {
      handler();
    }
    this.render();
  }
}

export async function startTUI(): Promise<void> {
  const tui = new ThingsTUI();
  tui.run();
}
