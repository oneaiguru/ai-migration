# features/admin/absenteeism-calculation.feature
Feature: Absenteeism Forecasting
  As a workforce manager
  I want to calculate and manage absenteeism forecasts
  So that I can plan staffing requirements effectively

  Background:
    Given I am logged into the workforce management system
    And I am on the "Расчёт абсентеизма" page
    And I have access to contact center "Контакт-центр 1010"

  Scenario: Building an absenteeism forecast with daily intervals
    Given I have configured forecast settings
    When I set the forecast horizon from "17.07.2023" to "17.07.2024"
    And I select interval size as "День" (Day)
    And I click "Построить прогноз" (Build Forecast)
    Then the system should generate an absenteeism forecast
    And I should see the forecast results displayed
    And the forecast should include daily predictions for the specified period

  Scenario: Viewing existing absenteeism profiles
    Given there are existing absenteeism profiles in the system
    When I navigate to the absenteeism calculation page
    Then I should see a table with columns:
      | Дата построения | Навык факта абсентеизма | Описание профиля прогноза | Действия |
    And each row should show profile details like "ВХ_Линия_гр1"
    And each row should have action buttons for Apply, Export, Edit, and Delete

  Scenario: Applying an absenteeism profile
    Given I have an existing absenteeism profile for skill "ВХ_Линия_гр1"
    When I click the "Применить" (Apply) button for that profile
    Then the profile should be applied to the current forecast
    And the system should confirm the application

  Scenario: Exporting an absenteeism profile
    Given I have an existing absenteeism profile
    When I click the export button (upload icon)
    Then the system should export the profile data
    And I should receive a downloadable file

  Scenario: Editing an absenteeism profile
    Given I have an existing absenteeism profile
    When I click the edit button (pencil icon)
    Then I should be taken to the profile editing interface
    And I should be able to modify profile parameters

  Scenario: Deleting an absenteeism profile
    Given I have an existing absenteeism profile
    When I click the delete button (trash icon)
    Then I should see a confirmation dialog
    When I confirm the deletion
    Then the profile should be removed from the system

  Scenario: Configuring periodic exceptions
    Given I want to set up recurring exceptions
    When I expand the "Периодические исключения" section
    And I configure weekly or monthly recurring patterns
    Then the system should save the periodic exceptions
    And these exceptions should be applied to future forecasts

  Scenario: Setting one-time exceptions
    Given I need to account for a special event or holiday
    When I expand the "Разовые исключения" section
    And I select specific dates for exceptions
    And I specify the type of exception
    Then the system should save the one-time exceptions
    And these exceptions should be applied to the forecast for those dates