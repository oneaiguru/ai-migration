import type { Task } from '../database/types.js';

export interface UIState {
  mode: 'list' | 'detail' | 'search' | 'tag-filter' | 'move-menu' | 'quick-add';
  currentList: string;
  visibleTasks: Task[];
  selectedIndex: number;
  selectedTask: Task | null;
  filterState: { tags: string[] };
  statusBar: string;
  mainListContent: string;
  detailContent: string | null;
  timestamp: number;
  step?: string;
}

export class StateCapture {
  /**
   * Capture current TUI state
   */
  capture(tui: any, step?: string): UIState {
    const visibleTasks = tui.getVisibleTasks();
    const selectedIndex = tui.getSelectedIndex();
    const selectedTask = selectedIndex >= 0 && selectedIndex < visibleTasks.length 
      ? visibleTasks[selectedIndex] 
      : null;

    return {
      mode: tui.getCurrentMode?.() || 'list',
      currentList: tui.getCurrentList(),
      visibleTasks,
      selectedIndex,
      selectedTask,
      filterState: tui.getFilterState?.() || { tags: [] },
      statusBar: tui.getStatusBar(),
      mainListContent: this.renderMainList(visibleTasks, selectedIndex),
      detailContent: tui.isDetailViewVisible?.() ? this.renderDetailView(selectedTask) : null,
      timestamp: Date.now(),
      step
    };
  }

  /**
   * Render main list view as text
   */
  private renderMainList(tasks: Task[], selectedIndex: number): string {
    return tasks
      .map((task, idx) => {
        const marker = idx === selectedIndex ? '►' : ' ';
        const status = task.status === 2 ? '✓' : ' ';
        const truncated = task.title.length > 60 ? task.title.substring(0, 57) + '...' : task.title;
        return `${marker} [${status}] ${truncated}`;
      })
      .join('\n');
  }

  /**
   * Render detail view as text
   */
  private renderDetailView(task: Task | null): string {
    if (!task) return 'No task selected';

    return `
Title: ${task.title}
Notes: ${task.notes || '(none)'}
List: ${task.list}
Status: ${task.status === 0 ? 'Active' : task.status === 2 ? 'Completed' : 'Other'}
Tags: ${task.tags && task.tags.length > 0 ? task.tags.join(', ') : '(none)'}
    `.trim();
  }

  /**
   * Render state as formatted text (human-readable)
   */
  renderAsText(state: UIState): string {
    const lines = [];

    if (state.step) {
      lines.push(`\n${'='.repeat(60)}`);
      lines.push(`Step: ${state.step}`);
      lines.push('='.repeat(60));
    }

    lines.push(`Mode: ${state.mode}`);
    lines.push(`List: ${state.currentList} (${state.visibleTasks.length} tasks)`);
    lines.push(`Selected: [${state.selectedIndex}] ${state.selectedTask?.title || '(none)'}`);

    if (state.filterState?.tags.length > 0) {
      lines.push(`Filters: ${state.filterState.tags.join(', ')}`);
    }

    lines.push('\nTasks:');
    lines.push(state.mainListContent);

    lines.push(`\nStatus: ${state.statusBar}`);

    if (state.detailContent) {
      lines.push('\n--- Detail View ---');
      lines.push(state.detailContent);
    }

    return lines.join('\n');
  }

  /**
   * Render state as JSON
   */
  renderAsJSON(state: UIState): string {
    const json = {
      mode: state.mode,
      currentList: state.currentList,
      selectedIndex: state.selectedIndex,
      selectedTask: state.selectedTask ? {
        id: state.selectedTask.id,
        title: state.selectedTask.title,
        status: state.selectedTask.status
      } : null,
      taskCount: state.visibleTasks.length,
      filters: state.filterState,
      statusBar: state.statusBar
    };
    return JSON.stringify(json, null, 2);
  }

  /**
   * Compare two states and return differences
   */
  diff(before: UIState, after: UIState): Record<string, any> {
    const changes: Record<string, any> = {};

    if (before.mode !== after.mode) {
      changes.mode = { before: before.mode, after: after.mode };
    }
    if (before.selectedIndex !== after.selectedIndex) {
      changes.selectedIndex = { before: before.selectedIndex, after: after.selectedIndex };
    }
    if (before.visibleTasks.length !== after.visibleTasks.length) {
      changes.taskCount = { before: before.visibleTasks.length, after: after.visibleTasks.length };
    }
    if (before.selectedTask?.id !== after.selectedTask?.id) {
      changes.selectedTask = {
        before: before.selectedTask?.title,
        after: after.selectedTask?.title
      };
    }
    if (before.currentList !== after.currentList) {
      changes.currentList = { before: before.currentList, after: after.currentList };
    }

    return changes;
  }
}
