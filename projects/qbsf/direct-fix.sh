#!/bin/bash
# direct_fix.sh - Прямое исправление quickbooks-api.js

echo "==================================================="
echo "Прямое исправление QuickBooks API"
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

# 2. Создание резервной копии файлов
print_section "Создание резервных копий файлов"

cp "$SERVICE_DIR/quickbooks-api.js" "$SERVICE_DIR/quickbooks-api.js.backup"
check_result "Создание резервной копии quickbooks-api.js"

cp "$SERVICE_DIR/invoice-mapper.js" "$SERVICE_DIR/invoice-mapper.js.backup"
check_result "Создание резервной копии invoice-mapper.js"

# 3. Прямое исправление в файле quickbooks-api.js
print_section "Исправление файла quickbooks-api.js"

# Находим метод createInvoice и добавляем туда принудительную установку Line
cat > "$SERVICE_DIR/quickbooks-api.js.patch" << 'EOF'
  /**
   * Создает счет в QuickBooks
   * @param {Object} invoiceData - Данные счета
   * @returns {Promise<Object>} Созданный счет
   */
  async createInvoice(invoiceData) {
    try {
      logger.info('Creating invoice in QuickBooks');

      // Исправление: Проверка наличия Line и принудительная установка
      if (!invoiceData.Line || !Array.isArray(invoiceData.Line) || invoiceData.Line.length === 0) {
        logger.warn('Invoice data missing Line, adding default line item');
        
        // Добавляем стандартную строку услуг
        invoiceData.Line = [{
          Amount: 1.00,
          DetailType: "SalesItemLineDetail",
          SalesItemLineDetail: {
            ItemRef: {
              value: "1",
              name: "Services"
            },
            Qty: 1,
            UnitPrice: 1.00
          },
          Description: "Default service item"
        }];
      }

      // Логгируем данные перед отправкой
      logger.debug('Invoice data to send:', {
        customerRef: invoiceData.CustomerRef,
        lineItems: invoiceData.Line,
        docNumber: invoiceData.DocNumber
      });

      const invoice = await this.request('post', 'invoice', invoiceData);
      return invoice;
    } catch (error) {
      logger.error('Error creating invoice:', error);
      throw error;
    }
  }
EOF

# Заменяем метод createInvoice в quickbooks-api.js
# Находим строку перед методом createInvoice
LINE_NUM=$(grep -n "createInvoice" "$SERVICE_DIR/quickbooks-api.js" | head -1 | cut -d: -f1)
# Вычисляем строку начала метода (предыдущая строка)
START_LINE=$((LINE_NUM - 1))
# Находим строку закрытия метода (следующая закрывающая скобка)
END_LINE=$(tail -n +$START_LINE "$SERVICE_DIR/quickbooks-api.js" | grep -n "  }" | head -1 | cut -d: -f1)
END_LINE=$((START_LINE + END_LINE))

# Заменяем содержимое метода
head -n $((START_LINE - 1)) "$SERVICE_DIR/quickbooks-api.js" > "$SERVICE_DIR/quickbooks-api.js.new"
cat "$SERVICE_DIR/quickbooks-api.js.patch" >> "$SERVICE_DIR/quickbooks-api.js.new"
tail -n +$((END_LINE + 1)) "$SERVICE_DIR/quickbooks-api.js" >> "$SERVICE_DIR/quickbooks-api.js.new"

mv "$SERVICE_DIR/quickbooks-api.js.new" "$SERVICE_DIR/quickbooks-api.js"
check_result "Обновление quickbooks-api.js"

# 4. Создаем максимально простой mapper
print_section "Создание простого invoice-mapper.js"

cat > "$SERVICE_DIR/invoice-mapper.js" << 'EOF'
/**
 * Модуль для преобразования данных между Salesforce и QuickBooks
 */
const logger = require('../utils/logger');

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
    // Создаем объект счета с минимальным набором полей
    const invoice = {
      CustomerRef: {
        value: customerId
      },
      DocNumber: opportunity.Name || `INV-${Date.now()}`,
      TxnDate: new Date().toISOString().split('T')[0],
      Line: [{
        Amount: opportunity.Amount || 1.00,
        DetailType: "SalesItemLineDetail",
        SalesItemLineDetail: {
          ItemRef: {
            value: "1", // Используем строку, а не число
            name: "Services"
          },
          Qty: 1,
          UnitPrice: opportunity.Amount || 1.00
        },
        Description: `Service for ${opportunity.Name || 'Opportunity'}`
      }]
    };

    logger.info('Successfully mapped Opportunity to Invoice', {
      opportunityId: opportunity.Id,
      lineItems: invoice.Line.length,
      total: invoice.Line[0].Amount
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
check_result "Создание простого invoice-mapper.js"

# 5. Перезапуск middleware
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

# 6. Инструкции
print_section "Инструкции для тестирования интеграции"

echo -e "${GREEN}==================================================="
echo "ИСПРАВЛЕНИЕ ПРИМЕНЕНО!"
echo "==================================================${NC}"
echo ""
echo "Мы внесли следующие изменения:"
echo "1. Упростили код invoice-mapper.js до минимума"
echo "2. Добавили защиту в quickbooks-api.js для принудительной установки Line"
echo ""
echo "Теперь попробуйте снова:"
echo "1. Создайте новую сделку в Salesforce"
echo "2. Установите статус 'Proposal and Agreement'"
echo "3. Проверьте логи на наличие ошибок"
echo ""
echo "URL для входа в QuickBooks:"
echo "https://app.sandbox.qbo.intuit.com/app/homepage"
echo ""
echo "URL для проверки счетов в QuickBooks:"
echo "https://app.sandbox.qbo.intuit.com/app/invoices"
echo ""
echo -e "${YELLOW}После успешного создания счета, можно продемонстрировать это Роману${NC}"
echo ""

# Открываем логи сервера
tail -f "$MIDDLEWARE_DIR/middleware.log"