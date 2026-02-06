# features/admin/employee-management.feature
Функционал: Управление сотрудниками
  Как менеджер по персоналу
  Я хочу управлять информацией о сотрудниках и их профилями
  Чтобы поддерживать точные данные о персонале с фотографиями и подробной информацией

  Background:
    Дано I am logged into the workforce management system
    И I have manager privileges
    И I am on the employees page
    И I have access to contact center "Контакт-центр 1010"

  Сценарий: Просмотр списка сотрудников с фотографиями
    Дано there are employees in the system
    Когда I access the employees section
    Тогда I should see a grid of all employees with profile photos
    И each employee should display basic information
    И I should see employee photos loaded from the file system
    И the employee list should be virtualized for performance

  Сценарий: Добавление нового сотрудника с профилем
    Дано I am on the employees page
    Когда I click the "Add Employee" button
    И I fill in the employee details form:
      | Field | Value |
      | First Name | Иван |
      | Last Name | Иванов |
      | Employee ID | EMP001 |
      | Department | Контакт-центр 1010 |
      | Position | Оператор |
      | Start Date | 2024-01-15 |
      | Skills | Входящая линия_1 |
    И I upload a profile photo
    И I click "Save"
    Тогда the new employee should be added to the system
    И I should see a success confirmation message
    И the employee photo should be stored and displayed

  Сценарий: Редактирование данных сотрудника
    Дано there is an employee "Иван Иванов" in the system
    Когда I click on the employee "Иван Иванов"
    И I click the "Edit" button
    И I update the employee's position to "Старший оператор"
    И I modify their skills to include additional queues
    И I click "Save"
    Тогда the employee's information should be updated
    И I should see a success confirmation message

  Сценарий: Просмотр профиля сотрудника с фотогалереей
    Дано there is an employee with multiple photos in the system
    Когда I click on the employee profile
    Тогда I should see their detailed profile information
    И I should see their main profile photo
    И I should be able to view additional photos in a gallery
    И I should see employee work history and assignments

  Сценарий: Поиск сотрудников по различным критериям
    Дано there are multiple employees in the system
    Когда I use the employee search functionality
    И I search by name "Иванов"
    Тогда I should see only employees matching "Иванов"
    Когда I search by skills "Входящая линия_1"
    Тогда I should see only employees with that skill
    Когда I search by department
    Тогда I should see department-filtered results

  Сценарий: Управление навыками и квалификацией сотрудников
    Дано I am viewing an employee profile
    Когда I access the skills management section
    И I add new skills like "Техническая поддержка"
    И I set skill proficiency levels
    И I add certifications and training records
    Тогда the employee's skill profile should be updated
    И the skills should be available for schedule assignment

  Сценарий: Отслеживание рабочих показателей сотрудников
    Дано I am viewing an employee's profile
    Когда I access their performance metrics
    Тогда I should see their work statistics including:
      | Metric | Description |
      | Attendance Rate | Percentage of scheduled shifts attended |
      | Punctuality Score | On-time arrival performance |
      | Overtime Hours | Extra hours worked |
      | Schedule Adherence | Compliance with assigned schedule |

  Сценарий: Управление организационной иерархией сотрудников
    Дано I have employees with different roles
    Когда I set up reporting relationships
    И I assign supervisors to agents
    И I define team structures
    Тогда the organizational hierarchy should be reflected in the system
    И supervisors should have access to their team member's information

  Сценарий: Работа с фотографиями и медиа сотрудников
    Дано I am managing employee profiles
    Когда I upload employee photos
    Тогда the photos should be stored securely
    И photos should be resized appropriately for display
    И I should be able to update or remove photos
    И photo file names should follow the UUID format pattern

  Сценарий: Экспорт данных сотрудников
    Дано I have employees displayed in the list
    Когда I select employees for export
    И I choose export format (Excel, CSV, PDF)
    Тогда I should be able to download employee data
    И the export should include all relevant employee information
    И photos should be optionally included in the export

  Сценарий: Массовые операции с сотрудниками
    Дано I have multiple employees selected
    Когда I perform bulk operations like:
      | Operation | Description |
      | Skills Assignment | Add skills to multiple employees |
      | Department Transfer | Move employees between departments |
      | Status Update | Change employment status |
      | Schedule Template | Apply schedule templates |
    Тогда the bulk operation should be applied to all selected employees
    И I should see confirmation of successful operations

  @performance
  Сценарий: Работа с большой базой сотрудников с фотографиями
    Дано I have 500+ employees with profile photos
    Когда I load the employee management page
    Тогда the employee grid should load efficiently using virtualization
    И photos should be lazy-loaded as needed
    И search and filtering should remain responsive
    И the interface should handle the large dataset smoothly

  @performance @loading
  Сценарий: Постепенная загрузка фото сотрудников предотвращает блокировки
    Дано список сотрудников содержит более "1000 фотографий"
    Когда я быстро прокручиваю страницу вниз
    Тогда фотографии догружаются по мере появления в области видимости
    И скорость прокрутки не замедляется

  @performance @virtualization
  Сценарий: Переработка виртуального списка освобождает память под фото
    Дано открыта страница сотрудников со списком 1000 элементов
    Когда я возвращаюсь к верхней части списка
    Тогда ранее отрисованные фотографии освобождают память
    И общий расход памяти не превышает "120MB"

  @performance
  Сценарий: Кэшированные изображения ускоряют повторное посещение
    Дано фотографии сотрудников были загружены ранее
    Когда я повторно открываю страницу сотрудников
    Тогда изображения отображаются из кеша без задержки
    И сетевые запросы к фотографиям отсутствуют

  Сценарий: Изменение статуса сотрудника с активного на отпуск
    Дано employee "EMP001" is currently active
    Когда I initiate status change to "В отпуске" with reason "Ежегодный отпуск"
    Тогда the employee status becomes "vacation"
    И the change is recorded with effective date

  Сценарий: Активирование неактивного сотрудника с одобрением
    Дано employee "EMP045" has status "inactive"
    Когда I change status to "active" and specify reason "Возврат из длительного отсутствия"
    И менеджер подтверждает изменение
    Тогда статус сотрудника обновляется на "active"
    И система фиксирует одобренное изменение

  Сценарий: Массовое изменение статуса с фиксацией причины
    Дано I select employees EMP010, EMP011 and EMP012
    Когда I set their status to "inactive" with reason "Сезонная приостановка"
    Тогда каждый выбранный сотрудник получает новый статус
    И в журнал изменений отображается указанная причина

  @notification
  Сценарий: Уведомление сотрудника об изменении статуса
    Дано статус сотрудника "EMP100" изменён на "vacation"
    Когда изменение сохраняется
    Тогда система отправляет уведомление данному сотруднику
    И запись появляется в истории уведомлений

  Сценарий: Просмотр истории изменения статусов
    Дано я нахожусь в профиле сотрудника "EMP050"
    Когда открываю раздел "История статусов"
    Тогда вижу все изменения статуса с указанием дат и причин
    И могу экспортировать историю в PDF
