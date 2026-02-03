Feature: Greeting and closing signals
  Use preprocessor signals to verify greeting components and closing position constraints.

  Background:
    Given I load the preprocessor output for call "05"

  Scenario: GR01+GR02 in first agent utterance
    Then signal "greeting.first_agent_company" is true
    And signal "greeting.first_agent_name" is true
    And signal "greeting.first_agent_greeting" is true
    And signal "greeting.asked_how_to_address" is true

  Scenario: Closing thanks/goodbye in final block
    Then signal "closing.thanks_in_last_block" is true
    And signal "closing.goodbye_in_last_block" is true
