Feature: Task Parsing
  As a freelancer
  I want the system to automatically parse my inputs
  So that I can automate my workflow

  Scenario: Parse project list
    Given a project list file with 2 projects
    When the task parser processes the file
    Then it should extract 2 structured tasks
    And each task should have the correct priority and deadline

  Scenario: Parse bug report
    Given a bug report file for a critical issue
    When the task parser processes the bug report
    Then it should extract a task with high priority
    And the task should be categorized as "bug_fix_prioritization"
