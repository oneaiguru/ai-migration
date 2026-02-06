/**
 * Основной JavaScript для веб-интерфейса администратора
 * 
 * Обеспечивает взаимодействие с API и динамическую функциональность интерфейса
 */

// Базовый URL для API
const API_BASE_URL = 'api.php';
let ADMIN_API_KEY = localStorage.getItem('ADMIN_API_KEY');

// Простая экранизация перед вставкой в innerHTML
function escapeHtml(value) {
    if (value === null || value === undefined) {
        return '';
    }
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/`/g, '&#96;');
}

function ensureApiKey() {
    if (ADMIN_API_KEY !== null && ADMIN_API_KEY !== undefined) {
        return;
    }
    const input = prompt('Введите административный API ключ (оставьте пустым, если не настроен):', '');
    if (input !== null) {
        ADMIN_API_KEY = input.trim();
        localStorage.setItem('ADMIN_API_KEY', ADMIN_API_KEY);
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    ensureApiKey();
    // Обновляем статистику и логи при загрузке страницы
    refreshStats();
    refreshLog();
    loadReports();
    
    // Проверяем статус системы
    checkSystemStatus();
    
    // Обработчики событий
    document.getElementById('refreshStats').addEventListener('click', refreshStats);
    document.getElementById('refreshLog').addEventListener('click', refreshLog);
    document.getElementById('clearLog').addEventListener('click', clearLog);
    
    document.getElementById('processingForm').addEventListener('submit', function(e) {
        e.preventDefault();
        startProcessing();
    });
    
    document.getElementById('testForm').addEventListener('submit', function(e) {
        e.preventDefault();
        testProduct();
    });
});

/**
 * Выполнение API-запроса
 * 
 * @param {string} endpoint Конечная точка API
 * @param {string} method HTTP метод (GET, POST, DELETE)
 * @param {Object} data Данные для отправки (для POST-запросов)
 * @returns {Promise<Object>} Результат запроса
 */
async function apiRequest(endpoint, method = 'GET', data = null) {
    try {
        const url = `${API_BASE_URL}${endpoint}`;
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (ADMIN_API_KEY) {
            options.headers['X-API-Key'] = ADMIN_API_KEY;
        }
        
        if (data && (method === 'POST' || method === 'PUT')) {
            options.body = JSON.stringify(data);
        }
        
        const response = await fetch(url, options);
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP ошибка: ${response.status}`);
        }
        
        return await response.json();
        
    } catch (error) {
        showError(`Ошибка API: ${error.message}`);
        throw error;
    }
}

/**
 * Обновление статистики на панели управления
 */
async function refreshStats() {
    try {
        showLoading('statsSection');
        
        const stats = await apiRequest('/stats');
        
        document.getElementById('totalProcessed').textContent = stats.total_processed;
        document.getElementById('totalSuccess').textContent = stats.success;
        document.getElementById('totalFailed').textContent = stats.failed;
        document.getElementById('averageUniqueness').textContent = `${stats.average_uniqueness}%`;
        
        hideLoading('statsSection');
    } catch (error) {
        console.error('Ошибка при обновлении статистики:', error);
        hideLoading('statsSection');
    }
}

/**
 * Запуск обработки товаров
 */
async function startProcessing() {
    try {
        const limit = document.getElementById('limit').value;
        const filterJson = document.getElementById('filter').value;
        
        let filter = {};
        if (filterJson.trim()) {
            try {
                filter = JSON.parse(filterJson);
            } catch (e) {
                showError('Некорректный формат JSON для фильтра');
                return;
            }
        }
        
        const data = {
            limit: parseInt(limit),
            filter: filter
        };
        
        const result = await apiRequest('/process', 'POST', data);
        
        showModal('Обработка запущена', `
            <div class="alert alert-success">
                <h4>Обработка запущена</h4>
                <p>${escapeHtml(result.message)}</p>
                <p>Запуск: ${escapeHtml(result.started_at)}</p>
                <p>Результаты будут доступны в журнале системы.</p>
            </div>
        `);
        
        // Обновление статистики и лога после короткой паузы
        setTimeout(() => {
            refreshStats();
            refreshLog();
        }, 2000);
        
    } catch (error) {
        console.error('Ошибка при запуске обработки:', error);
    }
}

/**
 * Тестирование генерации на одном товаре
 */
async function testProduct() {
    try {
        const productId = document.getElementById('productId').value;
        
        if (!productId) {
            showError('Не указан ID товара');
            return;
        }
        
        showModal('Тестирование товара', `
            <div class="text-center">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Загрузка...</span>
                </div>
                <p class="mt-2">Тестирование товара #${escapeHtml(productId)}...</p>
            </div>
        `);
        
        const result = await apiRequest('/test', 'POST', { productId: productId });
        
        let content = `
            <h4>Результаты тестирования товара #${escapeHtml(result.product.id)}</h4>
            <div class="card mb-3">
                <div class="card-header">Информация о товаре</div>
                <div class="card-body">
                    <p><strong>Название:</strong> ${escapeHtml(result.product.name)}</p>
                    <p><strong>Уникальность:</strong> ${escapeHtml(result.uniqueness)}%</p>
                    <p><strong>Время генерации:</strong> ${escapeHtml(result.generation_time)} сек</p>
                </div>
            </div>
            
            <div class="card mb-3">
                <div class="card-header">Оригинальный текст</div>
                <div class="card-body">
                    <p>${escapeHtml(result.original_text)}</p>
                </div>
            </div>
            
            <div class="card">
                <div class="card-header">Сгенерированный текст</div>
                <div class="card-body">
                    <p>${escapeHtml(result.generated_text)}</p>
                </div>
            </div>
        `;
        
        showModal('Результаты тестирования', content);
        
        // Обновление журнала
        refreshLog();
    } catch (error) {
        console.error('Ошибка при тестировании:', error);
        hideModal();
        showError(`Ошибка при тестировании: ${error.message}`);
    }
}

/**
 * Обновление журнала системы
 */
async function refreshLog() {
    try {
        const logOutput = document.getElementById('logOutput');
        logOutput.innerHTML = '<div class="text-center"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Загрузка...</span></div></div>';
        
        const logs = await apiRequest('/logs');
        
        logOutput.innerHTML = '';
        
        if (!logs.entries.length) {
            logOutput.innerHTML = '<div class="text-center text-muted">Журнал пуст</div>';
            return;
        }
        
        logs.entries.forEach(entry => {
            const logLine = document.createElement('div');
            
            if (entry.level === 'WARNING') {
                logLine.className = 'text-warning';
            } else if (entry.level === 'ERROR') {
                logLine.className = 'text-danger';
            }
            
            logLine.textContent = `[${entry.timestamp}] [${entry.level}] ${entry.message}`;
            logOutput.appendChild(logLine);
        });
        
        // Прокрутка вниз для отображения последних записей
        logOutput.scrollTop = logOutput.scrollHeight;
    } catch (error) {
        console.error('Ошибка при обновлении журнала:', error);
    }
}

/**
 * Очистка журнала системы
 */
async function clearLog() {
    try {
        if (!confirm('Вы уверены, что хотите очистить журнал?')) {
            return;
        }
        
        await apiRequest('/logs/clear', 'POST');
        
        document.getElementById('logOutput').innerHTML = '<div class="text-center text-muted">Журнал очищен</div>';
        
        showSuccess('Журнал успешно очищен');
    } catch (error) {
        console.error('Ошибка при очистке журнала:', error);
    }
}

/**
 * Загрузка списка отчетов
 */
async function loadReports() {
    try {
        const reportsData = await apiRequest('/reports');
        const reportsList = document.getElementById('reportsList');
        
        if (!reportsData.reports.length) {
            reportsList.innerHTML = '<tr><td colspan="5" class="text-center">Отчеты не найдены</td></tr>';
            return;
        }
        
        reportsList.innerHTML = '';
        
        reportsData.reports.forEach(report => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${escapeHtml(report.date)}</td>
                <td>${escapeHtml(report.filename)}</td>
                <td>${escapeHtml(report.processed)}</td>
                <td>${escapeHtml(report.success)}</td>
                <td>
                    <button class="btn btn-sm btn-primary view-report" data-report="${escapeHtml(report.filename)}">Просмотр</button>
                    <button class="btn btn-sm btn-outline-danger delete-report" data-report="${escapeHtml(report.filename)}">Удалить</button>
                </td>
            `;
            reportsList.appendChild(row);
        });
        
        // Добавляем обработчики событий для кнопок
        document.querySelectorAll('.view-report').forEach(button => {
            button.addEventListener('click', function() {
                viewReport(this.getAttribute('data-report'));
            });
        });
        
        document.querySelectorAll('.delete-report').forEach(button => {
            button.addEventListener('click', function() {
                deleteReport(this.getAttribute('data-report'));
            });
        });
    } catch (error) {
        console.error('Ошибка при загрузке отчетов:', error);
    }
}

/**
 * Просмотр отчета
 * 
 * @param {string} reportName Имя файла отчета
 */
async function viewReport(reportName) {
    try {
        const reportData = await apiRequest(`/reports/${reportName}`);
        
        let content = `
            <h4>Отчет: ${escapeHtml(reportName)}</h4>
            <div class="card mb-3">
                <div class="card-header">Статистика обработки</div>
                <div class="card-body">
                    <table class="table table-bordered">
                        <tr><th>Всего обработано</th><td>${escapeHtml(reportData.stats.total)}</td></tr>
                        <tr><th>Успешно</th><td>${escapeHtml(reportData.stats.success)}</td></tr>
                        <tr><th>Неудачно</th><td>${escapeHtml(reportData.stats.failed)}</td></tr>
                        <tr><th>Уникальных</th><td>${escapeHtml(reportData.stats.unique)}</td></tr>
                        <tr><th>Недостаточно уникальных</th><td>${escapeHtml(reportData.stats.not_unique)}</td></tr>
                        <tr><th>Пропущено</th><td>${escapeHtml(reportData.stats.skipped)}</td></tr>
                    </table>
                </div>
            </div>
        `;
        
        if (reportData.stats.errors && reportData.stats.errors.length > 0) {
            content += `
                <div class="card">
                    <div class="card-header">Ошибки</div>
                    <div class="card-body">
                        <ul class="list-group">
                            ${reportData.stats.errors.map(error => `<li class="list-group-item text-danger">${escapeHtml(error)}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            `;
        }
        
        showModal('Просмотр отчета', content);
    } catch (error) {
        console.error('Ошибка при просмотре отчета:', error);
    }
}

/**
 * Удаление отчета
 * 
 * @param {string} reportName Имя файла отчета
 */
async function deleteReport(reportName) {
    try {
        if (confirm(`Вы уверены, что хотите удалить отчет "${reportName}"?`)) {
            await apiRequest(`/reports/${reportName}`, 'DELETE');
            
            showSuccess(`Отчет "${reportName}" успешно удален`);
            
            // Обновляем список отчетов
            loadReports();
        }
    } catch (error) {
        console.error('Ошибка при удалении отчета:', error);
    }
}

/**
 * Проверка статуса системы
 */
async function checkSystemStatus() {
    try {
        const status = await apiRequest('/status');
        
        // В реальном проекте здесь должно быть больше проверок
        // и отображение статуса в интерфейсе
        
        if (!status.bitrix_api) {
            showWarning(`Проблема с подключением к Bitrix API: ${status.bitrix_error || 'Нет соединения'}`);
        }
        
        if (!status.claude_api) {
            showWarning(`Проблема с подключением к Claude API: ${status.claude_error || 'Нет соединения'}`);
        }
        
        // Проверка директорий
        Object.entries(status.directories).forEach(([dir, info]) => {
            if (!info.exists || !info.writable) {
                showWarning(`Проблема с директорией ${dir}: ${!info.exists ? 'не существует' : 'нет прав на запись'}`);
            }
        });
    } catch (error) {
        console.error('Ошибка при проверке статуса системы:', error);
    }
}

/**
 * Показать индикатор загрузки в указанном контейнере
 * 
 * @param {string} containerId ID контейнера
 */
function showLoading(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
        container.classList.add('loading');
        
        // Можно добавить анимацию загрузки
        const loader = document.createElement('div');
        loader.className = 'loader-overlay';
        loader.innerHTML = '<div class="spinner-border text-primary" role="status"><span class="visually-hidden">Загрузка...</span></div>';
        
        container.appendChild(loader);
    }
}

/**
 * Скрыть индикатор загрузки в указанном контейнере
 * 
 * @param {string} containerId ID контейнера
 */
function hideLoading(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
        container.classList.remove('loading');
        
        const loader = container.querySelector('.loader-overlay');
        if (loader) {
            loader.remove();
        }
    }
}

/**
 * Показать модальное окно с указанным заголовком и содержимым
 * 
 * @param {string} title Заголовок окна
 * @param {string} content HTML-содержимое
 */
function showModal(title, content) {
    const modalTitle = document.querySelector('#resultModal .modal-title');
    const modalBody = document.getElementById('modalBody');
    
    modalTitle.textContent = title;
    modalBody.innerHTML = content;
    
    const modal = new bootstrap.Modal(document.getElementById('resultModal'));
    modal.show();
}

/**
 * Скрыть модальное окно
 */
function hideModal() {
    const modalElement = document.getElementById('resultModal');
    const modal = bootstrap.Modal.getInstance(modalElement);
    if (modal) {
        modal.hide();
    }
}

/**
 * Показать сообщение об ошибке
 * 
 * @param {string} message Текст сообщения
 */
function showError(message) {
    const alertContainer = document.createElement('div');
    alertContainer.className = 'alert alert-danger alert-dismissible fade show position-fixed top-0 end-0 m-3';
    alertContainer.setAttribute('role', 'alert');
    alertContainer.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    document.body.appendChild(alertContainer);
    
    // Автоматическое скрытие через 5 секунд
    setTimeout(() => {
        alertContainer.remove();
    }, 5000);
}

/**
 * Показать сообщение об успехе
 * 
 * @param {string} message Текст сообщения
 */
function showSuccess(message) {
    const alertContainer = document.createElement('div');
    alertContainer.className = 'alert alert-success alert-dismissible fade show position-fixed top-0 end-0 m-3';
    alertContainer.setAttribute('role', 'alert');
    alertContainer.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    document.body.appendChild(alertContainer);
    
    // Автоматическое скрытие через 5 секунд
    setTimeout(() => {
        alertContainer.remove();
    }, 5000);
}

/**
 * Показать предупреждение
 * 
 * @param {string} message Текст сообщения
 */
function showWarning(message) {
    const alertContainer = document.createElement('div');
    alertContainer.className = 'alert alert-warning alert-dismissible fade show position-fixed top-0 end-0 m-3';
    alertContainer.setAttribute('role', 'alert');
    alertContainer.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    document.body.appendChild(alertContainer);
    
    // Автоматическое скрытие через 5 секунд
    setTimeout(() => {
        alertContainer.remove();
    }, 5000);
}
