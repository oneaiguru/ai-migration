/**
 * Test script for the scheduler functionality
 * Run with: node test-scheduler.js YOUR_API_KEY
 */
const axios = require('axios');

// Get API key from command line argument
const apiKey = process.argv[2];
if (!apiKey) {
  console.error('Error: API key is required');
  console.log('Usage: node test-scheduler.js YOUR_API_KEY');
  process.exit(1);
}

// Base URL
const baseURL = 'http://localhost:3000';

// Axios instance with API key
const api = axios.create({
  baseURL,
  headers: {
    'X-API-Key': apiKey
  }
});

// Test the scheduler
async function testScheduler() {
  console.log('=== SCHEDULER TESTS ===\n');
  
  try {
    // 1. Check scheduler status
    console.log('Checking scheduler status...');
    const statusResponse = await api.get('/scheduler/status');
    
    if (statusResponse.data.success) {
      console.log('✅ Scheduler status check passed');
      
      const jobs = statusResponse.data.jobs;
      console.log(`Found ${jobs.length} scheduled jobs:`);
      
      jobs.forEach(job => {
        console.log(`- ${job.name}: ${job.active ? 'Active' : 'Inactive'}`);
        if (job.nextRun) {
          console.log(`  Next run: ${new Date(job.nextRun).toLocaleString()}`);
        }
      });
      
      // 2. Trigger invoice creation
      console.log('\nTriggering manual invoice creation...');
      const invoiceResponse = await api.post('/scheduler/invoice-creation');
      
      if (invoiceResponse.data.success) {
        console.log('✅ Manual invoice creation triggered successfully');
        console.log(`Processed: ${invoiceResponse.data.processed || 0}`);
        console.log(`Successful: ${invoiceResponse.data.successful || 0}`);
        console.log(`Failed: ${invoiceResponse.data.failed || 0}`);
      } else {
        console.log('❌ Manual invoice creation failed');
        console.log(`Error: ${invoiceResponse.data.error || 'Unknown error'}`);
      }
      
      // 3. Trigger payment check
      console.log('\nTriggering manual payment check...');
      const paymentResponse = await api.post('/scheduler/payment-check');
      
      if (paymentResponse.data.success) {
        console.log('✅ Manual payment check triggered successfully');
        console.log(`Invoices processed: ${paymentResponse.data.invoicesProcessed || 0}`);
        console.log(`Paid invoices found: ${paymentResponse.data.paidInvoicesFound || 0}`);
        console.log(`Invoices updated: ${paymentResponse.data.invoicesUpdated || 0}`);
      } else {
        console.log('❌ Manual payment check failed');
        console.log(`Error: ${paymentResponse.data.error || 'Unknown error'}`);
      }
    } else {
      console.log('❌ Scheduler status check failed');
      console.log(`Error: ${statusResponse.data.error || 'Unknown error'}`);
    }
  } catch (error) {
    console.log('❌ Error testing scheduler:');
    console.log(error.response?.data?.error || error.message);
  }
}

// Run the test
testScheduler();