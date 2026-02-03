const fs = require('fs');
const path = require('path');

const TOKEN_FILE = path.join(__dirname, '../../data/tokens.json');

// Initialize token storage
const initTokenStorage = () => {
  const dir = path.dirname(TOKEN_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  if (!fs.existsSync(TOKEN_FILE)) {
    fs.writeFileSync(TOKEN_FILE, JSON.stringify({
      salesforce: {},
      quickbooks: {}
    }, null, 2));
  }
};

// Save token
const saveToken = async (service, identifier, tokenData) => {
  initTokenStorage();
  
  const tokens = JSON.parse(fs.readFileSync(TOKEN_FILE, 'utf8'));
  
  if (!tokens[service]) {
    tokens[service] = {};
  }
  
  tokens[service][identifier] = {
    ...tokenData,
    savedAt: new Date().toISOString()
  };
  
  fs.writeFileSync(TOKEN_FILE, JSON.stringify(tokens, null, 2));
  
  return true;
};

// Get token
const getToken = async (service, identifier = null) => {
  initTokenStorage();
  
  const tokens = JSON.parse(fs.readFileSync(TOKEN_FILE, 'utf8'));
  
  if (identifier) {
    return tokens[service] ? tokens[service][identifier] : null;
  }
  
  return tokens[service] || {};
};

// Remove token
const removeToken = async (service, identifier) => {
  initTokenStorage();
  
  const tokens = JSON.parse(fs.readFileSync(TOKEN_FILE, 'utf8'));
  
  if (tokens[service] && tokens[service][identifier]) {
    delete tokens[service][identifier];
    fs.writeFileSync(TOKEN_FILE, JSON.stringify(tokens, null, 2));
  }
  
  return true;
};

module.exports = {
  saveToken,
  getToken,
  removeToken
};