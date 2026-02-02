
I have now re‑checked both the **real Naumen WFM** system and the latest **parity build** in a browser, following the full golden journey. Here is what I found:

### Validation of the Golden Journey (Russian text)

* **Filter panel:** In the replica (`nsp559gx9`) the employee list has a filter panel with “Скрыть фильтры/Показать фильтры”, search by FIO/login, dropdowns for team and status, sort/order, free‑text fields for “Должность” and “Точка оргструктуры”, and a toggle “Показывать уволенных”![](https://sdmntprnorthcentralus.oaiusercontent.com/files/00000000-7758-622f-8f8a-855542d83f2c/raw?se=2025-10-09T00%3A21%3A47Z&sp=r&sv=2024-08-04&sr=b&scid=a903634d-8f34-544f-bec2-cf4000b246c8&skoid=1e4bb9ed-6bb5-424a-a3aa-79f21566e722&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2025-10-08T22%3A35%3A16Z&ske=2025-10-09T22%3A35%3A16Z&sks=b&skv=2024-08-04&sig=GRfw1U2fjTRJoQwaYl7r8zHP/OhyQeIagExVqByjjsk%3D)employee-management-parity-gnlqewuz2-granins-projects.vercel.app. In Naumen WFM there is no such panel—only a simple search and a toggle for dismissed employees. Your golden journey correctly describes the replica UI; keep the note that a hire‑date filter is absent.
    
* **Quick Add:** The replica’s **Новый сотрудник** modal asks for `логин WFM`, `пароль`, and `повтор пароля` and then opens the right‑side edit drawer![](https://sdmntprnorthcentralus.oaiusercontent.com/files/00000000-7a90-622f-8886-854bde3d21d1/raw?se=2025-10-09T00%3A21%3A47Z&sp=r&sv=2024-08-04&sr=b&scid=c3e4247a-cc77-52aa-a4b0-7b0f08cc68e0&skoid=1e4bb9ed-6bb5-424a-a3aa-79f21566e722&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2025-10-08T22%3A35%3A07Z&ske=2025-10-09T22%3A35%3A07Z&sks=b&skv=2024-08-04&sig=OBHU4Sib7pgCIHfub21LgRfdvE2NKVGczsMCGEuJi0k%3D)employee-management-parity-nsp559gx9-granins-projects.vercel.app. The WFM system’s add dialog appears on the left and only asks for login and password (no confirmation). Since the golden journey is for the replica, the current text is correct.
    
* **Edit drawer:** The replica uses a right‑side drawer with required fields (surname, name, patronymic optional, login, external logins, password, structure point, office, position, time zone, hour norm, status) and optional fields (contacts, dates, tags, skills, reserve skills, preferred shifts/schemes, tasks)![](https://sdmntprnorthcentralus.oaiusercontent.com/files/00000000-4980-622f-8f62-1b788a394e3f/raw?se=2025-10-09T00%3A21%3A47Z&sp=r&sv=2024-08-04&sr=b&scid=8498924b-9fe9-5490-80cc-e22b8f6717a6&skoid=1e4bb9ed-6bb5-424a-a3aa-79f21566e722&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2025-10-08T22%3A35%3A15Z&ske=2025-10-09T22%3A35%3A15Z&sks=b&skv=2024-08-04&sig=zhJlGNr%2BlswIAn9mTUuZiO0ZvGEoli9fTQqBznYEFxc%3D)employee-management-parity-nsp559gx9-granins-projects.vercel.app. WFM uses a left‑side drawer with a similar but wider list of fields and includes an overtime checkbox (`Переработка: Не допускать переработок`)![](https://sdmntprsouthcentralus.oaiusercontent.com/files/00000000-dc84-61f7-928e-b20d29705cdb/raw?se=2025-10-09T00%3A21%3A47Z&sp=r&sv=2024-08-04&sr=b&scid=9480259c-bc98-5cc5-bc81-6cc0c6f1539d&skoid=1e4bb9ed-6bb5-424a-a3aa-79f21566e722&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2025-10-08T22%3A35%3A02Z&ske=2025-10-09T22%3A35%3A02Z&sks=b&skv=2024-08-04&sig=uLcRuxuVzz8sa/10%2B6bNqQq87x/8OVcToSofs2AUAo8%3D)wfm-practice51.dc.oswfm.ru. Your golden journey correctly states that the replica drawer opens on the **right** and that there is **no overtime toggle** in the current version.
    
* **Bulk edit:** In the replica, the bulk edit drawer supports status, team, hour norm, work scheme, skills, reserve skills, tags and a comment. The team field only offers **“Заменить всем”**; there is no Add/Remove option. Please update the Russian text to reflect that team can only be replaced. All other fields do offer Add/Replace/Remove.
    
* **Tag manager:** The replica opens the tag manager overlay from the right; new tags are appended to the list and, in the latest build, automatically scrolled into view and highlighted. This matches the golden journey (with the minor note about auto‑scroll now working).
    
* **Import/Export:** The replica supports imports for employees, skills, vacations, shift preferences, schemes and tags. In the latest build each modal shows correct headings, appendix references and required column hints. Exports include current‑columns CSV, vacations and tags. WFM only exports vacations and tags. Your Russian text should mention that only the documented categories are supported; ensure you don’t promise other formats.
    
* **Dismiss/Restore:** The workflow described in the golden journey (dismiss removes future assignments, restore returns the employee when the “Показывать уволенных” toggle is on) matches WFM behaviour.
    

### Remaining text tweaks

1. **Команда in bulk edit:** note that only “Заменить всем” is available (no add/remove).
    
2. **Tag manager note:** mention that new tags are now auto‑scrolled and highlighted.
    
3. **Clarify differences vs WFM:** Keep the Known Differences table (KD‑04, KD‑05, KD‑06) noting that hire‑date filter, overtime toggle and broader bulk‑edit fields are absent in the parity UI.
    

### Plan for final Stage 6 comparison (browser‑only)

To systematically verify that the latest refactor matches the checklist and the legacy build, follow this order:

1. **Prepare:** Open both URLs (`nsp559gx9` and the legacy `…7b28yt9nh…`) in separate tabs. Clear local storage or use an incognito window for each. Work at 1440×900 px.
    
2. **Run the Stage 6 focus checks:**
    
    * **Import modals:** Open each category and confirm headings, appendix references, allowed formats, required columns and CSV templates are correct. Validate that invalid uploads produce appropriate error messages.
        
    * **Bulk‑edit drawer:** Select multiple employees and ensure that selecting a team value auto‑activates “Заменить всем” in the new build (and note the old behaviour in the legacy build).
        
    * **Tag manager:** Create a tag and verify that the new build auto‑scrolls to the tag and highlights it; confirm the old build requires manual scrolling.
        
    * **Performance dashboard:** Navigate to `Показатели` and confirm KPI numbers are rounded in the new build (no long decimals).
        
3. **General parity sweep:** Re‑check filters, sorting, quick add, edit drawer (including dismiss/restore), export options, column settings and keyboard navigation to ensure no new regressions have been introduced.
    
4. **Triage demo modules:** Visit Фото галерея, Показатели, Статусы, Сертификации and Навыки; document that these are demonstration pages and note which features remain to be implemented if the product team wants to ship them before migration.
    
5. **Document:** Record pass/fail results in the Stage 6 checklist and summarise findings in the handoff log. Create follow‑up tasks for any issues or demo modules in `TODO_AGENT.md`.
    

By validating each golden‑journey step in the browser and following the ordered Stage 6 checks, you’ll ensure that your documentation and parity assessments are based on verified behaviour rather than assumptions.