Feature: Things TUI Clone
  As a Things user
  I want a terminal UI clone of Things.py
  So I can manage tasks from the command line

  Background:
    Given Things TUI is running with real data

  # ===========================================================================
  # PHASE 2: Read-Only Features (Navigation, Display, Search, Filter)
  # ===========================================================================

  # @leaf_2_1 List Navigation (1-4 keys)
  # ===================================

  @leaf_2_1 @read_only @navigate_lists
  Scenario: Navigate to Today with '1' key
    When I press '1'
    Then current list changes to "Today"
    And status bar shows "Today"
    And tasks from Today displayed

  @leaf_2_1 @read_only @navigate_lists
  Scenario: Navigate to Upcoming with '2' key
    When I press '2'
    Then current list changes to "Upcoming"
    And status bar shows "Upcoming"

  @leaf_2_1 @read_only @navigate_lists
  Scenario: Navigate to Anytime with '3' key
    When I press '3'
    Then current list changes to "Anytime"
    And status bar shows "Anytime"
    And loads 5655 anytime tasks

  @leaf_2_1 @read_only @navigate_lists
  Scenario: Navigate to Someday with '4' key
    When I press '4'
    Then current list changes to "Someday"
    And status bar shows "Someday"
    And loads 278 someday tasks

  @leaf_2_1 @read_only @navigate_lists
  Scenario: Selection resets on list change
    Given I select task at position 5
    When I press '1' to switch lists
    Then selection resets to position 0
    And first task is highlighted

  @leaf_2_1 @read_only @navigate_lists
  Scenario: List shows correct task count
    When I press '1'
    Then status bar shows "X" slash 87
    When I press '3'
    Then status bar shows "X" slash 5655

  @leaf_2_1 @read_only @navigate_lists
  Scenario: Sidebar shows active list
    When I press '2'
    Then sidebar highlights "2 Upcoming"
    When I press '3'
    Then sidebar highlights "3 Anytime"

  @leaf_2_1 @read_only @navigate_lists
  Scenario: List displays immediately
    When I press any list key (1-4)
    Then list updates without delay
    And tasks render instantly

  # @leaf_2_2 Task Selection (↑↓/jk keys)
  # =====================================

  @leaf_2_2 @read_only @select_tasks
  Scenario: Navigate down with arrow key
    Given task list has multiple items
    When I press Down arrow
    Then selection moves to next task
    And previous task no longer highlighted

  @leaf_2_2 @read_only @select_tasks
  Scenario: Navigate down with 'j' key
    Given task list has multiple items
    When I press 'j'
    Then selection moves to next task
    And uses vim keybindings

  @leaf_2_2 @read_only @select_tasks
  Scenario: Navigate up with arrow key
    Given task list has multiple items
    When I press Up arrow
    Then selection moves to previous task

  @leaf_2_2 @read_only @select_tasks
  Scenario: Navigate up with 'k' key
    Given task list has multiple items
    When I press 'k'
    Then selection moves to previous task

  @leaf_2_2 @read_only @select_tasks
  Scenario: Selection cannot go above first task
    Given task list has multiple items
    And selection is on first task
    When I press Up arrow
    Then selection stays on first task

  @leaf_2_2 @read_only @select_tasks
  Scenario: Selection cannot go below last task
    Given task list has multiple items
    And selection is on last task
    When I press Down arrow
    Then selection stays on last task

  @leaf_2_2 @read_only @select_tasks
  Scenario: Status bar shows selection position
    Given task list has multiple items
    When I select task at position 5
    Then status bar shows "5"

  @leaf_2_2 @read_only @select_tasks
  Scenario: Visual highlighting shows selection
    Given task list has multiple items
    When I select a task
    Then selected task shows inverse video
    And other tasks show normal video

  @leaf_2_2 @read_only @select_tasks
  Scenario: Rapid navigation is smooth
    Given task list has multiple items
    When I press Down 10 times
    Then all selections register smoothly
    And no lag or missed keys

  # @leaf_2_3 Task Detail View (Enter key)
  # =======================================

  @leaf_2_3 @read_only @detail_view
  Scenario: Detail view opens with Enter
    Given at least one task exists in current list
    When I select a task
    And I press Enter
    Then detail view opens
    And shows task title

  @leaf_2_3 @read_only @detail_view
  Scenario: Detail view shows complete information
    Given at least one task exists in current list
    When I select task "Buy milk"
    And I press Enter
    Then detail view displays:
      | title  | Buy milk        |
      | status | Active          |
      | list   | Today           |

  @leaf_2_3 @read_only @detail_view
  Scenario: Detail view shows notes if present
    Given at least one task exists in current list
    And task has notes "Remember to get organic"
    When I select it
    And I press Enter
    Then detail view shows notes section
    And notes text is visible

  @leaf_2_3 @read_only @detail_view
  Scenario: Detail view shows tags
    Given at least one task exists in current list
    And task has tags "shopping, urgent"
    When I select it
    And I press Enter
    Then detail view shows tags
    And all tags displayed with # prefix

  @leaf_2_3 @read_only @detail_view
  Scenario: Detail view shows due date
    Given at least one task exists in current list
    And task has due date "Today"
    When I select it
    And I press Enter
    Then detail view shows due date
    And displays formatted date

  @leaf_2_3 @read_only @detail_view
  Scenario: Close detail view with any key
    Given at least one task exists in current list
    When I press Enter on selected task
    And detail view is open
    And I press 'q'
    Then detail view closes
    And I'm back at task list
    And selection preserved

  @leaf_2_3 @read_only @detail_view
  Scenario: Detail view handles long notes
    Given at least one task exists in current list
    And task has very long notes
    When I press Enter
    Then detail view scrolls
    And all notes visible

  # @leaf_2_4 Search (/ key)
  # ========================

  @leaf_2_4 @read_only @search
  Scenario: Search opens with slash key
    When I press '/'
    Then search dialog appears
    And input field is focused

  @leaf_2_4 @read_only @search
  Scenario: Search finds tasks by title
    When I press '/'
    And I type "python"
    Then search results show tasks containing "python"

  @leaf_2_4 @read_only @search
  Scenario: Search finds tasks by notes
    When I press '/'
    And I type "meeting"
    Then search results show tasks with notes containing "meeting"

  @leaf_2_4 @read_only @search
  Scenario: Search is case-insensitive
    When I press '/'
    And I type "PYTHON"
    Then results match "python" (case-insensitive)

  @leaf_2_4 @read_only @search
  Scenario: Cancel search with Escape
    When I press '/'
    And I press Escape
    Then search dialog closes
    And I'm back at previous list

  @leaf_2_4 @read_only @search
  Scenario: Search results in dedicated list
    When I press '/'
    And I type "python"
    And I press Enter
    Then current list changes to "Search Results"
    And status bar shows search query

  @leaf_2_4 @read_only @search
  Scenario: Empty search returns no results
    When I press '/'
    And I type "nonexistent_xyz_123"
    Then "No tasks" message appears

  # @leaf_2_5 Tag Filtering (t key)
  # ===============================

  @leaf_2_5 @read_only @filter_tags
  Scenario: Tag filter opens with 't' key
    Given tasks have tags assigned
    When I press 't'
    Then tag filter interface opens
    And all available tags listed

  @leaf_2_5 @read_only @filter_tags
  Scenario: Select single tag
    Given tasks have tags assigned
    When I press 't'
    And I select tag "shopping"
    And I press Enter
    Then list filtered to show only "shopping" tasks
    And status bar shows "1 tag(s) selected"

  @leaf_2_5 @read_only @filter_tags
  Scenario: Select multiple tags
    Given tasks have tags assigned
    When I press 't'
    And I select tag "work"
    And I select tag "urgent"
    And I press Enter
    Then list shows tasks with either "work" OR "urgent"
    And status bar shows "2 tag(s) selected"

  @leaf_2_5 @read_only @filter_tags
  Scenario: Visual feedback for selected tags
    Given tasks have tags assigned
    When I press 't'
    And I navigate to tag "shopping"
    And I press Space
    Then tag shows checkmark
    And tag is highlighted

  @leaf_2_5 @read_only @filter_tags
  Scenario: Clear all filters with 'c'
    Given tasks have tags assigned
    And filters are active
    When I press 'c'
    Then all filters removed
    And full list restored
    And status bar updated

  @leaf_2_5 @read_only @filter_tags
  Scenario: No tasks match filter
    Given tasks have tags assigned
    When I press 't'
    And I select rarely-used tag
    And I press Enter
    Then "No tasks" message appears
    And list shows as empty

  @leaf_2_5 @read_only @filter_tags
  Scenario: Filter persists during navigation
    Given tasks have tags assigned
    And filter is active with "shopping"
    When I press 'r' to refresh
    Then filter still active
    And "shopping" tasks still displayed

  # @leaf_2_6 Status Bar (Integrated)
  # ==================================
  # (Status bar tested as part of other scenarios)

  # ===========================================================================
  # PHASE 3: Write Operations (Data Mutation)
  # ===========================================================================

  # @leaf_3_1 Quick-Add Task (n key)
  # ================================

  @leaf_3_1 @write @quick_add
  Scenario: Quick-add opens with 'n' key
    When I press 'n'
    Then quick-add input dialog opens
    And input field is focused
    And cursor ready for typing

  @leaf_3_1 @write @quick_add
  Scenario: Create new task with title only
    When I press 'n'
    And I type "Buy groceries"
    And I press Enter
    Then new task created with title "Buy groceries"
    And task appears in current list
    And success message shown

  @leaf_3_1 @write @quick_add
  Scenario: New task added to Today list by default
    When I press '1' to ensure on Today list
    And I press 'n'
    And I type "New task"
    And I press Enter
    Then task appears in Today list
    And status bar updates with new count

  @leaf_3_1 @write @quick_add
  Scenario: Cancel quick-add with Escape
    When I press 'n'
    And I press Escape
    Then quick-add dialog closes
    And no task created
    And list remains unchanged

  @leaf_3_1 @write @quick_add
  Scenario: Quick-add focuses selection on new task
    When I press 'n'
    And I type "New task"
    And I press Enter
    Then new task is created
    And selection moves to newly created task
    And newly created task is highlighted

  @leaf_3_1 @write @quick_add
  Scenario: Multiple quick-adds in succession
    When I press 'n'
    And I type "First task"
    And I press Enter
    And I press 'n'
    And I type "Second task"
    And I press Enter
    Then both tasks created
    And both appear in list
    And second task is selected

  @leaf_3_1 @write @quick_add
  Scenario: Quick-add trims whitespace from title
    When I press 'n'
    And I type "  Task with spaces  "
    And I press Enter
    Then task created with title "Task with spaces"
    And no leading or trailing whitespace

  @leaf_3_1 @write @quick_add
  Scenario: Empty task title rejected
    When I press 'n'
    And I press Enter without typing
    Then error message shown "Title cannot be empty"
    And quick-add dialog remains open
    And no task created
