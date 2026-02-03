import { execSync } from 'child_process';
import type { Task, Tag, DatabaseConnection, TaskWithTags } from './types.js';

export class ThingsDatabase {
  private isReady: boolean = true;
  private tagsCache: Tag[] = [];
  private taskTagsCache: Map<string, string[]> = new Map();

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
            'tags': []
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

      const output = execSync(`python3 -c "${script.replace(/"/g, '\\"')}"`, { 
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe']
      });
      
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
            'tags': []
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
