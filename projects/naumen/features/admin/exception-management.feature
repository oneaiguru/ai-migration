# features/admin/exception-management.feature
Feature: Exception Management
  As a workforce manager
  I want to manage calendar exceptions and holidays
  So that schedules reflect non-working days and special events

  Background:
    Given I am logged into the workforce management system
    And I have manager privileges
    And I am on the "Задать исключения" page

  @exceptions @calendar
  Scenario: Add public holiday exception
    Given админ открывает модуль "Задать исключения"
    When выбирает дату "23 февраля 2025" как "Праздничный день"
    And указывает описание "День защитника Отечества"
    Then исключение сохраняется в календаре
    And система помечает дату как нерабочую
    And уведомления отправляются сотрудникам

  Scenario: Edit existing exception description
    Given создано исключение на дату "01.05.2025" с описанием "Праздник весны"
    When я открываю его для редактирования
    And меняю описание на "Праздник труда"
    Then изменения сохраняются
    And календарь отображает новое описание

  Scenario: Deactivate past exception
    Given в списке есть прошедшее исключение "31.12.2024"
    When я отключаю его статус
    Then исключение помечается как неактивное
    And оно скрывается из списка предстоящих

  Scenario: Remove unnecessary exception
    Given имеется исключение "15.08.2025" в календаре
    When я удаляю его
    Then запись об исключении отсутствует в системе

  Scenario: View upcoming exceptions list
    Given несколько исключений созданы на будущие даты
    When я просматриваю раздел предстоящих исключений
    Then список отсортирован по дате возрастания
    And отображается количество дней до каждого события

  Scenario: Bulk deactivate selected exceptions
    Given выбрано несколько исключений из списка
    When я нажимаю "Отключить выбранные"
    Then все выбранные исключения становятся неактивными
    And система подтверждает массовое действие

  Scenario: Detect conflict with existing holiday
    Given уже существует праздничное исключение на "08.03.2025"
    When я пытаюсь добавить новое исключение на ту же дату
    Then система предупреждает о конфликте
    And предлагает изменить дату или тип исключения

  Scenario: Calendar highlights exception dates
    Given в календаре есть исключения на текущий месяц
    When я открываю календарный вид
    Then все даты с исключениями выделены цветом
    And тип исключения отображается в подсказке при наведении

  Scenario: Apply seasonal exception pattern
    Given я выбираю шаблон "Новогодние каникулы"
    When применяю его на период с "01.01.2026" по "08.01.2026"
    Then в календаре создаются соответствующие исключения на каждый день

  Scenario: Export exceptions to CSV
    Given список исключений содержит более десяти записей
    When я выбираю опцию "Экспорт в CSV"
    Then формируется файл со всеми данными исключений

  Scenario: Import exceptions from CSV
    Given у меня есть файл с новыми исключениями
    When я загружаю его через форму импорта
    Then исключения добавляются в систему
    And отображаются в списке предстоящих

  Scenario: Notify employees about changed exception
    Given сотрудникам уже отправлены уведомления об исключении "05.11.2025"
    When я изменяю дату этого исключения на "06.11.2025"
    Then система повторно отправляет уведомления с обновлённой датой

  Scenario: View statistics of active exceptions
    Given существует несколько активных и неактивных исключений
    When я смотрю сводку статистики
    Then отображается общее количество исключений
    And количество активных и предстоящих событий

  Scenario: Search exceptions by description
    Given в системе много исключений с различными описаниями
    When я ввожу текст "техобслуживание" в поле поиска
    Then отображаются только исключения с таким описанием

