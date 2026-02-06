# Functional Diagrams

## 1. Overview

Functional diagrams illustrate the **system architecture, bot interaction flow, database structure, and API integrations** for Sherlock AI. These diagrams provide a **clear visualization of how different components interact**, ensuring smooth development and troubleshooting.

---

## 2. System Architecture Diagram

The system architecture diagram outlines how **different services interact**, including the bot, database, external APIs, and analytics.

```mermaid
graph TD
    User -->|Interacts| TelegramBot[Telegram Bot]
    TelegramBot -->|Processes Input| StoryEngine[Story Engine]
    TelegramBot -->|Sends request| OpenAI[OpenAI API]
    TelegramBot -->|Processes Payments| YooMoney[YooMoney API]
    StoryEngine -->|Saves progress| Database[PostgreSQL]
    StoryEngine -->|Logs events| Analytics[Analytics Service]
    Database -->|Stores Data| Backup[Backup System]
    Analytics -->|Visualizes Data| AdminPanel[Admin Dashboard]
```

------

## 3. User Interaction Flow

This sequence diagram details a **typical user interaction with the bot**, from starting a story to making choices.

```mermaid
sequenceDiagram
    participant User
    participant Bot
    participant StoryEngine
    participant OpenAI
    participant Database

    User->>Bot: /start command
    Bot->>StoryEngine: Initialize new game session
    StoryEngine->>Database: Load user profile
    Database-->>StoryEngine: Send user data
    StoryEngine-->>Bot: Display first scene
    User->>Bot: Selects a choice
    Bot->>StoryEngine: Process choice
    StoryEngine->>Database: Save user progress
    StoryEngine->>OpenAI: Request AI-generated dialogue
    OpenAI-->>StoryEngine: Return generated text
    StoryEngine-->>Bot: Send next scene
```

------

## 4. Database Structure Diagram

This ER diagram shows how Sherlock AI **stores and manages data**, including user progress, story structure, and payment records.

```mermaid
erDiagram
    USERS {
        BIGINT id PK
        TEXT username
        TIMESTAMP registered_at
    }
    STORIES {
        BIGINT id PK
        TEXT title
        TEXT description
        JSON structure
    }
    STORY_PROGRESS {
        BIGINT id PK
        BIGINT user_id FK
        BIGINT story_id FK
        TEXT current_node
        JSON user_choices
        TIMESTAMP last_updated
    }
    PAYMENTS {
        BIGINT id PK
        BIGINT user_id FK
        TEXT transaction_id
        DECIMAL amount
        TEXT status
        TIMESTAMP timestamp
    }

    USERS ||--o{ STORY_PROGRESS : tracks
    USERS ||--o{ PAYMENTS : makes
    STORIES ||--o{ STORY_PROGRESS : has
```

------

## 5. API Interaction Flow

This diagram shows how the **Telegram Bot** interacts with external APIs.

```mermaid
sequenceDiagram
    participant User
    participant Bot
    participant OpenAI
    participant YooMoney
    participant Database

    User->>Bot: /investigate command
    Bot->>Database: Retrieve current story state
    Database-->>Bot: Return story node
    Bot->>OpenAI: Request AI-generated dialogue
    OpenAI-->>Bot: Return dialogue
    Bot->>User: Display story update

    User->>Bot: /subscribe premium
    Bot->>YooMoney: Process payment request
    YooMoney-->>Bot: Confirm transaction
    Bot->>Database: Update user subscription status
    Bot->>User: Subscription activated
```

------

## 6. Payment Processing Flow

This diagram explains how **payments are handled securely** via YooMoney.

```mermaid
sequenceDiagram
    participant User
    participant Bot
    participant YooMoney
    participant Database

    User->>Bot: Requests subscription
    Bot->>YooMoney: Initiates transaction
    YooMoney-->>Bot: Redirects user to payment page
    User->>YooMoney: Completes payment
    YooMoney-->>Bot: Sends transaction confirmation
    Bot->>Database: Update subscription status
    Bot->>User: Subscription activated
```

------

## 7. Error Handling Flow

This diagram illustrates how **errors are logged and handled** in Sherlock AI.

```mermaid
sequenceDiagram
    participant User
    participant Bot
    participant ErrorLogger
    participant SupportTeam

    User->>Bot: Sends invalid request
    Bot->>ErrorLogger: Log error with timestamp
    ErrorLogger->>SupportTeam: Send alert if critical
    Bot->>User: Displays error message
```

------

## 8. Priority and Next Steps

### 8.1 Priority Level: **High**

Diagrams are essential for **developers and stakeholders** to understand system interactions. These must be included **before the specification is finalized**.

### 8.2 Next Steps

1. **Refine database schema based on latest changes.**
2. **Validate API interaction workflows.**
3. **Ensure payment flow is fully documented.**
4. **Review all diagrams for accuracy and completeness.**
5. **Integrate diagrams into the final specification document.**

------

## 9. Dependencies

- **Backend Engineers**: Verify database relationships.
- **Frontend Developers**: Validate user flow consistency.
- **DevOps Team**: Confirm API integration workflows.
- **Product Manager**: Approve overall system structure.
