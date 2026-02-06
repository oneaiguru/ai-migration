# Расширенные пользовательские истории и спецификации BDD

## 1. Истории интеграции ИИ

### US-1.1: Динамичное взаимодействие с NPC на базе ИИ

Как детектив
Я хочу вести динамичные беседы с подозреваемыми, управляемыми ИИ,
Чтобы собирать реалистичную и контекстуальную информацию.

**Критерии приёмки:**

* ИИ поддерживает согласованность личности персонажей
* Ответы отражают предыдущие взаимодействия и предъявленные улики
* Эмоциональные состояния влияют на паттерны ответов
* Диалоги выглядят естественными и контекстно уместными
* Система корректно обрабатывает неожиданный ввод пользователя

**BDD-спецификации:**

```gherkin
Feature: AI-Powered Suspect Interactions

Scenario: Questioning suspect with evidence
  Given I am investigating "The Library Shadows Mystery"
  And I have collected "ink stains" evidence
  When I present the evidence to the "library director"
  Then the AI should generate a contextual response
  And the response should reference the "ink stains"
  And the emotional state of the suspect should update
  And the interaction should be logged in the investigation history

Scenario: Suspect memory of previous interactions
  Given I have previously questioned the "library director"
  When I ask about the same topic again
  Then the AI should reference our previous conversation
  And maintain consistency with earlier statements
  And show appropriate frustration at repeated questioning
```

### US-1.2: Расширенный анализ улик на базе ИИ

Как следователь
Мне нужна помощь ИИ в анализе сложных улик,
Чтобы я мог обнаружить скрытые связи и закономерности.

**Критерии приёмки:**

* ИИ анализирует взаимосвязи между элементами доказательств
* Система предлагает возможные связи
* Распознавание паттернов по нескольким типам улик
* Оценка доверия для предлагаемых выводов
* Интеграция с системой развития сюжета

**BDD-спецификации:**

```gherkin
Feature: AI Evidence Analysis

Scenario: Pattern recognition in multiple evidence pieces
  Given I have collected multiple pieces of evidence
  When I request an AI analysis
  Then the system should identify patterns
  And suggest possible connections
  And provide a confidence score for each suggestion
  And link to relevant case elements

Scenario: Timeline reconstruction
  Given I have gathered temporal evidence
  When I use the AI analysis tool
  Then the system should construct a possible timeline
  And highlight any inconsistencies
  And suggest areas for further investigation
```

## 2. Особенности монетизации

#### Детали подписки

* Бесплатный уровень:

    * Доступ к 3 базовым историям
    * Только текстовый контент
    * Без подсказок
* Премиум-уровень (299 руб./мес.):

    * Доступ к 10 продвинутым историям
    * Базовая мультимедийная поддержка
    * Ограниченные подсказки
    * Сохранение прогресса
* VIP-уровень (799 руб./мес.):

    * Неограниченное количество историй
    * Полный мультимедийный контент
    * Неограниченные подсказки
    * Приоритетная поддержка и эксклюзивный контент

### US-2.1: Премиум-инструменты расследования

Как премиум-подписчик
Я хочу иметь доступ к продвинутым инструментам расследования,
Чтобы эффективнее раскрывать дела.

**Расширенные критерии приёмки:**

* Доступ к анализатору улик на базе ИИ
* Премиум-система подсказок с контекстуальными подсказками
* Расширенное построение временной шкалы
* Отображение отношений между персонажами
* Пользовательские заметки с мультимедиа
* Приоритетный доступ к новым делам
* Несколько слотов сохранения

**BDD-спецификации:**

```gherkin
Feature: Premium Tools Access

Scenario: Using advanced evidence analyzer
  Given I am a premium subscriber
  When I use the evidence analyzer on a piece of evidence
  Then I should receive detailed analysis
  And get AI-generated insights
  And see potential connections to other evidence
  And have access to save the analysis

Scenario: Timeline construction
  Given I have collected multiple time-sensitive clues
  When I use the premium timeline tool
  Then I should be able to arrange events chronologically
  And identify time gaps
  And highlight conflicting testimonies
  And save multiple timeline versions
```

## 3. Система управления историями

### US-3.1: Динамическая адаптация сюжета

Как игрок
Я хочу, чтобы мой выбор существенно влиял на сюжет,
Чтобы каждое прохождение было уникальным.

**Критерии приёмки:**

* Ветвление сюжета на основе выбора
* Несколько путей решения
* Отношения персонажей влияют на развитие
* Порядок сбора улик меняет доступные варианты
* Значимые последствия пропущенных улик
* Несколько возможных концовок
* Устойчивое влияние решений на все расследования
* Ограничения по структуре:
    * Не менее 3 точек принятия решений в главе
    * Макс. 5 глав
    * Автосохранение в ключевых точках

**BDD-спецификации:**

```gherkin
Feature: Story Branching

Scenario: Missing critical evidence
  Given I am investigating "The Library Shadows Mystery"
  When I fail to discover the "ink stains" evidence
  Then the story should adapt to this oversight
  And new evidence paths should become available
  And the final solution should remain achievable
  But through a different investigation route

Scenario: Character relationship impact
  Given I have developed a "hostile" relationship with a suspect
  When I attempt to question them again
  Then they should be less cooperative
  And require different approach strategies
  And this should affect the investigation path
```

## 4. Интеграция мультимедиа

### US-4.1: Расширенный осмотр мультимедиа

Как следователь
Я хочу детально изучать мультимедийные улики,
Чтобы раскрывать скрытые связи.

**Критерии приёмки:**

* Поддержка изображений высокого разрешения с зумом
* Аудио с отметками времени
* Видео с покадровым анализом
* Инструменты сравнения
* Аннотации и заметки на мультимедиа
* Система категорий для улик
* Перекрёстные ссылки
* Спецификации:
    * Изображения: макс. 2 МБ, JPG/PNG
    * Аудио: макс. 2 минуты, MP3
    * Видео: макс. 1 мин/10 МБ, MP4

**BDD-спецификации:**

```gherkin
Feature: Multimedia Evidence Analysis

Scenario: Analyzing surveillance footage
  Given I have access to "security camera" footage
  When I examine the footage
  Then I should be able to mark important timestamps
  And take notes on specific frames
  And compare with other evidence pieces
  And receive AI analysis of the footage

Scenario: Photo evidence enhancement
  Given I have a crime scene photo
  When I use the enhancement tool
  Then I should be able to zoom into details
  And adjust image parameters
  And mark areas of interest
  And link findings to my case notes
```

## 5. Требования к производительности

* Время отклика:
    * Текст: до 200 мс
    * Мультимедиа: до 3 секунд
    * Переходы сюжетов: до 1 секунды
* Одновременные пользователи:
    * 40+ активных пользователей
    * Стабильность под нагрузкой
    * Плавная деградация при перегрузке

## 6. Шаблоны базовых историй

* Истории с тремя подозреваемыми
* Система категоризации улик
* Механика проверки алиби