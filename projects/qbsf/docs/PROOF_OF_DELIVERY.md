# Что готово  

## ДО (скриншот 26 декабря)

QB Integration Error Logs - **0 items**
- Ни одного лога с ошибкой
- Интеграция падает молча
- Невозможно дебажить

## ПОСЛЕ (После деплоя будет так)

- Каждая Opportunity получает статус (Success/Error/Skipped)
- Понятные коды/причины: AUTH_EXPIRED, CONFIG_MISSING, SUPPLIER_EXCLUDED
- Можешь сам исправить проблему

---

##  диагноз был верный

 написал (Dec 27 00:39):
> "Из-за того что в сделке у аккаунта есть контакты без email - интеграция не отрабатывает"

**Наше решение**: Приоритет billing email (строго по порядку):
1. Opportunity.Email_for_invoice__c (если заполнено) — **рекомендуется заполнять**
2. Primary OpportunityContactRole.Contact.Email (OCR, IsPrimary=true) — если есть
3. Account.Email__c (если заполнено на аккаунте)
4. Contact.Email fallback (самый свежий по LastModifiedDate, только если есть email)

**Теперь**: Контакты без email больше не мешают — email выбирается детерминированно по приоритету выше.

---

## Где всё лежит (запрос 27 дек.)

### Middleware (Node.js)
- Сервер: pve.atocomm.eu порт 2323
- Путь: /opt/qb-integration/
- Ключевые файлы:
  - src/services/salesforce-api.js:231-321 — billing email priority + emailSource (Opp→OCR→Account→Contact)
  - src/routes/api.js:47-86 — invoice reconciliation (existing invoice) + запись QB_Invoice_ID__c / QB_Invoice_Number__c
  - src/services/quickbooks-api.js:564-614 — getInvoicePaymentLinkDetails() (InvoiceLink + reason codes)
  - src/services/salesforce-api.js:353-367 — updateOpportunityWithQBInvoiceId()
  - src/routes/api.js — основные endpoints (/api/opportunity-to-invoice, /api/update-invoice)

### Salesforce (Apex)
- Триггер: force-app/main/default/triggers/OpportunityQuickBooksTrigger.trigger
- Очередь: force-app/main/default/classes/QBInvoiceIntegrationQueueable.cls
- Error logs объект: QB_Integration_Error_Log__c
- Success logs объект: QB_Integration_Log__c

### Как дебажить самому

SOQL в Dev Console → Query Editor:

```sql
-- Ошибки:
SELECT Opportunity__c, Error_Code__c, Error_Message__c, CreatedDate
FROM QB_Integration_Error_Log__c
ORDER BY CreatedDate DESC LIMIT 10

-- Статусы на Opportunity:
SELECT Name, QB_Sync_Status__c, QB_Error_Code__c, QB_Error_Message__c
FROM Opportunity
WHERE QB_Sync_Status__c = 'Error'

-- Статус очередей обработки:
SELECT Id, Status, JobType, ApexClass.Name, NumberOfErrors, CreatedDate
FROM AsyncApexJob
WHERE ApexClass.Name IN ('QBInvoiceIntegrationQueueable','QBInvoiceUpdateQueueable')
ORDER BY CreatedDate DESC
```

---

## Тесты которые это проверяют

### P1: Логи теперь создаются (Observability)
| Test File | Test Name | Что проверяет |
|-----------|-----------|--------|
| QBInvoiceIntegrationQueueableTest | testWarningLogStatus | Warning статус записывается в QB_Integration_Log__c |
| QBInvoiceIntegrationQueueableTest | testMissingSettings | Error + CONFIG_MISSING код записывается |
| OpportunityQuickBooksTriggerTest | testSkipWhenSupplierIsAtoComm | Skip reason записывается при исключении ATO COMM |

### P2: Email приоритет работает (Email Priority)
| Test File | Test Name | Что проверяет |
|-----------|-----------|--------|
| billing-email-trim.test.js | uses trimmed Opportunity email when present | Email_for_invoice__c используется первым (пробелы обрезаются) |
| salesforce-api-ocr-fallback.test.js | uses OCR when Opp/Account blank | Primary OCR email используется если Opp.Email пусто |
| billing-email-trim.test.js | uses Account email when Opportunity email is blank | Account.Email__c используется если Opp/OCR пусто |
| salesforce-api-contact-order.test.js | ORDER BY LastModifiedDate DESC | Contact fallback берёт самый свежий email |

### P3: Понятные ошибки (Error Codes)
| Test File | Test Name | Что проверяет |
|-----------|-----------|--------|
| QBInvoiceIntegrationQueueableTest | testAuthExpiredCreatesErrorLog | AUTH_EXPIRED код + сообщение с реavторизацией |
| QBInvoiceIntegrationQueueableTest | testMissingSettings | CONFIG_MISSING для отсутствующих настроек |
| OpportunityQuickBooksTriggerTest | testSkipWhenSupplierIsAtoComm | SUPPLIER_EXCLUDED причина (QB_Skip_Reason__c) |

---

## Фактический вывод тестов

### Node.js (Middleware) - Запущено сейчас

```
PASS tests/auth-errors.test.js
PASS tests/billing-email-trim.test.js
PASS tests/invoice-idempotency.test.js
PASS tests/quickbooks-customer-email-update.test.js
PASS tests/quickbooks-payment-link-details.test.js
PASS tests/salesforce-api-contact-order.test.js
PASS tests/salesforce-api-email-source.test.js
PASS tests/salesforce-api-ocr-fallback.test.js

Test Suites: 8 passed, 8 total
Tests:       23 passed, 23 total
Snapshots:   0 total
```

**Результат**: ✅ **ВСЕ 23 ТЕСТА ПРОЙДЕНЫ**

### Apex (Salesforce) - 39 тестов в 8 файлах

| Файл | Кол-во тестов | Статус |
|------|--------|--------|
| OpportunityQuickBooksTriggerTest | 3 | ✅ PASS |
| QBInvoiceIntegrationQueueableTest | 10 | ✅ PASS |
| QuickBooksAPIServiceTest | 5 | ✅ PASS |
| QuickBooksInvokerTest | 1 | ✅ PASS |
| QuickBooksInvoiceControllerTest | 4 | ✅ PASS |
| QuickBooksComprehensiveTest | 6 | ✅ PASS |
| QuickBooksInvoiceControllerExtraTest | 3 | ✅ PASS |
| QBInvoiceUpdateQueueableTest | 7 | ✅ PASS |

**Итого**: **62 теста** (23 Node.js + 39 Apex) — ✅ **ВСЕ ПРОЙДЕНЫ**

---

## Что это означает 

| До | После деплоя |
|----|--------|
| Интеграция падает молча | Видно точную причину (QB_Error_Code__c / QB_Skip_Reason__c) |
| Зависит от случайного контакта | Email выбирается по приоритету |
| Нет логов ошибок | Каждая ошибка логируется (QB_Integration_Error_Log__c) |
| Непонятно при каких случаях нужна реавторизация | AUTH_EXPIRED код с понятным сообщением |

---

## Гарантия

Если после деплоя любая из 3 проблем не работает как описано выше → **100% возврат оплаты**.

---

## Условия

- **Цена**: 100,000 ₽
- **Оплата**: 100% перед deployment
- **После оплаты**: 2-3 часа на deploy + совместное тестирование
- **Покажу**: Где что лежит (как просил Dec 27 14:10)

# Что делать при ошибке AUTH_EXPIRED

## Как определить

На Сделке (Opportunity) вы увидите:

- QB_Sync_Status__c = "Error"
- QB_Error_Code__c = "AUTH_EXPIRED"
- QB_Error_Message__c содержит "reauthorization required"

## Что делать

1. Откройте: https://sqint.atocomm.eu/auth/quickbooks
2. Войдите в QuickBooks (если требуется)
3. Нажмите "Разрешить" (Authorize)
4. Дождитесь сообщения "Authorization successful"
5. Вернитесь в Salesforce и измените Stage сделки (назад и обратно)

## Когда это происходит

- Refresh token истекает через ~100 дней неактивности
- Или: если доступ был отозван в QuickBooks
