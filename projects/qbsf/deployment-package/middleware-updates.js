// middleware-updates.js - Add these endpoints to routes/api.js

/**
 * Create QuickBooks invoice from Salesforce Invoice object
 * НОВЫЙ ENDPOINT для SF Invoice объектов
 */
router.post('/sf-invoice-to-qb', async (req, res, next) => {
  try {
    const { salesforceInvoiceId, salesforceInstance, quickbooksRealm, invoice } = req.body;
    
    if (!salesforceInvoiceId || !salesforceInstance || !quickbooksRealm) {
      throw new AppError('Required parameters missing', 400, 'MISSING_PARAMETERS');
    }
    
    logger.info(`Processing Salesforce Invoice: ${salesforceInvoiceId}`);
    
    // Initialize API clients
    const sfApi = new SalesforceAPI(salesforceInstance);
    const qbApi = new QuickBooksAPI(quickbooksRealm);
    
    // Create or find customer in QuickBooks
    logger.info(`Creating/finding customer in QuickBooks: ${invoice.customer.name}`);
    const customerData = {
      DisplayName: invoice.customer?.name || 'Customer Name Missing',
      CompanyName: invoice.customer?.name || 'Customer Name Missing',
      PrimaryEmailAddr: invoice.customer?.email ? {
        Address: invoice.customer.email
      } : null,
      PrimaryPhone: invoice.customer?.phone ? {
        FreeFormNumber: invoice.customer.phone
      } : null,
      BillAddr: invoice.customer?.address ? {
        Line1: invoice.customer.address.street || '',
        City: invoice.customer.address.city || '',
        CountrySubDivisionCode: invoice.customer.address.state || '',
        PostalCode: invoice.customer.address.postalCode || '',
        Country: invoice.customer.address.country || ''
      } : null
    };
    
    const qbCustomerId = await qbApi.findOrCreateCustomer(customerData);
    
    // Transform Salesforce Invoice to QuickBooks format
    logger.info('Transforming Invoice data to QuickBooks format');
    const qbInvoiceData = transformSFInvoiceToQB(invoice, qbCustomerId);
    
    // Create Invoice in QuickBooks
    logger.info('Creating Invoice in QuickBooks');
    const qbInvoice = await qbApi.createInvoice(qbInvoiceData);
    
    res.json({
      success: true,
      quickbooksInvoiceId: qbInvoice.Id,
      quickbooksInvoiceNumber: qbInvoice.DocNumber,
      message: 'Invoice created successfully in QuickBooks'
    });
  } catch (error) {
    logger.error('Error creating invoice from Salesforce:', error);
    next(error);
  }
});

/**
 * Check payment status for SF Invoice objects
 * ОБНОВЛЕННЫЙ ENDPOINT для мониторинга оплат
 */
router.post('/check-invoice-payment-status', async (req, res, next) => {
  try {
    const { salesforceInstance, quickbooksRealm } = req.body;
    
    if (!salesforceInstance || !quickbooksRealm) {
      throw new AppError('Required parameters missing', 400, 'MISSING_PARAMETERS');
    }
    
    logger.info('Running scheduled invoice payment status check');
    
    // Initialize API clients
    const sfApi = new SalesforceAPI(salesforceInstance);
    const qbApi = new QuickBooksAPI(quickbooksRealm);
    
    // Get unpaid SF Invoices
    const query = `
      SELECT Id, Name, invgen__QB_Invoice_ID__c, invgen__Status__c, 
             invgen__Amount__c, invgen__Due_Date__c, invgen__Opportunity__c 
      FROM invgen__Invoice__c 
      WHERE invgen__Status__c IN ('Created', 'Sent', 'Viewed') 
      AND invgen__QB_Invoice_ID__c != null
    `;
    
    const queryResult = await sfApi.query(query);
    const unpaidInvoices = queryResult.records || [];
    
    if (unpaidInvoices.length === 0) {
      logger.info('No unpaid invoices found');
      return res.json({ 
        success: true, 
        invoicesProcessed: 0,
        paidInvoicesFound: 0,
        invoicesUpdated: 0
      });
    }
    
    logger.info(`Found ${unpaidInvoices.length} unpaid invoices to check`);
    
    let paidInvoicesCount = 0;
    let updatedCount = 0;
    
    for (const invoice of unpaidInvoices) {
      try {
        const qbInvoiceId = invoice.invgen__QB_Invoice_ID__c;
        
        if (!qbInvoiceId) {
          logger.warn(`Invoice ${invoice.Id} doesn't have a QuickBooks ID`);
          continue;
        }
        
        // Check payment status in QuickBooks
        const paymentStatus = await qbApi.checkInvoicePaymentStatus(qbInvoiceId);
        
        if (paymentStatus.isPaid) {
          logger.info(`Invoice ${invoice.Id} (QB: ${qbInvoiceId}) is paid`);
          
          // Update SF Invoice status
          await sfApi.updateRecord('invgen__Invoice__c', invoice.Id, {
            invgen__Status__c: 'Paid',
            invgen__Payment_Date__c: paymentStatus.paymentDetails?.paymentDate || new Date().toISOString().split('T')[0]
          });
          
          // Close related Opportunity
          if (invoice.invgen__Opportunity__c) {
            await sfApi.updateRecord('Opportunity', invoice.invgen__Opportunity__c, {
              StageName: 'Closed Won',
              CloseDate: new Date().toISOString().split('T')[0]
            });
            logger.info(`Closed Opportunity ${invoice.invgen__Opportunity__c} as Won`);
          }
          
          paidInvoicesCount++;
          updatedCount++;
        } else if (paymentStatus.status && paymentStatus.status !== invoice.invgen__Status__c) {
          // Update intermediate statuses (Sent, Viewed, etc.)
          await sfApi.updateRecord('invgen__Invoice__c', invoice.Id, {
            invgen__Status__c: paymentStatus.status
          });
          logger.info(`Updated invoice ${invoice.Id} status to ${paymentStatus.status}`);
          updatedCount++;
        }
      } catch (error) {
        logger.error(`Error processing invoice ${invoice.Id}:`, error);
      }
    }
    
    res.json({
      success: true,
      invoicesProcessed: unpaidInvoices.length,
      paidInvoicesFound: paidInvoicesCount,
      invoicesUpdated: updatedCount,
      message: `Processed ${unpaidInvoices.length} invoices, updated ${updatedCount} records`
    });
  } catch (error) {
    logger.error('Error checking invoice payment status:', error);
    next(error);
  }
});

// Updated invoice transformer for SF Invoice objects
function transformSFInvoiceToQB(sfInvoice, qbCustomerId) {
  logger.info(`Transforming SF Invoice ${sfInvoice.id} to QuickBooks format`);
  
  try {
    const qbInvoiceData = {
      CustomerRef: {
        value: qbCustomerId
      },
      Line: []
    };
    
    // Basic information
    if (sfInvoice.date) {
      qbInvoiceData.TxnDate = sfInvoice.date;
    }
    
    if (sfInvoice.dueDate) {
      qbInvoiceData.DueDate = sfInvoice.dueDate;
    }
    
    // Generate invoice number with format №"####"
    const invoiceNumber = generateInvoiceNumber();
    qbInvoiceData.DocNumber = invoiceNumber;
    
    // Private note for tracking SF ID
    qbInvoiceData.PrivateNote = `Created from Salesforce Invoice: ${sfInvoice.id}`;
    
    // Billing address
    if (sfInvoice.customer?.address) {
      qbInvoiceData.BillAddr = {
        Line1: sfInvoice.customer.address.street || '',
        City: sfInvoice.customer.address.city || '',
        CountrySubDivisionCode: sfInvoice.customer.address.state || '',
        PostalCode: sfInvoice.customer.address.postalCode || '',
        Country: sfInvoice.customer.address.country || ''
      };
    }
    
    // Invoice line items
    if (sfInvoice.lineItems && sfInvoice.lineItems.length > 0) {
      for (const lineItem of sfInvoice.lineItems) {
        const qbLineItem = {
          Amount: lineItem.amount || (lineItem.unitPrice * lineItem.quantity),
          Description: lineItem.description || '',
          DetailType: 'SalesItemLineDetail',
          SalesItemLineDetail: {
            Qty: lineItem.quantity || 1,
            UnitPrice: lineItem.unitPrice || lineItem.amount
          }
        };
        
        // If there's a QB ID for the product, use it
        if (lineItem.product && lineItem.product.id) {
          qbLineItem.SalesItemLineDetail.ItemRef = {
            value: lineItem.product.id,
            name: lineItem.product.name || 'Product'
          };
        } else {
          // Otherwise use standard Services item
          qbLineItem.SalesItemLineDetail.ItemRef = {
            value: '1',
            name: 'Services'
          };
        }
        
        qbInvoiceData.Line.push(qbLineItem);
      }
    } else {
      // If no line items, add one with total amount
      qbInvoiceData.Line.push({
        Amount: sfInvoice.amount || 1.00,
        Description: sfInvoice.description || 'Service',
        DetailType: 'SalesItemLineDetail',
        SalesItemLineDetail: {
          Qty: 1,
          UnitPrice: sfInvoice.amount || 1.00,
          ItemRef: {
            value: '1',
            name: 'Services'
          }
        }
      });
    }
    
    logger.info('Successfully transformed SF Invoice to QB format', {
      sfInvoiceId: sfInvoice.id,
      qbCustomerId,
      lineItemsCount: qbInvoiceData.Line.length
    });
    
    return qbInvoiceData;
  } catch (error) {
    logger.error('Error transforming SF Invoice to QB format:', error);
    throw new Error(`Failed to transform invoice: ${error.message}`);
  }
}

function generateInvoiceNumber() {
  const randomNum = Math.floor(Math.random() * 10000);
  return `№"${String(randomNum).padStart(4, '0')}"`;
}

module.exports = {
  transformSFInvoiceToQB,
  generateInvoiceNumber
};