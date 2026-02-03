// api.js - Обновляем middleware для обработки SF счетов и проверки оплаты

/**
 * Маршруты API для интеграции Salesforce и QuickBooks
 */
const express = require('express');
const router = express.Router();
const { authenticateApiKey } = require('../middleware/auth');
const salesforceAPI = require('../services/salesforce-api');
const quickbooksAPI = require('../services/quickbooks-api');
const logger = require('../utils/logger');

// Применяем аутентификацию API ключа ко всем маршрутам
router.use(authenticateApiKey);

/**
 * Проверка статуса оплаты счетов и обновление в Salesforce
 */
router.post('/check-payment-status', async (req, res, next) => {
  try {
    logger.info('Running scheduled payment status check');
    
    // Получаем неоплаченные счета из Salesforce
    const unpaidInvoices = await salesforceAPI.getUnpaidInvoices();
    
    if (!unpaidInvoices || unpaidInvoices.length === 0) {
      logger.info('No unpaid invoices found');
      return res.json({ 
        success: true, 
        invoicesProcessed: 0,
        paidInvoicesFound: 0
      });
    }
    
    logger.info(`Found ${unpaidInvoices.length} unpaid invoices to check`);
    
    let paidInvoicesCount = 0;
    
    // Проверяем каждый счет в QuickBooks
    for (const invoice of unpaidInvoices) {
      try {
        // Получаем ID счета в QuickBooks
        const qbInvoiceId = invoice.invgen__QB_Invoice_ID__c;
        
        if (!qbInvoiceId) {
          logger.warn(`Invoice ${invoice.Id} doesn't have a QuickBooks ID`);
          continue;
        }
        
        // Получаем статус счета из QuickBooks
        const qbInvoice = await quickbooksAPI.getInvoiceById(qbInvoiceId);
        
        if (!qbInvoice) {
          logger.warn(`Invoice ${qbInvoiceId} not found in QuickBooks`);
          continue;
        }
        
        // Проверка статуса оплаты
        const isPaid = qbInvoice.Balance === 0;
        
        if (isPaid) {
          logger.info(`Invoice ${invoice.Id} (QB: ${qbInvoiceId}) is paid`);
          
          // Обновляем статус в Salesforce
          await salesforceAPI.updateInvoiceAsPaid(
            invoice.Id, 
            qbInvoice.Balance === 0 ? 'Paid' : 'Partially Paid',
            qbInvoice.TxnDate
          );
          
          // Закрываем связанную сделку, если счет полностью оплачен
          if (qbInvoice.Balance === 0 && invoice.invgen__Opportunity__c) {
            await salesforceAPI.closeOpportunityAsWon(
              invoice.invgen__Opportunity__c,
              `Closed due to payment of invoice ${invoice.Name}`
            );
          }
          
          paidInvoicesCount++;
        }
      } catch (error) {
        logger.error(`Error processing invoice ${invoice.Id}:`, error);
      }
    }
    
    logger.info(`Scheduled payment check completed`, {
      invoicesProcessed: unpaidInvoices.length,
      paidInvoicesFound: paidInvoicesCount
    });
    
    res.json({
      success: true,
      invoicesProcessed: unpaidInvoices.length,
      paidInvoicesFound: paidInvoicesCount
    });
  } catch (error) {
    logger.error('Error checking payment status:', error);
    next(error);
  }
});

/**
 * Создание счета в QuickBooks из счета Salesforce
 */
router.post('/sf-invoice-to-qb', async (req, res, next) => {
  try {
    const { salesforceInvoiceId, salesforceInstance, quickbooksRealm, invoice } = req.body;
    
    if (!salesforceInvoiceId || !salesforceInstance || !quickbooksRealm) {
      return res.status(400).json({
        success: false,
        error: 'Required parameters missing',
        requiredParams: ['salesforceInvoiceId', 'salesforceInstance', 'quickbooksRealm']
      });
    }
    
    logger.info(`Processing Salesforce Invoice: ${salesforceInvoiceId}`);
    
    // Если данные счета пришли из SF, используем их напрямую
    let invoiceData = invoice;
    
    // Если данные счета не пришли, получаем их из SF
    if (!invoiceData) {
      // Устанавливаем токены для указанного экземпляра SF
      await salesforceAPI.ensureAccessTokenForInstance(salesforceInstance);
      
      // Получаем данные счета из SF
      invoiceData = await salesforceAPI.getInvoiceById(salesforceInvoiceId);
      
      if (!invoiceData) {
        return res.status(404).json({
          success: false,
          error: `Invoice ${salesforceInvoiceId} not found in Salesforce`
        });
      }
    }
    
    // Получаем или создаем клиента в QuickBooks
    const customerData = invoiceData.customer || {
      name: invoiceData.Account?.Name || 'Customer Name Missing',
      email: invoiceData.Account?.Email || null,
      phone: invoiceData.Account?.Phone || null,
      address: invoiceData.billingAddress || null
    };
    
    const qbCustomer = await quickbooksAPI.findOrCreateCustomer(
      customerData.name,
      customerData.email,
      customerData.phone,
      customerData.address
    );
    
    if (!qbCustomer) {
      return res.status(500).json({
        success: false,
        error: 'Failed to create or find QuickBooks customer'
      });
    }
    
    // Преобразуем данные SF счета в формат QB
    const qbInvoiceData = {
      CustomerRef: {
        value: qbCustomer.Id
      },
      Line: []
    };
    
    // Добавляем основную информацию
    if (invoiceData.date) {
      qbInvoiceData.TxnDate = invoiceData.date;
    }
    
    if (invoiceData.dueDate) {
      qbInvoiceData.DueDate = invoiceData.dueDate;
    }
    
    if (invoiceData.number) {
      qbInvoiceData.DocNumber = invoiceData.number;
    }
    
    // Добавляем примечание для трекинга SF ID
    qbInvoiceData.PrivateNote = `Created from Salesforce Invoice: ${salesforceInvoiceId}`;
    
    // Добавляем адрес если есть
    if (customerData.address) {
      qbInvoiceData.BillAddr = {
        Line1: customerData.address.street || '',
        City: customerData.address.city || '',
        CountrySubDivisionCode: customerData.address.state || '',
        PostalCode: customerData.address.postalCode || '',
        Country: customerData.address.country || ''
      };
    }
    
    // Добавляем строки счета
    if (invoiceData.lineItems && invoiceData.lineItems.length > 0) {
      for (const lineItem of invoiceData.lineItems) {
        const qbLineItem = {
          Amount: lineItem.amount || lineItem.unitPrice * lineItem.quantity,
          Description: lineItem.description || '',
          DetailType: 'SalesItemLineDetail',
          SalesItemLineDetail: {
            Qty: lineItem.quantity || 1,
            UnitPrice: lineItem.unitPrice || lineItem.amount,
            ItemRef: {}
          }
        };
        
        // Если есть QB ID для продукта, используем его
        if (lineItem.product && lineItem.product.id) {
          qbLineItem.SalesItemLineDetail.ItemRef = {
            value: lineItem.product.id,
            name: lineItem.product.name || 'Product'
          };
        } else {
          // Иначе ищем/создаем элемент по имени
          const itemName = lineItem.description || 'Service';
          const qbItem = await quickbooksAPI.findOrCreateItem(itemName);
          
          qbLineItem.SalesItemLineDetail.ItemRef = {
            value: qbItem.Id,
            name: qbItem.Name
          };
        }
        
        qbInvoiceData.Line.push(qbLineItem);
      }
    } else {
      // Если строк нет, добавляем одну с общей суммой
      const defaultItem = await quickbooksAPI.findOrCreateItem('Services');
      
      qbInvoiceData.Line.push({
        Amount: invoiceData.amount || 0.01,
        Description: invoiceData.description || 'Service',
        DetailType: 'SalesItemLineDetail',
        SalesItemLineDetail: {
          Qty: 1,
          UnitPrice: invoiceData.amount || 0.01,
          ItemRef: {
            value: defaultItem.Id,
            name: defaultItem.Name
          }
        }
      });
    }
    
    // Создаем счет в QuickBooks
    const qbInvoice = await quickbooksAPI.createInvoice(qbInvoiceData);
    
    // Обновляем счет в Salesforce с ID из QuickBooks
    await salesforceAPI.updateSalesforceInvoiceWithQBId(
      salesforceInvoiceId,
      qbInvoice.Id,
      salesforceInstance
    );
    
    res.json({
      success: true,
      quickbooksInvoiceId: qbInvoice.Id,
      quickbooksInvoiceNumber: qbInvoice.DocNumber
    });
  } catch (error) {
    logger.error('Error creating invoice from Salesforce:', error);
    next(error);
  }
});

// Остальные маршруты из существующего апи...

module.exports = router;