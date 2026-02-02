# features/admin/request-management.feature
Функционал: Управление заявками на изменение расписания
  Как менеджер по персоналу
  Я хочу управлять заявками на изменение расписания
  Чтобы я мог утверждать или отклонять запросы на изменение графика

  Предыстория:
    Дано I am logged into the system
    И I am on the schedule requests page

  Сценарий: Просмотр текущих заявок по умолчанию
    Когда the page loads
    Тогда I should see the "Актуальные заявки" filter selected by default
    И I should see a list of current schedule requests
    И requests should show employee names, dates, and status

  Сценарий: Фильтрация заявок по периоду дат
    Дано I am viewing the requests page
    Когда I select "Заявки за период" filter option
    Тогда I should see date range picker fields become enabled
    И I should be able to select start and end dates
    Когда I select a date range
    Тогда I should see only requests within that period

  Сценарий: Фильтрация заявок по статусу
    Дано I am viewing the requests page
    Когда I check the "на рассмотрении" status filter
    Тогда I should see only requests with "under review" status
    Когда I check the "одобренные" status filter
    Тогда I should see only approved requests
    Когда I check the "отклонённые" status filter
    Тогда I should see only rejected requests

  Сценарий: Просмотр подробностей заявки
    Дано I have schedule requests displayed
    Когда I click on a request row
    Тогда I should see detailed request information including:
      | Field | Content |
      | Employee Name | Full name of requesting employee |
      | Activity Request | Type of schedule change requested |
      | Submission Date | When the request was submitted |
      | Start Time | Requested start time |
      | End Time | Requested end time |
      | Comments | Employee's comment on the request |
      | Manager Comments | Manager's feedback if any |

  Сценарий: Выбор нескольких заявок
    Когда I click the checkbox in the header row
    Тогда all visible requests should be selected
    И the bulk action buttons should become enabled

  Сценарий: Массовое одобрение заявок
    Дано I have selected multiple requests
    И the selected requests are in "under review" status
    Когда I click the "Одобрить выбранные" button
    Тогда I should see a confirmation dialog
    Когда I confirm the bulk approval
    Тогда all selected requests should be marked as approved
    И I should see a success notification
    И the requests should be updated in the list

  Сценарий: Массовое отклонение заявок
    Дано I have selected multiple requests
    И the selected requests are in "under review" status
    Когда I click the "Отклонить выбранные" button
    Тогда I should see a confirmation dialog
    Когда I confirm the bulk rejection
    Тогда all selected requests should be marked as rejected
    И I should see a success notification
    И the requests should be updated in the list

  Сценарий: Экспорт отчета по заявкам
    Дано there are requests displayed in the list
    Когда I click the "Выгрузить отчет по заявкам" button
    Тогда a report file should be generated
    И the file should download to my device
    И the report should contain all visible request data

  Сценарий: Просмотр заявки в статусе рассмотрения
    Дано there is a request with "under review" status
    Когда I view the request in the list
    Тогда I should see a gray process icon
    И the status should display as "на рассмотрении"

  Сценарий: Просмотр одобренной заявки
    Дано there is a request with "approved" status
    Когда I view the request in the list
    Тогда I should see a green check icon
    И the status should display as "одобрена"

  Сценарий: Просмотр отклоненной заявки
    Дано there is a request with "rejected" status
    Когда I view the request in the list
    Тогда I should see a red denied icon
    И the status should display as "отклонено"
  @bulk @workflow
  Сценарий: Массовое одобрение заявок с условными изменениями
    Дано админ выбрал "25 заявок на изменение графика"
    И заявки имеют статус "ожидает утверждения"
    Когда админ нажимает "Массовое утверждение"
    И указывает условие "только заявки до 3 дней"
    Тогда система фильтрует подходящие заявки
    И отображает предварительный результат "18 заявок"
    И выполняется массовое утверждение с уведомлениями

  @bulk
  Сценарий: Массовое отклонение с обязательным указанием причины
    Дано I have selected multiple requests
    Когда I click "Массовое отклонение"
    И I enter rejection reason "недостаточно смен"
    Тогда all selected requests should be marked as rejected
    И employees should receive notification

  Сценарий: Многоступенчатый процесс утверждения
    Дано a request is submitted for schedule change
    Когда the supervisor approves the request
    И the HR manager confirms the approval
    Тогда the request status should change to "одобрена"
    И audit trail should record both approvals

  Сценарий: Система повышения приоритета заявки
    Дано a request is nearing its start date
    Когда the system detects less than 2 days remaining
    Тогда the priority should escalate to "Высокий"
    И managers should be alerted to review immediately

  Сценарий: Условное одобрение с корректировкой графика
    Дано I review a schedule change request
    Когда I approve with condition "сдвинуть начало на час позже"
    Тогда the employee should be prompted to accept the modification
    И the request status remains pending until confirmed

  Сценарий: Делегирование заявки другому менеджеру
    Дано I am viewing a pending request
    Когда I choose to delegate it to "Старший менеджер"
    Тогда that manager should receive the request in their queue
    И the delegation should be logged in history

  @analytics
  Сценарий: Анализ динамики заявок со временем
    Дано I open the request analytics dashboard
    Когда I view statistics by month
    Тогда I should see graphs of submission counts and approval rates
    И I should identify peak periods of activity

  Сценарий: Многоуровневая сортировка заявок
    Дано I have a list of requests
    Когда I sort by "Статус" then by "Приоритет"
    Тогда the table should order requests accordingly

  Сценарий: Расширенная фильтрация с операторами
    Дано I open расширенные фильтры
    Когда I set condition "Приоритет >= Средний" and "Статус != отклонено"
    Тогда only matching requests should remain in the list

  Сценарий: Настройка видимости и порядка колонок
    Дано I customize the request table columns
    Когда I hide the "Описание" column
    И move "Приоритет" before "Дата подачи"
    Тогда the table layout should update to my preference

  Сценарий: Редактирование ячеек с проверкой
    Дано I edit a request note inline
    Когда I enter text over 500 символов
    Тогда the system should display a validation error
    И the change should not be saved

  Сценарий: Группировка строк и агрегирование по отделам
    Дано I group requests by "Отдел"
    Тогда the table should show aggregated counts per group
    И I should be able to collapse or expand each department

  @performance
  Сценарий: Виртуальная прокрутка при 500+ заявках
    Дано the system contains over 500 pending requests
    Когда I scroll through the list
    Тогда rows should render smoothly without lag

  Сценарий: Модальное окно заявки с вложениями и историей
    Дано I open a request in the modal dialog
    Тогда I should see tabs "Детали", "История", "Файлы"
    И I can upload документы for preview
    И comment threads should track manager notes
    И related requests should be linked for reference

  @export
  Сценарий: Массовый экспорт выбранных заявок в архив ZIP
    Дано I have selected multiple requests
    Когда I choose "Экспорт ZIP"
    Тогда the system generates a ZIP file with request reports
    И the download should start automatically

  @realtime
  Сценарий: Уведомление об одобренной заявке
    Дано запрос сотрудника был одобрен менеджером
    Когда статус изменяется на "одобрена"
    Тогда пользователи получают уведомление о принятии заявки

  @realtime
  Сценарий: Уведомление об отклоненной заявке
    Дано запрос сотрудника был отклонён менеджером
    Когда статус изменяется на "отклонено"
    Тогда пользователи получают уведомление об отказе

  @realtime @integration
  Сценарий: Массовое обновление заявок отправляет сообщение WebSocket
    Дано я выбрал несколько заявок для массового утверждения
    Когда подтверждаю операцию
    Тогда сервер отправляет сообщение "requests:updated" для всех клиентов
    И списки заявок обновляются без перезагрузки
