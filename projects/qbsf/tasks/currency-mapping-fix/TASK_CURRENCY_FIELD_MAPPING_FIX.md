# ЗАДАЧА: Исправление маппинга валюты (Currency Field Mapping Fix)

**Дата**: 23.01.2026 - 24.01.2026
**Автор**: Roman Kapralov
**Приоритет**: 🔴 CRITICAL
**Статус**: 🟡 PENDING IMPLEMENTATION

---

## 📝 ОПИСАНИЕ ПРОБЛЕМЫ (RUSSIAN)

### Суть проблемы

Интеграция Salesforce-QuickBooks неправильно берёт валюту при создании счёта в QB. Вместо использования валюты из **Сделки (Opportunity)**, система берёт валюту из **Карточки товара (Product2)**, что приводит к неправильным конвертациям валют.

### Конкретный пример

**Сценарий**: На сделке указана валюта USD, но товар в системе помечен как EUR

| Объект | Поле | Значение | Статус |
|--------|------|----------|--------|
| **Opportunity** | CurrencyIsoCode | USD | ✅ ПРАВИЛЬНО |
| **Product2** | CurrencyIsoCode | EUR | ❌ ОШИБОЧНО ИСПОЛЬЗУЕТСЯ |
| **QB Integration Log** | Currency | EUR | 🔴 НЕПРАВИЛЬНЫЙ РЕЗУЛЬТАТ |

### Komunikacija от Roman

```
[23.01.2026 14:55] Roman:
"я выяснил с поддержкой QB что у них нет оплаты в евро,
поэтому от Евро мы отказываемся. точнее мы создаем сделки
в долларах но по прайсу в ЕВро."

[23.01.2026 18:35] Roman:
"Можешь поменять
Интеграция настроена неверно: она берет валюту не из Сделки (Opportunity),
а из Карточки товара (Product).

Посмотрите на скриншот 4: у самого продукта (как номенклатурной единицы
на складе) поле Product Currency стоит EUR. Интегратор (или скрипт),
который отправляет данные в QuickBooks, работает по логике:

'Я вижу продукт Delegate fee. Какая у него валюта по умолчанию?
Ага, Евро. Значит, отправляю в QuickBooks счет в Евро с цифрой 1163'.

Это грубая ошибка маппинга (сопоставления полей). Продукт может быть один,
а продавать вы его можете хоть в йенах, хоть в фунтах. Интеграция должна
смотреть на поле CurrencyIsoCode объекта Opportunity, а не объекта Product2.

[24.01.2026 18:14] Roman:
"Сможешь поменять этот параметр? или скажи где лежит конфигур файл"
```

---

## 📸 СКРИНШОТЫ (EVIDENCE)

### Скриншот 1: QB Integration Log (LOG-0079)
**Файл**: `images/photo_2026-01-26_13-14-19.jpg`

```
Log Number: LOG-0079
Message: Invoice successfully created in QuickBooks
Currency: EUR - Euro  ❌ ОШИБКА - должна быть USD
Status: Success
Opportunity: Delegate fee
QB Invoice ID: 2641
```

**Вывод**: Система создала счёт в Евро, хотя сделка была в Долларах

---

### Скриншот 2: Opportunity Details (Сделка)
**Файл**: `images/photo_2026-01-26_13-14-18.jpg`

```
Opportunity Information:
├─ Opportunity Name: Delegate fee
├─ Account Name: Acron Aviation
├─ Opportunity Currency: USD - U.S. Dollar  ✅ ПРАВИЛЬНО
├─ Amount: USD 2,326.00 (EUR 1,982,44)  ⚠️ конвертированная цена
└─ Close Date: 26.03.2026

Products (1):
├─ Delegate fee, pre-sale
├─ Quantity: 2,00
├─ Sales Price: USD 1,163,00 (EUR 991,22)  ⚠️ конвертированная цена
└─ Total Price: USD 2,326,00 (EUR 1,982,44)

QB Payment Amount: USD 2,326.00 (EUR 1,982,44)
```

**Вывод**: На сделке валюта **USD**, что правильно. QB должен получить USD, а не EUR.

---

### Скриншот 3: Product Details (Карточка товара)
**Файл**: `images/photo_2026-01-26_13-13-50.jpg`

```
Product: Delegate fee, pre-sale
├─ Product Code: [empty]
├─ Product Family: [empty]
├─ Product Currency: EUR - Euro  ❌ ПРОБЛЕМА
├─ QB Item ID: [empty]
├─ Active: ✓
└─ Product Description: [empty]

System Information:
├─ Created By: Olga Rybak, 26.01.2025, 22:27
└─ Last Modified By: Olga Rybak, 05.09.2025, 20:23
```

**Вывод**: Товар по умолчанию имеет EUR, но это не должно влиять на валюту счёта в QB.

---

## 🔍 ROOT CAUSE АНАЛИЗ

### Текущее поведение (НЕПРАВИЛЬНО)

```
Opportunity created with Currency = USD
    ↓
Integration fires (Trigger/API)
    ↓
Get Product from OpportunityLineItem
    ↓
Read Product2.CurrencyIsoCode (EUR)  ← ОШИБКА ЗДЕСЬ
    ↓
Create QB Invoice with EUR currency
    ↓
Result: USD amount in EUR currency = НЕПРАВИЛЬНО
```

### Ожидаемое поведение (ПРАВИЛЬНО)

```
Opportunity created with Currency = USD
    ↓
Integration fires (Trigger/API)
    ↓
Read Opportunity.CurrencyIsoCode (USD)  ← ПРАВИЛЬНО
    ↓
Create QB Invoice with USD currency
    ↓
Result: USD amount in USD currency = ✅ ПРАВИЛЬНО
```

---

## 🔧 ГДЕ НУЖНЫ ИЗМЕНЕНИЯ

### 1. **Salesforce Apex Code**

**Файл**: `/force-app/main/default/classes/` (один из этих):
- `QBInvoiceIntegrationQueueable.cls`
- `QuickBooksInvoiceController.cls`
- `QuickBooksAPIService.cls`

**Что искать**:
```apex
// НЕПРАВИЛЬНО (текущий код):
String currency = lineItem.Product2.CurrencyIsoCode;

// ПРАВИЛЬНО (нужно изменить на):
String currency = opportunity.CurrencyIsoCode;
```

**Линии кода для проверки**:
- Поиск: `Product2.CurrencyIsoCode`
- Заменить на: `Opportunity.CurrencyIsoCode`

---

### 2. **Node.js Middleware**

**Файл**: `/deployment/sf-qb-integration-final/src/` (возможно):
- `services/salesforce-api.js`
- `transforms/opportunity-to-invoice.js`
- `routes/api.js`

**Что искать**:
```javascript
// НЕПРАВИЛЬНО (текущий код):
const currency = lineItem.product.currencyCode;

// ПРАВИЛЬНО (нужно изменить на):
const currency = opportunity.currencyCode;
```

---

### 3. **Data Mapping Configuration**

**Проверить**: Есть ли конфигурационный файл, где прописан маппинг полей?
- Например: `mapping.json`, `config.js`, или в коде самих классов Apex?

---

## ✅ ЧТО НУЖНО СДЕЛАТЬ (IMPLEMENTATION CHECKLIST)

### Phase 1: Diagnosis (30 minutes)
- [ ] Найти все места в коде, где используется `Product2.CurrencyIsoCode`
- [ ] Найти все места в middleware, где берётся валюта из неправильного источника
- [ ] Создать список файлов, требующих изменения

### Phase 2: Implementation (1-2 hours)
- [ ] Изменить Apex код на использование `Opportunity.CurrencyIsoCode`
- [ ] Изменить Node.js код на использование `opportunity.currencyCode`
- [ ] Убедиться, что метаполе Opportunity.CurrencyIsoCode передаётся правильно

### Phase 3: Testing (1 hour)
- [ ] Создать тестовую сделку с USD
- [ ] Протестировать создание счёта в QB
- [ ] Проверить логи интеграции (должна быть USD, а не EUR)
- [ ] Проверить, что сумма в QB соответствует сделке

### Phase 4: Verification (30 minutes)
- [ ] Создать несколько тестовых сделок с разными валютами
- [ ] Убедиться, что каждая сделка создаёт счёт с правильной валютой
- [ ] Проверить QB Integration Log - все должны быть с правильной валютой

---

## 📋 КОНТЕКСТ ДЛЯ NEXT AGENT

### Текущая конфигурация
- **QB Org**: customer-inspiration-2543 (production)
- **QB Realm ID**: 9341454378379755
- **Middleware URL**: https://sqint.atocomm.eu
- **API Key**: See `SECRETS.local.md` (git-ignored)

### Какие файлы точно нужно проверить
1. Во всём проекте (`/force-app/` и `/deployment/`):
   - Поиск: `Product2.CurrencyIsoCode` → Заменить на `Opportunity.CurrencyIsoCode`
   - Поиск: `product.currency` или `product.currencyCode` → Проверить контекст
   - Поиск: `Product2.*Currency` → Проверить все варианты

---

## 🎯 SUCCESS CRITERIA

- ✅ QB Integration Log показывает USD (вместо EUR) для сделок в USD
- ✅ QB Integration Log показывает EUR для сделок в EUR (если применимо)
- ✅ Тестовая сделка с USD создаёт счёт в QB с USD
- ✅ Сумма в QB соответствует сумме в сделке (без конвертации)
- ✅ Код покрыт тестами (test coverage остаётся выше 75%)

---

---

# TASK: Currency Field Mapping Fix

**Date**: January 23-24, 2026
**Author**: Roman Kapralov
**Priority**: 🔴 CRITICAL
**Status**: 🟡 PENDING IMPLEMENTATION

---

## 📝 PROBLEM DESCRIPTION (ENGLISH)

### Issue Summary

The Salesforce-QuickBooks integration is incorrectly pulling the currency when creating an invoice in QB. Instead of using the currency from the **Opportunity (Deal)**, the system is pulling currency from the **Product Card (Product2)**, which results in incorrect currency conversions.

### Specific Example

**Scenario**: The opportunity is in USD, but the product in the system is marked as EUR

| Object | Field | Value | Status |
|--------|-------|-------|--------|
| **Opportunity** | CurrencyIsoCode | USD | ✅ CORRECT |
| **Product2** | CurrencyIsoCode | EUR | ❌ INCORRECTLY USED |
| **QB Integration Log** | Currency | EUR | 🔴 WRONG RESULT |

### Communication from Roman

```
[Jan 23, 2026 14:55] Roman:
"I clarified with QB support that they don't have Euro payments,
so we're refusing Euro. More precisely, we create deals in dollars
but using Euro pricing."

[Jan 23, 2026 18:35] Roman:
"Can you change it?
Integration is configured incorrectly: it takes currency not from the Deal (Opportunity),
but from the Product Card (Product).

Look at screenshot 4: the product itself (as a nomenclature unit in warehouse)
has the Product Currency field set to EUR. The integrator (or script) that sends
data to QuickBooks works by the logic:

'I see the product "Delegate fee". What's its default currency?
Aha, Euro. So I'm sending a QuickBooks invoice in Euro with the amount 1163'.

This is a gross field mapping error. A product can be one, but you can sell it
in yen, pounds, or anything. The integration should look at the CurrencyIsoCode
field of the Opportunity object, not the Product2 object.

[Jan 24, 2026 18:14] Roman:
"Can you change this parameter? Or tell me where the config file is located"
```

---

## 📸 SCREENSHOTS (EVIDENCE)

### Screenshot 1: QB Integration Log (LOG-0079)
**File**: `images/photo_2026-01-26_13-14-19.jpg`

```
Log Number: LOG-0079
Message: Invoice successfully created in QuickBooks
Currency: EUR - Euro  ❌ ERROR - should be USD
Status: Success
Opportunity: Delegate fee
QB Invoice ID: 2641
```

**Conclusion**: System created invoice in Euro, although the deal was in Dollars

---

### Screenshot 2: Opportunity Details
**File**: `images/photo_2026-01-26_13-14-18.jpg`

```
Opportunity Information:
├─ Opportunity Name: Delegate fee
├─ Account Name: Acron Aviation
├─ Opportunity Currency: USD - U.S. Dollar  ✅ CORRECT
├─ Amount: USD 2,326.00 (EUR 1,982.44)  ⚠️ converted price
└─ Close Date: 2026-03-26

Products (1):
├─ Delegate fee, pre-sale
├─ Quantity: 2.00
├─ Sales Price: USD 1,163.00 (EUR 991.22)  ⚠️ converted price
└─ Total Price: USD 2,326.00 (EUR 1,982.44)

QB Payment Amount: USD 2,326.00 (EUR 1,982.44)
```

**Conclusion**: The opportunity has USD currency, which is correct. QB should receive USD, not EUR.

---

### Screenshot 3: Product Details
**File**: `images/photo_2026-01-26_13-13-50.jpg`

```
Product: Delegate fee, pre-sale
├─ Product Code: [empty]
├─ Product Family: [empty]
├─ Product Currency: EUR - Euro  ❌ PROBLEM
├─ QB Item ID: [empty]
├─ Active: ✓
└─ Product Description: [empty]

System Information:
├─ Created By: Olga Rybak, 2025-01-26, 22:27
└─ Last Modified By: Olga Rybak, 2025-09-05, 20:23
```

**Conclusion**: The product has EUR by default, but this should not affect the currency of the QB invoice.

---

## 🔍 ROOT CAUSE ANALYSIS

### Current Behavior (INCORRECT)

```
Opportunity created with Currency = USD
    ↓
Integration fires (Trigger/API)
    ↓
Get Product from OpportunityLineItem
    ↓
Read Product2.CurrencyIsoCode (EUR)  ← ERROR HERE
    ↓
Create QB Invoice with EUR currency
    ↓
Result: USD amount in EUR currency = WRONG
```

### Expected Behavior (CORRECT)

```
Opportunity created with Currency = USD
    ↓
Integration fires (Trigger/API)
    ↓
Read Opportunity.CurrencyIsoCode (USD)  ← CORRECT
    ↓
Create QB Invoice with USD currency
    ↓
Result: USD amount in USD currency = ✅ CORRECT
```

---

## 🔧 WHERE CHANGES ARE NEEDED

### 1. **Salesforce Apex Code**

**File**: `/force-app/main/default/classes/` (one of these):
- `QBInvoiceIntegrationQueueable.cls`
- `QuickBooksInvoiceController.cls`
- `QuickBooksAPIService.cls`

**What to look for**:
```apex
// INCORRECT (current code):
String currency = lineItem.Product2.CurrencyIsoCode;

// CORRECT (change to):
String currency = opportunity.CurrencyIsoCode;
```

**Code lines to check**:
- Search: `Product2.CurrencyIsoCode`
- Replace with: `Opportunity.CurrencyIsoCode`

---

### 2. **Node.js Middleware**

**File**: `/deployment/sf-qb-integration-final/src/` (possibly):
- `services/salesforce-api.js`
- `transforms/opportunity-to-invoice.js`
- `routes/api.js`

**What to look for**:
```javascript
// INCORRECT (current code):
const currency = lineItem.product.currencyCode;

// CORRECT (change to):
const currency = opportunity.currencyCode;
```

---

### 3. **Data Mapping Configuration**

**Check if**: There is a configuration file where field mapping is defined?
- For example: `mapping.json`, `config.js`, or in the Apex class code itself?

---

## ✅ IMPLEMENTATION CHECKLIST

### Phase 1: Diagnosis (30 minutes)
- [ ] Find all places in code where `Product2.CurrencyIsoCode` is used
- [ ] Find all places in middleware where currency is pulled from wrong source
- [ ] Create list of files requiring changes

### Phase 2: Implementation (1-2 hours)
- [ ] Change Apex code to use `Opportunity.CurrencyIsoCode`
- [ ] Change Node.js code to use `opportunity.currencyCode`
- [ ] Ensure Opportunity.CurrencyIsoCode metafield is passed correctly

### Phase 3: Testing (1 hour)
- [ ] Create test opportunity with USD
- [ ] Test invoice creation in QB
- [ ] Check integration logs (should show USD, not EUR)
- [ ] Verify amount in QB matches the opportunity

### Phase 4: Verification (30 minutes)
- [ ] Create several test opportunities with different currencies
- [ ] Verify each creates invoice with correct currency
- [ ] Check QB Integration Log - all should have correct currency

---

## 📋 CONTEXT FOR NEXT AGENT

### Current Configuration
- **SF Org**: customer-inspiration-2543 (production)
- **QB Realm ID**: 9341454378379755
- **Middleware URL**: https://sqint.atocomm.eu
- **API Key**: See `SECRETS.local.md` (git-ignored)

### Files to Definitely Check
1. Throughout the project (`/force-app/` and `/deployment/`):
   - Search: `Product2.CurrencyIsoCode` → Replace with `Opportunity.CurrencyIsoCode`
   - Search: `product.currency` or `product.currencyCode` → Check context
   - Search: `Product2.*Currency` → Check all variations

---

## 🎯 SUCCESS CRITERIA

- ✅ QB Integration Log shows USD (instead of EUR) for USD opportunities
- ✅ QB Integration Log shows EUR for EUR opportunities (if applicable)
- ✅ Test opportunity in USD creates QB invoice with USD
- ✅ Amount in QB matches opportunity amount (no conversion)
- ✅ Code remains covered by tests (test coverage stays above 75%)

---

## 📖 REFERENCES & RELATED TASKS

**Related handoff documents**:
- `/HANDOFF_CODEX.md` - Project workflow guidelines
- `/NEXT_AGENT_HANDOFF_v3.md` - Latest project status
- `/CLAUDE.md` - Project configuration details

**Files to explore**:
- `/force-app/main/default/classes/` - All Apex classes
- `/deployment/sf-qb-integration-final/src/` - Middleware code
- `/tasks/` - Other related tasks and specifications
