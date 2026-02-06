# API Документация

## Обзор

API Sherlock AI предоставляет конечные точки для управления сюжетами, взаимодействий с пользователями и административных операций.

## Аутентификация

Все запросы требуют JWT. Токены выдаются через эндпоинты `/auth`.

### Управление токенами

* Генерация и проверка через сервис TokenManager
* Автоматическая ротация токенов
* Для подробностей см. [Security Token Management](./security-token-management.md)

## Базовый URL

[https://api.sherlock-ai.com/v1](https://api.sherlock-ai.com/v1)

## Эндпоинты

### Аутентификация

```
POST /auth/login
POST /auth/refresh
POST /auth/logout
```

### Управление сюжетами

```http
GET /stories
GET /stories/{id}
POST /stories/progress
PUT /stories/{id}/state
```

### Управление пользователями

```http
GET /users/{id}
POST /users
PUT /users/{id}
DELETE /users/{id}
```

### Интеграция платежей

```http
POST /payments/create
GET /payments/{id}
POST /payments/webhook
```

## Ошибки

| Код | Описание |
| --- | --- |
| 401 | Несанкционированный доступ |
| 403 | Запрещено |
| 404 | Не найдено |
| 429 | Превышен лимит запросов |
| 500 | Внутренняя ошибка сервера |

* * *

# deployment-architecture.mermaid

```mermaid
graph TB
    subgraph "Production Environment"
        TG[Telegram API] --> LB[Load Balancer]
        LB --> APP1[App Server 1]
        LB --> APP2[App Server 2]
        APP1 --> CACHE[Redis Cache]
        APP2 --> CACHE
        APP1 --> DB[(Primary DB)]
        APP2 --> DB
        DB --> BACKUP[(Backup DB)]
        APP1 --> MEDIA[Media Storage]
        APP2 --> MEDIA
        MEDIA --> CDN[Content Delivery Network]
    end

    subgraph "External Services"
        APP1 --> OPENAI[OpenAI API]
        APP2 --> OPENAI
        APP1 --> PAY[YooMoney API]
        APP2 --> PAY
    end

    subgraph "Monitoring"
        APP1 --> MON[Monitoring System]
        APP2 --> MON
        MON --> ALERT[Alert System]
    end
```