#!/bin/bash
# quick_demo_fix.sh - Исправленный скрипт для демонстрации

echo "==================================================="
echo "Демонстрация интеграции Salesforce-QuickBooks (исправленная)"
echo "==================================================="

# Переменные
MIDDLEWARE_DIR="/Users/m/git/clients/qbsf/deployment/sf-qb-integration-final"
NGROK_URL="https://3128-166-1-160-232.ngrok-free.app"
SF_ALIAS="sanboxsf"
SF_INSTANCE_URL="https://customer-inspiration-2543--sanboxsf.sandbox.my.salesforce.com"

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Функция для печати секции
print_section() {
  echo -e "\n${YELLOW}=== $1 ===${NC}"
}

# Функция для проверки результата операции
check_result() {
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ $1${NC}"
  else
    echo -e "${RED}✗ $1${NC}"
    exit 1
  fi
}

# 1. Исправление текущего middleware для поддержки пустых линейных позиций
# (Пропускаем, так как это уже сделано в предыдущем запуске)

# 2. Обновляем настройки через Salesforce CLI
print_section "Обновление Remote Site Settings через CLI"

# Создаем временный файл метаданных
mkdir -p temp_metadata/remoteSiteSettings
cat > temp_metadata/remoteSiteSettings/QuickBooksMiddleware.remoteSite << EOF
<?xml version="1.0" encoding="UTF-8"?>
<RemoteSiteSetting xmlns="http://soap.sforce.com/2006/04/metadata">
    <disableProtocolSecurity>false</disableProtocolSecurity>
    <isActive>true</isActive>
    <url>${NGROK_URL}</url>
    <description>URL для связи с middleware для интеграции с QuickBooks</description>
</RemoteSiteSetting>
EOF

# Развертываем Remote Site Settings
echo "Развертывание Remote Site Settings..."
sf project deploy start -d temp_metadata --target-org $SF_ALIAS
check_result "Обновление Remote Site Settings"

# Удаляем временные файлы
rm -rf temp_metadata

# 3. Проверяем и обновляем Custom Settings
print_section "Обновление QB Integration Settings"

# Создаем временный файл Apex для обновления настроек (без RemoteSiteSetting)
cat > update_settings.apex << EOF
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
            setting.put('Middleware_Endpoint__c', '${NGROK_URL}');
            update setting;
            System.debug('Updated QB Integration Settings: ' + setting.get('Middleware_Endpoint__c'));
        } else {
            SObject setting = Schema.getGlobalDescribe().get('QB_Integration_Settings__c').newSObject();
            setting.put('API_Key__c', 'quickbooks_salesforce_api_key_2025');
            setting.put('Middleware_Endpoint__c', '${NGROK_URL}');
            setting.put('QB_Realm_ID__c', '9341454378379755');
            insert setting;
            System.debug('Created new QB Integration Settings');
        }
    }
} catch (Exception e) {
    System.debug('Error processing QB_Integration_Settings__c: ' + e.getMessage());
}
EOF

# Выполняем Apex код
sf apex run --file update_settings.apex --target-org $SF_ALIAS
check_result "Проверка и обновление Custom Settings"

# 4. Запуск middleware сервера
print_section "Запуск middleware сервера"

# Останавливаем предыдущий экземпляр если он запущен
if pgrep -f "node $MIDDLEWARE_DIR/src/server.js" > /dev/null; then
  echo "Останавливаем предыдущий экземпляр middleware..."
  pkill -f "node $MIDDLEWARE_DIR/src/server.js"
  sleep 2
fi

# Запускаем новый экземпляр
echo "Запуск middleware сервера..."
cd "$MIDDLEWARE_DIR"
npm start > middleware.log 2>&1 &
SERVER_PID=$!
echo "Сервер запущен с PID: $SERVER_PID"
sleep 5

# Проверяем, запустился ли сервер
if ps -p $SERVER_PID > /dev/null; then
  echo "Сервер успешно запущен"
else
  echo "Ошибка запуска сервера. Проверьте middleware.log"
  exit 1
fi

# 5. Инструкции по демонстрации
print_section "Инструкции по демонстрации"

echo -e "${GREEN}==================================================="
echo "Демонстрация готова к показу!"
echo "==================================================${NC}"
echo ""
echo "Для демонстрации выполните следующие шаги:"
echo ""
echo "1. Аутентификация middleware в Salesforce:"
echo "   Откройте в браузере: $NGROK_URL/auth/salesforce"
echo ""
echo "2. Аутентификация middleware в QuickBooks:"
echo "   Откройте в браузере: $NGROK_URL/auth/quickbooks"
echo ""
echo "3. Создайте тестовую сделку в Salesforce:"
echo "   - Создайте новую Opportunity"
echo "   - Добавьте или не добавляйте продукты (для демонстрации обоих случаев)"
echo "   - Измените статус на 'Proposal and Agreement'"
echo ""
echo "4. Наблюдайте процесс в логах сервера:"
echo "   tail -f $MIDDLEWARE_DIR/middleware.log"
echo ""
echo "5. Проверьте создание счета в QuickBooks"
echo ""
echo -e "${YELLOW}Примечание: Для остановки демонстрации нажмите Ctrl+C${NC}"
echo ""

# Для удобства открываем логи сервера
echo "Показываем логи сервера в реальном времени:"
tail -f "$MIDDLEWARE_DIR/middleware.log"