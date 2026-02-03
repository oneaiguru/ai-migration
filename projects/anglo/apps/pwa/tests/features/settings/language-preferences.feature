@retention
# Tier: @retention
# Load-bearing for: Accessibility
# Psychological intent: Lets users learn in their comfort language; reduces confusion.
# MVP scope (preserve effect):
# - Russian UI default.
# - Option to switch UI language later (v2).
# Pitfalls / anti-patterns:
# - Don't add complexity to onboarding
Feature: Language and Localization Preferences
  As a learner
  I want to customize language display
  So that I learn in the best way for me

  Background:
    Given a user is in Settings
    And language preferences are configurable

  @retention @stub
  Scenario: App interface language
    Given the user goes to Settings → Language
    When they view language options
    Then options appear:
      """
      - "Русский" (Russian) - default
      - "English" - for English learners wanting English interface
      """
    And user selects preferred interface language

  @v2
  Scenario: Russian interface is default
    Given a new user from Russia
    When they first open the app
    Then :
      """
      - UI is in Russian
      - Menus, buttons, messages all Russian
      - Exercise instructions in Russian
      """

  @v2
  Scenario: English interface option
    Given advanced learners
    When they select "English" language
    Then :
      """
      - Entire interface switches to English
      - Lesson content still English-to-Russian
      - UI language ≠ Learning language
      """

  @v2
  Scenario: Audio pronunciation preference
    Given listening exercises with audio
    When the user goes to Settings → Audio
    Then options:
      """
      - "American English" (default)
      - "British English"
      - "Both" (mix of accents)
      """
    And user selects preferred accent

  @v2
  Scenario: Subtitle/Caption preference
    Given listening exercises
    When the user goes to Settings → Captions
    Then options:
      """
      - "Off" (default)
      - "Russian" (show Russian translation)
      - "English" (show what they heard)
      - "Both" (Russian + English)
      """

  @v2
  Scenario: Phonetic assistance
    Given learners struggling with pronunciation
    When they go to Settings → Phonetics
    Then options:
      """
      - "IPA Notation" (International Phonetic Alphabet)
      - "Russian Transliteration" (English words in Cyrillic)
      - "Off"
      """
    And selected option appears with difficult words

  @v2
  Scenario: Transliteration example
    Given a Russian speaker learning "hello"
    When transliteration is enabled
    Then they see:
      """
      - English: "hello"
      - Russian characters: "хэллоу" (approximate)
      - Helps pronunciation bridge
      """

  @v2
  Scenario: Grammar explanations language
    Given grammar tips appear
    When a user is learning
    Then tips are displayed in:
      """
      - Russian (default) - "Настоящее простое время для описания фактов"
      - English (if interface language is English)
      """
    And language matches interface language

  @v2
  Scenario: Currency in pricing
    Given payment pricing
    When a user in Russia views Max
    Then currency displayed:
      """
      - "500 RUB" (Russian interface)
      - "500 ₽" (alternate symbol)
      - Never shows USD or other foreign currency
      """

  @v2
  Scenario: Date/time formatting
    Given calendar and timestamps
    When a user completes a lesson
    Then dates shown in Russian format:
      """
      - "15 марта 2026" (15 March 2026)
      - Not "March 15, 2026"
      """

  @v2
  Scenario: Regional content considerations
    Given exercise example sentences
    When sentences include cultural references
    Then examples are Russian-relevant:
      """
      - "I live in Moscow" (not random place)
      - "I work in IT" (common in Russia)
      - References to familiar Russian context
      """

  @v2
  Scenario: Romanization toggle
    Given some users familiar with Latin characters
    When they enable "Romanized Russian" (optional)
    Then Russian text can display in Latin:
      """
      - "Привет" becomes "Privet"
      - Helpful for typing practice
      - Can be toggled per exercise type
      """

  @v2
  Scenario: Right-to-left support
    Given potential future languages
    When language preferences are built
    Then architecture supports RTL:
      """
      - Layout can flip if needed
      - Arabic/Hebrew ready for v2
      - Current Russian is LTR (no change)
      """

  @v2
  Scenario: Language pack management
    Given languages can be added in future
    When a user views "Language Packs"
    Then they can:
      """
      - Download additional language content
      - Manage storage for offline packs
      - Enable/disable languages
      - Currently: only English course available
      """
