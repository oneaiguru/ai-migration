#!/bin/bash
# Setup script for Salesforce authentication workarounds

# Text styling
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Print section header
print_header() {
  echo -e "\n${BLUE}${BOLD}==== $1 ====${NC}\n"
}

# Print step
print_step() {
  echo -e "${YELLOW}$1${NC}"
}

# Print success
print_success() {
  echo -e "${GREEN}✓ $1${NC}"
}

# Print error
print_error() {
  echo -e "${RED}✗ $1${NC}"
}

# Create necessary directories
mkdir -p data
mkdir -p auth-scripts

print_header "SETTING UP AUTHENTICATION WORKAROUNDS"

# Save PKCE script
print_step "Creating PKCE auth script..."
cat > auth-scripts/sf-pkce-auth.js << 'EOL'
// PKCE Implementation for Salesforce OAuth
const crypto = require('crypto');
const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const port = 3001; // Use a different port from your main app

// PKCE code generator functions
function base64URLEncode(buffer) {
  return buffer.toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function sha256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest();
}

// Save code verifier in memory (in a real app, use a secure session)
let codeVerifier = null;

// Make sure data directory exists
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Route to initiate OAuth with PKCE
app.get('/test-auth', (req, res) => {
  // Generate code verifier and challenge
  const verifier = base64URLEncode(crypto.randomBytes(32));
  const challenge = base64URLEncode(sha256(verifier));
  
  // Save the verifier for later
  codeVerifier = verifier;
  
  console.log('Code Verifier:', verifier);
  console.log('Code Challenge:', challenge);
  
  // Build the authorization URL with PKCE
  const clientId = process.env.SF_CLIENT_ID;
  const redirectUri = 'http://localhost:3001/callback';
  const authUrl = `${process.env.SF_LOGIN_URL}/services/oauth2/authorize?` +
    `response_type=code` +
    `&client_id=${encodeURIComponent(clientId)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&code_challenge=${encodeURIComponent(challenge)}` +
    `&code_challenge_method=S256`;
  
  // Redirect to Salesforce for authorization
  res.redirect(authUrl);
});

// Callback route to handle the authorization code
app.get('/callback', async (req, res) => {
  const { code, error, error_description } = req.query;
  
  if (error) {
    return res.send(`<h1>Error</h1><p>${error}: ${error_description}</p>`);
  }
  
  if (!code) {
    return res.send('<h1>Error</h1><p>No authorization code received</p>');
  }
  
  try {
    // Exchange code for tokens using the code verifier
    const tokenResponse = await axios({
      method: 'post',
      url: `${process.env.SF_LOGIN_URL}/services/oauth2/token`,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      data: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: process.env.SF_CLIENT_ID,
        client_secret: process.env.SF_CLIENT_SECRET,
        code_verifier: codeVerifier,
        code: code,
        redirect_uri: 'http://localhost:3001/callback'
      })
    });
    
    // Success! Save the tokens
    const { access_token, refresh_token, instance_url } = tokenResponse.data;
    
    // In a real app, you would securely store these tokens
    console.log('Access Token:', access_token.substring(0, 10) + '...');
    console.log('Refresh Token:', refresh_token ? (refresh_token.substring(0, 10) + '...') : 'None');
    console.log('Instance URL:', instance_url);
    
    // Create a simple token storage file
    const tokens = {
      salesforce: {
        [instance_url]: {
          accessToken: access_token,
          refreshToken: refresh_token,
          instanceUrl: instance_url,
          expiresAt: Date.now() + (tokenResponse.data.expires_in * 1000)
        }
      },
      quickbooks: {}
    };
    
    // Write to the tokens file used by the main app
    fs.writeFileSync(path.join(dataDir, 'tokens.json'), JSON.stringify(tokens, null, 2));
    
    res.send('<h1>Success!</h1><p>Authorization successful. You can close this window.</p>');
  } catch (error) {
    console.error('Token Exchange Error:', error.response?.data || error.message);
    res.send(`<h1>Error</h1><p>Failed to exchange code for tokens: ${error.message}</p>`);
  }
});

// Start the server
app.listen(port, () => {
  console.log(`PKCE Debug server running at http://localhost:${port}`);
  console.log(`Try accessing http://localhost:${port}/test-auth to start the OAuth flow with PKCE`);
});
EOL
print_success "PKCE auth script created"

# Save Password flow script
print_step "Creating Password flow auth script..."
cat > auth-scripts/sf-password-auth.js << 'EOL'
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
EOL
print_success "Password flow auth script created"

# Update the .env file with the username/password field template
print_step "Updating .env file with additional fields..."
cat >> .env << EOL

# Salesforce Username/Password for direct authentication (optional)
# SF_USERNAME=your_salesforce_username
# SF_PASSWORD=your_salesforce_password
# SF_SECURITY_TOKEN=your_security_token
EOL
print_success ".env file updated"

# Make scripts executable
print_step "Making scripts executable..."
chmod +x auth-scripts/sf-pkce-auth.js
chmod +x auth-scripts/sf-password-auth.js
print_success "Scripts are now executable"

print_header "SETUP COMPLETE"
print_step "To run the PKCE authentication flow (with code challenge):"
echo "node auth-scripts/sf-pkce-auth.js"
echo "Then visit: http://localhost:3001/test-auth"

print_step "To run the Password authentication flow (bypassing OAuth):"
echo "1. Edit your .env file and uncomment/update SF_USERNAME, SF_PASSWORD, and SF_SECURITY_TOKEN"
echo "2. Run: node auth-scripts/sf-password-auth.js"

print_step "After successful authentication:"
echo "1. Restart your main middleware server"
echo "2. Check the status: curl -H \"X-API-Key: YOUR_API_KEY\" http://localhost:3000/auth/status"
echo "3. Complete the QuickBooks authentication separately"
