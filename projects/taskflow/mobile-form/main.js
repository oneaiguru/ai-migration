const templateSelect = document.getElementById('templateSelect');
const form = document.getElementById('taskForm');
const message = document.getElementById('message');
const preview = document.getElementById('preview');
const submitBtn = document.getElementById('submitBtn');

let templates = {};
const STORAGE_KEY = 'tasks';

// Load templates from JSON
fetch('../bot/templates.json')
  .then(res => {
      if (!res.ok) throw new Error('Request failed');
      return res.json();
  })
  .then(data => {
      templates = data;
      populateTemplates();
  })
  .catch(err => {
      console.error('Failed to load templates', err);
      message.textContent = 'Failed to load templates.';
      message.className = 'error';
  });

function populateTemplates() {
    templateSelect.innerHTML = '<option value="">Select a template</option>';
    Object.keys(templates).forEach(key => {
        const opt = document.createElement('option');
        opt.value = key;
        opt.textContent = templates[key].name;
        templateSelect.appendChild(opt);
    });
}

function saveLocalTask(task) {
    const tasks = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    tasks.push(task);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function syncTasks() {
    if (!navigator.onLine) {
        message.textContent = 'Offline. Tasks will sync when online.';
        message.className = 'error';
        return;
    }
    const tasks = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const unsynced = tasks.filter(t => !t.synced);
    if (unsynced.length === 0) return;
    Promise.all(
        unsynced.map(t =>
            fetch('/api/tasks', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({id: t.id, title: t.prompt})
            }).then(res => res.ok).catch(() => false)
        )
    ).then(results => {
        const updated = tasks.map(task => {
            const idx = unsynced.findIndex(u => u.id === task.id);
            if (idx !== -1 && results[idx]) {
                return {...task, synced: true};
            }
            return task;
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        if (results.every(r => r)) {
            message.textContent = 'Tasks synced.';
            message.className = 'success';
        } else {
            message.textContent = 'Some tasks failed to sync.';
            message.className = 'error';
        }
    });
}

function createInput(name) {
    const wrapper = document.createElement('div');
    const label = document.createElement('label');
    label.textContent = name;
    const input = document.createElement('input');
    input.id = name;
    input.required = true;
    wrapper.appendChild(label);
    wrapper.appendChild(input);
    const error = document.createElement('div');
    error.className = 'error hidden';
    error.id = `${name}-error`;
    wrapper.appendChild(error);
    return wrapper;
}

function updateForm() {
    form.innerHTML = '';
    const templateKey = templateSelect.value;
    if (!templateKey) return;
    const prompt = templates[templateKey].prompt;
    const vars = Array.from(new Set(prompt.match(/{{(.*?)}}/g))) || [];
    vars.forEach(v => {
        const name = v.replace(/{{|}}/g, '');
        form.appendChild(createInput(name));
    });
    preview.classList.add('hidden');
}

templateSelect.addEventListener('change', () => {
    updateForm();
    showPreview();
});
form.addEventListener('input', showPreview);

function validate() {
    let valid = true;
    const inputs = form.querySelectorAll('input');
    inputs.forEach(input => {
        const errorEl = document.getElementById(`${input.id}-error`);
        if (!input.value.trim()) {
            errorEl.textContent = 'Required';
            errorEl.classList.remove('hidden');
            valid = false;
        } else {
            errorEl.classList.add('hidden');
        }
    });
    return valid;
}

function renderPrompt(templateKey, values) {
    let text = templates[templateKey].prompt;
    Object.entries(values).forEach(([k,v]) => {
        const re = new RegExp(`{{${k}}}`, 'g');
        text = text.replace(re, v);
    });
    return text;
}

function showPreview() {
    const templateKey = templateSelect.value;
    if (!templateKey) return;
    const inputs = form.querySelectorAll('input');
    const values = {};
    inputs.forEach(i => values[i.id] = i.value.trim());
    preview.textContent = renderPrompt(templateKey, values);
    preview.classList.remove('hidden');
}

submitBtn.addEventListener('click', (e) => {
    e.preventDefault();
    message.className = 'hidden';
    if (!validate()) return;

    const templateKey = templateSelect.value;
    const inputs = form.querySelectorAll('input');
    const values = {};
    inputs.forEach(i => values[i.id] = i.value.trim());

    const task = {
        id: Date.now().toString(),
        template: templateKey,
        params: values,
        prompt: renderPrompt(templateKey, values)
    };

    saveLocalTask({...task, synced: false});
    syncTasks();

    message.textContent = 'Task saved locally.';
    message.className = 'success';
    form.reset();
});

window.addEventListener('online', syncTasks);
document.addEventListener('DOMContentLoaded', syncTasks);
