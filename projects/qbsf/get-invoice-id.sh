#!/bin/bash
# get_invoice_id.sh - Получение ID последнего созданного счета

echo "==================================================="
echo "Получение ID последнего созданного счета в QuickBooks"
echo "==================================================="

# Переменные
MIDDLEWARE_DIR="/Users/m/git/clients/qbsf/deployment/sf-qb-integration-final"

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

# 1. Создаем временный файл для кода
print_section "Создание временного кода"

TMP_DIR="/tmp/qb_invoice_finder"
mkdir -p $TMP_DIR
check_result "Создание временной директории"

# Создаем код для получения счетов
cat > $TMP_DIR/get_invoices.js << 'EOF'
/**
 * Скрипт для получения списка последних счетов из QuickBooks
 */
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const oauthManager = require('../../src/services/oauth-manager');
const config = require('../../src/config');
const logger = require('../../src/utils/logger');

// Отключаем вывод логов
logger.level = 'error';

/**
 * Получает список последних счетов
 */
async function getInvoices() {
  try {
    // Получаем токены для QuickBooks
    const qbTokens = await oauthManager.getValidAccessToken('quickbooks');
    
    // Проверяем, что токены существуют
    if (!qbTokens || !qbTokens.access_token) {
      console.error('No QuickBooks tokens found. Please authenticate first.');
      return;
    }
    
    // Получаем настройки
    const realmId = qbTokens.realmId || config.quickbooks?.realmId || '9341454378379755';
    const environment = qbTokens.environment || config.quickbooks?.environment || 'sandbox';
    
    // URL API в зависимости от окружения
    const apiBaseUrl = environment === 'sandbox' 
      ? 'https://sandbox-quickbooks.api.intuit.com/v3/company'
      : 'https://quickbooks.api.intuit.com/v3/company';
    
    // Формируем запрос
    const url = `${apiBaseUrl}/${realmId}/query?query=SELECT Id, DocNumber, TxnDate, TotalAmt, CustomerRef, Balance FROM Invoice ORDER BY TxnDate DESC MAXRESULTS 10`;
    
    // Выполняем запрос
    const response = await axios({
      method: 'get',
      url,
      headers: {
        'Authorization': `Bearer ${qbTokens.access_token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    // Проверяем ответ
    if (response.status === 200 && response.data && response.data.QueryResponse) {
      const invoices = response.data.QueryResponse.Invoice || [];
      
      console.log(`\n=== ИНФОРМАЦИЯ О ТОКЕНАХ ===`);
      console.log(`Realm ID: ${realmId}`);
      console.log(`Environment: ${environment}`);
      console.log(`Token Type: ${qbTokens.token_type}`);
      console.log(`Token Expires: ${new Date(qbTokens.expires_at * 1000).toLocaleString()}`);
      
      console.log(`\n=== НАЙДЕНО ${invoices.length} СЧЕТОВ ===`);
      
      if (invoices.length === 0) {
        console.log('Счета не найдены.');
        return;
      }
      
      // Выводим информацию о счетах
      invoices.forEach((invoice, index) => {
        const customer = invoice.CustomerRef ? invoice.CustomerRef.name : 'Неизвестно';
        const date = new Date(invoice.TxnDate).toLocaleDateString();
        
        console.log(`\n${index + 1}. Счет #${invoice.DocNumber || 'Без номера'}`);
        console.log(`   ID: ${invoice.Id}`);
        console.log(`   Дата: ${date}`);
        console.log(`   Сумма: ${invoice.TotalAmt} USD`);
        console.log(`   Клиент: ${customer}`);
        console.log(`   Баланс: ${invoice.Balance} USD`);
        
        // Формируем прямую ссылку
        const uiUrl = environment === 'sandbox'
          ? `https://app.sandbox.qbo.intuit.com/app/invoice?txnId=${invoice.Id}`
          : `https://app.qbo.intuit.com/app/invoice?txnId=${invoice.Id}`;
        
        console.log(`   Ссылка: ${uiUrl}`);
      });
      
      // Информация для доступа к sandbox
      console.log(`\n=== КАК ПРОСМОТРЕТЬ СЧЕТА ===`);
      console.log(`1. Перейдите на страницу входа в ${environment === 'sandbox' ? 'Sandbox' : 'Production'} QBO:`);
      console.log(`   ${environment === 'sandbox' ? 'https://app.sandbox.qbo.intuit.com/' : 'https://app.qbo.intuit.com/'}`);
      console.log(`2. Используйте учетные данные вашего ${environment === 'sandbox' ? 'sandbox' : 'production'} аккаунта QuickBooks.`);
      console.log(`3. После входа перейдите по указанным выше ссылкам на конкретные счета.`);
      
    } else {
      console.error('Ошибка при получении счетов:', response.status);
    }
  } catch (error) {
    console.error('Ошибка выполнения запроса:', error.message);
    
    if (error.response) {
      console.error('Ответ сервера:', error.response.status);
      console.error('Данные ответа:', error.response.data);
    }
  }
}

// Запускаем функцию
getInvoices();
EOF
check_result "Создание скрипта для получения счетов"

# 2. Запускаем скрипт
print_section "Получение списка счетов"

cd $MIDDLEWARE_DIR
node $TMP_DIR/get_invoices.js
check_result "Выполнение скрипта"

# 3. Очистка
print_section "Завершение"

rm -rf $TMP_DIR
check_result "Удаление временных файлов"

echo -e "${GREEN}==================================================="
echo "Теперь вы должны видеть список последних счетов и прямые ссылки на них."
echo "Для просмотра счетов используйте указанные выше ссылки."
echo "==================================================${NC}"