document.addEventListener('DOMContentLoaded', function() {
    // Token validation functionality
    const tokenInput = document.getElementById('token-input');
    const checkTokenBtn = document.getElementById('check-token');
    const tokenResult = document.getElementById('token-result');
    
    if (checkTokenBtn) {
        checkTokenBtn.addEventListener('click', async function() {
            const token = tokenInput.value.trim();
            
            if (!token) {
                tokenResult.className = 'error';
                tokenResult.textContent = 'Please enter a token';
                return;
            }
            
            try {
                tokenResult.textContent = 'Validating...';
                tokenResult.className = '';
                
                const response = await fetch('/validate-token', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ token })
                });
                
                const data = await response.json();
                
                if (data.valid) {
                    tokenResult.className = 'success';
                    let resultHTML = '<p>✅ Valid token for user: <strong>' + data.username + '</strong></p>';
                    resultHTML += '<p>Current balance: $' + data.balance.toFixed(2) + '</p>';
                    
                    if (data.isAdmin) {
                        resultHTML += '<p><strong>Admin privileges enabled</strong></p>';
                    }
                    
                    tokenResult.innerHTML = resultHTML;
                } else {
                    tokenResult.className = 'error';
                    tokenResult.textContent = '❌ Invalid token';
                }
            } catch (error) {
                tokenResult.className = 'error';
                tokenResult.textContent = 'Error: ' + error.message;
            }
        });
    }
    
    // Balance check functionality
    const balanceToken = document.getElementById('balance-token');
    const checkBalanceBtn = document.getElementById('check-balance');
    const balanceResult = document.getElementById('balance-result');
    
    if (checkBalanceBtn) {
        checkBalanceBtn.addEventListener('click', async function() {
            const token = balanceToken.value.trim();
            
            if (!token) {
                balanceResult.className = 'error';
                balanceResult.textContent = 'Please enter a token';
                return;
            }
            
            try {
                balanceResult.textContent = 'Checking...';
                balanceResult.className = '';
                
                const response = await fetch('/user/balance', {
                    method: 'GET',
                    headers: {
                        'x-auth-token': token
                    }
                });
                
                if (response.status === 401) {
                    balanceResult.className = 'error';
                    balanceResult.textContent = '❌ Invalid token';
                    return;
                }
                
                const data = await response.json();
                
                balanceResult.className = 'success';
                let resultHTML = '<p>Username: <strong>' + data.username + '</strong></p>';
                resultHTML += '<p>Current balance: $' + data.balance.toFixed(2) + '</p>';
                
                if (data.lowBalanceWarning) {
                    resultHTML += '<p class="error">⚠️ Low balance warning: Your balance is below $30</p>';
                }
                
                balanceResult.innerHTML = resultHTML;
            } catch (error) {
                balanceResult.className = 'error';
                balanceResult.textContent = 'Error: ' + error.message;
            }
        });
    }
});
