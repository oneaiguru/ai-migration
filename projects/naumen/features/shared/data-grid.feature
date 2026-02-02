# features/shared/data-grid.feature
Feature: Data Grid Functionality
  As a user of the workforce management system
  I want to interact with data grids effectively
  So that I can view and manage information efficiently

  Background:
    Given I am viewing a data grid in the application

  Scenario: Sort data by column
    Given the data grid contains sortable columns
    When I click on a column header sort button
    Then the data should be sorted by that column
    And I should see a sort indicator on the column
    When I click the sort button again
    Then the sort order should reverse

  Scenario: Filter data by column
    Given the data grid contains filterable columns
    When I click on a column filter button
    Then I should see filter options for that column
    When I apply a filter
    Then only rows matching the filter should be displayed
    And I should see a filter indicator on the column

  Scenario: Refresh data
    Given I am viewing data in the grid
    When I click the refresh button
    Then the data should be reloaded from the server
    And I should see the most current information

  Scenario: Virtual scrolling performance
    Given I have a large dataset (500+ items)
    When I scroll through the data grid
    Then the scrolling should be smooth and responsive
    And only visible rows should be rendered
    And memory usage should remain stable

  Scenario: Column resize
    Given I am viewing a data grid with resizable columns
    When I drag the column border to resize
    Then the column width should adjust accordingly
    And the layout should remain stable

  Scenario: Select all items
    When I click the "select all" checkbox in the header
    Then all visible items should be selected
    And bulk action buttons should become enabled
    When I click the "select all" checkbox again
    Then all items should be deselected
  @performance @virtualization @benchmark
  Scenario: Memory usage optimized for 1000-row dataset
    Given я загружаю таблицу с "1000 строками"
    When я прокручиваю список от начала до конца
    Then общий расход памяти не превышает "100MB"
    And рендерятся только видимые строки

  @performance @loading
  Scenario: Lazy loading new rows with intersection observer
    Given таблица отображает первые 100 строк
    When я достигаю конца списка
    Then автоматически подгружаются следующие 100 строк
    And индикатор загрузки отображается ненадолго

  @performance @virtualization
  Scenario: Smooth scrolling remains above 60fps
    Given открыт список из более "500 элементов"
    When я быстро прокручиваю колесиком мыши
    Then частота кадров не падает ниже "60 FPS"

  @performance
  Scenario: Component cleanup removes scroll listeners
    Given я закрываю страницу с таблицей
    When компонент списка размонтируется
    Then все слушатели прокрутки удаляются
    And утечек памяти не происходит

  @performance
  Scenario: Bundle size tracked after feature toggles
    Given разработчик собирает модуль таблицы с отключенными опциями
    When выполняется анализ Webpack
    Then итоговый размер бандла фиксируется для сравнения
