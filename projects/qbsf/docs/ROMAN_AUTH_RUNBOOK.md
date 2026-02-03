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
