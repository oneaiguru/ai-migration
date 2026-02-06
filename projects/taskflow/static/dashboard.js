document.addEventListener('DOMContentLoaded', () => {
  const statsEl = document.getElementById('stats-content');
  const taskForm = document.getElementById('task-form');
  const taskTableBody = document.querySelector('#tasks-table tbody');
  const templateSelect = document.getElementById('template-select');
  const filterButtons = document.querySelectorAll('#task-filters button');
  const searchInput = document.getElementById('task-search');
  let allTasks = [];
  let currentFilter = 'all';

  async function fetchJSON(url, options = {}) {
    const res = await fetch(url, options);
    if (!res.ok) throw new Error('Request failed');
    return res.json();
  }

  async function loadMetrics() {
    try {
      const data = await fetchJSON('/api/metrics');
      const counts = data.counts || {};
      statsEl.textContent = `Total: ${data.total || 0} | Pending: ${counts.pending || 0} | Completed: ${counts.done || counts.completed || 0}`;
    } catch {
      statsEl.textContent = 'Failed to load metrics';
    }
  }

  async function loadTasks() {
    const data = await fetchJSON('/api/tasks');
    allTasks = data.tasks || [];
  }

  async function loadTemplates() {
    const data = await fetchJSON('/api/templates');
    const list = data.templates || [];
    templateSelect.innerHTML = '<option value="">Template</option>';
    list.forEach(t => {
      const opt = document.createElement('option');
      opt.value = t;
      opt.textContent = t;
      templateSelect.appendChild(opt);
    });
  }

  function renderTasks() {
    const search = searchInput.value.toLowerCase();
    taskTableBody.innerHTML = '';
    allTasks
      .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
      .slice(0, 10)
      .filter(t => (currentFilter === 'all' || t.status === currentFilter))
      .filter(t => t.title.toLowerCase().includes(search) || t.id.toLowerCase().includes(search))
      .forEach(t => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${t.id}</td>
          <td>${t.title}</td>
          <td>${t.status}</td>
          <td>${new Date(t.updated_at).toLocaleString()}</td>
          <td>
            <button data-action="view" data-id="${t.id}">View</button>
            <button data-action="edit" data-id="${t.id}">Edit</button>
            <button data-action="delete" data-id="${t.id}">Delete</button>
          </td>`;
        taskTableBody.appendChild(tr);
      });
  }

  async function addTask(e) {
    e.preventDefault();
    if (!taskForm.checkValidity()) {
      taskForm.reportValidity();
      return;
    }
    const payload = {
      id: document.getElementById('task-id').value.trim(),
      title: document.getElementById('task-title').value.trim(),
      status: document.getElementById('task-status').value,
      template: templateSelect.value || undefined
    };
    await fetchJSON('/api/tasks', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(payload)
    });
    taskForm.reset();
    await refresh();
  }

  async function handleAction(e) {
    const btn = e.target.closest('button');
    if (!btn) return;
    const id = btn.dataset.id;
    const action = btn.dataset.action;
    if (action === 'delete') {
      if (!confirm('Delete task ' + id + '?')) return;
      await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
    } else if (action === 'edit') {
      const title = prompt('New title:');
      const status = prompt('New status (pending/in progress/done):');
      await fetchJSON(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ title, status })
      });
    } else if (action === 'view') {
      const data = await fetchJSON(`/api/tasks/${id}`);
      alert(JSON.stringify(data, null, 2));
    }
    await refresh();
  }

  async function refresh() {
    await loadTasks();
    renderTasks();
    await loadMetrics();
  }

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      renderTasks();
    });
  });

  searchInput.addEventListener('input', renderTasks);
  taskForm.addEventListener('submit', addTask);
  taskTableBody.addEventListener('click', handleAction);

  // initial load
  (async () => {
    await loadTemplates();
    await refresh();
    setInterval(refresh, 15000);
  })();
});
