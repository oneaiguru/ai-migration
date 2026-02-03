// Обновление Remote Site Settings
List<RemoteSiteSetting> existingRSS = [
    SELECT Id, Url, IsActive, Description, DisableProtocolSecurity 
    FROM RemoteSiteSetting 
    WHERE SiteName = 'QuickBooksMiddleware'
];

if (!existingRSS.isEmpty()) {
    RemoteSiteSetting rss = existingRSS[0];
    rss.Url = 'https://3128-166-1-160-232.ngrok-free.app';
    rss.IsActive = true;
    update rss;
    System.debug('Updated Remote Site Setting: ' + rss.Url);
} else {
    System.debug('Remote Site Setting not found. Please create it manually.');
}

// Обновление Custom Settings
List<QB_Integration_Settings__c> qbSettings = [
    SELECT Id, API_Key__c, Middleware_Endpoint__c, QB_Realm_ID__c
    FROM QB_Integration_Settings__c
    LIMIT 1
];

if (!qbSettings.isEmpty()) {
    QB_Integration_Settings__c setting = qbSettings[0];
    setting.API_Key__c = 'quickbooks_salesforce_api_key_2025';
    setting.Middleware_Endpoint__c = 'https://3128-166-1-160-232.ngrok-free.app';
    update setting;
    System.debug('Updated QB Integration Settings: ' + setting.Middleware_Endpoint__c);
} else {
    QB_Integration_Settings__c setting = new QB_Integration_Settings__c();
    setting.API_Key__c = 'quickbooks_salesforce_api_key_2025';
    setting.Middleware_Endpoint__c = 'https://3128-166-1-160-232.ngrok-free.app';
    setting.QB_Realm_ID__c = '9341454378379755';
    insert setting;
    System.debug('Created new QB Integration Settings');
}
