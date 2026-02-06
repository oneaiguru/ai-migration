Here’s the report on the refactored employee-management UI, summarizing issues discovered outside the Stage 6 UAT checklist. The report identifies the major and minor problems introduced by the refactor—such as the mis-mapped import modal, non-functional team selection in bulk edit, tag-manager usability, unrounded KPI display, and unimplemented demo pages—and provides citations for each finding. You can review the full report here:

# Stage 6 Refactor – Issues Beyond the Checklist

During the follow‑up exploration of the **refactored employee management UI** (`employee‑management‑parity‑gnlqewuz2`), several issues surfaced that were _not_ covered by the Stage 6 UAT checklist. These items appear to be regressions or new bugs introduced by the refactoring. They should be addressed before the refactor can be considered production‑ready.

## 1. Import modal mis‑mapping (major bug)

* **Observed behaviour:** When choosing **Сотрудника** (Employees) from the **Import** dropdown, the modal incorrectly displays the section title and guidance for _skills_ or _shift preferences_ rather than employees. Multiple attempts produced the same result![](./images/figure-01.png)employee-management-parity-gnlqewuz2-granins-projects.vercel.app![](./images/figure-02.png)employee-management-parity-gnlqewuz2-granins-projects.vercel.app.
  
* **Impact:** Users cannot import employees because the modal shows the wrong template and appendix references, leading to confusion and incorrect uploads.
  
* **Expected:** The modal should display “Импорт сотрудников” with the correct appendix and instructions, just like other categories (e.g., **Отпуска** and **Смены предпочтений** show the proper sections![](./images/figure-03.png)employee-management-parity-gnlqewuz2-granins-projects.vercel.app).
* **Status:** ✅ Resolved – импортный модуль теперь подставляет контекстные заголовки, список приложений и обязательные колонки из `src/components/EmployeeListContainer.tsx` (РК 2025‑10‑08).
  

## 2. Mass‑edit “Team” dropdown doesn’t open

* **Observed behaviour:** In the mass‑edit drawer, all other fields become editable after choosing **Replace for all** (e.g., Status dropdown opens correctly). However, the **Team** dropdown remains inactive—clicking the dropdown arrow does nothing![](./images/figure-04.png)employee-management-parity-gnlqewuz2-granins-projects.vercel.app. This issue persists across sessions.
  
* **Impact:** Administrators cannot bulk‑move employees between teams, which is a core function of the WFM system.
  
* **Expected:** After selecting an operation (e.g., _Replace for all_), the Team dropdown should open and list available teams, similar to the Status field![](./images/figure-05.png)employee-management-parity-gnlqewuz2-granins-projects.vercel.app.
* **Status:** ✅ Resolved – выпадающий список больше не блокируется действием «none» и автоматически включает «Заменить всем» при выборе команды (`EmployeeListContainer.tsx`).
  

## 3. Tag catalogue UX issues

* **Observed behaviour:** Creating a new tag via the Tag Manager works, but the new tag appears at the bottom of a long list that requires manual scrolling to find![](./images/figure-06.png)employee-management-parity-gnlqewuz2-granins-projects.vercel.app. There is no auto‑scroll or indication that the tag was added, and previously created tags also accumulate at the bottom.
  
* **Impact:** Users may think tag creation failed because they don’t see the new tag; this reduces discoverability and could lead to duplicate tags.
  
* **Expected:** New tags should either appear near the top of the list or be auto‑scrolled into view. A toast confirming creation or a highlight would improve UX.
* **Status:** ✅ Resolved – создание тега теперь прокручивает список к новой записи и подсвечивает её в менеджере тегов (`EmployeeListContainer.tsx`).
  

## 4. Performance metrics display bug

* **Observed behaviour:** On the **Показатели** (Performance) page, the KPI for **Качество обслуживания** shows an unrounded value (e.g., `51.36363636363637%`)![](./images/figure-07.png)employee-management-parity-gnlqewuz2-granins-projects.vercel.app. Other metrics appear normal.
  
* **Impact:** Rounding/formatting errors compromise the professionalism of the dashboard and may confuse users.
  
* **Expected:** KPI values should be displayed with appropriate precision (e.g., `51.36 %` or `51.4 %`).
* **Status:** ✅ Resolved – форматирование процентных и десятичных значений переехало на `Intl.NumberFormat` (см. `src/components/PerformanceMetricsView.tsx`).
  

## 5. Demo pages and placeholders

* **Photo gallery:** The **Mass upload** and **Export** buttons on the **Фото галерея** page do nothing; the page is labelled as a demo and is not fully implemented![](./images/figure-08.png)employee-management-parity-gnlqewuz2-granins-projects.vercel.app.
  
* **Statuses:** “Send to vacation,” “Deactivate,” and similar actions open placeholder modals that state the feature is “not yet implemented”![](./images/figure-09.png)employee-management-parity-gnlqewuz2-granins-projects.vercel.app.
  
* **Skills:** The **Навыки** page displays a “component in development” message![](./images/figure-10.png)employee-management-parity-gnlqewuz2-granins-projects.vercel.app.
  
* **Impact:** These modules are explicitly labelled demo content, so missing functionality is acceptable. They do not block parity but should be clearly documented as future enhancements.
* **Status:** ⏳ Deferred – помечено как демо до запуска модуля расписаний; описано в хэнд-оффе как ожидаемое поведение (оставить для продуктового решения в Phase 7+).
  

## 6. Accessibility and focus hints

* **Observed behaviour:** The refactor improved `Esc` handling and focus trapping for most modals; however, some focus issues remain untested (e.g., Tab order in mass‑edit drawer and Tag Manager). Additional keyboard testing is recommended to ensure full compliance with accessibility guidelines.
  

## Other minor observations

* The **Column settings** drawer works correctly and persists changes across sessions![](./images/figure-11.png)employee-management-parity-gnlqewuz2-granins-projects.vercel.app, although default column order should be re‑verified on a fresh session.
  
* **Quick add** and **edit drawers** persisted changes after save, fixing previous persistence bugs; this is an improvement.
  
* Filtering, sorting, and search behave as expected, matching baseline behaviour![](./images/figure-12.png)employee-management-parity-gnlqewuz2-granins-projects.vercel.app![](./images/figure-13.png)employee-management-parity-gnlqewuz2-granins-projects.vercel.app.
  

## Summary of issues beyond Stage 6

| #     | Issue                                              | Severity   | Status     | Evidence                                                     |
| ----- | -------------------------------------------------- | ---------- | ---------- | ------------------------------------------------------------ |
| **1** | Import modal mis‑mapped for employees              | **High**   | ✅ Resolved | Incorrect heading/appendix when selecting “Сотрудника”![](./images/figure-01.png)employee-management-parity-gnlqewuz2-granins-projects.vercel.app![](./images/figure-02.png)employee-management-parity-gnlqewuz2-granins-projects.vercel.app |
| **2** | Mass‑edit Team dropdown doesn’t open               | **High**   | ✅ Resolved | Dropdown remains inactive after selecting operation![](./images/figure-04.png)employee-management-parity-gnlqewuz2-granins-projects.vercel.app |
| **3** | Tag Manager adds new tags at bottom without notice | **Medium** | ✅ Resolved | New tags require scroll to discover![](./images/figure-06.png)employee-management-parity-gnlqewuz2-granins-projects.vercel.app |
| **4** | Performance KPI unrounded value                    | **Medium** | ✅ Resolved | Unformatted percentage on KPI card![](./images/figure-07.png)employee-management-parity-gnlqewuz2-granins-projects.vercel.app |
| **5** | Demo pages have unimplemented actions              | **Low**    | ⏳ Deferred | Photo gallery mass upload/export; statuses placeholders![](./images/figure-08.png)employee-management-parity-gnlqewuz2-granins-projects.vercel.app![](./images/figure-09.png)employee-management-parity-gnlqewuz2-granins-projects.vercel.app |

These issues should be addressed in the next iteration. None of them appear in the Stage 6 UAT checklist, so they represent new gaps introduced by the refactor. Resolving them will help achieve full parity with the WFM system and improve overall usability.

If you need further investigation or want me to retest specific scenarios, just let me know!
