# Руководство по установке и настройке Prometheus с Cortex

## 1. Подготовка к установке

### 1.1. Требования к системе

#### Минимальные требования для Docker-установки:
- **CPU**: 8 vCPU
- **RAM**: 32 GB
- **Диск**: 500 GB SSD
- **ОС**: Ubuntu 20.04/22.04, Debian 11/12 или CentOS 8/9
- **Сеть**: Публичный IP или внутренний доступ между хостами

#### Предустановленное ПО:
- Docker (версия 20+)
- Docker Compose (версия 2+)
- Git
- curl, wget

### 1.2. Подготовка сервера

Выполните следующие команды для подготовки сервера:

```bash
# Обновление системы
sudo apt update && sudo apt upgrade -y

# Установка необходимых пакетов
sudo apt install -y apt-transport-https ca-certificates curl gnupg lsb-release git

# Установка Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Добавление текущего пользователя в группу docker
sudo usermod -aG docker $USER

# Установка Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.3/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Перезапуск shell для применения изменений в группе
newgrp docker
```

### 1.3. Скачивание файлов решения

```bash
# Создание рабочей директории
mkdir -p ~/prometheus-cortex
cd ~/prometheus-cortex

# Скачивание файлов конфигурации
git clone <repository-url> .
# или скопируйте все файлы в эту директорию

# Предоставление прав на выполнение скриптам
chmod +x *.sh
```

## 2. Вариант установки с использованием Docker Compose

> Базовый `docker-compose.yml` поднимает только Grafana и Alertmanager для быстрого теста UI/алертов. Полный стек (Prometheus/Cortex/MinIO/NGINX) разворачивайте через Kubernetes-манифесты из каталога `kubernetes/` или свой расширенный compose-файл.

### 2.1. Установка с помощью автоматического скрипта

Самый простой способ поднять compose-окружение (Grafana + Alertmanager):

```bash
# Запуск скрипта установки
./setup_monitoring.sh
```

Скрипт автоматически выполнит следующие действия:
- Создаст необходимые директории и шаблоны targets
- Запустит контейнеры Grafana и Alertmanager через docker-compose
- При необходимости предложит добавить хосты в file_sd (для дальнейшего развертывания Prometheus)

### 2.2. Ручная установка

Если вы предпочитаете установить систему вручную или хотите лучше понять процесс:

```bash
# 1. Создание директорий для конфигурации и данных
mkdir -p config/{prometheus/{rules,targets/{linux,windows}},alertmanager,grafana/provisioning/{datasources,dashboards}} data

# 2. Базовые конфигурации уже находятся в `config/` в этом репозитории.
#    При необходимости обновите их под свою среду:
#    - config/prometheus/prometheus.yml (+ targets/linux|windows)
#    - config/prometheus/rules/*.yml
#    - config/cortex/cortex.yml
#    - config/alertmanager/alertmanager.yml
#    - config/grafana/provisioning/datasources/datasources.yml

# 3. Настройка целевых хостов (для будущего Prometheus)
echo "- targets:" > config/prometheus/targets/linux/targets.yml
echo "  - localhost:9100" >> config/prometheus/targets/linux/targets.yml
# Добавьте другие хосты по необходимости; эти файлы будут использованы в Kubernetes/расширенном Prometheus.

# 4. Запуск контейнеров (Grafana + Alertmanager)
docker-compose up -d
```

### 2.3. Проверка установки

После установки проверьте работоспособность системы:

```bash
# Запуск скрипта проверки
./verify_deployment.sh

# Скрипт проверит только реально запущенные сервисы (в базовом Compose — Grafana и Alertmanager).
# Или проверьте контейнеры вручную
docker ps -a | grep "grafana\\|alertmanager"

# Для полного стека используйте Kubernetes:
kubectl get pods
```

### 2.4. Доступ к пользовательским интерфейсам

После успешной установки:

- **Compose (Grafana + Alertmanager):**
  - Grafana: http://server-ip:3000 (логин: admin, пароль: admin)
  - AlertManager: http://server-ip:9093

- **Полный стек (Kubernetes или расширенный Compose):**
  - Prometheus: http://server-ip:9090
  - Cortex Query Frontend: http://server-ip:9010/prometheus
  - MinIO Console: http://server-ip:9001 (логин: minioadmin, пароль: minioadmin)
  - Consul UI: http://server-ip:8500

## 3. Вариант установки с использованием Kubernetes

### 3.1. Подготовка Kubernetes кластера

Для установки в Kubernetes вам потребуется существующий кластер. Если у вас его нет, вы можете создать тестовый кластер с помощью minikube:

```bash
# Установка minikube
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube

# Запуск кластера
minikube start --memory=8g --cpus=4
```

### 3.2. Установка системы мониторинга

```bash
# Применение манифестов
kubectl apply -f k8s-storage.yaml
kubectl apply -f k8s-prometheus.yaml
kubectl apply -f k8s-cortex.yaml
kubectl apply -f k8s-grafana.yaml

# Проверка состояния подов
kubectl get pods
```

### 3.3. Доступ к интерфейсам в Kubernetes

```bash
# Проброс портов для доступа к Prometheus
kubectl port-forward svc/prometheus 9090:9090 &

# Проброс портов для доступа к Grafana
kubectl port-forward svc/grafana 3000:3000 &

# Проброс портов для доступа к Alertmanager
kubectl port-forward svc/alertmanager 9093:9093 &
```

## 4. Установка Node Exporter на хосты

### 4.1. Автоматическая установка

Для автоматической установки Node Exporter на целевые хосты используйте скрипт:

```bash
# Копирование скрипта на целевой хост
scp install_node_exporter.sh user@target-host:~/

# SSH на целевой хост и запуск скрипта
ssh user@target-host "sudo bash ~/install_node_exporter.sh"
```

### 4.2. Ручная установка

```bash
# На каждом целевом хосте:

# Скачивание Node Exporter
wget https://github.com/prometheus/node_exporter/releases/download/v1.6.0/node_exporter-1.6.0.linux-amd64.tar.gz
tar xvfz node_exporter-1.6.0.linux-amd64.tar.gz

# Создание пользователя
sudo useradd -rs /bin/false node_exporter

# Копирование бинарного файла
sudo cp node_exporter-1.6.0.linux-amd64/node_exporter /usr/local/bin/
sudo chown node_exporter:node_exporter /usr/local/bin/node_exporter

# Создание systemd сервиса
sudo bash -c 'cat > /etc/systemd/system/node_exporter.service << EOF
[Unit]
Description=Node Exporter
After=network.target

[Service]
User=node_exporter
Group=node_exporter
Type=simple
ExecStart=/usr/local/bin/node_exporter

[Install]
WantedBy=multi-user.target
EOF'

# Запуск сервиса
sudo systemctl daemon-reload
sudo systemctl start node_exporter
sudo systemctl enable node_exporter

# Проверка статуса
sudo systemctl status node_exporter
```

### 4.3. Добавление хостов в мониторинг

После установки Node Exporter добавьте хосты в конфигурацию:

```bash
# Обновите file_sd (используется в Kubernetes или вашем Prometheus):
./add_hosts.sh -c config/prometheus/prometheus.yml host1 host2

# Или добавьте вручную в файл config/prometheus/targets/linux/targets.yml
echo "  - new-host:9100" >> config/prometheus/targets/linux/targets.yml

# Примените изменения:
# - Kubernetes: kubectl edit configmap prometheus-config && kubectl rollout restart statefulset prometheus
# - Внешний Prometheus: вызовите его endpoint /-/reload или перезапустите службу
```

## 5. Настройка оповещений

### 5.1. Настройка email-оповещений

Отредактируйте файл `alertmanager.yml`:

```yaml
global:
  smtp_smarthost: 'smtp.example.org:587'
  smtp_from: 'alertmanager@example.org'
  smtp_auth_username: 'your-username'
  smtp_auth_password: 'your-password'
  smtp_require_tls: true

receivers:
- name: 'email'
  email_configs:
  - to: 'admin@example.org'
    send_resolved: true
```

Перезапустите AlertManager:

```bash
# Для Docker
docker-compose restart alertmanager

# Для Kubernetes
kubectl rollout restart deployment alertmanager
```

### 5.2. Настройка Telegram-оповещений

Отредактируйте файл `alertmanager.yml`:

```yaml
receivers:
- name: 'telegram'
  telegram_configs:
  - bot_token: 'your-telegram-bot-token'
    chat_id: 12345678
    parse_mode: 'HTML'
```

## 6. Настройка резервного копирования

### 6.1. Резервное копирование конфигурации

```bash
# Создание резервной копии конфигурации
tar -czf prometheus-config-backup-$(date +%Y%m%d).tar.gz config/

# Сохранение конфигурации в Git
git init config-repo
cd config-repo
cp -r ../config/* .
git add .
git commit -m "Initial configuration backup"
```

### 6.2. Резервное копирование данных

> Базовый docker-compose не включает MinIO и Prometheus. Используйте эти примеры только если вы развернули полный стек (Kubernetes или расширенный Compose с соответствующими volume-ами).

```bash
# Резервное копирование данных MinIO (для окружений, где сервис запущен)
docker run --rm -v prometheus-cortex_minio-data:/data -v $(pwd)/backup:/backup \
  busybox tar -czf /backup/minio-data-backup-$(date +%Y%m%d).tar.gz /data

# Резервное копирование данных Prometheus (если volume доступен)
docker run --rm -v prometheus-cortex_prometheus-data:/data -v $(pwd)/backup:/backup \
  busybox tar -czf /backup/prometheus-data-backup-$(date +%Y%m%d).tar.gz /data
```

## 7. Обновление системы

### 7.1. Обновление Docker-установки (Grafana + Alertmanager)

```bash
# Остановка контейнеров
docker-compose down

# Обновление образов
docker-compose pull

# Запуск с обновленными образами
docker-compose up -d
```

Для обновления полного стека используйте Kubernetes-манифесты или ваш расширенный compose-файл.

### 7.2. Обновление Kubernetes-установки

```bash
# Обновление образов в манифестах (отредактируйте версии)
# Затем примените обновленные манифесты
kubectl apply -f k8s-prometheus.yaml
kubectl apply -f k8s-cortex.yaml
kubectl apply -f k8s-grafana.yaml
```

## 8. Устранение неполадок

### 8.1. Распространенные проблемы и решения

#### Prometheus не может подключиться к Node Exporter
- Проверьте, работает ли Node Exporter: `curl http://host:9100/metrics`
- Проверьте настройки брандмауэра: `sudo ufw status` или `sudo iptables -L`
- Проверьте сетевую доступность: `ping host`

#### Cortex не получает данные от Prometheus
- Проверьте настройки remote_write в prometheus.yml
- Для Kubernetes: проверьте логи Prometheus и Cortex Distributor (`kubectl logs statefulset/prometheus`, `kubectl logs deployment/cortex-distributor`)
- Для расширенного Docker Compose: `docker-compose logs prometheus` и `docker-compose logs cortex-distributor`

#### Данные не сохраняются в MinIO
- Проверьте, созданы ли бакеты (Kubernetes): `kubectl exec deploy/minio -- mc ls minio`
- Для расширенного Docker Compose: `docker-compose exec minio mc ls minio`
- Проверьте доступность MinIO: `curl http://localhost:9000/minio/health/live`
- Проверьте настройки Cortex и подключение к S3 в cortex.yml

#### Grafana не показывает данные
- Проверьте настройки источников данных
- Проверьте запросы к Cortex: `curl -u admin:admin http://localhost:9010/prometheus/api/v1/query?query=up`
- Проверьте логи Grafana: `docker-compose logs grafana`

### 8.2. Сбор диагностической информации

```bash
# Compose (Grafana + Alertmanager) логи и статус
docker-compose logs > compose-logs.txt
docker-compose ps > compose-status.txt

# Полный стек в Kubernetes
kubectl get pods -o wide > k8s-pods.txt
kubectl logs statefulset/prometheus > prometheus.log
kubectl logs deployment/cortex-distributor > cortex-distributor.log

# Проверка настроек Prometheus (когда сервис запущен)
curl -s http://localhost:9090/api/v1/status/config > prometheus-config-status.json || true
curl -s http://localhost:9090/api/v1/targets > prometheus-targets-status.json || true

# Сборка полного диагностического архива
tar -czf diagnostics-$(date +%Y%m%d).tar.gz *.txt *.json
```

## 9. Запуск первичных тестов

После установки рекомендуется выполнить следующие тесты:

### 9.1. Проверка сбора метрик

Выполняйте эти проверки в окружении, где развернуты Prometheus и Cortex (Kubernetes или расширенный Compose).

```bash
# Проверка доступности метрик в Prometheus
curl -s "http://localhost:9090/api/v1/query?query=up" | jq .

# Проверка доступности метрик в Cortex
curl -s -u admin:admin "http://localhost:9010/prometheus/api/v1/query?query=up" | jq .
```

### 9.2. Проверка алертинга

```bash
# Генерация тестового алерта
curl -X POST http://localhost:9090/api/v1/admin/tsdb/snapshot

# Проверка наличия алерта в AlertManager
curl -s http://localhost:9093/api/v2/alerts | jq .
```

### 9.3. Нагрузочное тестирование

```bash
# Установка инструмента нагрузочного тестирования
go install github.com/prometheus/benchmark/cmd/promql-query-benchmark@latest

# Запуск тестирования с простым запросом
promql-query-benchmark -url=http://localhost:9090 -query="rate(node_cpu_seconds_total{mode=\"idle\"}[5m])" -queries=100
```
