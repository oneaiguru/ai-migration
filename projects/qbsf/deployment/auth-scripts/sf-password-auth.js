// Salesforce Password Flow Authentication Script
// This bypasses OAuth flow for quick demos/testing
const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Make sure data directory exists
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Credentials from .env file
const sfClientId = process.env.SF_CLIENT_ID;
const sfClientSecret = process.env.SF_CLIENT_SECRET;
const sfUsername = process.env.SF_USERNAME;
const sfPassword = process.env.SF_PASSWORD;
const sfSecurityToken = process.env.SF_SECURITY_TOKEN || '';
const sfLoginUrl = process.env.SF_LOGIN_URL || 'https://login.salesforce.com';

// Check if all required credentials are available
if (!sfClientId || !sfClientSecret || !sfUsername || !sfPassword) {
  console.error('Error: Missing required Salesforce credentials in .env file');
  console.error('Required variables: SF_CLIENT_ID, SF_CLIENT_SECRET, SF_USERNAME, SF_PASSWORD');
  console.error('Optional variables: SF_SECURITY_TOKEN, SF_LOGIN_URL');
  process.exit(1);
}

async function getSalesforceToken() {
  console.log('Authenticating with Salesforce using password flow...');
  
  try {
    // Combine password with security token if present
    const passwordWithToken = `${sfPassword}${sfSecurityToken}`;
    
    // Make OAuth request with password grant type
    const response = await axios.post(
      `${sfLoginUrl}/services/oauth2/token`,
      new URLSearchParams({
        grant_type: 'password',
        client_id: sfClientId,
        client_secret: sfClientSecret,
        username: sfUsername,
        password: passwordWithToken
      }),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }
    );
    
    console.log('Authentication successful!');
    console.log('Access Token:', response.data.access_token.substring(0, 10) + '...');
    console.log('Instance URL:', response.data.instance_url);
    
    // Create tokens storage structure
    const tokens = {
      salesforce: {
        [response.data.instance_url]: {
          accessToken: response.data.access_token,
          refreshToken: response.data.refresh_token || null,
          instanceUrl: response.data.instance_url,
          expiresAt: Date.now() + ((response.data.expires_in || 7200) * 1000)
        }
      },
      quickbooks: {}
    };
    
    // Save tokens to file
    const tokensFile = path.join(dataDir, 'tokens.json');
    fs.writeFileSync(tokensFile, JSON.stringify(tokens, null, 2));
    console.log(`Tokens saved to ${tokensFile}`);
    
    // Test the connection with a simple API call
    console.log('\nTesting API connection...');
    try {
      const apiResponse = await axios.get(
        `${response.data.instance_url}/services/data/v56.0/sobjects`,
        {
          headers: {
            'Authorization': `Bearer ${response.data.access_token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('API connection successful!');
      console.log(`Available sobjects: ${apiResponse.data.sobjects.length}`);
    } catch (apiError) {
      console.error('API connection failed:', apiError.response?.data || apiError.message);
    }
    
    return tokens;
  } catch (error) {
    console.error('Authentication failed:', error.response?.data || error.message);
    
    // Provide more helpful error messages
    if (error.response?.data?.error === 'invalid_client_id') {
      console.error('\nTIP: Your client ID may be incorrect. Check your Connected App settings.');
    } else if (error.response?.data?.error === 'invalid_grant') {
      console.error('\nTIP: Username/password is incorrect or the user doesn\'t have API access.');
      console.error('If your password is correct, you may need to append your security token.');
      console.error('Add SF_SECURITY_TOKEN=your_token to your .env file.');
    }
    
    throw error;
  }
}

// Execute the authentication
getSalesforceToken().catch(err => {
  console.error('Authentication script failed');
  process.exit(1);
});
