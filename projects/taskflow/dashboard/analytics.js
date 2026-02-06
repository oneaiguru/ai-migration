// dashboard/analytics.js
/**
 * Analytics module for TaskFlow dashboard
 * Processes task data and generates metrics
 */
class TaskflowAnalytics {
  constructor(tasks = []) {
    this.tasks = tasks;
    this.metrics = {};
    this.calculate();
  }

  /**
   * Calculate all metrics from tasks
   */
  calculate() {
    this.metrics = {
      counts: this._calculateCounts(),
      completion: this._calculateCompletionRate(),
      aiDistribution: this._calculateAIDistribution(),
      timeToCompletion: this._calculateTimeToCompletion(),
      interventionRate: this._calculateInterventionRate(),
      taskCategories: this._calculateTaskCategories(),
      templateUsage: this._calculateTemplateUsage(),
      trend: this._calculateTrend()
    };
    return this.metrics;
  }

  /**
   * Calculate basic task counts
   */
  _calculateCounts() {
    const total = this.tasks.length;
    const pending = this.tasks.filter(t => t.status === 'pending').length;
    const inProgress = this.tasks.filter(t => t.status === 'in progress').length;
    const completed = this.tasks.filter(t => t.status === 'completed' || t.status === 'done').length;
    const failed = this.tasks.filter(t => t.status === 'failed').length;
    return { total, pending, inProgress, completed, failed };
  }

  /**
   * Calculate task completion rate
   */
  _calculateCompletionRate() {
    const { total, completed } = this.metrics.counts || this._calculateCounts();
    return total ? Math.round((completed / total) * 100) : 0;
  }

  /**
   * Calculate AI level distribution
   */
  _calculateAIDistribution() {
    const levels = { L4: 0, L5: 0, human: 0, unknown: 0 };
    this.tasks.forEach(task => {
      if (task.ai_level === 'L4') levels.L4++;
      else if (task.ai_level === 'L5') levels.L5++;
      else if (task.ai_level === 'human') levels.human++;
      else levels.unknown++;
    });
    return levels;
  }

  /**
   * Calculate average time to completion
   */
  _calculateTimeToCompletion() {
    const completedTasks = this.tasks.filter(t =>
      (t.status === 'completed' || t.status === 'done') &&
      t.created_at && t.completed_at
    );
    if (!completedTasks.length) return { average: 0, min: 0, max: 0 };
    const durations = completedTasks.map(task => {
      const created = new Date(task.created_at);
      const completed = new Date(task.completed_at);
      return (completed - created) / (1000 * 60 * 60); // hours
    });
    const average = durations.reduce((sum, val) => sum + val, 0) / durations.length;
    return {
      average: Math.round(average * 10) / 10, // 1 decimal place
      min: Math.round(Math.min(...durations) * 10) / 10,
      max: Math.round(Math.max(...durations) * 10) / 10
    };
  }

  /**
   * Calculate human intervention rate
   */
  _calculateInterventionRate() {
    const humanInterventions = this.tasks.filter(t => t.human_intervention).length;
    return this.tasks.length ?
      Math.round((humanInterventions / this.tasks.length) * 100) : 0;
  }

  /**
   * Calculate task categories distribution
   */
  _calculateTaskCategories() {
    const categories = {};
    this.tasks.forEach(task => {
      if (task.category) {
        categories[task.category] = (categories[task.category] || 0) + 1;
      }
    });
    return categories;
  }

  /**
   * Calculate template usage statistics
   */
  _calculateTemplateUsage() {
    const templates = {};
    this.tasks.forEach(task => {
      if (task.template) {
        templates[task.template] = (templates[task.template] || 0) + 1;
      }
    });
    return templates;
  }

  /**
   * Calculate task creation/completion trend
   */
  _calculateTrend() {
    const dates = {};
    const now = new Date();
    // Initialize last 14 days
    for (let i = 13; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      dates[dateStr] = { created: 0, completed: 0 };
    }
    // Count tasks by date
    this.tasks.forEach(task => {
      if (task.created_at) {
        const dateStr = task.created_at.split('T')[0];
        if (dates[dateStr]) {
          dates[dateStr].created++;
        }
      }
      if (task.completed_at) {
        const dateStr = task.completed_at.split('T')[0];
        if (dates[dateStr]) {
          dates[dateStr].completed++;
        }
      }
    });
    // Convert to arrays for charting
    return {
      dates: Object.keys(dates),
      created: Object.values(dates).map(d => d.created),
      completed: Object.values(dates).map(d => d.completed)
    };
  }

  /**
   * Get task performance by AI level
   */
  getPerformanceByAILevel() {
    const levels = { L4: {}, L5: {} };
    ['L4', 'L5'].forEach(level => {
      const levelTasks = this.tasks.filter(t => t.ai_level === level);
      const completed = levelTasks.filter(t =>
        t.status === 'completed' || t.status === 'done'
      ).length;
      const interventions = levelTasks.filter(t => t.human_intervention).length;
      levels[level] = {
        total: levelTasks.length,
        completed,
        completion_rate: levelTasks.length ?
          Math.round((completed / levelTasks.length) * 100) : 0,
        intervention_rate: levelTasks.length ?
          Math.round((interventions / levelTasks.length) * 100) : 0
      };
    });
    return levels;
  }

  /**
   * Get template performance metrics
   */
  getTemplatePerformance() {
    const templates = {};
    const templateTasks = this.tasks.filter(t => t.template);
    templateTasks.forEach(task => {
      const tpl = task.template;
      if (!templates[tpl]) {
        templates[tpl] = {
          total: 0,
          completed: 0,
          interventions: 0,
          avg_time: 0,
          times: []
        };
      }
      templates[tpl].total++;
      if (task.status === 'completed' || task.status === 'done') {
        templates[tpl].completed++;
      }
      if (task.human_intervention) {
        templates[tpl].interventions++;
      }
      if (task.created_at && task.completed_at) {
        const created = new Date(task.created_at);
        const completed = new Date(task.completed_at);
        const hours = (completed - created) / (1000 * 60 * 60);
        templates[tpl].times.push(hours);
      }
    });
    // Calculate averages
    Object.keys(templates).forEach(tpl => {
      const data = templates[tpl];
      data.completion_rate = data.total ?
        Math.round((data.completed / data.total) * 100) : 0;
      data.intervention_rate = data.total ?
        Math.round((data.interventions / data.total) * 100) : 0;
      if (data.times.length) {
        data.avg_time = Math.round(
          (data.times.reduce((sum, val) => sum + val, 0) / data.times.length) * 10
        ) / 10;
      }
      delete data.times;
    });
    return templates;
  }
}

// Export for both browser and Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TaskflowAnalytics;
} else {
  window.TaskflowAnalytics = TaskflowAnalytics;
}
