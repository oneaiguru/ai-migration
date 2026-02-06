# API Documentation

## Overview

The Sherlock AI Bot API provides endpoints for story management, user interactions, and system administration.

## Authentication

All API requests require JWT authentication. Tokens are obtained through the `/auth` endpoints.

### Token Management

- Tokens are generated and validated using our updated TokenManager service.
- Tokens automatically rotate and expire based on security policies.
- For detailed token management practices, please refer to our [Security Token Management Documentation](./security-token-management.md).

## Base URL

https://api.sherlock-ai.com/v1

## Endpoints

### Authentication

```
POST /auth/login
POST /auth/refresh
POST /auth/logout
```

### Story Management

```http
GET /stories
GET /stories/{id}
POST /stories/progress
PUT /stories/{id}/state
```

### User Management

```http
GET /users/{id}
POST /users
PUT /users/{id}
DELETE /users/{id}
```

### Payment Integration

```http
POST /payments/create
GET /payments/{id}
POST /payments/webhook
```

## Error Codes

| Code | Description         |
| ---- | ------------------- |
| 401  | Unauthorized        |
| 403  | Forbidden           |
| 404  | Not Found           |
| 429  | Rate Limit Exceeded |
| 500  | Server Error        |

------

# deployment-architecture.mermaid

graph TB subgraph "Production Environment" TG[Telegram API] --> LB[Load Balancer] LB --> APP1[App Server 1] LB --> APP2[App Server 2] APP1 --> CACHE[Redis Cache] APP2 --> CACHE APP1 --> DB[(Primary DB)] APP2 --> DB DB --> BACKUP[(Backup DB)] APP1 --> MEDIA[Media Storage] APP2 --> MEDIA MEDIA --> CDN[Content Delivery Network] end

```
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