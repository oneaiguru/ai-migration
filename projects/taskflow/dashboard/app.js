(function() {
    const tasksKey = 'taskflow_tasks';
    const templatesKey = 'taskflow_templates';

    function load(key) {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    }

    function save(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    }

    let tasks = load(tasksKey);
    let templates = load(templatesKey);

    const statsEl = document.getElementById('stats-content');
    const taskForm = document.getElementById('task-form');
    const taskTableBody = document.querySelector('#task-table tbody');
    const templateForm = document.getElementById('template-form');
    const templateList = document.getElementById('template-list');

    function updateStats() {
        const total = tasks.length;
        const pending = tasks.filter(t => t.status === 'pending').length;
        const inProgress = tasks.filter(t => t.status === 'in progress').length;
        const done = tasks.filter(t => t.status === 'done').length;
        statsEl.textContent =
            `Total: ${total} | Pending: ${pending} | In Progress: ${inProgress} | Done: ${done}`;
    }

    function renderTasks() {
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

    function renderTemplates() {
        templateList.innerHTML = '';
        templates.forEach(tpl => {
            const li = document.createElement('li');
            li.textContent = tpl.name;
            templateList.appendChild(li);
        });
    }

    taskForm.addEventListener('submit', e => {
        e.preventDefault();
        const id = document.getElementById('task-id').value.trim();
        const title = document.getElementById('task-title').value.trim();
        const status = document.getElementById('task-status').value;
        const now = new Date().toISOString();
        const task = { id, title, status, updated_at: now };
        tasks.push(task);
        save(tasksKey, tasks);
        taskForm.reset();
        renderTasks();
        updateStats();
    });

    templateForm.addEventListener('submit', e => {
        e.preventDefault();
        const name = document.getElementById('template-name').value.trim();
        const content = document.getElementById('template-content').value.trim();
        templates.push({ name, content });
        save(templatesKey, templates);
        templateForm.reset();
        renderTemplates();
    });

    // initial render
    renderTasks();
    updateStats();
    renderTemplates();
})();
