# Screenshot Capture Guide – Employee Management Parity

Use this walkthrough when you need to refresh the evidence set for the parity demo. Every section below maps one capture from `docs/SCREENSHOT_INDEX.md` to a concrete sequence of actions. Follow the steps exactly, but feel free to use any employee records as long as the resulting UI matches the described state.

## Before You Start
- Open the current production build: `https://employee-management-parity-qmpbx1nh9-granins-projects.vercel.app`.
- Keep the legacy reference handy for comparisons: `https://employee-management-parity-legacy-7b28yt9nh-granins-projects.vercel.app`.
- Set the browser viewport to **1440×900** (or wider) and ensure the UI is zoomed to 100 %.
- Clear local storage or use an incognito window so the table renders in its default state (filters closed, no persisted selection).
- Unless a step explicitly says otherwise, the screenshots should be taken from the production build.

## 1. Selection Mode Banner (`selection-mode-banner-2025-10-07.png`)
1. Load the employee list (`Список сотрудников`).
2. Press `Tab` until focus lands on the toolbar button `Массовое редактирование` (icon with stacked squares).
3. Press `Space` to enter selection mode. A blue informational banner appears at the top of the table.
4. `Tab` once more to focus the first table row, then press `Space` to select it. Confirm the banner now shows the active selection count and the toolbar buttons highlight.
5. Capture the viewport showing the banner, the highlighted first row, and the active toolbar buttons.

## 2. Dismiss / Restore Timeline (`dismiss-restore-timeline-2025-10-09.png`)
1. Click the first employee row (or press `Enter`) to open the edit drawer.
2. Inside the drawer, click `Уволить`. Wait for the success toast.
3. Close the drawer. In the table header, tick the checkbox `Показывать уволенных` so the dismissed employee stays visible.
4. Re-open the same employee (click row or press `Enter`). The drawer shows the `Восстановить` button.
5. Click `Восстановить`, wait for the toast, and stay in the drawer.
6. Scroll to the “Активные задачи” timeline. You should see two new system entries (“Статус изменён на «Уволен»”; “Сотрудник восстановлен из увольнения”) with the ⚙️ badge.
7. Capture the drawer showing the timeline entries and the header state.

## 3. Tag-Limit Alert (`tag-limit-alert-2025-10-09.png`)
1. Return to the table and ensure at least one employee is selected (use the same selection mode as in section 1).
2. Open the tag manager by clicking `Теги` on the toolbar.
3. In the modal, choose the action `Добавить всем` (ensure it is highlighted).
4. Tick tags until four chips are selected (you can use existing catalogue entries).
5. Attempt to tick a fifth tag. The inline alert at the bottom should appear with the “не более 4 тегов” message, and the checkbox you tried to add remains unchecked.
6. Capture the modal showing the active action buttons, the selected tags, and the alert.

## 4. Bulk-Edit Summary (`bulk-edit-summary-2025-10-09.png`)
1. Close the tag manager and clear any existing selection (`Очистить` on the blue banner if needed).
2. Enter selection mode again and select **two** employees.
3. Open the bulk-edit drawer (`Массовое редактирование`).
4. Configure several matrix actions:
   - Status: click `Заменить всем` and pick `В отпуске`.
   - Team: click `Заменить всем` and choose any other team.
   - Skills: click `Добавить всем` and type two skill names (one per line).
   - Reserve skills (optional): click `Удалить у всех` and enter an existing reserve skill name.
   - Tags: click `Добавить всем` and enter two tag names.
   - Hour norm (optional): click `Заменить всем` and type `36`.
   - Comment: add a short note in the comment field.
5. Scroll to the right-hand column labelled “Предстоящие изменения”. Confirm each configured action is listed with the correct marker (`+`, `→`, or `−`).
6. Capture the panel so the list of changes and the “Выбранные сотрудники” count are both visible.

## Additional Tips
- If the UI already shows the desired state (e.g., an employee is dismissed), reset by refreshing the page or toggling filters so you control the sequence for the capture.
- When comparing against the legacy build, repeat the same steps and note any mismatches before switching back to production for the final screenshot.
- Store the resulting PNG files under the shared Desktop evidence directory and reference them in `docs/SCREENSHOT_INDEX.md`.
