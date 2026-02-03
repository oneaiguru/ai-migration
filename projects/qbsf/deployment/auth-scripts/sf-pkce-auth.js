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
