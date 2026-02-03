Feature: File Concatenation
  To verify the file concatenation tool works correctly,
  As a user,
  I want to select files and have their contents concatenated (with an optional folder tree).

  Scenario: Concatenate selected files with tree
    Given a project directory exists with files
    When I select files "file1.txt" and "file2.txt"
    And I request concatenation with tree included
    Then the API returns concatenated content that includes a tree structure
    And the content of "file1.txt" and "file2.txt" is present