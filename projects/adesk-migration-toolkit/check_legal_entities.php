<?php
/**
 * Adesk Legal Entity Check Script
 * This script checks for legal entities in Adesk and provides guidance
 * for migration preparation.
 */

// Set error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Load required classes
require_once __DIR__ . '/classes/AdeskApi.php';
require_once __DIR__ . '/classes/Logger.php';

// Load configuration
$config = require_once __DIR__ . '/config.php';

// Create logger
$logger = new Logger($config['logs_dir'], 'debug');

// Create API client
$api = new AdeskApi(
    $config['adesk_api_url'],
    $config['adesk_api_token'],
    $config['adesk_api_version'],
    $logger
);

echo "=== Adesk Legal Entity Checker ===\n\n";
echo "This tool checks if legal entities exist in your Adesk account.\n";
echo "Legal entities are required for bank account creation during migration.\n\n";

// Try direct legal-entities endpoint
$legalEntities = $api->get('legal-entities');
if ($legalEntities && isset($legalEntities['legal_entities']) && !empty($legalEntities['legal_entities'])) {
    echo "✓ Found " . count($legalEntities['legal_entities']) . " legal entities.\n";
    echo "Legal Entities:\n";
    foreach ($legalEntities['legal_entities'] as $entity) {
        echo "- ID: {$entity['id']}, Name: {$entity['name']}\n";
    }
    echo "\nRecommendation: Set LEGAL_ENTITY_ID=" . $legalEntities['legal_entities'][0]['id'] . " in your .env file.\n";
} else {
    echo "✗ Could not retrieve legal entities using the direct API endpoint.\n";
    
    // Try organization endpoint to find default legal entity
    $organization = $api->get('organization');
    if ($organization && isset($organization['default_legal_entity']) && !empty($organization['default_legal_entity'])) {
        echo "✓ Found default legal entity ID: " . $organization['default_legal_entity'] . " in organization settings.\n";
        echo "\nRecommendation: Set LEGAL_ENTITY_ID=" . $organization['default_legal_entity'] . " in your .env file.\n";
    } else {
        echo "✗ Could not find default legal entity in organization settings.\n";
        
        // Try to get bank accounts to see if they have legal entity info
        $bankAccounts = $api->get('bank-accounts');
        if ($bankAccounts && isset($bankAccounts['data']) && !empty($bankAccounts['data'])) {
            $legalEntityIds = [];
            foreach ($bankAccounts['data'] as $account) {
                if (isset($account['legal_entity']) && !empty($account['legal_entity'])) {
                    $legalEntityIds[$account['legal_entity']] = true;
                }
            }
            
            if (!empty($legalEntityIds)) {
                echo "✓ Found legal entity IDs from existing bank accounts: " . implode(', ', array_keys($legalEntityIds)) . "\n";
                echo "\nRecommendation: Set LEGAL_ENTITY_ID=" . array_key_first($legalEntityIds) . " in your .env file.\n";
            } else {
                echo "✗ No legal entity information found in existing bank accounts.\n";
                
                // Checking current .env setting
                $currentSetting = getenv('LEGAL_ENTITY_ID');
                if ($currentSetting) {
                    echo "\nCurrently using LEGAL_ENTITY_ID=$currentSetting from environment.\n";
                    echo "The migration will attempt to use this value.\n";
                } else {
                    echo "\nWARNING: No legal entity information available.\n";
                    echo "The migration will use a default value of 1, which may not work.\n";
                    echo "\nRecommendation:\n";
                    echo "1. Create a legal entity in Adesk manually\n";
                    echo "2. Note its ID\n";
                    echo "3. Set LEGAL_ENTITY_ID=<your_legal_entity_id> in your .env file\n";
                }
            }
        } else {
            echo "✗ Could not retrieve bank accounts to check for legal entity information.\n";
            
            // Checking current .env setting
            $currentSetting = getenv('LEGAL_ENTITY_ID');
            if ($currentSetting) {
                echo "\nCurrently using LEGAL_ENTITY_ID=$currentSetting from environment.\n";
                echo "The migration will attempt to use this value.\n";
            } else {
                echo "\nWARNING: No legal entity information available.\n";
                echo "The migration will use a default value of 1, which may not work.\n";
                echo "\nRecommendation:\n";
                echo "1. Create a legal entity in Adesk manually\n";
                echo "2. Note its ID\n";
                echo "3. Set LEGAL_ENTITY_ID=<your_legal_entity_id> in your .env file\n";
            }
        }
    }
}

echo "\n=== API Token Test ===\n";
// Test some basic endpoints to check API connectivity
$endpoints = [
    'account' => 'Account information',
    'organization' => 'Organization information',
    'transactions/categories' => 'Transaction categories',
    'contractors' => 'Contractors',
    'projects' => 'Projects',
    'bank-accounts' => 'Bank accounts',
    'transactions' => 'Transactions'
];

$workingCount = 0;
foreach ($endpoints as $endpoint => $description) {
    echo "Testing $description endpoint... ";
    $result = $api->get($endpoint);
    if ($result !== false) {
        echo "✓ Working\n";
        $workingCount++;
    } else {
        echo "✗ Failed\n";
    }
}

echo "\n$workingCount of " . count($endpoints) . " endpoints are working.\n";

if ($workingCount < count($endpoints)) {
    echo "\nSome API endpoints are not accessible. This might be due to:\n";
    echo "1. API token permissions are limited\n";
    echo "2. Some endpoints might not be available in your Adesk plan\n";
    echo "3. API version incompatibility\n";
} else {
    echo "\nAll API endpoints are working correctly.\n";
}

echo "\nEnd of legal entity check.\n";
