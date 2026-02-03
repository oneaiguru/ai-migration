// Проверяем существование объекта
try {
    // Проверяем, существует ли объект QB_Integration_Settings__c
    Schema.SObjectType tokenType = Schema.getGlobalDescribe().get('QB_Integration_Settings__c');
    
    if (tokenType == null) {
        System.debug('Custom Setting QB_Integration_Settings__c does not exist.');
    } else {
        System.debug('Custom Setting QB_Integration_Settings__c exists.');
        
        // Проверяем и обновляем настройки
        List<SObject> qbSettings = Database.query('SELECT Id, API_Key__c, Middleware_Endpoint__c, QB_Realm_ID__c FROM QB_Integration_Settings__c LIMIT 1');
        
        if (!qbSettings.isEmpty()) {
            SObject setting = qbSettings[0];
            setting.put('API_Key__c', 'quickbooks_salesforce_api_key_2025');
            setting.put('Middleware_Endpoint__c', 'https://3128-166-1-160-232.ngrok-free.app');
            update setting;
            System.debug('Updated QB Integration Settings: ' + setting.get('Middleware_Endpoint__c'));
        } else {
            SObject setting = Schema.getGlobalDescribe().get('QB_Integration_Settings__c').newSObject();
            setting.put('API_Key__c', 'quickbooks_salesforce_api_key_2025');
            setting.put('Middleware_Endpoint__c', 'https://3128-166-1-160-232.ngrok-free.app');
            setting.put('QB_Realm_ID__c', '9341454378379755');
            insert setting;
            System.debug('Created new QB Integration Settings');
        }
    }
} catch (Exception e) {
    System.debug('Error processing QB_Integration_Settings__c: ' + e.getMessage());
}
