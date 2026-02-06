// dashboard/data_manager.js
/**
 * Data manager for TaskFlow dashboard
 * Handles loading and storing task data
 */
class TaskflowDataManager {
  constructor() {
    this.tasks = [];
    this.templates = [];
    this.isLoading = false;
    this.lastSync = null;
  }

  /**
   * Initialize data from localStorage or server
   */
  async init() {
    try {
      this.isLoading = true;
      // Try loading from localStorage first
      this._loadFromLocalStorage();
      // Then try to sync with server if available
      await this.syncWithServer();
      this.isLoading = false;
      return true;
    } catch (err) {
      console.error('Error initializing data:', err);
      this.isLoading = false;
      return false;
    }
  }

  /**
   * Load data from localStorage
   */
  _loadFromLocalStorage() {
    try {
      const tasksData = localStorage.getItem('taskflow_tasks');
      const templatesData = localStorage.getItem('taskflow_templates');
      if (tasksData) {
        this.tasks = JSON.parse(tasksData);
      }
      if (templatesData) {
        this.templates = JSON.parse(templatesData);
      }
      const lastSync = localStorage.getItem('taskflow_last_sync');
      if (lastSync) {
        this.lastSync = new Date(lastSync);
      }
    } catch (err) {
      console.error('Error loading from localStorage:', err);
    }
  }

  /**
   * Save data to localStorage
   */
  _saveToLocalStorage() {
    try {
      localStorage.setItem('taskflow_tasks', JSON.stringify(this.tasks));
      localStorage.setItem('taskflow_templates', JSON.stringify(this.templates));
      localStorage.setItem('taskflow_last_sync', new Date().toISOString());
    } catch (err) {
      console.error('Error saving to localStorage:', err);
    }
  }

  /**
   * Sync data with server if available
   */
  async syncWithServer() {
    try {
      // Check if API is available
      const response = await fetch('/api/tasks', {
        method: 'HEAD',
        headers: { 'Accept': 'application/json' }
      });
      if (response.ok) {
      await this._fetchTasksFromServer();
      await this._fetchTemplatesFromServer();
      this.lastSync = new Date();
      await this._fetchSyncTimestamp();
      this._saveToLocalStorage();
        return true;
      }
      return false;
    } catch (err) {
      console.log('Using local data (server sync failed):', err);
      return false;
    }
  }

  /**
   * Fetch tasks from server API
   */
  async _fetchTasksFromServer() {
    const response = await fetch('/api/tasks');
    if (response.ok) {
      const data = await response.json();
      this.tasks = data.tasks || [];
    } else {
      throw new Error(`Failed to fetch tasks: ${response.status}`);
    }
  }

  /**
   * Fetch templates from server API
   */
  async _fetchTemplatesFromServer() {
    const response = await fetch('/api/templates');
    if (response.ok) {
      const data = await response.json();
      this.templates = data.templates || [];
    } else {
      throw new Error(`Failed to fetch templates: ${response.status}`);
    }
  }

  /**
   * Fetch last sync timestamp from server
   */
  async _fetchSyncTimestamp() {
    try {
      const resp = await fetch('/sync.log');
      if (resp.ok) {
        const text = await resp.text();
        const lines = text.trim().split(/\n/);
        const last = lines[lines.length - 1];
        this.lastSync = new Date(last);
      }
    } catch (err) {
      console.log('Failed to fetch sync log:', err);
    }
  }

  /**
   * Add a new task
   */
  addTask(task) {
    // Generate ID if not provided
    if (!task.id) {
      task.id = `task-${Date.now()}`;
    }
    // Set created timestamp
    if (!task.created_at) {
      task.created_at = new Date().toISOString();
    }
    this.tasks.push(task);
    this._saveToLocalStorage();
    this._syncTaskToServer(task);
    return task;
  }

  /**
   * Update an existing task
   */
  updateTask(taskId, updates) {
    const index = this.tasks.findIndex(t => t.id === taskId);
    if (index === -1) return null;
    // Update task
    this.tasks[index] = { ...this.tasks[index], ...updates };
    // Set updated timestamp
    this.tasks[index].updated_at = new Date().toISOString();
    // Set completed timestamp if status was changed to completed
    if (updates.status === 'completed' || updates.status === 'done') {
      this.tasks[index].completed_at = new Date().toISOString();
    }
    this._saveToLocalStorage();
    this._syncTaskToServer(this.tasks[index]);
    return this.tasks[index];
  }

  /**
   * Delete a task
   */
  deleteTask(taskId) {
    const index = this.tasks.findIndex(t => t.id === taskId);
    if (index === -1) return false;
    this.tasks.splice(index, 1);
    this._saveToLocalStorage();
    this._deleteTaskFromServer(taskId);
    return true;
  }

  /**
   * Sync task to server if API is available
   */
  async _syncTaskToServer(task) {
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task)
      });
      return response.ok;
    } catch (err) {
      console.log('Task will sync later (offline):', err);
      return false;
    }
  }

  /**
   * Delete task from server if API is available
   */
  async _deleteTaskFromServer(taskId) {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE'
      });
      return response.ok;
    } catch (err) {
      console.log('Task will be deleted later (offline):', err);
      return false;
    }
  }

  /**
   * Get all tasks
   */
  getTasks() {
    return [...this.tasks];
  }

  /**
   * Get a specific task by ID
   */
  getTask(taskId) {
    return this.tasks.find(t => t.id === taskId);
  }

  /**
   * Filter tasks by criteria
   */
  filterTasks(criteria = {}) {
    return this.tasks.filter(task => {
      // Match each criteria field
      return Object.entries(criteria).every(([key, value]) => {
        // Skip undefined or null criteria
        if (value === undefined || value === null) return true;
        // Match array criteria (any match)
        if (Array.isArray(value)) {
          return value.includes(task[key]);
        }
        // Match string with case-insensitive partial match
        if (typeof value === 'string' && typeof task[key] === 'string') {
          return task[key].toLowerCase().includes(value.toLowerCase());
        }
        // Exact match for everything else
        return task[key] === value;
      });
    });
  }

  /**
   * Return the last synchronization timestamp
   */
  getLastSync() {
    return this.lastSync;
  }
}

// Export for both browser and Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TaskflowDataManager;
} else {
  window.TaskflowDataManager = TaskflowDataManager;
}
