async function fetchTemplates(query = '', category = '') {
    const params = new URLSearchParams();
    if (query) params.append('query', query);
    if (category) params.append('category', category);
    const res = await fetch('/api/templates?' + params.toString());
    const data = await res.json();
    return data.templates || data.data || [];
}

function renderTemplates(list) {
    const container = document.getElementById('templates');
    container.innerHTML = '';
    list.forEach(t => {
        const div = document.createElement('div');
        div.className = 'template-item';
        div.innerHTML = `<h3>${t.display_name} <small>${t.version}</small></h3>
<p>${t.description}</p>
<p><strong>Categories:</strong> ${t.categories.join(', ')}</p>`;
        container.appendChild(div);
    });
}

async function loadCategories(templates) {
    const select = document.getElementById('category');
    const cats = new Set();
    templates.forEach(t => t.categories.forEach(c => cats.add(c)));
    select.innerHTML = '<option value="">All categories</option>';
    Array.from(cats).sort().forEach(c => {
        const opt = document.createElement('option');
        opt.value = c;
        opt.textContent = c;
        select.appendChild(opt);
    });
}

async function init() {
    let templates = await fetchTemplates();
    renderTemplates(templates);
    loadCategories(templates);

    document.getElementById('search').addEventListener('input', async e => {
        templates = await fetchTemplates(e.target.value, document.getElementById('category').value);
        renderTemplates(templates);
    });
    document.getElementById('category').addEventListener('change', async e => {
        templates = await fetchTemplates(document.getElementById('search').value, e.target.value);
        renderTemplates(templates);
    });
}

window.onload = init;
