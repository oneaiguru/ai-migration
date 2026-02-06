# Техническая документация: Prometheus с Cortex

## 1. Обзор системы

Внедренная система мониторинга представляет собой комплексное решение на базе Prometheus с Cortex, обеспечивающее горизонтальное масштабирование, долгосрочное хранение метрик и высокую доступность для мониторинга большого количества хостов на предприятии.

### 1.1. Компоненты системы

#### Сбор метрик:
- **Prometheus** - система сбора метрик с базовым хранением
- **Node Exporter** - агент для сбора системных метрик с хостов

#### Хранение и обработка:
- **Cortex Distributor** - обеспечивает прием и распределение метрик
- **Cortex Ingester** - отвечает за запись метрик в хранилище
- **Cortex Store Gateway** - доступ к метрикам в долгосрочном хранилище
- **Cortex Query Frontend** - оптимизация и кэширование запросов
- **Cortex Compactor** - сжатие и агрегация долгосрочных данных
- **Cortex Ruler** - вычисление правил и формирование алертов

#### Хранилище:
- **MinIO** (S3-совместимое) - долгосрочное хранение метрик
- **Consul** - хранение конфигурации и состояния компонентов

#### Визуализация и уведомления:
- **Grafana** - дашборды и визуализация
- **AlertManager** - обработка и отправка уведомлений

## 2. Архитектура решения

### 2.1. Схема взаимодействия компонентов

```
Node Exporter -> Prometheus -> Cortex Distributor -> Cortex Ingester -> Object Storage
                                                               |
                                                               v
Grafana -> Cortex Query Frontend -> Cortex Querier -> Cortex Store Gateway -> Object Storage
                                       ^
                                       |
AlertManager <- Cortex Ruler ----------+
```

### 2.2. Потоки данных

1. **Сбор метрик:**
   - Node Exporter собирает метрики с хостов
   - Prometheus скрапит эти метрики с заданным интервалом

2. **Запись метрик:**
   - Prometheus отправляет метрики в Cortex через remote_write
   - Distributor принимает метрики и распределяет их по Ingester'ам
   - Ingester сохраняет метрики во временном хранилище и периодически записывает их в долгосрочное хранилище

3. **Запросы метрик:**
   - Grafana или другие клиенты отправляют запросы в Query Frontend
   - Query Frontend оптимизирует запросы и кэширует результаты
   - Store Gateway предоставляет доступ к метрикам в долгосрочном хранилище

4. **Алертинг:**
   - Ruler анализирует метрики и формирует алерты
   - AlertManager группирует и отправляет уведомления

## 3. Варианты развертывания

Система может быть развернута в одном из двух режимов:

### 3.1. Docker Compose (только Grafana + Alertmanager)

Используется для быстрого поднятия UI и алертинга без остальной части стека:
- Разворачивает лишь Grafana и Alertmanager для проверки дашбордов/правил
- Не включает Prometheus/Cortex/MinIO/NGINX (для них используйте Kubernetes или расширяйте compose вручную)
- Простота запуска для демо и проверки алертов

**Файлы для развертывания:**
- `docker-compose.yml` - описание Grafana и Alertmanager
- `setup_monitoring.sh` - скрипт для автоматизации запуска compose-окружения

### 3.2. Kubernetes

Рекомендуется для крупных инсталляций:
- Высокая отказоустойчивость
- Автоматическое масштабирование компонентов
- Более сложная настройка

**Файлы для развертывания:**
- `prometheus-deployment.yaml` - манифест для Prometheus
- `cortex-deployment.yaml` - манифест для компонентов Cortex
- `storage-deployment.yaml` - манифест для хранилищ
- `grafana-deployment.yaml` - манифест для Grafana

## 4. Настройка компонентов

### 4.1. Prometheus

Ключевые параметры конфигурации в `prometheus.yml`:

```yaml
global:
  scrape_interval: 15s       # Частота сбора метрик
  evaluation_interval: 15s   # Частота вычисления правил

remote_write:                # Настройка отправки метрик в Cortex
  - url: "http://cortex-distributor:9009/api/v1/push"
```

### 4.2. Cortex

Ключевые параметры в `cortex.yml`:

```yaml
storage:
  engine: blocks            # Тип хранилища

blocks_storage:
  backend: s3               # S3-совместимое хранилище для блоков
  tsdb:
    retention_period: 30d   # Период хранения данных
```

### 4.3. Node Exporter

Установка на все хосты с помощью скрипта `install_node_exporter.sh`.

### 4.4. AlertManager

Настройка каналов уведомлений в `alertmanager.yml`:

```yaml
receivers:
- name: 'email'
  email_configs:
  - to: 'admin@example.org'

- name: 'telegram'
  telegram_configs:
  - bot_token: 'your-telegram-bot-token'
    chat_id: 12345678
```

### 4.5. Grafana

Настройка источников данных в `config/grafana/provisioning/datasources/datasources.yml` (и аналогично в Kubernetes ConfigMap `grafana-datasources`).

## 5. Управление системой

### 5.1. Добавление хостов для мониторинга

1. Установите Node Exporter на новые хосты:
   ```bash
   sudo ./install_node_exporter.sh
   ```

2. Добавьте новые хосты в Prometheus:
   ```bash
   ./add_hosts.sh
   ```

### 5.2. Масштабирование

#### В Kubernetes:
```bash
kubectl scale deployment cortex-distributor --replicas=3
```

### 5.3. Резервное копирование

1. **Конфигурация:**
   ```bash
   git init /etc/prometheus-config
   cd /etc/prometheus-config
   git add .
   git commit -m "Prometheus configuration backup"
   ```

2. **Данные Prometheus:**
   - При использовании Kubernetes: создание Persistent Volume Snapshots
   - При использовании Docker только если Prometheus развернут в отдельном контейнере (не входит в базовый compose): `docker run --rm -v prometheus_data:/data -v /backup:/backup busybox tar -czf /backup/prometheus-data.tar.gz /data`

### 5.4. Обновление

#### В Docker Compose (Grafana + Alertmanager):
```bash
docker-compose pull
docker-compose up -d
```

#### В Kubernetes:
```bash
kubectl apply -f prometheus-deployment.yaml
kubectl apply -f cortex-deployment.yaml
```

## 6. Мониторинг системы мониторинга

Для мониторинга самой системы мониторинга созданы дашборды:

1. **Cortex Overview** - общий обзор компонентов Cortex
2. **Prometheus Stats** - метрики работы Prometheus
3. **Alertmanager** - статистика алертов

## 7. Устранение неполадок

### 7.1. Проверка состояния компонентов

```bash
# Для Docker (базовый compose: Grafana/Alertmanager; расширенный compose: остальные сервисы)
docker ps -a | grep "grafana\|alertmanager"
docker logs <container_id>

# Для Kubernetes
kubectl get pods
kubectl logs <pod_name>
```

### 7.2. Распространенные проблемы

1. **Prometheus не может подключиться к Cortex:**
   - Проверьте сетевую доступность: `curl -v http://cortex-distributor:9009/ready`
   - Проверьте конфигурацию remote_write в Prometheus

2. **Cortex не сохраняет данные в хранилище:**
   - Проверьте доступность MinIO: `curl -v http://minio:9000/minio/health/live`
   - Проверьте наличие бакетов: `mc ls minio/cortex-blocks`

3. **Grafana не показывает данные:**
   - Проверьте источники данных: http://grafana:3000/datasources
   - Проверьте запросы в Cortex: `curl -u admin:admin http://cortex-query-frontend:9010/prometheus/api/v1/query?query=up`

### 7.3. Логи

Основные места хранения логов:

- **Docker:** `docker logs <container_name>`
- **Kubernetes:** `kubectl logs <pod_name>`
- **Системные логи Node Exporter:** `journalctl -u node_exporter`

## 8. Безопасность

### 8.1. Аутентификация

- **Cortex:** Базовая аутентификация в конфигурации `remote_write`
- **Grafana:** Логин/пароль (admin/admin по умолчанию)

### 8.2. Сетевая безопасность

Рекомендации:
- Использовать firewall для ограничения доступа к портам компонентов
- Настроить TLS для всех внешних подключений
- Использовать VPN или приватную сеть для взаимодействия компонентов

## 9. Дальнейшие улучшения

1. **Высокая доступность:**
   - Настройка мульти-зонного развертывания компонентов
   - Репликация данных между зонами

2. **Оптимизация производительности:**
   - Настройка шардирования данных
   - Оптимизация запросов с использованием кэширования

3. **Улучшение безопасности:**
   - Внедрение mTLS между компонентами
   - Настройка RBAC в Kubernetes
