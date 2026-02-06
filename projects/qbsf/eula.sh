# 1. Connect to server
ssh roman@pve.atocomm.eu -p2323
# Password: $SSH_PASS

# 2. Create public directory
mkdir -p /opt/qb-integration/public

# 3. Create EULA page
cat > /opt/qb-integration/public/eula.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>End-User License Agreement - Salesforce QuickBooks Integration</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; }
        h1 { color: #333; border-bottom: 2px solid #0066cc; padding-bottom: 10px; }
        h2 { color: #0066cc; margin-top: 30px; }
        .last-updated { color: #666; font-style: italic; }
        .contact-info { background: #f5f5f5; padding: 15px; border-radius: 5px; margin-top: 20px; }
    </style>
</head>
<body>
    <h1>End-User License Agreement</h1>
    <p class="last-updated">Last Updated: July 01, 2025</p>

    <h2>1. License Grant</h2>
    <p>Subject to the terms of this Agreement, we grant you a non-exclusive, non-transferable license to use the Salesforce-QuickBooks Integration Software ("Software") solely for your internal business purposes.</p>

    <h2>2. Permitted Use</h2>
    <p>You may use the Software to:</p>
    <ul>
        <li>Synchronize invoice data between Salesforce and QuickBooks</li>
        <li>Automate invoice creation based on opportunity status changes</li>
        <li>Track payment status and update opportunity records</li>
    </ul>

    <h2>3. Restrictions</h2>
    <p>You may not:</p>
    <ul>
        <li>Modify, reverse engineer, or create derivative works of the Software</li>
        <li>Distribute, sublicense, or transfer the Software to third parties</li>
        <li>Use the Software for any unlawful purpose</li>
    </ul>

    <h2>4. Data Security</h2>
    <p>The Software processes your business data. You are responsible for:</p>
    <ul>
        <li>Maintaining appropriate access controls in your Salesforce and QuickBooks systems</li>
        <li>Ensuring compliance with applicable data protection regulations</li>
        <li>Regular backup of your data</li>
    </ul>

    <h2>5. Disclaimer of Warranties</h2>
    <p>THE SOFTWARE IS PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND. WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE.</p>

    <h2>6. Limitation of Liability</h2>
    <p>IN NO EVENT SHALL WE BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, OR CONSEQUENTIAL DAMAGES ARISING OUT OF THE USE OF THE SOFTWARE.</p>

    <h2>7. Support</h2>
    <p>Technical support is provided for 30 days following initial deployment. Additional support may be available under separate agreement.</p>

    <h2>8. Termination</h2>
    <p>This license remains in effect until terminated. You may terminate it at any time by discontinuing use of the Software and removing all copies.</p>

    <h2>9. Governing Law</h2>
    <p>This Agreement shall be governed by the laws of the Russian Federation.</p>

    <div class="contact-info">
        <h2>Contact Information</h2>
        <p>For technical support or questions about this license:</p>
        <p><strong>Email:</strong> support@atocomm.eu</p>
        <p><strong>Integration Developer:</strong> Misha Granin</p>
        <p><strong>Client:</strong> Roman Kapralov</p>
    </div>
</body>
</html>
EOF

# 4. Create Privacy Policy page
cat > /opt/qb-integration/public/privacy.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Privacy Policy - Salesforce QuickBooks Integration</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; }
        h1 { color: #333; border-bottom: 2px solid #0066cc; padding-bottom: 10px; }
        h2 { color: #0066cc; margin-top: 30px; }
        .last-updated { color: #666; font-style: italic; }
        .highlight { background: #fff3cd; padding: 10px; border-radius: 5px; margin: 15px 0; }
        .contact-info { background: #f5f5f5; padding: 15px; border-radius: 5px; margin-top: 20px; }
    </style>
</head>
<body>
    <h1>Privacy Policy</h1>
    <p class="last-updated">Last Updated: July 01, 2025</p>

    <div class="highlight">
        <strong>Important:</strong> This integration operates between your existing Salesforce and QuickBooks systems. We do not store your business data permanently.
    </div>

    <h2>1. Information We Process</h2>
    <p>The integration temporarily processes the following data to synchronize between your systems:</p>
    <ul>
        <li><strong>Salesforce Data:</strong> Opportunity records, Account information, Invoice details</li>
        <li><strong>QuickBooks Data:</strong> Customer information, Invoice status, Payment records</li>
        <li><strong>Authentication Data:</strong> OAuth tokens for secure API access</li>
    </ul>

    <h2>2. How We Use Your Information</h2>
    <p>We use your data solely to:</p>
    <ul>
        <li>Create invoices in QuickBooks based on Salesforce opportunities</li>
        <li>Synchronize invoice status between systems</li>
        <li>Update opportunity records when payments are received</li>
        <li>Determine US supplier status for selective synchronization</li>
    </ul>

    <h2>3. Data Storage and Retention</h2>
    <p>We follow these data handling practices:</p>
    <ul>
        <li><strong>No Permanent Storage:</strong> Business data is processed in real-time and not retained</li>
        <li><strong>OAuth Tokens:</strong> Stored securely and encrypted for ongoing API access</li>
        <li><strong>Logs:</strong> System logs kept for 30 days for troubleshooting purposes</li>
    </ul>

    <h2>4. Data Security</h2>
    <p>We implement industry-standard security measures:</p>
    <ul>
        <li>All data transmission encrypted using HTTPS/TLS</li>
        <li>OAuth 2.0 authentication with secure token handling</li>
        <li>Regular security monitoring and updates</li>
        <li>Access restricted to authorized integration processes only</li>
    </ul>

    <h2>5. Third-Party Services</h2>
    <p>This integration connects to:</p>
    <ul>
        <li><strong>Salesforce:</strong> Subject to Salesforce's privacy policy</li>
        <li><strong>QuickBooks:</strong> Subject to Intuit's privacy policy</li>
        <li><strong>Hosting Provider:</strong> Infrastructure services with appropriate data protection agreements</li>
    </ul>

    <h2>6. Your Rights and Control</h2>
    <p>You maintain full control over your data:</p>
    <ul>
        <li>Access and modify data directly in your Salesforce and QuickBooks systems</li>
        <li>Disconnect the integration at any time</li>
        <li>Request deletion of any stored authentication tokens</li>
    </ul>

    <h2>7. Compliance</h2>
    <p>We are committed to compliance with applicable data protection regulations including GDPR, CCPA, and other relevant privacy laws.</p>

    <h2>8. Changes to This Policy</h2>
    <p>We may update this privacy policy as needed. Material changes will be communicated to users of the integration.</p>

    <h2>9. International Data Transfers</h2>
    <p>Data may be processed in different countries where Salesforce, QuickBooks, or our hosting services operate. All transfers comply with applicable privacy regulations.</p>

    <div class="contact-info">
        <h2>Contact Us</h2>
        <p>If you have questions about this privacy policy or our data practices:</p>
        <p><strong>Email:</strong> privacy@atocomm.eu</p>
        <p><strong>Integration Developer:</strong> Misha Granin</p>
        <p><strong>Client:</strong> Roman Kapralov</p>
        <p><strong>Support:</strong> support@atocomm.eu</p>
    </div>
</body>
</html>
EOF

# 5. Update nginx configuration to serve static files
cat >> /etc/nginx/sites-available/qb-integration << 'EOF'

    # Serve static files for legal pages
    location /eula.html {
        alias /opt/qb-integration/public/eula.html;
        add_header Content-Type text/html;
    }
    
    location /privacy.html {
        alias /opt/qb-integration/public/privacy.html;
        add_header Content-Type text/html;
    }
EOF

# 6. Restart nginx
systemctl reload nginx

# 7. Test the pages
curl -I https://sqint.atocomm.eu/eula.html
curl -I https://sqint.atocomm.eu/privacy.html
