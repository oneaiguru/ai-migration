(async function() {
    const statsEl = document.getElementById('stats-content');
    const taskForm = document.getElementById('task-form');
    const taskTableBody = document.querySelector('#task-table tbody');
    const templateForm = document.getElementById('template-form');
    const templateList = document.getElementById('template-list');

    async function fetchJSON(url, options = {}) {
        const res = await fetch(url, options);
        if (!res.ok) throw new Error('Request failed');
        return res.json();
    }

    async function loadMetrics() {
        try {
            const data = await fetchJSON('/api/metrics');
            const total = data.total || 0;
            const pending = data.counts.pending || 0;
            const inProgress = data.counts['in progress'] || 0;
            const done = data.counts.done || 0;
            statsEl.textContent = `Total: ${total} | Pending: ${pending} | In Progress: ${inProgress} | Done: ${done}`;
        } catch (err) {
            statsEl.textContent = 'Failed to load metrics';
        }
    }

    async function loadTasks() {
        const data = await fetchJSON('/api/tasks');
        return data.tasks || [];
    }

    function renderTasks(tasks) {
        taskTableBody.innerHTML = '';
        tasks.forEach(task => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${task.id}</td>
                <td>${task.title}</td>
                <td>${task.status}</td>
                <td>${task.updated_at}</td>`;
            taskTableBody.appendChild(tr);
        });
    }

    async function loadTemplates() {
        const data = await fetchJSON('/api/templates');
        return data.templates || [];
    }

    function renderTemplates(list) {
        templateList.innerHTML = '';
        list.forEach(t => {
            const li = document.createElement('li');
            li.textContent = t;
            templateList.appendChild(li);
        });
    }

    taskForm.addEventListener('submit', async e => {
        e.preventDefault();
        const id = document.getElementById('task-id').value.trim();
        const title = document.getElementById('task-title').value.trim();
        const status = document.getElementById('task-status').value;
        const resp = await fetchJSON('/api/tasks', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({id, title, status})
        });
        const tasks = await loadTasks();
        renderTasks(tasks);
        await loadMetrics();
        taskForm.reset();
    });

    templateForm.addEventListener('submit', async e => {
        e.preventDefault();
        const name = document.getElementById('template-name').value.trim();
        const content = document.getElementById('template-content').value.trim();
        await fetchJSON('/api/templates', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({name, content})
        });
        const templates = await loadTemplates();
        renderTemplates(templates);
        templateForm.reset();
    });

    const tasks = await loadTasks();
    const templates = await loadTemplates();
    renderTasks(tasks);
    renderTemplates(templates);
    await loadMetrics();
})();
