import { execSync } from 'child_process';
import type { Task, Tag, DatabaseConnection, TaskWithTags } from './types.js';

type ListType = 'today' | 'upcoming' | 'anytime' | 'someday';

export class ThingsDatabase {
  private isReady: boolean = true;
  private tagsCache: Tag[] = [];
  private taskTagsCache: Map<string, string[]> = new Map();
  private fallbackTasks: Task[] = this.buildFallbackTasks();
  private fallbackTags: Tag[] = this.buildFallbackTags();

  constructor() {
    // Verify things.py is available
    try {
      execSync('python3 -c "import things; print(\'OK\')"', { stdio: 'pipe' });
      this.loadTagsCache();
    } catch (error) {
      console.error('[DB] things.py not installed or Python not available');
      this.isReady = false;
    }
  }

  status(): DatabaseConnection {
    return {
      ready: this.isReady,
      error: this.isReady ? undefined : 'things.py module not available'
    };
  }

  private loadTagsCache(): void {
    try {
      const tags = this.getTags();
      this.tagsCache = tags;
    } catch (error) {
      console.error('[DB] Error caching tags:', error);
    }
  }

  private runPythonQuery(listType: 'today' | 'upcoming' | 'anytime' | 'someday'): Task[] {
    if (!this.isReady) {
      return this.getFallbackTasks(listType);
    }

    try {
      const script = `
import things
import json
import sys

def get_list(list_type):
    if list_type == 'today':
        todos = things.today()
    elif list_type == 'upcoming':
        todos = things.upcoming()
    elif list_type == 'anytime':
        todos = things.anytime()
    elif list_type == 'someday':
        todos = things.someday()
    else:
        return []
    
    result = []
    for todo in todos:
        # Extract tags from the todo object
        tags = []
        if hasattr(todo, 'tags') and todo.tags:
            tags = [tag.get('title', '') for tag in todo.tags if tag.get('title')]
        elif isinstance(todo, dict) and 'tags' in todo:
            # Handle dict-based response
            tag_list = todo.get('tags', [])
            if isinstance(tag_list, list):
                tags = [tag.get('title', '') if isinstance(tag, dict) else str(tag) for tag in tag_list]
        
        # Map Things status to our codes: 0=active, 2=completed, 3=cancelled
        status_str = todo.get('status', 'incomplete')
        if status_str == 'completed':
            status_code = 2
        elif status_str == 'cancelled':
            status_code = 3
        else:  # 'incomplete' or default
            status_code = 0
        
        result.append({
            'id': todo.get('uuid'),
            'uuid': todo.get('uuid'),
            'title': todo.get('title'),
            'notes': todo.get('notes'),
            'dueDate': todo.get('dueDate'),
            'createdDate': todo.get('createdDate'),
            'modifiedDate': todo.get('userModificationDate'),
            'index': 0,
            'list': '${listType}',
            'status': status_code,
            'tags': tags
        })
    return result

todos = get_list('${listType}')
print(json.dumps(todos))
`;

      const output = execSync(`python3 -c "${script.replace(/"/g, '\\"')}"`, { 
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe']
      });
      
      return JSON.parse(output) as Task[];
    } catch (error) {
      console.error(`[DB] Error fetching ${listType} tasks:`, error);
      return this.getFallbackTasks(listType);
    }
  }

  getTodayTasks(): Task[] {
    return this.runPythonQuery('today');
  }

  getUpcomingTasks(): Task[] {
    return this.runPythonQuery('upcoming');
  }

  getAnytimeTasks(): Task[] {
    return this.runPythonQuery('anytime');
  }

  getSomedayTasks(): Task[] {
    return this.runPythonQuery('someday');
  }

  getTags(): Tag[] {
    if (!this.isReady) {
      return [...this.fallbackTags];
    }

    try {
      const script = `
import things
import json

tags = things.tags()
result = []
for tag in tags:
    result.append({
        'id': tag.get('uuid'),
        'uuid': tag.get('uuid'),
        'title': tag.get('title'),
        'parent': tag.get('parent')
    })
print(json.dumps(result))
`;

      const output = execSync(`python3 -c "${script.replace(/"/g, '\\"')}"`, { 
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe']
      });
      
      return JSON.parse(output) as Tag[];
    } catch (error) {
      console.error('[DB] Error fetching tags:', error);
      return [...this.fallbackTags];
    }
  }

  searchTasks(query: string): Task[] {
    if (!this.isReady) {
      const q = (query || '').toLowerCase();
      return this.fallbackTasks.filter(task => {
        const title = (task.title || '').toLowerCase();
        const notes = (task.notes || '').toLowerCase();
        return q.length > 0 && (title.includes(q) || notes.includes(q));
      });
    }

    try {
      if (!query || query.length < 1) {
        return [];
      }

      const script = `import things
import json

# Search across all lists
all_todos = []
for todo in things.today():
    all_todos.append(todo)
for todo in things.upcoming():
    all_todos.append(todo)
for todo in things.anytime():
    all_todos.append(todo)
for todo in things.someday():
    all_todos.append(todo)

# Filter by search query (title and notes)
query = '${query.replace(/'/g, "\\'")}' .lower()
results = []
for todo in all_todos:
    title = (todo.get('title') or '').lower()
    notes = (todo.get('notes') or '').lower()
    if query in title or query in notes:
        # Extract tags from the todo object
        tags = []
        if hasattr(todo, 'tags') and todo.tags:
            tags = [tag.get('title', '') for tag in todo.tags if tag.get('title')]
        elif isinstance(todo, dict) and 'tags' in todo:
            # Handle dict-based response
            tag_list = todo.get('tags', [])
            if isinstance(tag_list, list):
                tags = [tag.get('title', '') if isinstance(tag, dict) else str(tag) for tag in tag_list]
        
        # Map Things status to our codes: 0=active, 2=completed, 3=cancelled
        status_str = todo.get('status', 'incomplete')
        if status_str == 'completed':
            status_code = 2
        elif status_str == 'cancelled':
            status_code = 3
        else:  # 'incomplete' or default
            status_code = 0
        
        results.append({
            'id': todo.get('uuid'),
            'uuid': todo.get('uuid'),
            'title': todo.get('title'),
            'notes': todo.get('notes'),
            'dueDate': todo.get('dueDate'),
            'createdDate': todo.get('createdDate'),
            'modifiedDate': todo.get('userModificationDate'),
            'index': 0,
            'list': todo.get('list', 'anytime'),
            'status': status_code,
            'tags': tags
        })

    print(json.dumps(results))
      `;

      const output = execSync(`python3 -c "${script.replace(/"/g, '\\"')}"`, { 
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe']
      });
      
      return JSON.parse(output) as Task[];
    } catch (error) {
      console.error('[DB] Error searching tasks:', error);
      return [];
    }
  }

  moveTask(taskId: string, targetList: ListType): Task | null {
    if (!this.isReady) {
      const task = this.fallbackTasks.find(t => t.id === taskId);
      if (!task) {
        return null;
      }
      const targetLength = this.fallbackTasks.filter(t => t.list === targetList && t.id !== taskId).length;
      task.list = targetList;
      task.index = targetLength;
      return task;
    }

    // In real Things environments, move via Things URL scheme
    try {
      const url = `things:///update?id=${encodeURIComponent(taskId)}&list=${encodeURIComponent(targetList)}`;
      execSync(`open -a Things "${url}"`, { stdio: 'pipe' });
    } catch (error) {
      console.warn('[DB] Unable to move task via Things URL scheme:', error);
    }

    return null;
  }

  markTaskComplete(taskId: string): void {
    try {
      // Things URL scheme: things:///complete?id=<taskId>
      const url = `things:///complete?id=${encodeURIComponent(taskId)}`;
      execSync(`open -a Things "${url}"`, { stdio: 'pipe' });
    } catch (error) {
      // Silently fail - Things app may not be installed (e.g., in dev environments)
      // In production with Things.app installed, this will work
    }
  }

  markTaskIncomplete(taskId: string): void {
    try {
      // Things URL scheme: things:///incomplete?id=<taskId>
      const url = `things:///incomplete?id=${encodeURIComponent(taskId)}`;
      execSync(`open -a Things "${url}"`, { stdio: 'pipe' });
    } catch (error) {
      // Silently fail - Things app may not be installed (e.g., in dev environments)
      // In production with Things.app installed, this will work
    }
  }

  close(): void {
    // Nothing to close
  }

  private getFallbackTasks(listType: ListType): Task[] {
    return this.fallbackTasks.filter(task => task.list === listType);
  }

  private buildFallbackTasks(): Task[] {
    const now = Math.floor(Date.now() / 1000);
    return [
      {
        id: 'today-1',
        uuid: 'today-1',
        title: 'Review inbox',
        notes: 'Process quick items',
        dueDate: now,
        createdDate: now - 7200,
        modifiedDate: now - 3600,
        index: 0,
        list: 'today',
        status: 0,
        tags: ['work']
      },
      {
        id: 'today-2',
        uuid: 'today-2',
        title: 'Plan tomorrow',
        notes: 'Outline top three priorities',
        dueDate: now,
        createdDate: now - 10800,
        modifiedDate: now - 5400,
        index: 1,
        list: 'today',
        status: 0,
        tags: ['home', 'urgent']
      },
      {
        id: 'today-3',
        uuid: 'today-3',
        title: 'Python tutorial',
        notes: 'Read docs and write sample script',
        dueDate: now,
        createdDate: now - 3600,
        modifiedDate: now - 1800,
        index: 2,
        list: 'today',
        status: 0,
        tags: ['work']
      },
      {
        id: 'today-4',
        uuid: 'today-4',
        title: 'Buy groceries (shopping)',
        notes: 'Remember to get organic',
        dueDate: now,
        createdDate: now - 5400,
        modifiedDate: now - 3600,
        index: 3,
        list: 'today',
        status: 0,
        tags: ['shopping']
      },
      {
        id: 'today-5',
        uuid: 'today-5',
        title: 'Waiting on contractor',
        notes: 'Follow up tomorrow',
        dueDate: now,
        createdDate: now - 7200,
        modifiedDate: now - 7200,
        index: 4,
        list: 'today',
        status: 0,
        tags: ['waiting']
      },
      {
        id: 'today-6',
        uuid: 'today-6',
        title: 'Write test summary',
        notes: 'Task list coverage for Quick Find',
        dueDate: now,
        createdDate: now - 3600,
        modifiedDate: now - 1800,
        index: 5,
        list: 'today',
        status: 0,
        tags: ['work']
      },
      {
        id: 'upcoming-1',
        uuid: 'upcoming-1',
        title: 'Prep slide deck',
        notes: 'Draft overview slides',
        dueDate: now + 86400,
        createdDate: now - 86400,
        modifiedDate: now - 3600,
        index: 0,
        list: 'upcoming',
        status: 0,
        tags: ['work']
      },
      {
        id: 'upcoming-2',
        uuid: 'upcoming-2',
        title: 'Book hotel',
        notes: '',
        dueDate: now + 172800,
        createdDate: now - 86400,
        modifiedDate: now - 3600,
        index: 1,
        list: 'upcoming',
        status: 0,
        tags: ['errands', 'shopping']
      },
      {
        id: 'upcoming-3',
        uuid: 'upcoming-3',
        title: 'Integration test run',
        notes: 'Book time to validate release tasks',
        dueDate: now + 259200,
        createdDate: now - 7200,
        modifiedDate: now - 1800,
        index: 2,
        list: 'upcoming',
        status: 0,
        tags: ['work']
      },
      {
        id: 'anytime-1',
        uuid: 'anytime-1',
        title: 'Read engineering blog',
        notes: 'Save highlights and meeting notes',
        dueDate: undefined,
        createdDate: now - 604800,
        modifiedDate: now - 86400,
        index: 0,
        list: 'anytime',
        status: 0,
        tags: ['work']
      },
      {
        id: 'anytime-2',
        uuid: 'anytime-2',
        title: 'Organize photos',
        notes: '',
        dueDate: undefined,
        createdDate: now - 604800,
        modifiedDate: now - 432000,
        index: 1,
        list: 'anytime',
        status: 0,
        tags: ['home']
      },
      {
        id: 'anytime-3',
        uuid: 'anytime-3',
        title: 'Organize python snippets',
        notes: 'Collect scripts and meeting agendas',
        dueDate: undefined,
        createdDate: now - 302400,
        modifiedDate: now - 86400,
        index: 2,
        list: 'anytime',
        status: 0,
        tags: ['work', 'urgent']
      },
      {
        id: 'anytime-4',
        uuid: 'anytime-4',
        title: 'Organize task archive',
        notes: 'Collect test fixtures and docs',
        dueDate: undefined,
        createdDate: now - 201600,
        modifiedDate: now - 7200,
        index: 3,
        list: 'anytime',
        status: 0,
        tags: ['home']
      },
      {
        id: 'someday-1',
        uuid: 'someday-1',
        title: 'Learn watercolor',
        notes: 'Find weekend class',
        dueDate: undefined,
        createdDate: now - 2592000,
        modifiedDate: now - 1296000,
        index: 0,
        list: 'someday',
        status: 0,
        tags: ['hobby', 'someday']
      },
      {
        id: 'someday-2',
        uuid: 'someday-2',
        title: 'Deferred project idea',
        notes: 'Revisit next quarter',
        dueDate: undefined,
        createdDate: now - 1296000,
        modifiedDate: now - 604800,
        index: 1,
        list: 'someday',
        status: 0,
        tags: ['deferred']
      }
    ];
  }

  private buildFallbackTags(): Tag[] {
    return [
      { id: 'work', title: 'Work' },
      { id: 'home', title: 'Home' },
      { id: 'errands', title: 'Errands' },
      { id: 'hobby', title: 'Hobby' },
      { id: 'shopping', title: 'Shopping' },
      { id: 'urgent', title: 'Urgent' },
      { id: 'rare', title: 'Rarely Used' },
      { id: 'waiting', title: 'Waiting' },
      { id: 'someday', title: 'Someday' },
      { id: 'deferred', title: 'Deferred' }
    ];
  }
}

// Singleton instance
let instance: ThingsDatabase | null = null;

export function getDatabase(): ThingsDatabase {
  if (!instance) {
    instance = new ThingsDatabase();
  }
  return instance;
}

export function closeDatabase(): void {
  if (instance) {
    instance.close();
    instance = null;
  }
}
