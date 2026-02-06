import { execFileSync } from 'child_process';
import type { Task, Tag, DatabaseConnection, TaskWithTags } from './types.js';

export class ThingsDatabase {
  private isReady: boolean = true;
  private tagsCache: Tag[] = [];
  private taskTagsCache: Map<string, string[]> = new Map();

  constructor() {
    // Verify things.py is available
    try {
      this.runPython("import things\nprint('OK')");
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

  private mapTagsToIds(raw: string[] | undefined): string[] {
    if (!raw || raw.length === 0) return [];
    if (this.tagsCache.length === 0) {
      this.loadTagsCache();
    }
    const byId = new Set(this.tagsCache.map(t => t.id).filter(Boolean));
    const titleCounts = new Map<string, number>();
    for (const t of this.tagsCache) {
      if (t.title) {
        titleCounts.set(t.title, (titleCounts.get(t.title) || 0) + 1);
      }
    }
    // Only map unique titles to avoid collapsing duplicate titles across parents.
    const uniqueTitleToId = new Map(
      this.tagsCache
        .filter(t => t.title && t.id && titleCounts.get(t.title) === 1)
        .map(t => [t.title as string, t.id as string]),
    );
    const normalized: string[] = [];
    for (const tag of raw) {
      if (!tag) continue;
      if (byId.has(tag)) {
        normalized.push(tag);
        continue;
      }
      const mapped = uniqueTitleToId.get(tag);
      normalized.push(mapped ?? tag);
    }
    return normalized;
  }

  private runPython(script: string): string {
    return execFileSync('python3', ['-c', script], {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe']
    });
  }

  private runPythonQuery(listType: 'today' | 'upcoming' | 'anytime' | 'someday'): Task[] {
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
            'status': 0,
            'tags': todo.get('tags', [])
        })
    return result

todos = get_list('${listType}')
print(json.dumps(todos))
`;

      const output = this.runPython(script);
      
      const tasks = JSON.parse(output) as Task[];
      return tasks.map(task => ({
        ...task,
        tags: this.mapTagsToIds(task.tags)
      }));
    } catch (error) {
      console.error(`[DB] Error fetching ${listType} tasks:`, error);
      return [];
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

      const output = this.runPython(script);
      
      return JSON.parse(output) as Tag[];
    } catch (error) {
      console.error('[DB] Error fetching tags:', error);
      return [];
    }
  }

  searchTasks(query: string): Task[] {
    try {
      if (!query || query.length < 1) {
        return [];
      }

      const script = `
import things
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
            'status': 0,
            'tags': todo.get('tags', [])
        })

print(json.dumps(results))
`;

      const output = this.runPython(script);
      
      const tasks = JSON.parse(output) as Task[];
      return tasks.map(task => ({
        ...task,
        tags: this.mapTagsToIds(task.tags)
      }));
    } catch (error) {
      console.error('[DB] Error searching tasks:', error);
      return [];
    }
  }

  close(): void {
    // Nothing to close
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
