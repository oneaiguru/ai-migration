# 🚀 Инструкции по развертыванию - Функция обновления счета

**Версия:** 2.0 с поддержкой обновления счетов  
**Статус:** Готово к развертыванию (уже развернуто в PR #92; использовать при повторной выкладке)

---

## Что нужно развернуть

Две файла в middleware на сервере Roman:

| Файл | Путь на сервере | Что изменилось |
|------|-----------------|-----------------|
| **quickbooks-api.js** | `/opt/qb-integration/src/services/quickbooks-api.js` | Добавлен метод `updateInvoice()` |
| **api.js** | `/opt/qb-integration/src/routes/api.js` | Добавлен эндпоинт `/update-invoice` |

---

## Шаги развертывания

### Шаг 1: Подготовка (на локальной машине)

Файлы находятся в:
```
projects/qbsf/deployment/sf-qb-integration-final/src/
```

### Шаг 2: Подключение к серверу Roman

```bash
ssh roman@pve.atocomm.eu -p2323
# Пароль: $SSH_PASS
```

### Шаг 3: Остановка старого сервера

```bash
cd /opt/qb-integration
# Остановить текущий процесс
pkill -f "node src/server.js"
sleep 2
```

### Шаг 4: Развертывание файлов

**С локальной машины** (в новом терминале, НЕ на сервере):

```bash
# Копируем обновленный quickbooks-api.js
scp -P 2323 projects/qbsf/deployment/sf-qb-integration-final/src/services/quickbooks-api.js \
  roman@pve.atocomm.eu:/opt/qb-integration/src/services/

# Копируем обновленный api.js
scp -P 2323 projects/qbsf/deployment/sf-qb-integration-final/src/routes/api.js \
  roman@pve.atocomm.eu:/opt/qb-integration/src/routes/
```

### Шаг 5: Проверка файлов на сервере

```bash
# На сервере (в том же SSH сеансе что раньше):
ls -la /opt/qb-integration/src/services/quickbooks-api.js
ls -la /opt/qb-integration/src/routes/api.js
# Оба файла должны быть там
```

### Шаг 6: Запуск сервера

```bash
cd /opt/qb-integration
# Запустить в фоне
node src/server.js &
sleep 3
```

### Шаг 7: Проверка здоровья

```bash
# На локальной машине (новый терминал):
curl -H "X-API-Key: $API_KEY" \
  https://sqint.atocomm.eu/api/health

# Ответ должен быть:
# {"success":true,"status":"healthy","timestamp":"..."}
```

---

## Тестирование новой функции

### Тест 1: Создание счета (старая функция)

Это должно работать как раньше:

```bash
curl -X POST https://sqint.atocomm.eu/api/opportunity-to-invoice \
  -H "X-API-Key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "opportunityId":"001xx000003DHP",
    "salesforceInstance":"https://yourorg.my.salesforce.com",
    "quickbooksRealm":"1234567890"
  }'

# Ответ: {"success":true,"qbInvoiceId":"..."}
```

### Тест 2: Обновление счета (новая функция)

```bash
curl -X POST https://sqint.atocomm.eu/api/update-invoice \
  -H "X-API-Key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "opportunityId":"001xx000003DHP",
    "qbInvoiceId":"123",
    "salesforceInstance":"https://yourorg.my.salesforce.com",
    "quickbooksRealm":"1234567890"
  }'

# Ответ: {"success":true,"qbInvoiceId":"123","message":"Invoice updated..."}
```

---

## Откат (если что-то пошло не так)

### Вариант A: Если есть старые файлы

```bash
ssh roman@pve.atocomm.eu -p2323
cd /opt/qb-integration

# Если вы сделали бэкап:
cp src/services/quickbooks-api.js.backup src/services/quickbooks-api.js
cp src/routes/api.js.backup src/routes/api.js

# Перезагружаем
pkill -f "node src/server.js"
sleep 2
node src/server.js &
```

### Вариант B: Если нет бэкапа

```bash
ssh roman@pve.atocomm.eu -p2323
cd /opt/qb-integration
# Просто git restore старые версии:
git checkout HEAD src/services/quickbooks-api.js
git checkout HEAD src/routes/api.js

pkill -f "node src/server.js"
sleep 2
node src/server.js &
```

---

## Проверка логов

Если что-то не работает:

```bash
ssh roman@pve.atocomm.eu -p2323
# Смотреть логи в реальном времени
tail -f /opt/qb-integration/server.log

# Или сохраненные логи
less /opt/qb-integration/logs/server.log
```

---

## Что дальше

После успешного развертывания:

1. ✅ Создайте тестовый Opportunity в Salesforce
2. ✅ Переместите его в "Proposal and Agreement" - счет создастся
3. ✅ Отредактируйте товары (добавьте новый)
4. ✅ Нажмите "Update QB Invoice" (или вызовите `/update-invoice` API)
5. ✅ Проверьте в QB что счет обновлен с новыми товарами

---

## Важные заметки

⚠️ **ПЕРЕД развертыванием:**
- Сделайте бэкап текущих файлов
- Убедитесь что Redis/БД работают
- Имеют доступ к QBapplication

✅ **ПОСЛЕ развертывания:**
- Проверьте здоровье API (`/health` эндпоинт)
- Тестируйте на non-production данных сначала
- Мониторьте логи первые 30 минут

---

**Развертывание подготовлено:** December 2025
**Версия кода:** fix/qbsf-romans-questions (коммит 74c65db)
