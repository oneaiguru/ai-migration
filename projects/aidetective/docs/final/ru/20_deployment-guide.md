# Руководство по развертыванию

## Настройка окружения

### Предварительные требования

* Python 3.9+
* PostgreSQL 13+
* Redis 6+
* Docker & Docker Compose

### Конфигурация

```bash
# Необходимые переменные окружения
TELEGRAM_BOT_TOKEN=
OPENAI_API_KEY=
YOOMONEY_API_KEY=
DATABASE_URL=
REDIS_URL=
```

### Локальная разработка

1. Клонировать репозиторий
2. Создать виртуальное окружение
3. Установить зависимости
4. Настроить переменные окружения
5. Запустить миграции базы данных
6. Запустить локальный сервер

### Продакшен-развертывание

1. Сборка Docker-образов
2. Настройка балансировщика нагрузки
3. Подключение мониторинга
4. Запуск через Docker Compose
5. Проверка работоспособности

## Мониторинг

* Prometheus `/metrics`
* Grafana дашборды
* Sentry для ошибок
* ELK для логов

* * *

## Диаграмма

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