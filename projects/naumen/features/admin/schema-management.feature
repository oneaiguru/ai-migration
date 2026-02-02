# features/admin/schema-management.feature
Feature: Schema Management
  As a workforce manager
  I want to create and manage scheduling schemas
  So that I can define repeating schedule patterns using shift templates

  Background:
    Given I am logged into the system
    And I am in the Schedule section
    And I am on the "Схемы" (Schemas) page
    And I have access to contact center "Контакт-центр 1010"

  Scenario: View existing shift templates in schema builder
    When I load the schemas page
    Then I should see a list of available shift templates including:
      | Shift Template | Time Pattern |
      | Смена 1 | 05/11 |
      | Смена 10 | 10/17 |
      | Смена 15 | 11:30/20:30 |
      | Смена 23 | 15/00 |
    And shift templates should be displayed in a virtualized list
    And I should see rotation variants like "1 ротация", "2 ротация", "4 ротация"

  Scenario: Search for specific shift templates
    Given I have multiple shift templates available
    When I enter "Смена 15" in the search field "Поиск по схемам"
    Then I should see only shift templates matching "Смена 15"
    And the search results should be filtered in real-time

  Scenario: View day type legend
    When I look at the schema interface
    Then I should see day type indicators:
      | Type | Color | Label |
      | Working Day | Blue circle | Рабочий |
      | Day Off | Red circle | Выходной |
      | Atypical Day | Orange circle | Нетипичный |
      | Floating Day Off | Purple circle | "Плавающий" выходной |

  Scenario: Create a new scheduling schema
    When I click the "Добавить схему" (Add Schema) button
    Then I should see a new schema creation interface
    And I should be able to select shift templates for different days
    And I should be able to define the schema rotation pattern
    And I should be able to specify day types for each position

  Scenario: Configure schema settings
    When I click the "Настройки схем" (Schema Settings) button
    Then I should see schema configuration options
    And I should be able to set default schema parameters
    And I should be able to configure global schema behaviors

  Scenario: Manage atypical days
    When I click the "Нетипичные дни" (Atypical Days) button
    Then I should see atypical day management interface
    And I should be able to define special day patterns
    And I should be able to configure how atypical days affect schemas

  Scenario: Build schema with rotation pattern
    Given I am creating a new schema
    When I select "Смена 10 (10/17)" for working days
    And I set the rotation pattern to "2 ротация"
    And I define the working day pattern
    And I add day-off positions in the rotation
    Then I should see a preview of the rotation cycle
    And the schema should show how the pattern repeats

  Scenario: Create multi-shift schema
    Given I am building a new schema
    When I assign "Смена 1 (05/11)" to some positions
    And I assign "Смена 15 (11:30/20:30)" to other positions  
    And I configure day-off positions
    Then I should have a schema that alternates between different shift types
    And the schema should maintain the defined rotation pattern

  Scenario: Configure working vs non-working days
    Given I am editing a schema
    When I mark certain positions as "Рабочий" (Working)
    And I mark other positions as "Выходной" (Day Off)
    And I set some positions as "Нетипичный" (Atypical)
    Then the schema should reflect the different day types
    And each position should have the appropriate color coding

  Scenario: Set up floating day-off pattern
    Given I am creating a schema with flexible scheduling
    When I configure "Плавающий выходной" (Floating Day Off) positions
    And I define the floating day parameters
    Then the schema should accommodate variable day-off assignments
    And the system should handle the floating day logic

  Scenario: Preview schema rotation cycle
    Given I have configured a schema with multiple rotations
    When I complete the schema setup
    Then I should see a visual preview of the full rotation cycle
    And I should be able to verify the pattern repeats correctly
    And I should see how employees would be scheduled over time

  Scenario: Apply shift template settings to schema
    Given I have selected specific shift templates
    When I incorporate them into a schema
    Then the schema should inherit the shift timing and activities
    And work activities and breaks should be preserved
    And the schema should maintain shift-specific configurations

  Scenario: Save and activate schema
    Given I have configured a complete schema
    When I save the schema configuration
    Then the schema should be available for schedule generation
    And I should be able to apply it to employee groups
    And the schema should integrate with the schedule grid system

  @performance
  Scenario: Handle large number of shift templates
    Given I have 40+ shift templates available
    When I scroll through the template list
    Then the virtualized list should load efficiently
    And template selection should be responsive
    And the interface should remain stable during operations