import { test, expect, Page } from '@playwright/test';

const ROW_SELECTOR = 'tbody tr';
const DRAWER_TEXT = 'Редактирование данных сотрудника';
const getFirstRowCheckbox = (page: Page) => page.locator('tbody tr input[type="checkbox"]').first();
const SELECTION_MODIFIER: 'Meta' | 'Control' = process.platform === 'darwin' ? 'Meta' : 'Control';

const openImportModal = async (page: Page, context: string) => {
  await page.locator('[title="Импортировать"]').first().click();
  const optionButtons = page.locator(`button:has-text("${context}")`);
  const count = await optionButtons.count();
  const index = count > 1 ? 1 : 0;
  await optionButtons.nth(index).click();
  await expect(page.getByRole('heading', { name: /Импорт/ })).toBeVisible();
};

const openExportModal = async (page: Page, context: string) => {
  await page.locator('[title="Экспортировать"]').first().click();
  const optionButtons = page.locator(`button:has-text("${context}")`);
  const count = await optionButtons.count();
  const index = count > 1 ? 1 : 0;
  await optionButtons.nth(index).click();
  await expect(page.getByRole('heading', { name: /Экспорт/ })).toBeVisible();
};

const uploadFileThroughChooser = async (
  page: Page,
  file: { name: string; mimeType: string; buffer: Buffer }
) => {
  const [fileChooser] = await Promise.all([
    page.waitForEvent('filechooser'),
    page.getByRole('button', { name: 'Выбрать файл' }).click(),
  ]);
  await fileChooser.setFiles(file);
};

test.describe('Employee list interactions', () => {
  test.beforeEach(async ({ page }) => {
    page.on('pageerror', (error) => {
      throw error;
    });
    page.on('console', (message) => {
      if (message.type() === 'error') {
        // eslint-disable-next-line no-console
        console.error('Console error:', message.text());
      }
    });
    await page.addInitScript(() => {
      try {
        const shouldPreserve = window.sessionStorage.getItem('preserve-local-storage');
        if (shouldPreserve === 'true') {
          window.sessionStorage.removeItem('preserve-local-storage');
          return;
        }
      } catch (error) {
        // ignore storage exceptions (e.g. disabled storage in tests)
      }
      window.localStorage.clear();
    });
    await page.goto('/');
    await expect(page.locator(ROW_SELECTOR).first()).toBeVisible();
  });

  test('clicking row opens drawer without toggling selection', async ({ page }) => {
    const row = page.locator(ROW_SELECTOR).first();

    await row.click();
    await expect(page.getByText(DRAWER_TEXT)).toBeVisible();
    await page.getByTestId('drawer-close-button').click();
    await expect(page.getByText(DRAWER_TEXT)).not.toBeVisible();
    await page.waitForTimeout(50);
    await expect(row).toBeFocused();
    await expect(row).not.toHaveClass(/border-l-4/);
  });

  test('view button within row opens edit drawer', async ({ page }) => {
    const viewButton = page.getByRole('button', { name: /Абдуллаева Динара/i });
    await viewButton.click();
    await expect(page.getByText(DRAWER_TEXT)).toBeVisible();
    await page.getByLabel('Закрыть').first().click();
    await expect(page.getByText(DRAWER_TEXT)).not.toBeVisible();
  });

  test('row checkbox toggles selection without forcing drawer', async ({ page }) => {
    const selectionButton = page.locator('button:has-text("Массовое редактирование")').first();
    await selectionButton.click();
    const checkbox = getFirstRowCheckbox(page);
    await expect(checkbox).toBeVisible();
    await checkbox.click();
    await expect(checkbox).toBeChecked();
    await expect(page.getByText(DRAWER_TEXT)).not.toBeVisible();
  });

  test('modifier click enters selection mode without opening drawer', async ({ page }) => {
    const secondRow = page.locator(ROW_SELECTOR).nth(1);
    const headerCheckbox = page.locator('thead input[type="checkbox"]');
    await secondRow.click({ modifiers: [SELECTION_MODIFIER] });
    await expect(headerCheckbox).toHaveCount(1);
    await expect(headerCheckbox).toBeVisible();
    await expect(page.getByText(DRAWER_TEXT)).not.toBeVisible();
    await expect(secondRow).toHaveClass(/bg-blue-50/);

    await secondRow.click({ modifiers: [SELECTION_MODIFIER] });
    await expect(secondRow).not.toHaveClass(/bg-blue-50/);
  });

  test('space key toggles selection mode for focused row', async ({ page }) => {
    const thirdRow = page.locator(ROW_SELECTOR).nth(2);
    const headerCheckbox = page.locator('thead input[type="checkbox"]');
    await thirdRow.focus();
    await page.keyboard.press('Space');
    await expect(headerCheckbox).toHaveCount(1);
    await expect(headerCheckbox).toBeVisible();
    await expect(thirdRow).toHaveClass(/bg-blue-50/);

    await page.keyboard.press('Space');
    await expect(thirdRow).not.toHaveClass(/bg-blue-50/);
  });

  test('escape exits selection mode when no overlays are open', async ({ page }) => {
    const bulkEditButton = page.locator('button:has-text("Массовое редактирование")').first();
    await bulkEditButton.click();
    const firstRow = page.locator(ROW_SELECTOR).first();
    const headerCheckbox = page.locator('thead input[type="checkbox"]');
    await firstRow.click();
    await expect(firstRow).toHaveClass(/bg-blue-50/);

    await page.keyboard.press('Escape');
    await expect(headerCheckbox).toHaveCount(0);
    await expect(firstRow).not.toHaveClass(/bg-blue-50/);
  });

  test('dismiss and restore employee updates status and visibility', async ({ page }) => {
    const employeeName = /Абдуллаева Динара/i;

    await page.locator(ROW_SELECTOR).first().click();
    await page.getByRole('button', { name: 'Уволить' }).click();
    await expect(page.getByText(/переведён в статус «Уволен»/i)).toBeVisible();

    const showInactiveToggle = page.getByRole('checkbox', { name: 'Показывать уволенных' });
    await showInactiveToggle.check();

    const employeeButton = page.getByRole('button', { name: employeeName }).first();
    await employeeButton.click();
    await expect(page.getByRole('button', { name: 'Восстановить' })).toBeVisible();
    await page.getByRole('button', { name: 'Восстановить' }).click();
    await expect(page.getByText(/восстановлен из увольнения/i)).toBeVisible();
    await expect(page.getByText(DRAWER_TEXT)).not.toBeVisible();
    await showInactiveToggle.uncheck();

    await page.locator(ROW_SELECTOR).first().click();
    await expect(page.getByRole('button', { name: 'Восстановить' })).not.toBeVisible();
    await expect(page.getByRole('button', { name: 'Уволить' })).toBeVisible();
    await page.getByTestId('drawer-close-button').click();
  });

  test('scheme history appears in edit drawer', async ({ page }) => {
    await page.locator(ROW_SELECTOR).first().click();
    await expect(page.getByText('История схем работы')).toBeVisible();
    await expect(page.getByText('Административный график', { exact: false }).first()).toBeVisible();
    await expect(page.getByText('Гибкий график').first()).toBeVisible();
    await page.getByTestId('drawer-close-button').click();
  });

  test('bulk edit drawer updates status for selected employees', async ({ page }) => {
    const bulkEditButton = page.locator('button:has-text("Массовое редактирование")').first();
    await bulkEditButton.click();

    const checkboxes = page.locator('tbody tr input[type="checkbox"]');
    await expect(checkboxes.first()).toBeVisible();
    await checkboxes.nth(0).click();
    await checkboxes.nth(1).click();

    await bulkEditButton.click();
    await expect(page.locator('#bulk-edit-status')).toBeVisible();

    const statusSelect = page.locator('#bulk-edit-status');
    await page.getByTestId('matrix-action-status-replace').click();
    await expect(statusSelect).toBeEnabled();
    await statusSelect.selectOption('vacation');
    await page.locator('#bulk-edit-comment').fill('Назначено групповое обучение');
    await page.getByRole('button', { name: 'Применить изменения' }).click();

    await expect(page.locator('tbody tr').first().getByText('В отпуске')).toBeVisible();
    await expect(page.locator('tbody tr').nth(1).getByText('В отпуске')).toBeVisible();

    const viewButton = page.getByRole('button', { name: /Абдуллаева Динара/i });
    await viewButton.click();
    await expect(page.getByText('Редактирование данных сотрудника')).toBeVisible();
    await expect(page.getByText('Назначено групповое обучение').first()).toBeVisible();
    await page.getByLabel('Закрыть').first().click();
  });

  test('bulk edit tags enforces four-tag limit', async ({ page }) => {
    const bulkEditButton = page.locator('button:has-text("Массовое редактирование")').first();
    await bulkEditButton.click();

    const firstRowCheckbox = page.locator('tbody tr input[type="checkbox"]').first();
    await firstRowCheckbox.click();

    await bulkEditButton.click();
    await page.getByTestId('matrix-action-tags-replace').click();
    await page.locator('textarea[placeholder="VIP, Новичок"]').fill('Тег 1\nТег 2\nТег 3\nТег 4\nТег 5');
    await page.getByRole('button', { name: 'Применить изменения' }).click();

    await expect(page.getByRole('alert').first()).toContainText('не более 4 тегов');
    await page.getByRole('button', { name: 'Закрыть массовое редактирование' }).click();
  });

  test('bulk edit skills and reserve skills replace entries', async ({ page }) => {
    const bulkEditButton = page.locator('button:has-text("Массовое редактирование")').first();
    await bulkEditButton.click();

    const firstRowCheckbox = page.locator('tbody tr input[type="checkbox"]').first();
    await firstRowCheckbox.click();

    await bulkEditButton.click();
    await page.getByTestId('matrix-action-skills-replace').click();
    await page.locator('textarea[placeholder="CRM, Работа с возражениями"]').fill('Тестовый навык 1\nТестовый навык 2');

    await page.getByTestId('matrix-action-reserveSkills-replace').click();
    await page.locator('textarea[placeholder="Английский, Чаты"]').fill('Резерв 1');

    await page.getByRole('button', { name: 'Применить изменения' }).click();

    await page.getByRole('button', { name: /Абдуллаева Динара/i }).click();
    await expect(page.getByText('Тестовый навык 1', { exact: false })).toBeVisible();
    await expect(page.getByText('Резерв 1', { exact: false })).toBeVisible();
    await page.getByTestId('drawer-close-button').click();
  });

  test('bulk edit skills and reserve skills add entries', async ({ page }) => {
    const bulkEditButton = page.locator('button:has-text("Массовое редактирование")').first();
    await bulkEditButton.click();

    const firstRowCheckbox = page.locator('tbody tr input[type="checkbox"]').first();
    await firstRowCheckbox.click();

    await bulkEditButton.click();
    await page.getByTestId('matrix-action-skills-add').click();
    await page.locator('textarea[placeholder="CRM, Работа с возражениями"]').fill('Добавленный навык');

    await page.getByTestId('matrix-action-reserveSkills-add').click();
    await page.locator('textarea[placeholder="Английский, Чаты"]').fill('Добавленный резерв');

    await page.getByRole('button', { name: 'Применить изменения' }).click();

    await page.getByRole('button', { name: /Абдуллаева Динара/i }).click();
    await expect(page.getByText(DRAWER_TEXT)).toBeVisible();
    const skillsSummary = page.locator('label:has-text("Навыки")').locator('..').locator('div').first();
    const reserveSummary = page.locator('label:has-text("Резервные навыки")').locator('..').locator('div').first();
    await expect(skillsSummary).toContainText('Добавленный навык');
    await expect(skillsSummary).toContainText('Консультирование клиентов');
    await expect(reserveSummary).toContainText('Добавленный резерв');
    await page.getByTestId('drawer-close-button').click();
  });

  test('bulk edit skills and reserve skills remove entries', async ({ page }) => {
    const bulkEditButton = page.locator('button:has-text("Массовое редактирование")').first();
    await bulkEditButton.click();

    const firstRowCheckbox = page.locator('tbody tr input[type="checkbox"]').first();
    await firstRowCheckbox.click();

    await bulkEditButton.click();
    await page.getByTestId('matrix-action-skills-remove').click();
    await page.locator('textarea[placeholder="CRM, Работа с возражениями"]').fill('Консультирование клиентов');

    await page.getByTestId('matrix-action-reserveSkills-remove').click();
    await page.locator('textarea[placeholder="Английский, Чаты"]').fill('Очередь 3');

    await page.getByRole('button', { name: 'Применить изменения' }).click();

    await page.getByRole('button', { name: /Абдуллаева Динара/i }).click();
    await expect(page.getByText(DRAWER_TEXT)).toBeVisible();
    const skillsSummary = page.locator('label:has-text("Навыки")').locator('..').locator('div').first();
    const reserveSummary = page.locator('label:has-text("Резервные навыки")').locator('..').locator('div').first();
    await expect(skillsSummary).not.toContainText('Консультирование клиентов');
    await expect(skillsSummary).toContainText('CRM система');
    await expect(reserveSummary).toHaveText('Резервные навыки не назначены');
    await page.getByTestId('drawer-close-button').click();
  });

  test('edit drawer disables save until required fields valid', async ({ page }) => {
    await page.locator(ROW_SELECTOR).first().click();
    const emailInput = page.locator('label:has-text("Email")').locator('..').locator('input');
    const saveButton = page.getByRole('button', { name: /Сохран/ });
    const originalEmail = await emailInput.inputValue();

    await emailInput.fill('');
    await page.locator('label:has-text("Телефон")').locator('..').locator('input').focus();
    await expect(saveButton).toBeDisabled();
    await expect(saveButton).toHaveAttribute('aria-disabled', 'true');

    await emailInput.fill('dinara.updated@example.com');
    await expect(saveButton).not.toBeDisabled();

    await emailInput.fill(originalEmail);
    await page.getByTestId('drawer-close-button').click();
  });

  test('saving drawer persists changes across reload', async ({ page }) => {
    await page.locator(ROW_SELECTOR).first().click();
    const hourNormInput = page.locator('label:has-text("Норма часов")').locator('..').locator('input');
    const originalValue = await hourNormInput.inputValue();
    const newValue = originalValue === '32' ? '38' : '32';

    await hourNormInput.fill(newValue);
    const saveButton = page.getByRole('button', { name: /Сохран/ });
    await expect(saveButton).not.toBeDisabled();
    await saveButton.click();
    const saveToast = page.locator('div[role="status"]').filter({ hasText: 'Данные сотрудника' });
    await expect(saveToast).toBeVisible();
    await page.getByTestId('drawer-close-button').click();

    await page.evaluate(() => {
      window.sessionStorage.setItem('preserve-local-storage', 'true');
    });
    await page.reload();
    await expect(page.locator(ROW_SELECTOR).first()).toBeVisible();

    await page.locator(ROW_SELECTOR).first().click();
    await expect(hourNormInput).toHaveValue(newValue);

    await hourNormInput.fill(originalValue);
    await page.getByRole('button', { name: /Сохран/ }).click();
    await page.getByTestId('drawer-close-button').click();
  });

  test('tag manager catalogue persists without selection', async ({ page }) => {
    await page.locator('button:has-text("Теги")').first().click();
    await page.getByPlaceholder('Например: VIP').fill('Тестовый тег');
    await page.getByRole('button', { name: 'Создать тег' }).click();
    await expect(page.getByText('Тестовый тег')).toBeVisible();
    await page.keyboard.press('Escape');

    await page.evaluate(() => {
      window.sessionStorage.setItem('preserve-local-storage', 'true');
    });
    await page.reload();
    await page.locator('button:has-text("Теги")').first().click();
    await expect(page.getByText('Тестовый тег')).toBeVisible();
    await page.getByRole('button', { name: 'Удалить тег Тестовый тег' }).click();
    await expect(page.getByText('Тестовый тег')).not.toBeVisible();
    await page.keyboard.press('Escape');
  });

  test('import modal shows context specific heading', async ({ page }) => {
    await openImportModal(page, 'Навыки');
    await expect(page.getByRole('heading', { name: 'Импорт навыков' })).toBeVisible();
    await expect(page.getByText('Шаблон: Appendix 3')).toBeVisible();
    await page.getByLabel('Закрыть импорт').click();
  });

  test('export modal shows context specific heading', async ({ page }) => {
    await openExportModal(page, 'Отпуска');
    await expect(page.getByRole('heading', { name: 'Экспорт отпусков' })).toBeVisible();
    await expect(page.getByText('Выгрузка сотрудников со статусом «В отпуске».')).toBeVisible();
    await page.getByLabel('Закрыть экспорт').click();
  });

  test('bulk edit summary lists planned changes', async ({ page }) => {
    const bulkEditButton = page.locator('button:has-text("Массовое редактирование")').first();
    await bulkEditButton.click();
    await page.locator('tbody tr input[type="checkbox"]').nth(0).click();
    await page.locator('tbody tr input[type="checkbox"]').nth(1).click();
    await bulkEditButton.click();

    await page.getByTestId('matrix-action-status-replace').click();
    await page.locator('#bulk-edit-status').selectOption('vacation');
    await page.locator('#bulk-edit-comment').fill('Смена графика на отпускной период');

    const summaryBlock = page.getByText('Предстоящие изменения').locator('..');
    await expect(summaryBlock).toContainText('Статус → В отпуске');
    await expect(summaryBlock).toContainText('Комментарий будет добавлен в таймлайн задач.');

    const selectedBlock = page.getByText('Выбранные сотрудники').locator('..');
    await expect(selectedBlock).toContainText('Всего: 2');

    await page.getByRole('button', { name: 'Отмена' }).click();
  });

  test('quick add modal restores focus to toolbar trigger on cancel', async ({ page }) => {
    const quickAddButton = page.getByTestId('toolbar-new-employee');
    await quickAddButton.click();
    await expect(page.getByRole('dialog', { name: /Быстрое добавление сотрудника/i })).toBeVisible();
    await page.getByRole('button', { name: 'Отмена' }).click();
    await expect(page.getByRole('dialog', { name: /Быстрое добавление сотрудника/i })).not.toBeVisible();
    await expect(quickAddButton).toBeFocused();
  });

  test('export tags downloads CSV with tag data', async ({ page }) => {
    await page.locator('[title="Экспортировать"]').first().click();
    await page.getByRole('button', { name: 'Теги' }).click();
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Скачать CSV' }).click();
    const download = await downloadPromise;
    const filename = download.suggestedFilename();
    expect(filename).toContain('employees_tags');
    const stream = await download.createReadStream();
    let csv = '';
    if (stream) {
      for await (const chunk of stream) {
        csv += chunk.toString();
      }
    }
    expect(csv).toContain('Тег');
    await page.getByLabel('Закрыть экспорт').click();
  });

  test('import validation rejects unsupported tag file', async ({ page }) => {
    await openImportModal(page, 'Теги');

    await uploadFileThroughChooser(page, {
      name: 'tags.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('sample'),
    });

    await expect(page.locator('text=Импорт «Теги» поддерживает форматы: csv').first()).toBeVisible();
    await page.getByLabel('Закрыть импорт').click();
  });

  test('import validation rejects employee csv with missing headers', async ({ page }) => {
    await openImportModal(page, 'Сотрудника');

    const csvContent = 'login,lastName,firstName,email\nuser1,Иванов,Иван,ivan@example.com';

    await uploadFileThroughChooser(page, {
      name: 'employees.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(csvContent, 'utf-8'),
    });

    await expect(page.locator('text=Отсутствуют обязательные колонки').first()).toBeVisible();
    await page.getByLabel('Закрыть импорт').click();
  });

  test('import validation accepts employee csv with required headers', async ({ page }) => {
    await openImportModal(page, 'Сотрудника');

    const csvContent = [
      'login,lastName,firstName,email,hiringDate,office,groupExternalId,positionExternalId,telephonyId,personnelNumber,schemeExternalId,calendarExternalId,timeZone',
      'user1,Иванов,Иван,ivan@example.com,2024-01-01,Офис А,grp-1,pos-1,tel-1,PN-001,scheme-1,cal-1,Europe/Moscow',
    ].join('\n');

    await uploadFileThroughChooser(page, {
      name: 'employees.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(csvContent, 'utf-8'),
    });

    await expect(page.locator('text=Файл «employees.csv» принят для раздела «Сотрудника»').first()).toBeVisible();
    await page.getByLabel('Закрыть импорт').click();
  });

  test('import validation rejects csv with missing headers', async ({ page }) => {
    await openImportModal(page, 'Теги');

    const csvContent = 'login,ФИО\nuser1,Иванов Иван';
    await uploadFileThroughChooser(page, {
      name: 'tags.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(csvContent, 'utf-8'),
    });

    await expect(page.locator('text=Отсутствуют обязательные колонки: Тег.').first()).toBeVisible();
    await page.getByLabel('Закрыть импорт').click();
  });

  test('import validation accepts csv with required headers', async ({ page }) => {
    await openImportModal(page, 'Теги');

    const csvContent = 'login,ФИО,Тег\nuser1,Иванов Иван,VIP';
    await uploadFileThroughChooser(page, {
      name: 'tags.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(csvContent, 'utf-8'),
    });

    await expect(page.locator('text=Файл «tags.csv» принят для раздела «Теги»').first()).toBeVisible();
    await page.getByLabel('Закрыть импорт').click();
  });

  test('import validation rejects vacation csv with missing headers', async ({ page }) => {
    await openImportModal(page, 'Отпуска');

    const csvContent = 'login,ФИО,Статус,Команда\nuser1,Иванов Иван,В отпуске,Группа поддержки';
    await uploadFileThroughChooser(page, {
      name: 'vacations.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(csvContent, 'utf-8'),
    });

    await expect(page.locator('text=Отсутствуют обязательные колонки: Комментарий.').first()).toBeVisible();
    await page.getByLabel('Закрыть импорт').click();
  });

  test('import validation accepts vacation csv with required headers', async ({ page }) => {
    await openImportModal(page, 'Отпуска');

    const csvContent = 'login,ФИО,Статус,Команда,Комментарий\nuser1,Иванов Иван,В отпуске,Группа поддержки,Отпуск по графику';
    await uploadFileThroughChooser(page, {
      name: 'vacations.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(csvContent, 'utf-8'),
    });

    await expect(page.locator('text=Файл «vacations.csv» принят для раздела «Отпуска»').first()).toBeVisible();
    await page.getByLabel('Закрыть импорт').click();
  });

  test('import validation rejects skills csv with missing headers', async ({ page }) => {
    await openImportModal(page, 'Навыки');

    const csvContent = 'login,skill,start\nuser1,Навык 1,2024-01-01';
    await uploadFileThroughChooser(page, {
      name: 'skills.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(csvContent, 'utf-8'),
    });

    await expect(page.locator('text=Отсутствуют обязательные колонки').first()).toBeVisible();
    await page.getByLabel('Закрыть импорт').click();
  });

  test('import validation accepts skills csv with required headers', async ({ page }) => {
    await openImportModal(page, 'Навыки');

    const csvContent = 'login,skill,start,end,priority\nuser1,Навык 1,2024-01-01,2024-02-01,1';
    await uploadFileThroughChooser(page, {
      name: 'skills.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(csvContent, 'utf-8'),
    });

    await expect(page.locator('text=Файл «skills.csv» принят для раздела «Навыки»').first()).toBeVisible();
    await page.getByLabel('Закрыть импорт').click();
  });

  test('import validation rejects scheme csv with missing headers', async ({ page }) => {
    await openImportModal(page, 'Схемы');

    const csvContent = 'login,start,end\nuser1,2024-01-01,2024-02-01';
    await uploadFileThroughChooser(page, {
      name: 'schemes.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(csvContent, 'utf-8'),
    });

    await expect(page.locator('text=Отсутствуют обязательные колонки').first()).toBeVisible();
    await page.getByLabel('Закрыть импорт').click();
  });

  test('import validation accepts scheme csv with required headers', async ({ page }) => {
    await openImportModal(page, 'Схемы');

    const csvContent = 'login,id,start,end\nuser1,scheme-1,2024-01-01,2024-02-01';
    await uploadFileThroughChooser(page, {
      name: 'schemes.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(csvContent, 'utf-8'),
    });

    await expect(page.locator('text=Файл «schemes.csv» принят для раздела «Схемы»').first()).toBeVisible();
    await page.getByLabel('Закрыть импорт').click();
  });
});
