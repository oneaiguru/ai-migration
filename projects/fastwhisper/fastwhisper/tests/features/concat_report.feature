Feature: Concatenate transcriptions with full path headings
  As a user
  I want a script to ensure transcripts exist and build a concatenated report
  So that each section is headed by the full absolute audio path

  Scenario: Generate concatenated report when transcripts are missing
    Given three audio files in a temporary directory
    And transcribe_audio is mocked to write outputs
    When I run the concat script with those inputs
    Then a concatenated report is created with absolute-path headings
    And per-file transcripts are created in the transcript directory

  Scenario: Skip re-transcription when transcripts already exist
    Given three audio files in a temporary directory
    And per-file transcripts already exist for those audios
    And transcribe_audio is mocked to raise if called
    When I run the concat script with those inputs
    Then a concatenated report is created with absolute-path headings
    And transcribe_audio was not called

  Scenario: Generate HTML report with absolute paths and links
    Given three audio files in a temporary directory
    And transcribe_audio is mocked to write outputs
    When I run the concat script with those inputs and html output
    Then an HTML report is created with absolute-path headings and transcript links

  Scenario: Exit with error on missing input file
    Given three audio files in a temporary directory
    When I run the concat script with a missing input
    Then it exits with an error and no report is created
