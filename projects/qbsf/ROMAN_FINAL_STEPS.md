# ПРОБЛЕМА РЕШЕНА - API KEY РАБОТАЕТ

## Что было сделано
Я нашел и исправил проблему сам. Nginx proxy не передавал заголовок X-API-Key на сервер. Теперь все работает.

## Проверка API (работает сейчас)

Попробуй эту команду:
```bash
curl -X POST https://sqint.atocomm.eu/api/check-payment-status \
  -H "X-API-Key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "salesforceInstance": "https://customer-inspiration-2543.my.salesforce.com",
    "quickbooksRealm": "9130354519120066"
  }'
```

Должен получить ответ:
```json
{
  "success": true,
  "invoicesProcessed": 4,
  "paidInvoicesFound": 1,
  "invoicesUpdated": 0
}
```

## Последние шаги для полной работы

### 1. Авторизация QuickBooks (обязательно)
- Открой: https://sqint.atocomm.eu/auth/quickbooks
- Войди в QuickBooks
- Дай разрешения
- Дождись подтверждения

### 2. Тест синхронизации платежей
После авторизации:
- Отметь invoice как paid в QuickBooks
- Запусти API проверку снова (команда выше)
- Увидишь `"invoicesUpdated": 1` вместо 0
- Проверь Salesforce - Opportunity станет "Closed Won"

## Статус системы

✓ Server работает
✓ API key исправлен
✓ Nginx настроен правильно
✓ Salesforce подключен
✗ QuickBooks OAuth истек (нужна авторизация)

## Где был API key

Ты спрашивал "где сейчас указан API key?":
- В сервере: /opt/qb-integration/.env
- В Salesforce: Custom Settings → QB_Integration_Settings__c → API_Key__c
- Значение: $API_KEY

Проблема была не в ключе, а в nginx proxy который не передавал заголовок.

---

Роман, все исправлено. API работает. Осталось только авторизовать QuickBooks.