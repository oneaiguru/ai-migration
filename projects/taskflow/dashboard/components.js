// dashboard/components.js
/**
 * Dashboard visualization components
 */
function createCompletionChart(elementId, counts) {
  const ctx = document.getElementById(elementId).getContext('2d');
  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Completed', 'In Progress', 'Pending', 'Failed'],
      datasets: [{
        data: [counts.completed, counts.inProgress, counts.pending, counts.failed],
        backgroundColor: ['#4caf50', '#2196f3', '#ff9800', '#f44336'],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'bottom' },
        title: { display: true, text: 'Task Status Distribution', font: { size: 16 } },
        tooltip: {
          callbacks: {
            label: function(context) {
              const label = context.label;
              const value = context.raw;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = Math.round((value / total) * 100);
              return `${label}: ${value} (${percentage}%)`;
            }
          }
        }
      }
    }
  });
}

function createTrendChart(elementId, trendData) {
  const ctx = document.getElementById(elementId).getContext('2d');
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: trendData.dates,
      datasets: [
        {
          label: 'Tasks Created',
          data: trendData.created,
          borderColor: '#2196f3',
          backgroundColor: 'rgba(33, 150, 243, 0.1)',
          fill: true,
          tension: 0.3
        },
        {
          label: 'Tasks Completed',
          data: trendData.completed,
          borderColor: '#4caf50',
          backgroundColor: 'rgba(76, 175, 80, 0.1)',
          fill: true,
          tension: 0.3
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        x: { grid: { display: false }, ticks: { maxRotation: 45, minRotation: 45 } },
        y: { beginAtZero: true, ticks: { precision: 0 } }
      },
      plugins: {
        legend: { position: 'top' },
        title: { display: true, text: 'Task Creation & Completion Trend', font: { size: 16 } }
      }
    }
  });
}

function createAIDistributionChart(elementId, distribution) {
  const ctx = document.getElementById(elementId).getContext('2d');
  new Chart(ctx, {
    type: 'pie',
    data: {
      labels: ['Claude Code (L4)', 'Codex (L5)', 'Human', 'Unknown'],
      datasets: [{
        data: [distribution.L4, distribution.L5, distribution.human, distribution.unknown],
        backgroundColor: ['#673ab7', '#00bcd4', '#ff5722', '#9e9e9e'],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'bottom' },
        title: { display: true, text: 'AI Level Distribution', font: { size: 16 } }
      }
    }
  });
}

function createTemplateUsageChart(elementId, templateUsage) {
  const ctx = document.getElementById(elementId).getContext('2d');
  const templates = Object.entries(templateUsage).sort((a, b) => b[1] - a[1]).slice(0, 5);
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: templates.map(t => t[0]),
      datasets: [{
        label: 'Tasks',
        data: templates.map(t => t[1]),
        backgroundColor: '#ff9800',
        borderColor: '#f57c00',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
      plugins: {
        legend: { display: false },
        title: { display: true, text: 'Top Templates Usage', font: { size: 16 } }
      }
    }
  });
}

function createPerformanceChart(elementId, performance) {
  const ctx = document.getElementById(elementId).getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Completion Rate', 'Intervention Rate'],
      datasets: [
        {
          label: 'Claude Code (L4)',
          data: [performance.L4.completion_rate || 0, performance.L4.intervention_rate || 0],
          backgroundColor: '#673ab7',
          borderColor: '#512da8',
          borderWidth: 1
        },
        {
          label: 'Codex (L5)',
          data: [performance.L5.completion_rate || 0, performance.L5.intervention_rate || 0],
          backgroundColor: '#00bcd4',
          borderColor: '#0097a7',
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true, max: 100, title: { display: true, text: 'Percentage (%)' } }
      },
      plugins: {
        title: { display: true, text: 'AI Level Performance Comparison', font: { size: 16 } }
      }
    }
  });
}

function createTaskTable(elementId, tasks) {
  const tableEl = document.getElementById(elementId);
  tableEl.innerHTML = '';
  const sortedTasks = [...tasks].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
  const tableHTML = `
    <table class="task-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Title</th>
          <th>Status</th>
          <th>AI Level</th>
          <th>Created</th>
          <th>Updated</th>
        </tr>
      </thead>
      <tbody>
        ${sortedTasks.map(task => `
          <tr data-task-id="${task.id}" class="task-row status-${task.status}">
            <td>${task.id}</td>
            <td>${task.title || '-'}</td>
            <td><span class="status-badge status-${task.status}">${task.status}</span></td>
            <td>${task.ai_level || '-'}</td>
            <td>${formatDate(task.created_at)}</td>
            <td>${formatDate(task.updated_at)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
  tableEl.innerHTML = tableHTML;
  const rows = tableEl.querySelectorAll('.task-row');
  rows.forEach(row => {
    row.addEventListener('click', () => {
      const taskId = row.getAttribute('data-task-id');
      if (typeof showTaskDetails === 'function') {
        showTaskDetails(taskId);
      }
    });
  });
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function showTaskDetails(taskId) {
  const task = window.dataManager.getTask(taskId);
  if (!task) return;
  const modalContent = `
    <div class="task-details">
      <h2>${task.title || 'Task Details'}</h2>
      <div class="detail-row">
        <span class="detail-label">ID:</span>
        <span class="detail-value">${task.id}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Status:</span>
        <span class="detail-value status-badge status-${task.status}">${task.status}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">AI Level:</span>
        <span class="detail-value">${task.ai_level || '-'}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Template:</span>
        <span class="detail-value">${task.template || '-'}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Created:</span>
        <span class="detail-value">${formatDate(task.created_at)}</span>
      </div>
      ${task.completed_at ? `
        <div class="detail-row">
          <span class="detail-label">Completed:</span>
          <span class="detail-value">${formatDate(task.completed_at)}</span>
        </div>
      ` : ''}
      ${task.human_intervention ? `
        <div class="detail-row">
          <span class="detail-label">Human Intervention:</span>
          <span class="detail-value">Yes</span>
        </div>
      ` : ''}
      ${task.description ? `
        <div class="detail-section">
          <h3>Description</h3>
          <div class="description">${task.description}</div>
        </div>
      ` : ''}
      ${task.notes ? `
        <div class="detail-section">
          <h3>Notes</h3>
          <div class="notes">${task.notes}</div>
        </div>
      ` : ''}
      <div class="detail-actions">
        <button class="btn update-task" data-task-id="${task.id}">Update Status</button>
        <button class="btn delete-task" data-task-id="${task.id}">Delete Task</button>
      </div>
    </div>`;
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `<div class="modal-content"><span class="close-modal">&times;</span>${modalContent}</div>`;
  document.body.appendChild(modal);
  setTimeout(() => modal.classList.add('show'), 10);
  const closeBtn = modal.querySelector('.close-modal');
  closeBtn.addEventListener('click', () => {
    modal.classList.remove('show');
    setTimeout(() => modal.remove(), 300);
  });
  const updateBtn = modal.querySelector('.update-task');
  updateBtn.addEventListener('click', () => {
    showStatusUpdateModal(task);
  });
  const deleteBtn = modal.querySelector('.delete-task');
  deleteBtn.addEventListener('click', () => {
    if (confirm(`Are you sure you want to delete task ${task.id}?`)) {
      window.dataManager.deleteTask(task.id);
      modal.classList.remove('show');
      setTimeout(() => {
        modal.remove();
        refreshDashboard();
      }, 300);
    }
  });
}

function showStatusUpdateModal(task) {
  const modal = document.createElement('div');
  modal.className = 'modal status-modal';
  modal.innerHTML = `
    <div class="modal-content">
      <span class="close-modal">&times;</span>
      <h2>Update Task Status</h2>
      <form id="status-form">
        <div class="form-group">
          <label for="status">Status:</label>
          <select id="status" name="status">
            <option value="pending" ${task.status === 'pending' ? 'selected' : ''}>Pending</option>
            <option value="in progress" ${task.status === 'in progress' ? 'selected' : ''}>In Progress</option>
            <option value="completed" ${task.status === 'completed' ? 'selected' : ''}>Completed</option>
            <option value="done" ${task.status === 'done' ? 'selected' : ''}>Done</option>
            <option value="failed" ${task.status === 'failed' ? 'selected' : ''}>Failed</option>
          </select>
        </div>
        <div class="form-group">
          <label for="ai_level">AI Level:</label>
          <select id="ai_level" name="ai_level">
            <option value="">- Select -</option>
            <option value="L4" ${task.ai_level === 'L4' ? 'selected' : ''}>Claude Code (L4)</option>
            <option value="L5" ${task.ai_level === 'L5' ? 'selected' : ''}>Codex (L5)</option>
            <option value="human" ${task.ai_level === 'human' ? 'selected' : ''}>Human</option>
          </select>
        </div>
        <div class="form-group">
          <label class="checkbox-label">
            <input type="checkbox" id="human_intervention" name="human_intervention" ${task.human_intervention ? 'checked' : ''}>
            Required human intervention
          </label>
        </div>
        <div class="form-actions">
          <button type="submit" class="btn primary">Update Task</button>
        </div>
      </form>
    </div>`;
  document.body.appendChild(modal);
  setTimeout(() => modal.classList.add('show'), 10);
  const closeBtn = modal.querySelector('.close-modal');
  closeBtn.addEventListener('click', () => {
    modal.classList.remove('show');
    setTimeout(() => modal.remove(), 300);
  });
  const form = modal.querySelector('#status-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const updates = {
      status: form.status.value,
      ai_level: form.ai_level.value,
      human_intervention: form.human_intervention.checked
    };
    window.dataManager.updateTask(task.id, updates);
    modal.classList.remove('show');
    setTimeout(() => {
      modal.remove();
      refreshDashboard();
    }, 300);
  });
}

function refreshDashboard() {
  if (!window.dataManager || !window.analytics) return;
  const tasks = window.dataManager.getTasks();
  window.analytics = new TaskflowAnalytics(tasks);
  const metrics = window.analytics.metrics;
  updateSyncStatus(window.dataManager.getLastSync());
  updateStatusCounts(metrics.counts);
  if (document.getElementById('completion-chart')) {
    createCompletionChart('completion-chart', metrics.counts);
  }
  if (document.getElementById('trend-chart')) {
    createTrendChart('trend-chart', metrics.trend);
  }
  if (document.getElementById('ai-distribution-chart')) {
    createAIDistributionChart('ai-distribution-chart', metrics.aiDistribution);
  }
  if (document.getElementById('template-usage-chart')) {
    createTemplateUsageChart('template-usage-chart', metrics.templateUsage);
  }
  if (document.getElementById('performance-chart')) {
    createPerformanceChart('performance-chart', window.analytics.getPerformanceByAILevel());
  }
  if (document.getElementById('tasks-table')) {
    createTaskTable('tasks-table', tasks);
  }
}

function updateSyncStatus(date) {
  const el = document.getElementById('sync-status');
  if (!el) return;
  if (!date) {
    el.textContent = 'No sync yet';
  } else {
    el.textContent = `Last sync: ${new Date(date).toLocaleString()}`;
  }
}

function updateStatusCounts(counts) {
  const countsEl = document.getElementById('status-counts');
  if (!countsEl) return;
  countsEl.innerHTML = `
    <div class="count-item">
      <span class="count">${counts.total}</span>
      <span class="label">Total</span>
    </div>
    <div class="count-item">
      <span class="count">${counts.completed}</span>
      <span class="label">Completed</span>
    </div>
    <div class="count-item">
      <span class="count">${counts.inProgress}</span>
      <span class="label">In Progress</span>
    </div>
    <div class="count-item">
      <span class="count">${counts.pending}</span>
      <span class="label">Pending</span>
    </div>`;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    createCompletionChart,
    createTrendChart,
    createAIDistributionChart,
    createTemplateUsageChart,
    createPerformanceChart,
    createTaskTable,
    showTaskDetails,
    refreshDashboard,
    updateSyncStatus
  };
}
