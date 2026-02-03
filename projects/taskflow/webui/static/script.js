async function loadTasks() {
    const res = await fetch('/api/tasks');
    const tasks = await res.json();
    const container = document.getElementById('tasks');
    container.innerHTML = '';
    tasks.forEach(t => {
        const a = document.createElement('a');
        a.href = '#';
        a.textContent = t;
        a.className = 'task-link';
        a.onclick = () => loadTask(t);
        container.appendChild(a);
    });
}

async function loadTask(taskId) {
    const res = await fetch(`/api/task/${taskId}`);
    const files = await res.json();
    const content = document.getElementById('content');
    content.innerHTML = `<h2>${taskId}</h2>`;
    files.forEach(async f => {
        const fileRes = await fetch(`/api/task/${taskId}/${f}`);
        const text = await fileRes.text();
        const ext = f.split('.').pop();
        const pre = document.createElement('pre');
        const code = document.createElement('code');
        code.textContent = text;
        code.className = ext;
        pre.appendChild(code);
        const link = document.createElement('a');
        link.href = `/api/task/${taskId}/${f}`;
        link.textContent = `Download ${f}`;
        link.download = f;
        content.appendChild(link);
        content.appendChild(pre);
        hljs.highlightElement(code);
    });
}

window.onload = loadTasks;
