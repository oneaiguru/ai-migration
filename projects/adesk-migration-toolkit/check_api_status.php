<?php
/**
 * Adesk API Status Check
 * 
 * This script performs a comprehensive check of the Adesk API connection
 * to help diagnose connectivity issues before migration.
 */

// Set error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Load required classes
require_once __DIR__ . '/classes/Logger.php';
require_once __DIR__ . '/classes/AdeskApi.php';

// Load configuration
$config = require_once __DIR__ . '/config.php';

// ASCII art header
echo "
   _____   ____  ______  _____ _  __   ___    ____  _____ 
  / _ \ \ / /  \/  |_ _|/ ____| |/ /  / _ \  |  _ \|_   _|
 | | | \ V /| |\/| || || (___| ' /  | | | | | |_) | | |  
 | |_| || | | |  | || | \___ \| . \  | |_| | |  __/  | |  
  \___/ |_| |_|  |_|___||___/|_|\_\  \___/  |_|     |_|  
                                                          
";

echo "Adesk API Status Check\n";
echo "=====================\n\n";

// Create a logger
$logger = new Logger(__DIR__ . '/logs', 'debug');

// Create API client
if (empty($config['adesk_api_token'])) {
    echo "ERROR: ADESK_API_TOKEN is missing; set it in .env before running status checks.\n";
    exit(1);
}

$api = new AdeskApi(
    $config['adesk_api_url'],
    $config['adesk_api_token'],
    $config['adesk_api_version'],
    $logger
);

// Test API configuration
echo "API Configuration:\n";
echo "----------------\n";
echo "API URL: " . $config['adesk_api_url'] . "\n";
echo "API Version: " . $config['adesk_api_version'] . "\n";
echo "API Token: " . substr($config['adesk_api_token'], 0, 8) . "..." . substr($config['adesk_api_token'], -8) . "\n\n";

// Test endpoints
echo "Testing API Endpoints:\n";
echo "--------------------\n";

$endpoints = [
    'account' => 'Account information',
    'organization' => 'Organization information',
    'legal-entities' => 'Legal entities',
    'transactions/categories' => 'Transaction categories',
    'contractors' => 'Contractors',
    'projects' => 'Projects',
    'bank-accounts' => 'Bank accounts',
    'transactions' => 'Transactions'
];

$successCount = 0;
$failCount = 0;

foreach ($endpoints as $endpoint => $description) {
    echo "Testing $description endpoint... ";
    $result = $api->get($endpoint);
    
    if ($result !== false) {
        echo "✓ SUCCESS\n";
        $successCount++;
        
        // Show count for collection endpoints
        if (isset($result['recordsTotal'])) {
            echo "  Found {$result['recordsTotal']} records\n";
        } 
        // Try to identify the format of this particular endpoint
        else if (isset($result['success']) && $result['success']) {
            if (isset($result['legal_entities'])) {
                echo "  Found " . count($result['legal_entities']) . " legal entities\n";
            } else if (isset($result['categories'])) {
                echo "  Found " . count($result['categories']) . " categories\n";
            } else if (isset($result['bank_accounts'])) {
                echo "  Found " . count($result['bank_accounts']) . " bank accounts\n";
            } else if (isset($result['organization'])) {
                echo "  Organization name: " . ($result['organization']['name'] ?? 'Unknown') . "\n";
            }
        }
    } else {
        echo "✗ FAILED\n";
        $failCount++;
    }
}

echo "\nEndpoint Test Results: $successCount succeeded, $failCount failed\n\n";

// Check legal entity status
echo "Legal Entity Status:\n";
echo "-----------------\n";

$legalEntityId = $api->getDefaultLegalEntityId();
echo "Default Legal Entity ID: $legalEntityId\n\n";

// Connection summary
echo "Connection Summary:\n";
echo "-----------------\n";

if ($successCount == count($endpoints)) {
    echo "✓ All API endpoints are working correctly.\n";
    echo "The system is ready for migration.\n";
} else if ($successCount >= count($endpoints) / 2) {
    echo "⚠ Some API endpoints failed, but essential endpoints are working.\n";
    echo "You can proceed with migration, but some features might not work correctly.\n";
} else {
    echo "✗ Critical API endpoints are not working.\n";
    echo "Migration may fail unless these issues are resolved.\n";
}

// API recommendations
echo "\nRecommendations:\n";
echo "---------------\n";

if ($failCount > 0) {
    echo "1. Verify your API token is correct and not expired\n";
    echo "2. Check if your Adesk subscription includes access to all API endpoints\n";
    echo "3. Try using a different API version in config.php\n";
    echo "4. Contact Adesk support if problems persist\n";
} else {
    echo "Your API connection is working correctly! You can proceed with migration.\n";
}

echo "\nEnd of API status check.\n";
