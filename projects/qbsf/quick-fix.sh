#!/bin/bash
# quick_fix.sh - Быстрое исправление проблемы с Line и перезапуск сервера

echo "==================================================="
echo "Быстрое исправление проблемы с Line и перезапуск"
echo "==================================================="

# Переменные
MIDDLEWARE_DIR="/Users/m/git/clients/qbsf/deployment/sf-qb-integration-final"
SERVICE_DIR="$MIDDLEWARE_DIR/src/services"

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

# 1. Остановка сервера, если он запущен
print_section "Остановка сервера"

# Останавливаем middleware если он запущен
if pgrep -f "node $MIDDLEWARE_DIR/src/server.js" > /dev/null; then
  echo "Останавливаем middleware..."
  pkill -f "node $MIDDLEWARE_DIR/src/server.js"
  sleep 2
  check_result "Остановка middleware"
else
  echo "Middleware не запущен"
fi

# 2. Создание исправленного файла
print_section "Создание исправленного файла mapper"

cat > "$SERVICE_DIR/invoice-mapper.js" << 'EOF'
/**
 * Модуль для преобразования данных между Salesforce и QuickBooks
 */
const logger = require('../utils/logger');
const config = require('../config');

// Константы для значений по умолчанию
const DEFAULT_ITEM_ID = '1'; // Используем строку, а не число
const DEFAULT_ITEM_NAME = 'Services';
const DEFAULT_TAX_CODE = 'NON';

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
      DocNumber: opportunity.Name || `INV-${Date.now()}`,
      TxnDate: new Date().toISOString().split('T')[0],
      BillEmail: {
        Address: accountData.Email || ''
      }
    };

    // Добавляем строки товаров/услуг (минимально необходимые поля)
    invoice.Line = [{
      Amount: opportunity.Amount || 1.00,
      DetailType: "SalesItemLineDetail",
      SalesItemLineDetail: {
        ItemRef: {
          value: DEFAULT_ITEM_ID,
          name: DEFAULT_ITEM_NAME
        },
        Qty: 1,
        UnitPrice: opportunity.Amount || 1.00
      },
      Description: `Service for ${opportunity.Name}`
    }];

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

module.exports = {
  mapOpportunityToInvoice
};
EOF
check_result "Создание исправленного файла mapper"

# 3. Перезапуск middleware
print_section "Перезапуск middleware"

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
check_result "Запуск middleware"

# 4. Инструкции
print_section "Инструкции для тестирования интеграции"

echo -e "${GREEN}==================================================="
echo "ДОСТУП К QUICKBOOKS:"
echo "==================================================${NC}"
echo ""
echo "1. Войдите в QuickBooks Sandbox через браузер:"
echo "   URL: https://app.sandbox.qbo.intuit.com/app/homepage"
echo ""
echo "2. Используйте учетные данные, которые вы указали при авторизации"
echo ""
echo "3. После входа перейдите к разделу Продажи -> Счета (Sales -> Invoices)"
echo "   URL: https://app.sandbox.qbo.intuit.com/app/invoices"
echo ""
echo "4. В Salesforce создайте новую сделку или измените статус существующей:"
echo "   - Создайте новую Opportunity в Salesforce"
echo "   - Измените статус на 'Proposal and Agreement'"
echo ""
echo "5. Проверьте логи middleware:"
echo "   tail -f $MIDDLEWARE_DIR/middleware.log"
echo ""
echo "6. Обновите страницу счетов в QuickBooks и проверьте, появился ли новый счет"
echo ""
echo -e "${YELLOW}Примечание: Исправление должно решить проблему с отсутствием Line в запросе.${NC}"
echo ""

# Открываем логи сервера
tail -f "$MIDDLEWARE_DIR/middleware.log"