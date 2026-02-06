
// Reporting functionality for TaskFlow dashboard

/**
 * Generate a CSV from data
 * @param {Array<Object>} data - Array of objects to convert to CSV
 * @param {Array<Object>} headers - Array of column headers { key, label }
 * @returns {string} CSV content
 */
function generateCSV(data, headers) {
  if (!data || !data.length) return '';

  const headerRow = headers.map(h => `"${h.label}"`).join(',');

  const rows = data.map(item => headers.map(header => {
    const value = item[header.key];
    if (value === null || value === undefined) {
      return '""';
    } else if (typeof value === 'string') {
      return `"${value.replace(/"/g, '""')}"`;
    } else if (typeof value === 'object' && value instanceof Date) {
      return `"${value.toISOString()}"`;
    }
    return `"${value}"`;
  }).join(','));

  return [headerRow, ...rows].join('\n');
}

/**
 * Download data as a CSV file
 * @param {string} filename - Name for the download file
 * @param {string} csvContent - CSV content to download
 */
function downloadCSV(filename, csvContent) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.display = 'none';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Generate a task list report
 * @param {Array<Object>} tasks - Task data
 * @returns {string} CSV content
 */
function generateTaskReport(tasks) {
  const headers = [
    { key: 'id', label: 'Task ID' },
    { key: 'title', label: 'Title' },
    { key: 'status', label: 'Status' },
    { key: 'ai_level', label: 'AI Level' },
    { key: 'template', label: 'Template' },
    { key: 'created_at', label: 'Created' },
    { key: 'updated_at', label: 'Updated' },
    { key: 'completed_at', label: 'Completed' },
    { key: 'human_intervention', label: 'Human Intervention' }
  ];

  return generateCSV(tasks, headers);
}

/**
 * Generate a template performance report
 * @param {Object} templatePerformance - Template performance data
 * @returns {string} CSV content
 */
function generateTemplateReport(templatePerformance) {
  const data = Object.entries(templatePerformance).map(([template, stats]) => ({
    template,
    total: stats.total,
    completed: stats.completed,
    completion_rate: stats.completion_rate,
    interventions: stats.interventions,
    intervention_rate: stats.intervention_rate,
    avg_time: stats.avg_time
  }));

  const headers = [
    { key: 'template', label: 'Template' },
    { key: 'total', label: 'Total Tasks' },
    { key: 'completed', label: 'Completed' },
    { key: 'completion_rate', label: 'Completion Rate (%)' },
    { key: 'interventions', label: 'Human Interventions' },
    { key: 'intervention_rate', label: 'Intervention Rate (%)' },
    { key: 'avg_time', label: 'Avg. Completion Time (hours)' }
  ];

  return generateCSV(data, headers);
}

/**
 * Generate an AI performance report
 * @param {Object} aiPerformance - AI level performance data
 * @returns {string} CSV content
 */
function generateAIReport(aiPerformance) {
  const data = Object.entries(aiPerformance).map(([level, stats]) => ({
    ai_level: level,
    total: stats.total,
    completed: stats.completed,
    completion_rate: stats.completion_rate,
    interventions: stats.interventions,
    intervention_rate: stats.intervention_rate,
    avg_time: stats.avg_time
  }));

  const headers = [
    { key: 'ai_level', label: 'AI Level' },
    { key: 'total', label: 'Total Tasks' },
    { key: 'completed', label: 'Completed' },
    { key: 'completion_rate', label: 'Completion Rate (%)' },
    { key: 'interventions', label: 'Human Interventions' },
    { key: 'intervention_rate', label: 'Intervention Rate (%)' },
    { key: 'avg_time', label: 'Avg. Completion Time (hours)' }
  ];

  return generateCSV(data, headers);
}

/**
 * Generate a metrics summary report
 * @param {Object} metrics - Analytics metrics
 * @returns {string} CSV content
 */
function generateMetricsSummaryReport(metrics) {
  const data = [{
    total_tasks: metrics.counts.total,
    completed_tasks: metrics.counts.completed,
    pending_tasks: metrics.counts.pending,
    in_progress_tasks: metrics.counts.inProgress,
    failed_tasks: metrics.counts.failed,
    completion_rate: metrics.completion,
    intervention_rate: metrics.interventionRate,
    avg_time_to_completion: metrics.timeToCompletion?.average || 0,
    l4_tasks: metrics.aiDistribution.L4,
    l5_tasks: metrics.aiDistribution.L5,
    human_tasks: metrics.aiDistribution.human,
    report_date: new Date().toISOString()
  }];

  const headers = [
    { key: 'report_date', label: 'Report Date' },
    { key: 'total_tasks', label: 'Total Tasks' },
    { key: 'completed_tasks', label: 'Completed Tasks' },
    { key: 'pending_tasks', label: 'Pending Tasks' },
    { key: 'in_progress_tasks', label: 'In Progress Tasks' },
    { key: 'failed_tasks', label: 'Failed Tasks' },
    { key: 'completion_rate', label: 'Completion Rate (%)' },
    { key: 'intervention_rate', label: 'Intervention Rate (%)' },
    { key: 'avg_time_to_completion', label: 'Avg. Time to Completion (hours)' },
    { key: 'l4_tasks', label: 'Claude Code (L4) Tasks' },
    { key: 'l5_tasks', label: 'Codex (L5) Tasks' },
    { key: 'human_tasks', label: 'Human Tasks' }
  ];

  return generateCSV(data, headers);
}

/**
 * Generate a PDF report (placeholder implementation)
 * @param {string} title - Report title
 * @param {Object} metrics - Analytics metrics
 * @returns {Promise<Blob>} PDF blob
 */
async function generatePDFReport(title, metrics) {
  alert('PDF generation would be implemented here using a PDF library.');

  const reportHTML = `
    <html>
    <head>
      <title>${title}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 30px; }
        h1 { color: #333; }
        .metrics-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .metrics-table th, .metrics-table td { border: 1px solid #ddd; padding: 8px; }
        .metrics-table th { background-color: #f2f2f2; }
      </style>
    </head>
    <body>
      <h1>${title}</h1>
      <p>Report generated on ${new Date().toLocaleString()}</p>

      <h2>Task Summary</h2>
      <table class="metrics-table">
        <tr><th>Metric</th><th>Value</th></tr>
        <tr><td>Total Tasks</td><td>${metrics.counts.total}</td></tr>
        <tr><td>Completed Tasks</td><td>${metrics.counts.completed}</td></tr>
        <tr><td>Completion Rate</td><td>${metrics.completion}%</td></tr>
        <tr><td>Human Intervention Rate</td><td>${metrics.interventionRate}%</td></tr>
        <tr><td>Avg. Time to Completion</td><td>${metrics.timeToCompletion?.average || 0} hours</td></tr>
      </table>

      <h2>AI Level Distribution</h2>
      <table class="metrics-table">
        <tr><th>AI Level</th><th>Tasks</th></tr>
        <tr><td>Claude Code (L4)</td><td>${metrics.aiDistribution.L4}</td></tr>
        <tr><td>Codex (L5)</td><td>${metrics.aiDistribution.L5}</td></tr>
        <tr><td>Human</td><td>${metrics.aiDistribution.human}</td></tr>
      </table>
    </body>
    </html>`;

  const blob = new Blob([reportHTML], { type: 'text/html' });
  return blob;
}

/**
 * Schedule automatic report generation
 * @param {string} reportType - Type of report to generate
 * @param {string} frequency - How often to generate
 * @param {Function|null} callback - Callback for generated report
 */
function scheduleReport(reportType, frequency, callback) {
  const schedules = JSON.parse(localStorage.getItem('reportSchedules') || '[]');
  schedules.push({
    reportType,
    frequency,
    lastRun: null,
    nextRun: calculateNextRunDate(frequency)
  });
  localStorage.setItem('reportSchedules', JSON.stringify(schedules));
  alert(`${reportType} report scheduled ${frequency}. In a real implementation, this would run server-side.`);
}

/**
 * Calculate the next run date for a scheduled report
 * @param {string} frequency - How often to generate
 * @returns {string} ISO date string
 */
function calculateNextRunDate(frequency) {
  const now = new Date();
  const nextRun = new Date(now);
  switch (frequency) {
    case 'daily':
      nextRun.setDate(now.getDate() + 1);
      nextRun.setHours(0, 0, 0, 0);
      break;
    case 'weekly':
      nextRun.setDate(now.getDate() + (7 - now.getDay()));
      nextRun.setHours(0, 0, 0, 0);
      break;
    case 'monthly':
      nextRun.setMonth(now.getMonth() + 1);
      nextRun.setDate(1);
      nextRun.setHours(0, 0, 0, 0);
      break;
  }
  return nextRun.toISOString();
}

/**
 * Set up the reporting UI components
 */
function setupReportingUI() {
  const container = document.getElementById('reports-container');
  if (!container) return;

  container.innerHTML = `
    <div class="reports-section">
      <h2>Generate Reports</h2>

      <div class="report-options">
        <div class="report-option">
          <h3>Task Reports</h3>
          <button id="task-csv-report" class="btn">Task List CSV</button>
          <button id="task-pdf-report" class="btn">Task Summary PDF</button>
        </div>

        <div class="report-option">
          <h3>Performance Reports</h3>
          <button id="template-report" class="btn">Template Performance</button>
          <button id="ai-report" class="btn">AI Level Performance</button>
        </div>

        <div class="report-option">
          <h3>Metrics Summary</h3>
          <button id="metrics-report" class="btn">Metrics CSV</button>
          <button id="full-pdf-report" class="btn">Complete PDF Report</button>
        </div>
      </div>

      <div class="schedule-report">
        <h3>Schedule Reports</h3>
        <select id="schedule-report-type">
          <option value="task-list">Task List</option>
          <option value="metrics-summary">Metrics Summary</option>
          <option value="ai-performance">AI Performance</option>
        </select>

        <select id="schedule-frequency">
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>

        <button id="schedule-btn" class="btn">Schedule Report</button>
      </div>
    </div>`;

  document.getElementById('task-csv-report').addEventListener('click', () => {
    const tasks = window.dataManager.getTasks();
    const csv = generateTaskReport(tasks);
    downloadCSV('taskflow_tasks.csv', csv);
  });

  document.getElementById('template-report').addEventListener('click', () => {
    const perf = window.analytics.getTemplatePerformance();
    const csv = generateTemplateReport(perf);
    downloadCSV('template_performance.csv', csv);
  });

  document.getElementById('ai-report').addEventListener('click', () => {
    const perf = window.analytics.getPerformanceByAILevel();
    const csv = generateAIReport(perf);
    downloadCSV('ai_performance.csv', csv);
  });

  document.getElementById('metrics-report').addEventListener('click', () => {
    const metrics = window.analytics.metrics;
    const csv = generateMetricsSummaryReport(metrics);
    downloadCSV('taskflow_metrics.csv', csv);
  });

  document.getElementById('task-pdf-report').addEventListener('click', async () => {
    const blob = await generatePDFReport('TaskFlow Task Report', window.analytics.metrics);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'taskflow_task_report.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });

  document.getElementById('full-pdf-report').addEventListener('click', async () => {
    const blob = await generatePDFReport('TaskFlow Complete Report', window.analytics.metrics);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'taskflow_complete_report.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });

  document.getElementById('schedule-btn').addEventListener('click', () => {
    const reportType = document.getElementById('schedule-report-type').value;
    const freq = document.getElementById('schedule-frequency').value;
    scheduleReport(reportType, freq, null);
  });
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    generateCSV,
    downloadCSV,
    generateTaskReport,
    generateTemplateReport,
    generateAIReport,
    generateMetricsSummaryReport,
    generatePDFReport,
    scheduleReport,
    setupReportingUI
  };
}

