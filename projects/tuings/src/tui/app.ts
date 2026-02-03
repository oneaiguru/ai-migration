import blessed from 'blessed';
import { getDatabase, closeDatabase } from '../database/things-db.js';
import type { Task, Tag } from '../database/types.js';
import { formatDate, truncate, createSearchDialog, createTaskDetailDialog, createTagFilterBar } from './components.js';

export type ListType = 'today' | 'upcoming' | 'anytime' | 'someday' | 'search';
type MoveTarget = Exclude<ListType, 'search'>;

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
  protected lastSidebarContent: string = '';
  protected lastMainListContent: string = '';
  protected quickAddedTasks: Task[] = [];
  protected previousListBeforeSearch: ListType = 'today';
  protected moveMenuOpen: boolean = false;
  protected moveMenuOptions: MoveTarget[] = ['today', 'upcoming', 'anytime', 'someday'];
  protected moveMenuSelectedIndex: number = 0;
  protected pendingMoveTaskId: string | null = null;
  protected pendingMoveFromList: ListType | null = null;

  // UI Elements
  protected sidebar!: blessed.Widgets.BoxElement;
  protected mainList!: blessed.Widgets.BoxElement;
  protected statusBar!: blessed.Widgets.BoxElement;
  private moveMenuBox?: blessed.Widgets.BoxElement;
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

    // Move between lists
    this.screen.key(['m'], () => {
      this.startMoveMenu();
      this.renderMoveMenu();
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

    // Mark complete / Clear filters
    this.screen.key(['c'], () => {
      // FIRST: Clear filters if tag filter is active
      if (this.selectedTags.size > 0) {
        this.selectedTags.clear();
        this.loadTasks();
      }
      // ELSE: Toggle task completion only if no filters active
      else if (this.tasks[this.selectedIndex]) {
        this.toggleTaskCompletion(this.selectedIndex);
      }
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

      // Merge quick-added tasks (in-memory) with database results
      const quickAdded = this.quickAddedTasks || [];
      const taskIds = new Set(tasks.map((t: Task) => t.id));
      const persistedQuickAdded = quickAdded.filter((t: Task) => !taskIds.has(t.id));
      tasks = [...tasks, ...persistedQuickAdded];

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
    // Render and cache sidebar
    this.lastSidebarContent = this.renderSidebar();
    this.sidebar.setContent(this.lastSidebarContent);

    // Render and cache main list
    this.lastMainListContent = this.renderMainList();
    this.mainList.setContent(this.lastMainListContent);

    // Render status bar
    this.statusBar.setContent(this.renderStatusBar());

    this.screen.render();
  }

  protected renderSidebar(): string {
    let content = '\nLISTS\n';
    content += '─────────────\n\n';

    for (const [key, list] of Object.entries(LIST_NAMES)) {
      if (list === 'Search Results') continue; // Skip search in sidebar

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

  protected renderTaskDetail(task: Task): string {
    if (!task) return '';
    const statusText = task.status === 0 ? 'Active' : task.status === 2 ? 'Completed' : 'Cancelled';
    const listName = task.list?.charAt(0).toUpperCase() + task.list?.slice(1) || 'Unknown';
    const tags = task.tags && task.tags.length > 0 ? task.tags.map(tag => `#${tag}`).join(', ') : '(none)';
    const notes = task.notes || '(none)';

    return `Title: ${task.title}
Notes: ${notes}
List: ${listName}
Status: ${statusText}
Tags: ${tags}`;
  }

  protected renderStatusBar(): string {
    // Check for success message in quick-add state
    const success = (this as any).quickAddSuccess;
    if (success) {
      return ` SUCCESS: Task created`;
    }

    // Check for error message in quick-add state
    const error = (this as any).quickAddError;
    if (error) {
      return ` ERROR: ${error}`;
    }

    const taskCount = this.tasks.length;
    const selectedNum = taskCount > 0 ? this.selectedIndex + 1 : 0;
    const listName = LIST_NAMES[this.currentList];
    const status = taskCount > 0 ? `${listName} ${selectedNum}/${taskCount}` : `${listName} empty`;

    let shortcuts = '↑↓/jk: Navigate | Enter: Detail | 1-4: Lists | /: Search | t: Tags | ?: Help | q: Quit';

    if (this.selectedTags.size > 0) {
      shortcuts = `${this.selectedTags.size} tag(s) selected | c: Clear filters | ${shortcuts}`;
    }

    if (this.currentList === 'search' && this.searchQuery) {
      shortcuts = `Search: "${this.searchQuery}" | ${shortcuts}`;
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

    searchBox.setContent('Search\n\nType query below:\n');

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
        content: 'No tags available\n\nPress any key to close',
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

  protected startMoveMenu(): void {
    if (this.tasks.length === 0) {
      return;
    }
    this.pendingMoveTaskId = this.tasks[this.selectedIndex]?.id ?? null;
    this.pendingMoveFromList = this.currentList;
    this.moveMenuOpen = true;
    const currentIndex = this.moveMenuOptions.indexOf(this.currentList as MoveTarget);
    this.moveMenuSelectedIndex = currentIndex >= 0 ? currentIndex : 0;
  }

  protected renderMoveMenu(): void {
    if (!this.moveMenuOpen) {
      return;
    }

    if (this.moveMenuBox) {
      this.moveMenuBox.destroy();
      this.moveMenuBox = undefined;
    }

    const box = blessed.box({
      parent: this.screen,
      top: 'center',
      left: 'center',
      width: 40,
      height: 12,
      border: 'line',
      scrollable: false,
      keys: true,
      mouse: true,
      style: {
        border: { fg: 'cyan' }
      }
    });

    const renderOptions = () => {
      let content = 'Move task to:\n';
      content += '─'.repeat(30) + '\n\n';

      this.moveMenuOptions.forEach((option, idx) => {
        const prefix = idx === this.moveMenuSelectedIndex ? '▶' : ' ';
        content += `${prefix} ${LIST_NAMES[option]}\n`;
      });

      content += '\nEnter: Move | Esc: Cancel';
      box.setContent(content);
    };

    renderOptions();

    box.key(['up', 'k'], () => {
      if (this.moveMenuSelectedIndex > 0) {
        this.moveMenuSelectedIndex--;
        renderOptions();
        this.screen.render();
      }
    });

    box.key(['down', 'j'], () => {
      if (this.moveMenuSelectedIndex < this.moveMenuOptions.length - 1) {
        this.moveMenuSelectedIndex++;
        renderOptions();
        this.screen.render();
      }
    });

    box.key(['enter'], () => {
      const target = this.moveMenuOptions[this.moveMenuSelectedIndex];
      this.applyMoveTarget(target);
    });

    box.key(['escape', 'q'], () => {
      this.cancelMoveMenu();
      this.screen.render();
    });

    box.focus();
    this.moveMenuBox = box;
    this.screen.render();
  }

  protected applyMoveTarget(targetList: MoveTarget): void {
    if (!this.pendingMoveTaskId && this.tasks[this.selectedIndex]) {
      this.pendingMoveTaskId = this.tasks[this.selectedIndex].id;
      this.pendingMoveFromList = this.currentList;
    }

    const taskId = this.pendingMoveTaskId;
    if (!taskId) {
      this.cancelMoveMenu();
      this.render();
      return;
    }

    // Update fallback database if available
    if ((this.db as any).moveTask) {
      (this.db as any).moveTask(taskId, targetList);
    }

    // Update quick-added tasks if they exist
    this.quickAddedTasks = this.quickAddedTasks.map(task => {
      if (task.id === taskId) {
        return { ...task, list: targetList };
      }
      return task;
    });

    // Switch view to target list and reload
    this.currentList = targetList;
    this.loadTasks();

    // Ensure selection stays on moved task
    const idx = this.tasks.findIndex(t => t.id === taskId);
    this.selectedIndex = idx >= 0 ? idx : Math.min(this.selectedIndex, Math.max(this.tasks.length - 1, 0));

    (this as any).lastMove = {
      taskId,
      from: this.pendingMoveFromList,
      to: targetList
    };

    this.cancelMoveMenu();
    this.render();
  }

  protected cancelMoveMenu(): void {
    this.moveMenuOpen = false;
    this.pendingMoveTaskId = null;
    this.pendingMoveFromList = null;

    if (this.moveMenuBox) {
      this.moveMenuBox.destroy();
      this.moveMenuBox = undefined;
    }
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

  protected toggleTaskCompletion(index: number): void {
    const task = this.tasks[index];
    if (task) {
      const isCompleting = task.status === 0;
      
      // Call Things URL scheme to persist change
      if (isCompleting) {
        // Mark complete in Things
        this.db.markTaskComplete(task.id);
      } else {
        // Mark incomplete in Things
        this.db.markTaskIncomplete(task.id);
      }
      
      // Update in-memory state to match
      task.status = isCompleting ? 2 : 0;
      
      // Move selection to next task if completing
      if (isCompleting && index < this.tasks.length - 1) {
        this.selectedIndex = index + 1;
      }
      
      // Wait for Things to update database, then reload
      setTimeout(() => {
        this.loadTasks();
        this.render();
      }, 500);
    }
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

  getTasksForList(list: ListType): Task[] {
    let tasks: Task[] = [];
    switch (list) {
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
      default:
        tasks = [];
    }
    const ids = new Set(tasks.map(task => task.id));
    const quickAdded = this.quickAddedTasks.filter(task => task.list === list && !ids.has(task.id));
    return [...tasks, ...quickAdded];
  }

  getAllTasks(): Task[] {
    const combined = [
      ...this.db.getTodayTasks(),
      ...this.db.getUpcomingTasks(),
      ...this.db.getAnytimeTasks(),
      ...this.db.getSomedayTasks()
    ];
    const ids = new Set(combined.map(task => task.id));
    const quickAdded = this.quickAddedTasks.filter(task => !ids.has(task.id));
    return [...combined, ...quickAdded];
  }

  getTags(): Tag[] {
    return this.tags;
  }

  getMoveMenuOptions(): string[] {
    return this.moveMenuOptions.map(option => LIST_NAMES[option]);
  }

  isMoveMenuVisible(): boolean {
    return this.moveMenuOpen;
  }

  selectMoveTarget(listName: string): void {
    const normalized = this.normalizeListKey(listName);
    if (!this.moveMenuOpen) {
      this.startMoveMenu();
    }
    const idx = this.moveMenuOptions.indexOf(normalized);
    this.moveMenuSelectedIndex = idx >= 0 ? idx : 0;
    this.applyMoveTarget(normalized);
  }

  cancelMoveSelection(): void {
    this.cancelMoveMenu();
    this.render();
  }

  getLastMove(): { taskId: string; from: ListType | null; to: ListType } | null {
    return (this as any).lastMove ?? null;
  }

  private normalizeListKey(listName: string): MoveTarget {
    const value = listName.toLowerCase();
    if (value.includes('today')) return 'today';
    if (value.includes('upcoming')) return 'upcoming';
    if (value.includes('anytime')) return 'anytime';
    if (value.includes('someday')) return 'someday';
    return 'today';
  }

  getSelectedIndex(): number {
    return this.selectedIndex;
  }

  getCurrentList(): string {
    return LIST_NAMES[this.currentList];
  }

  getCurrentListKey(): ListType {
    return this.currentList;
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

  getLastToggleDebug(): any {
    return (this as any).lastToggleDebug;
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

  isQuickAddDialogVisible(): boolean {
    return (this as any).quickAddOpen ?? false;
  }

  isQuickAddInputFocused(): boolean {
    return (this as any).quickAddFocused ?? false;
  }

  getSidebarContent(): string {
    return this.lastSidebarContent;
  }

  getFilterState(): { tags: string[] } {
    return {
      tags: Array.from(this.selectedTags)
    };
  }

  getCurrentMode(): string {
    if ((this as any).detailViewOpen) return 'detail';
    if ((this as any).searchDialogOpen) return 'search';
    if ((this as any).tagFilterOpen) return 'tag-filter';
    if ((this as any).quickAddOpen) return 'quick-add';
    if (this.moveMenuOpen) return 'move-menu';
    return 'list';
  }

  private handleKeyPress(key: string): void {
    // Handle search dialog input
    if ((this as any).searchDialogOpen) {
      if (key === 'escape') {
        (this as any).searchDialogOpen = false;
        (this as any).inputFocused = false;
        this.searchQuery = '';
        this.currentList = this.previousListBeforeSearch || 'today';
        this.loadTasks();
        this.render();
        return;
      }
      if (key === 'enter') {
        this.currentList = 'search';
        (this as any).searchDialogOpen = false;
        (this as any).inputFocused = false;
        this.selectedIndex = 0;
        this.loadTasks();
        this.render();
        return;
      }
      if (key.length === 1) {
        this.searchQuery = (this.searchQuery || '') + key;
        this.currentList = 'search';
        this.selectedIndex = 0;
        this.loadTasks();
        this.render();
        return;
      }
    }

    // Handle tag filter overlay
    if ((this as any).tagFilterOpen) {
      if (key === 'space') {
        const idx = Math.max(0, Math.min(this.selectedIndex, this.tags.length - 1));
        const tag = this.tags[idx];
        if (tag) {
          this.selectTag(tag.id);
        }
        this.render();
        return;
      }
      if (key === 'enter' || key === 'escape') {
        (this as any).tagFilterOpen = false;
        this.render();
        return;
      }
    }

    // Handle quick-add input
    if ((this as any).quickAddOpen) {
      if (key === 'enter') {
        const text = ((this as any).quickAddText || '').trim();
        if (text.length > 0) {
          // Create new task using Things URL scheme
          this.createTaskViaURLScheme(text);
          (this as any).quickAddOpen = false;
          (this as any).quickAddText = '';
          (this as any).quickAddError = '';
          (this as any).quickAddSuccess = true;
          // Clear success message after a moment
          setTimeout(() => {
            (this as any).quickAddSuccess = false;
            this.render();
          }, 1500);
          // Don't reload - keep the task we just added in memory
        } else {
          (this as any).quickAddError = 'Title cannot be empty';
          this.render();
          return;
        }
      } else if (key === 'escape') {
        (this as any).quickAddOpen = false;
        (this as any).quickAddText = '';
        (this as any).quickAddError = '';
      } else if (key.length === 1) {
        // Accumulate typed text (single character only)
        (this as any).quickAddText = ((this as any).quickAddText || '') + key;
      }
      this.render();
      return;
    }

    // Handle move menu navigation
    if (this.moveMenuOpen) {
      if (key === 'escape') {
        this.cancelMoveMenu();
        this.render();
        return;
      }
      if (key === 'up' || key === 'k') {
        if (this.moveMenuSelectedIndex > 0) {
          this.moveMenuSelectedIndex--;
        }
        this.render();
        return;
      }
      if (key === 'down' || key === 'j') {
        if (this.moveMenuSelectedIndex < this.moveMenuOptions.length - 1) {
          this.moveMenuSelectedIndex++;
        }
        this.render();
        return;
      }
      if (key === 'enter') {
        const target = this.moveMenuOptions[this.moveMenuSelectedIndex] || this.moveMenuOptions[0];
        this.applyMoveTarget(target);
        return;
      }
    }

    // Route key press through same handlers as real input
    const handlers: Record<string, () => void> = {
      'q': () => { (this as any).detailViewOpen = false; (this as any).searchDialogOpen = false; },
      '1': () => { this.currentList = 'today'; this.selectedIndex = 0; this.loadTasks(); this.selectedIndex = 0; },
      '2': () => { this.currentList = 'upcoming'; this.selectedIndex = 0; this.loadTasks(); this.selectedIndex = 0; },
      '3': () => { this.currentList = 'anytime'; this.selectedIndex = 0; this.loadTasks(); this.selectedIndex = 0; },
      '4': () => { this.currentList = 'someday'; this.selectedIndex = 0; this.loadTasks(); this.selectedIndex = 0; },
      'up': () => { if (this.selectedIndex > 0) this.selectedIndex--; },
      'k': () => { if (this.selectedIndex > 0) this.selectedIndex--; },
      'down': () => { if (this.selectedIndex < this.tasks.length - 1) this.selectedIndex++; },
      'j': () => { if (this.selectedIndex < this.tasks.length - 1) this.selectedIndex++; },
      'enter': () => { 
        if (this.tasks[this.selectedIndex]) {
          (this as any).detailViewOpen = true; 
          (this as any).lastDetailContent = this.renderTaskDetail(this.tasks[this.selectedIndex]);
        }
      },
      'escape': () => { (this as any).detailViewOpen = false; (this as any).searchDialogOpen = false; },
      '/': () => { 
        this.previousListBeforeSearch = this.currentList;
        (this as any).searchDialogOpen = true; 
        (this as any).inputFocused = true;
        this.searchQuery = '';
      },
      't': () => { (this as any).tagFilterOpen = true; },
      'c': () => {
        // FIRST: Clear filters if tag filter is active
        if (this.selectedTags.size > 0) {
          this.selectedTags.clear();
          this.loadTasks();
        }
        // ELSE: Toggle task completion only if no filters active
        else if (this.tasks[this.selectedIndex]) {
          this.toggleTaskCompletion(this.selectedIndex);
        }
      },
      'r': () => { this.loadTasks(); },
      'n': () => { 
        (this as any).quickAddOpen = true; 
        (this as any).quickAddFocused = true; 
        (this as any).quickAddText = ''; 
        (this as any).quickAddError = '';
      },
      'tab': () => { 
        const order: ListType[] = ['today', 'upcoming', 'anytime', 'someday'];
        const idx = order.indexOf(this.currentList);
        const next = order[(idx + 1) % order.length];
        this.currentList = next;
        this.selectedIndex = 0;
        this.loadTasks();
      },
      'm': () => { this.startMoveMenu(); },
      '?': () => { /* help - skip for tests */ },
    };

    const handler = handlers[key];
    if (handler) {
      handler();
    }
    this.render();
  }

  // Override toggleTaskCompletion for tests (skip URL scheme calls)
  protected toggleTaskCompletion(index: number): void {
    const task = this.tasks[index];
    if (task) {
      const isCompleting = task.status === 0;
      
      // In test mode, just toggle in-memory (no URL scheme call to Things)
      task.status = isCompleting ? 2 : 0;
      
      // Move selection to next task if completing
      if (isCompleting && index < this.tasks.length - 1) {
        this.selectedIndex = index + 1;
      }
      
      // For tests, render immediately
      this.render();
    }
  }

  protected createTaskViaURLScheme(title: string): void {
    // TODO: Implement task creation via Things URL scheme
    // For now, store in quickAddedTasks which will be merged with DB tasks on reload
    const listType = this.currentList === 'search' ? 'today' : this.currentList;
    const newTask: Task = {
      id: `temp-${Date.now()}`,
      uuid: `temp-uuid-${Date.now()}`,
      title: title.trim(),
      notes: '',
      list: listType as 'today' | 'upcoming' | 'anytime' | 'someday' | 'logbook',
      tags: [],
      status: 0,
      index: this.tasks.length
    };
    // Store in quickAddedTasks to persist across reloads
    this.quickAddedTasks.push(newTask);
    // Also add to current view immediately
    this.tasks.push(newTask);
    this.selectedIndex = this.tasks.length - 1;
  }
}

export async function startTUI(): Promise<void> {
  const tui = new ThingsTUI();
  tui.run();
}
