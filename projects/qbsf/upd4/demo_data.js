// Demo data for testing without actual API connections
const getDemoData = () => {
  return {
    opportunity: {
      id: '006XX000012345ABC',
      name: 'Demo Opportunity',
      amount: 5000,
      stage: 'Closed Won',
      accountId: '001XX000012345ABC'
    },
    account: {
      id: '001XX000012345ABC',
      name: 'Demo Company',
      billingStreet: '123 Demo Street',
      billingCity: 'Demo City',
      billingState: 'CA',
      billingPostalCode: '12345'
    },
    invoice: {
      id: 'INV-001',
      number: 'INV-001',
      amount: 5000,
      status: 'Sent'
    },
    invoiceId: 'INV-001',
    payment: {
      id: 'PAY-001',
      amount: 5000,
      date: new Date().toISOString(),
      method: 'Credit Card'
    }
  };
};

module.exports = {
  getDemoData
};