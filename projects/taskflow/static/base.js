document.addEventListener('DOMContentLoaded', () => {
    const ajaxForms = document.querySelectorAll('form[data-ajax]');
    ajaxForms.forEach(form => {
        form.addEventListener('submit', async e => {
            e.preventDefault();
            if (!form.checkValidity()) {
                form.classList.add('was-validated');
                return;
            }
            const progress = document.querySelector(form.dataset.progressTarget || '#progress-indicator');
            const error = document.querySelector(form.dataset.errorTarget || '#error-message');
            if (error) error.classList.add('d-none');
            if (progress) progress.classList.remove('d-none');
            try {
                const resp = await fetch(form.action, {
                    method: form.method || 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(Object.fromEntries(new FormData(form)))
                });
                if (!resp.ok) throw new Error('Request failed');
                const data = await resp.json();
                form.dispatchEvent(new CustomEvent('ajax:success', {detail: data}));
            } catch (err) {
                if (error) {
                    error.textContent = err.message;
                    error.classList.remove('d-none');
                }
            } finally {
                if (progress) progress.classList.add('d-none');
            }
        });
    });

    const validationForms = document.querySelectorAll('.needs-validation');
    validationForms.forEach(form => {
        form.addEventListener('submit', event => {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            }
            form.classList.add('was-validated');
        }, false);
    });
});
