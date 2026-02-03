#!/bin/bash
# demo_current_solution.sh - Скрипт для демонстрации текущего решения

echo "==================================================="
echo "Демонстрация текущей интеграции Salesforce-QuickBooks"
echo "==================================================="

# Переменные
MIDDLEWARE_DIR="/Users/m/git/clients/qbsf/deployment/sf-qb-integration-final"
NGROK_URL="https://9e14-166-1-160-232.ngrok-free.app"
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
print_section "Исправление middleware для пустых линейных позиций"

cd "$MIDDLEWARE_DIR"
echo "Обновляем файл mapper для поддержки пустых линейных позиций..."

# Создаем резервную копию файла
cp src/services/invoice-mapper.js src/services/invoice-mapper.js.backup
check_result "Создание резервной копии invoice-mapper.js"

# Создаем новый файл с исправлениями для пустых линейных позиций
cat > src/services/invoice-mapper.js << 'EOF'
/**
 * Модуль для преобразования данных между Salesforce и QuickBooks
 */
const logger = require('../utils/logger');
const config = require('../config');

// Константы для значений по умолчанию
const DEFAULT_ITEM_ID = config.quickbooks?.defaultItemId || '1';
const DEFAULT_ITEM_NAME = config.quickbooks?.defaultItemName || 'Services';
const DEFAULT_TAX_CODE = config.quickbooks?.defaultTaxCode || 'NON';

/**
 * Преобразует Salesforce Opportunity в QuickBooks Invoice
 * @param {Object} opportunity - Данные Salesforce opportunity
 * @param {Object} accountData - Данные Salesforce account
 * @param {Array} lineItems - Строки Opportunity
 * @param {number} customerId - ID клиента в QuickBooks
 * @returns {Object} Объект счета QuickBooks
 */
function mapOpportunityToInvoice(opportunity, accountData, lineItems = [], customerId) {
  logger.info('Mapping Opportunity to Invoice', {
    opportunityId: opportunity.Id,
    customerId,
    lineItemCount: lineItems.length
  });

  try {
    // Создаем объект счета
    const invoice = {
      CustomerRef: {
        value: customerId
      },
      Line: [],
      DocNumber: opportunity.Name || `INV-${Date.now()}`,
      TxnDate: new Date().toISOString().split('T')[0],
      DueDate: calculateDueDate(new Date()),
      BillEmail: {
        Address: accountData.Email || ''
      },
      BillAddr: formatAddress(accountData),
      PrivateNote: `Created from Salesforce Opportunity: ${opportunity.Id}`
    };

    // Преобразуем строки товаров/услуг
    if (lineItems && lineItems.length > 0) {
      invoice.Line = lineItems.map((item) => {
        logger.debug('Mapping line item', { 
          index: lineItems.indexOf(item), 
          productName: item.Product2?.Name,
          qbItemId: item.Product2?.QB_Item_ID__c
        });

        return {
          Amount: parseFloat(item.TotalPrice || 0),
          DetailType: "SalesItemLineDetail",
          SalesItemLineDetail: {
            ItemRef: {
              value: item.Product2?.QB_Item_ID__c || DEFAULT_ITEM_ID,
              name: item.Product2?.Name || DEFAULT_ITEM_NAME
            },
            Qty: parseFloat(item.Quantity || 1),
            UnitPrice: parseFloat(item.UnitPrice || 0),
            TaxCodeRef: {
              value: DEFAULT_TAX_CODE
            }
          },
          Description: item.Product2?.Description || item.Product2?.Name || 'Service'
        };
      });
    } else {
      // Если нет строк, создаем стандартную строку услуг
      logger.warn('No line items found, creating default service line', {
        opportunity: opportunity.Id,
        amount: opportunity.Amount
      });
      
      invoice.Line = [{
        Amount: opportunity.Amount || 0.01, // Минимум 0.01 если нет суммы
        DetailType: "SalesItemLineDetail",
        SalesItemLineDetail: {
          ItemRef: {
            value: DEFAULT_ITEM_ID,
            name: DEFAULT_ITEM_NAME
          },
          Qty: 1,
          UnitPrice: opportunity.Amount || 0.01,
          TaxCodeRef: {
            value: DEFAULT_TAX_CODE
          }
        },
        Description: `Service for Opportunity: ${opportunity.Name}`
      }];
    }

    logger.info('Successfully mapped Opportunity to Invoice', {
      opportunityId: opportunity.Id,
      lineItems: invoice.Line.length
    });

    return invoice;
  } catch (error) {
    logger.error('Error mapping opportunity to invoice:', error);
    throw new Error(`Failed to map opportunity to invoice: ${error.message}`);
  }
}

/**
 * Рассчитывает дату платежа (обычно +30 дней от текущей даты)
 * @param {Date} date - Базовая дата
 * @returns {string} Дата в формате ISO
 */
function calculateDueDate(date) {
  const dueDate = new Date(date);
  dueDate.setDate(dueDate.getDate() + 30);
  return dueDate.toISOString().split('T')[0];
}

/**
 * Форматирует адрес из данных Salesforce для QuickBooks
 * @param {Object} accountData - Данные аккаунта Salesforce
 * @returns {Object|undefined} Адрес для QuickBooks или undefined
 */
function formatAddress(accountData) {
  if (!accountData.BillingStreet && !accountData.BillingCity) {
    return undefined;
  }
  
  return {
    Line1: accountData.BillingStreet || '',
    City: accountData.BillingCity || '',
    Country: accountData.BillingCountry || '',
    CountrySubDivisionCode: accountData.BillingState || '',
    PostalCode: accountData.BillingPostalCode || ''
  };
}

module.exports = {
  mapOpportunityToInvoice
};
EOF
check_result "Создание обновленного файла invoice-mapper.js"

# 2. Обновляем файл конфигурации для значений по умолчанию
print_section "Обновление конфигурации"

if ! grep -q "QB_DEFAULT_ITEM_ID" .env; then
  echo "" >> .env
  echo "# Default QuickBooks Item Configuration" >> .env
  echo "QB_DEFAULT_ITEM_ID=1" >> .env
  echo "QB_DEFAULT_ITEM_NAME=Services" >> .env
  echo "QB_DEFAULT_TAX_CODE=NON" >> .env
  check_result "Добавление настроек QB по умолчанию в .env"
fi

# 3. Запуск ngrok для проброса портов
print_section "Запуск ngrok"

# Проверяем, запущен ли ngrok
if ! pgrep -f "ngrok http 3000" > /dev/null; then
  echo "Запускаем ngrok..."
  ngrok http 3000 > /dev/null &
  NGROK_PID=$!
  echo "Ngrok запущен с PID: $NGROK_PID"
else
  echo "Ngrok уже запущен"
fi

# Даем ngrok время на запуск
sleep 5

# Получаем URL ngrok
NGROK_URL=$(curl -s http://localhost:4040/api/tunnels | grep -o '"public_url":"https://[^"]*' | sed 's/"public_url":"//g')
echo "Ngrok URL: $NGROK_URL"
check_result "Получение URL ngrok"

# 4. Обновление настроек в Salesforce
print_section "Обновление настроек в Salesforce"

# Аутентификация в Salesforce
sf org login web --alias $SF_ALIAS --instance-url $SF_INSTANCE_URL
check_result "Логин в Salesforce Sandbox"

# Создаем временный файл Apex для обновления настроек
cat > update_settings.apex << EOF
// Обновление Remote Site Settings
List<RemoteSiteSetting> existingRSS = [
    SELECT Id, Url, IsActive, Description, DisableProtocolSecurity 
    FROM RemoteSiteSetting 
    WHERE SiteName = 'QuickBooksMiddleware'
];

if (!existingRSS.isEmpty()) {
    RemoteSiteSetting rss = existingRSS[0];
    rss.Url = '$NGROK_URL';
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
    setting.Middleware_Endpoint__c = '$NGROK_URL';
    update setting;
    System.debug('Updated QB Integration Settings: ' + setting.Middleware_Endpoint__c);
} else {
    QB_Integration_Settings__c setting = new QB_Integration_Settings__c();
    setting.API_Key__c = 'quickbooks_salesforce_api_key_2025';
    setting.Middleware_Endpoint__c = '$NGROK_URL';
    setting.QB_Realm_ID__c = '9341454378379755';
    insert setting;
    System.debug('Created new QB Integration Settings');
}
EOF

# Выполняем Apex код
sf apex run --file update_settings.apex --target-org $SF_ALIAS
check_result "Обновление настроек в Salesforce"

# 5. Запуск middleware сервера
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

# 6. Инструкции по демонстрации
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

# Ожидаем ввода пользователя для завершения
read -p "Нажмите Enter для завершения демонстрации..."

# Очистка
echo "Очистка..."
if ps -p $SERVER_PID > /dev/null; then
  kill $SERVER_PID
fi
if [ ! -z "$NGROK_PID" ] && ps -p $NGROK_PID > /dev/null; then
  kill $NGROK_PID
fi

echo "Демонстрация завершена."