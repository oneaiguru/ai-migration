# EXACT TASKS FROM ROMAN - Direct Quotes

> **Source**: `/Users/m/git/clients/qbsf/ignore/qb-sf-communication-package/99.markdown`
> **Original Language**: Russian (WhatsApp/Telegram)
> **Date Range**: December 1, 2025 - November 7, 2025

---

## 🔴 TASK 1: FIX BROKEN INTEGRATION

### Roman's Exact Words (December 1, 21:57):

```
Roman Kapralov, [01.12.2025 21:57]
у нас перестала работать интеграция. Номер не возвращает теперь.
Проверь завтра. У нас на неделе показ
```

### English Translation:
> "Our integration stopped working. The number doesn't return anymore.
> Check it tomorrow. We have a demonstration this week."

### What "Номер не возвращает" Means:
**"The number doesn't return"** = Invoice ID is not being returned from the integration. When an Opportunity is created or updated, the `QB_Invoice_ID__c` field should populate with the QuickBooks invoice number, but it's not happening anymore.

### Context Before This:
Roman said the same day (Dec 1, 21:45):
```
Roman Kapralov, [01.12.2025 21:45]
слово пацана? ))))

Misha Granin, [01.12.2025 21:45]
да. плюс зуб даю!
```
> Roman: "Your word as a friend?" / Misha: "Yes, plus I give you my tooth!" (Russian idiom for serious promise)

Then immediately (21:57):
```
Roman Kapralov, [01.12.2025 21:57]
у нас перестала работать интеграция...
```
> The integration broke.

### The Escalation (Dec 2-3):

**Dec 2, 17:27**:
```
Roman Kapralov, [02.12.2025 17:27]
утро уже прошло

Roman Kapralov, [02.12.2025 17:27]
зуб под угрозой
```
> "Morning is over" / "Your tooth is under threat" (broken promise)

**Dec 2, 23:06**:
```
Roman Kapralov, [02.12.2025 23:06]
мелочи доделал ?
```
> "Did you finish the little things?" (implying the fixes should be simple details)

**Dec 3, 01:07-01:08**:
```
Roman Kapralov, [03.12.2025 01:07]
Час?

Misha Granin, [03.12.2025 01:08]
около того
```
> Roman: "An hour?" / Misha: "About that" (still working at 1 AM)

**Dec 3, 02:21**:
```
Roman Kapralov, [03.12.2025 02:21]
Ну ничего, по старике будем тестить

Roman Kapralov, [03.12.2025 02:21]
У тебя запрос либо проходит либо нет.

Roman Kapralov, [03.12.2025 02:21]
Так что не откладывай
```
> "No problem, we'll test the old way. Either the request goes through or it doesn't. So don't delay."

**Dec 3, 03:22** - LAST MESSAGE:
```
Roman Kapralov, [03.12.2025 03:22]
Ну как
```
> "So how is it?" (Waiting for answer - no response yet as of Dec 6)

---

## 🟠 TASK 2: ADD PAYMENT LINK FIELD (Additional Feature - Autumn Request)

### Roman's Initial Request (November 7, 15:28):

```
Roman Kapralov, [07.11.2025 15:28]
Привет, мне нужно из QB получить еще одно поле - "ссылка на оплату".
Можешь это сделать? если да то когда и за сколько?

Ну или сказать где его взять куда добавить и тд
```

### English Translation:
> "Hello, I need to get one more field from QB - 'payment link'.
> Can you do it? If yes, when and for how much?
>
> Or tell me where to get it, where to add it, etc."

### Detailed Requirement (November 7, 15:49):

```
Roman Kapralov, [07.11.2025 15:49]
Нужно чтобы в SalesForce передавалась ссылка на оплату которая открывает
внешний виджет QB где можно будет оплатить картой и другими способами
```

### English Translation:
> "It needs to pass the payment link to SalesForce that opens the external QB widget
> where users can pay by card and other methods."

### Clarification on Scope (November 20, 15:39-15:41):

```
Roman Kapralov, [20.11.2025 15:39]
Давай сначала со ссылкой раздеремся. Потом мы проведем прям эксперимент
с частичной оплатой и я тебе сам напишу конкретную постановку

Roman Kapralov, [20.11.2025 15:40]
Если сумма полностью совпадает с суммой счета то статус поменяется на Paid

Roman Kapralov, [20.11.2025 15:41]
пока больше ничего не надо трогать.

Roman Kapralov, [20.11.2025 15:41]
А то вчера что то уже плохо работало - как будто упала интеграция но я сам не смотрел
```

### English Translation:
> "Let's first deal with the link. Then we'll run an experiment with partial payment
> and I'll write you the exact specification.
>
> If the amount matches the invoice amount exactly, the status changes to Paid.
>
> Don't touch anything else for now.
>
> Because something wasn't working well yesterday - it seemed like the integration fell,
> but I didn't check it myself."

### Field Name (November 16, 20:59):

```
Roman Kapralov, [16.11.2025 20:59]
QB_Payment_Link__c
```

> The field name that should be created in Salesforce

### Question About Partial Payments (November 17, 13:28-14:41):

```
Roman Kapralov, [17.11.2025 13:28]
И еще вопрос, если по счету пройдет частичная оплата, данные в sales force придут?
Или только по созданию и статусу paid?

Misha Granin, [17.11.2025 14:38]
Стандартная оплата не придет конечно. Это уже надо совсем другое доп решение...

Roman Kapralov, [17.11.2025 14:40]
Да просто при поступлении денег в QB надо сразу передавать это значение в SF.

Roman Kapralov, [17.11.2025 14:41]
Если в qb есть статус частично оплачено - можно по нему передавать
```

### English Translation:
> Roman: "And another question: if a partial payment goes through on the invoice,
> will the data come to Salesforce? Or only on creation and paid status?
>
> Misha: "Standard payment won't come, of course. This needs a completely different solution..."
>
> Roman: "Just, when money comes into QB, immediately transfer that value to SF.
> If QB has a 'partially paid' status - we can transfer based on that."

### CRITICAL: Don't Touch Anything Else (November 20, 15:41-15:43):

```
Roman Kapralov, [20.11.2025 15:41]
пока больше ничего не надо трогать.

Roman Kapralov, [20.11.2025 15:42]
А то вчера что то уже плохо работало - как будто упала интеграция но я сам не смотрел

Misha Granin, [20.11.2025 15:42]
Так что то менялось уже с тех пор как мой код летом деплоили? Уже что то сделано?

Roman Kapralov, [20.11.2025 15:42]
нет. В интеграцию никто не лез

Roman Kapralov, [20.11.2025 15:42]
У нас так и было реализовано тобой. Если статус Paid приходят все данные в SF и сделка закрывается

Roman Kapralov, [20.11.2025 15:43]
Тур не надо ничего корректировать
```

### English Translation:
> Roman: "Don't touch anything else for now.
>
> Because something wasn't working well yesterday - seemed like integration fell, but I didn't check.
>
> Misha: "Has anything changed since my code was deployed in summer? Has something been done already?"
>
> Roman: "No. Nobody touched the integration.
>
> We use what you built. When status is 'Paid', all data comes to SF and the deal closes.
>
> Don't change anything."

---

## 📋 EXACT SCOPE OF WORK

### Task 1: Fix Integration (IMMEDIATE/BLOCKING)

**What's Broken**:
- Invoice ID ("номер") is not being returned
- As of December 1, 2025

**Root Cause** (from Nov 27 deployment errors):
```
REQUIRED_FIELD_MISSING: [Supplierc]
Code Coverage: 20% (need 75%)
OpportunityQuickBooksTrigger: 0% coverage
```

**Exact Requirements** (from Roman's words):
1. Fix the integration so it returns the invoice ID/number again
2. Do NOT change anything else in the working payment sync logic
3. Current logic: "Если статус Paid приходят все данные в SF и сделка закрывается"
   (If status is Paid, all data comes to SF and the deal closes) - keep this working

**Scope**:
- Fix only what's broken
- Do NOT modify payment sync logic
- Do NOT change anything unrelated

---

### Task 2: Add Payment Link Field (SECONDARY)

**What to Add**:
```
Field Name:        QB_Payment_Link__c
Source:            QuickBooks (payment link)
Destination:       Salesforce Opportunity
Purpose:           Display clickable link to QB payment widget for users to pay
```

**Exact Workflow** (from Roman's description):
1. QB generates/has a payment link
2. Link is extracted from QB API response
3. Link is passed through middleware to Salesforce
4. Link is stored in QB_Payment_Link__c field
5. Users can click the link to open QB payment widget
6. Users can pay by card or other methods

**Current Status**:
- Field created: November 16, 2025 ✅ (QB_Payment_Link__c)
- Implementation: NOT STARTED ❌

**What NOT to Do**:
```
Roman Kapralov, [20.11.2025 15:41]
пока больше ничего не надо трогать.
```
> "Don't touch anything else for now."

Only add the payment link. Don't modify:
- Payment sync logic
- Invoice creation logic
- Existing field mappings
- Scheduler/automation

---

## 🎯 EXACT QUOTES FOR REQUIREMENTS

### "The Number Doesn't Return" (Task 1 Definition)

```
[Dec 1, 21:57]
"у нас перестала работать интеграция. Номер не возвращает теперь."

= Integration is broken. Invoice ID is not being returned.
```

### "Payment Link from QB Widget" (Task 2 Definition)

```
[Nov 7, 15:49]
"Нужно чтобы в SalesForce передавалась ссылка на оплату которая открывает
внешний виджет QB где можно будет оплатить картой и другими способами"

= Need to pass a payment link to SalesForce that opens the external QB widget
  where users can pay by card and other methods.
```

### "Only Do the Payment Link" (Task 2 Scope)

```
[Nov 20, 15:41]
"сделай сейчас только передачу ссылки на оплату"

= Just do the payment link transmission now.
```

### "Don't Touch Anything Else" (Task 2 Warning)

```
[Nov 20, 15:41]
"пока больше ничего не надо трогать."

= Don't touch anything else for now.
```

---

## 📊 TASK PRIORITY & DEADLINE

### Task 1: Fix Integration
- **Priority**: 🔴 CRITICAL/BLOCKING
- **Reported**: December 1, 21:57
- **Expected Fix**: December 2 ("завтра" = tomorrow)
- **Current Status**: NOT FIXED (as of Dec 6)
- **Roman's Patience**: EXHAUSTED
  - "зуб под угрозой" (tooth under threat = broken promise)
  - "мелочи доделал?" (did you finish the little things?)
  - Multiple messages asking for status
  - Last message Dec 3, 03:22 with no response for 3+ days

### Task 2: Add Payment Link
- **Priority**: 🟠 HIGH/SECONDARY
- **Requested**: November 7
- **Deadline Given**: November 13 (Misha promised "tomorrow")
- **Actual Status**: Still not done (1 month later)
- **Roman's Words**: "3 недели!!!!! для добавления одного поля" (3 weeks!!!!! to add one field)

### Demonstration Deadline
```
[Dec 1, 21:57]
"У нас на неделе показ"

= We have a demonstration this week (week of Dec 1-7)
```

Status: Unknown if demonstration already happened or still pending

---

## ✅ DELIVERABLES

### For Task 1 (Fix Integration):
- [ ] Invoice ID returns correctly
- [ ] QB_Invoice_ID__c field populates when Opportunity stage = "Proposal and Agreement"
- [ ] All tests pass (10+ tests currently failing)
- [ ] Code coverage >= 75%
- [ ] OpportunityQuickBooksTrigger > 0% coverage
- [ ] Verified with test Opportunity

### For Task 2 (Add Payment Link):
- [ ] QB_Payment_Link__c field populated with payment link from QB
- [ ] Link is clickable in Salesforce
- [ ] Link opens QB payment widget
- [ ] Tested with real QB invoice
- [ ] No changes to existing payment sync logic

---

## 🔴 CRITICAL CONTEXT

### This is NOT about payment approval:
- Payment was already made September 4, 2025 ✅
- This is about fixing broken functionality + adding requested feature

### This is time-sensitive:
- Integration broken 5 days ago (Dec 1)
- Demonstration expected this week (Dec 1-7)
- Roman is frustrated with 3+ weeks delay on simple feature
- Last contact: Dec 3, 03:22 (no response for 3+ days)

### Roman's Patience Level:
```
[Dec 1, 21:12]
"Я тебе написал 07 ноября. 3 недели!!!!! для добавления одного поля, ну камон..."

= I wrote you on Nov 7. 3 WEEKS!!!!! to add one field, come on...
```

---

## 📝 STATUS TO SEND TO ROMAN

When you start work, send update:

```
Roman!

I'm starting work on:

1. FIX INTEGRATION (Priority 1) - Invoice ID not returning
   - Diagnosing Supplierc field issue
   - Fixing test coverage
   - ETA: ~2 hours

2. ADD PAYMENT LINK (Priority 2) - QB_Payment_Link__c
   - Extract link from QB API
   - Pass through middleware
   - Store in Salesforce
   - ETA: ~3 hours

Will update you in 1 hour with progress.
```

---

*Extracted from authentic client communication*
*All quotes translated directly from Russian*
*Source: WhatsApp/Telegram Dec 1 - Nov 7, 2025*
