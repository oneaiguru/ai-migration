# features/user/user-profile.feature
Feature: Personal Profile Management
  As an employee
  I want to maintain my personal profile
  So that my contact information and preferences are up to date

  Background:
    Given I am logged into the workforce management system
    And I have employee privileges
    And I am viewing my profile page

  @self-service
  Scenario: Update personal contact details
    When I edit my phone number and email
    And I save the changes
    Then the profile information is updated
    And a success message is shown

  @self-service
  Scenario: Manage skills and certifications
    When I open the "Рабочая информация" tab
    Then I can add or remove skills
    And I can update certification status

  @self-service
  Scenario: Set notification preferences
    When I open the preferences tab
    And I enable push notifications for shift changes
    Then my new preference is saved

  @self-service
  Scenario: Upload profile photo
    When I upload a new profile picture
    Then the photo preview updates immediately
    And the image is saved after confirmation

  @self-service
  Scenario: Update emergency contact
    When I edit my emergency contact information
    And I save the profile
    Then the new contact details are stored


  @accessibility @keyboard @a11y
  Scenario: Navigate profile form using keyboard only
    Given профиль открыт для редактирования
    When пользователь переходит по полям клавишей Tab
    Then фокус перемещается по порядку ввода
    And клавиша Enter активирует кнопку "Сохранить"

  @accessibility @a11y
  Scenario: Screen reader announces profile sections
    Given включен экранный диктор
    When страница профиля загружается
    Then разделы имеют aria-labels
    And диктор озвучивает название активной вкладки

  @accessibility @a11y
  Scenario: Focus trapped inside photo upload modal
    Given открыт диалог загрузки фото
    When пользователь нажимает Tab
    Then фокус не выходит за пределы модального окна
    And Escape закрывает диалог и возвращает фокус на кнопку загрузки

  @accessibility @contrast @a11y
  Scenario: Verify profile page color contrast
    Given страница профиля отображается в стандартной теме
    Then цвет текста и фона имеет контраст не ниже 4.5 к 1
    And ссылки и кнопки имеют видимый фокус

  @accessibility @voice @a11y
  Scenario: Open notification settings by voice command
    Given активирован режим голосового управления
    When пользователь говорит "Открыть настройки уведомлений"
    Then раскрывается вкладка предпочтений
    And фокус ставится на первый переключатель
