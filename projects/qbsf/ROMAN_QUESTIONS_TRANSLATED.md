# Roman's Questions - Translation & Summary

## Question 1: Re-submission / Update Invoice

**Original (Russian):**
"еще вопрос раз ты прочитал, как мне можно повторно отправить запрос чтобы переписать данные счета? Например я внес не все продукты - счет создался - далее мне нужно скорректировать проодукты и снова отправить тот же счет"

**Translation:**
"One more question - since you read it, how can I re-submit a request to update the invoice data? For example, I entered not all products - the invoice was created - then I need to correct the products and send the same invoice again"

**Meaning:**
- User created invoice with incomplete product list
- Now wants to add missing products
- Wants to update SAME invoice, not create new one
- Needs re-submission mechanism

---

## Question 2 & 3: Filtering Conditions

**Original (Russian):**
"короче по каким то юр лицам счет не создается"
"по каким то создается. Какие там условия ? почта должна быть на уровне контакта?"

**Translation:**
"Basically, for some legal entities (companies) the invoice is not created"
"For some it is created. What are the conditions? Should the email be at the contact level?"

**Meaning:**
- Some accounts create invoices successfully
- Some accounts don't create invoices at all
- What are the filtering/validation conditions?
- Is email on Contact required?

---

## Summary of Issues

1. **Selective Invoice Creation:** Not all accounts generate invoices - need to identify filtering conditions
2. **Email Requirement:** Unclear if email on Contact is mandatory
3. **Update Capability:** No current mechanism to update existing invoices with new products

---

## What Needs to be Done

### Immediate (Diagnosis):
- Identify which accounts work and which don't
- List filtering conditions (Account Type, Country, etc.)
- Determine email requirement

### Then (Implementation):
- Add re-submission/update feature
- Allow updating existing QB invoices
- Document for Roman how to use

