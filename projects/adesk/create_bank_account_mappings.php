<?php
/**
 * VIPFLAT to Adesk Migration Tool - Bank Account Mapping Tool
 * 
 * This script helps create mappings between VIPFLAT bank accounts and manually created
 * Adesk bank accounts to work around API limitations related to legal entities.
 * 
 * Usage: php create_bank_account_mappings.php
 */

// Set error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Load configuration
$config = require_once __DIR__ . '/config.php';

// Load classes
require_once __DIR__ . '/classes/Logger.php';
require_once __DIR__ . '/classes/AdeskApi.php';
require_once __DIR__ . '/classes/IdMapper.php';
require_once __DIR__ . '/classes/DataExporter.php';

// Initialize logger
$logger = new Logger(
    $config['logs_dir'],
    $config['log_level'],
    $config['log_file_format']
);

// Initialize Adesk API client
$adesk = new AdeskApi(
    $config['adesk_api_url'],
    $config['adesk_api_token'],
    $config['adesk_api_version'],
    $logger,
    $config['retry_attempts'],
    $config['retry_delay']
);

// Initialize ID mapper
$mapper = new IdMapper($config['mappings_dir'], $logger);

// Initialize data exporter
$exporter = new DataExporter($config['data_dir'], $config, $logger);

// Log script start
$logger->info("Starting bank account mapping tool");

// Check if existing mappings exist
$existingMappings = $mapper->getAllMappings('bank_accounts');
if (!empty($existingMappings)) {
    echo "Existing bank account mappings found.\n";
    echo "Current mappings:\n";
    echo "--------------------------------------------------------------------------------\n";
    echo "VIPFLAT ID | Adesk ID  | VIPFLAT Name                  | Adesk Name              \n";
    echo "--------------------------------------------------------------------------------\n";
    
    foreach ($existingMappings as $vipflatId => $mapping) {
        $adeskId = $mapping['adesk_id'];
        $name = isset($mapping['metadata']['name']) ? $mapping['metadata']['name'] : 'Unknown';
        $adeskName = isset($mapping['metadata']['adesk_name']) ? $mapping['metadata']['adesk_name'] : 'Unknown';
        
        printf("%-10s | %-9s | %-30s | %-30s\n", $vipflatId, $adeskId, substr($name, 0, 30), substr($adeskName, 0, 30));
    }
    echo "--------------------------------------------------------------------------------\n\n";
    
    // Ask if user wants to add more mappings
    echo "Do you want to add more bank account mappings? (y/n): ";
    $response = trim(fgets(STDIN));
    if (strtolower($response) !== 'y') {
        echo "Exiting without adding more mappings.\n";
        exit(0);
    }
}

// Get VIPFLAT bank accounts
$vipflatAccounts = $exporter->export('bank_accounts');
if ($vipflatAccounts === false || empty($vipflatAccounts)) {
    $logger->error("Failed to export VIPFLAT bank accounts");
    echo "Error: Failed to export VIPFLAT bank accounts. Check the data directory configuration.\n";
    exit(1);
}

// Get Adesk bank accounts
$adeskAccounts = $adesk->getBankAccounts();
if ($adeskAccounts === false || !isset($adeskAccounts['data']) || empty($adeskAccounts['data'])) {
    $logger->error("Failed to retrieve Adesk bank accounts");
    echo "Error: Failed to retrieve Adesk bank accounts. Check your API token and connection.\n";
    exit(1);
}

// Map VIPFLAT IDs that don't have a mapping yet
$unmappedVipflatAccounts = [];
foreach ($vipflatAccounts as $account) {
    if (!$mapper->getAdeskId('bank_accounts', $account['id'])) {
        $unmappedVipflatAccounts[] = $account;
    }
}

if (empty($unmappedVipflatAccounts)) {
    echo "All VIPFLAT bank accounts are already mapped!\n";
    exit(0);
}

// Interactive mapping process
echo "Starting interactive bank account mapping process.\n";
echo "This tool will help you map VIPFLAT bank accounts to Adesk bank accounts.\n";
echo "You should have already created the bank accounts in Adesk manually.\n\n";

// Print available Adesk accounts
echo "Available Adesk bank accounts:\n";
echo "--------------------------------------------------------------------------------------------------\n";
echo "ID       | Type         | Name                           | Currency | Legal Entity                \n";  
echo "--------------------------------------------------------------------------------------------------\n";

foreach ($adeskAccounts['data'] as $index => $account) {
    $type = $account['type'] == 1 ? "Cash" : "Bank";
    $legalEntityInfo = isset($account['legal_entity_name']) ? $account['legal_entity_name'] : $account['legal_entity'];
    printf("%-9s | %-12s | %-30s | %-8s | %-25s\n", 
        $account['id'], 
        $type, 
        substr($account['name'], 0, 30), 
        $account['currency'],
        substr($legalEntityInfo, 0, 25)
    );
}
echo "--------------------------------------------------------------------------------------------------\n\n";

// Interactive mapping
foreach ($unmappedVipflatAccounts as $vipflatAccount) {
    echo "\nVIPFLAT Bank Account:\n";
    echo "ID: " . $vipflatAccount['id'] . "\n";
    echo "Name: " . (isset($vipflatAccount['name']) ? $vipflatAccount['name'] : 'Unnamed Account') . "\n";
    
    if (isset($vipflatAccount['type'])) {
        echo "Type: " . ($vipflatAccount['type'] == 1 ? "Cash" : "Bank") . "\n";
    }
    
    if (isset($vipflatAccount['currency'])) {
        echo "Currency: " . $vipflatAccount['currency'] . "\n";
    }
    
    if (isset($vipflatAccount['number'])) {
        echo "Account Number: " . $vipflatAccount['number'] . "\n";
    }
    
    echo "\nEnter the Adesk bank account ID to map to this VIPFLAT account (or 'skip' to skip): ";
    $adeskId = trim(fgets(STDIN));
    
    if (strtolower($adeskId) === 'skip') {
        echo "Skipping this account.\n";
        continue;
    }
    
    // Validate that the Adesk ID exists
    $adeskAccount = null;
    foreach ($adeskAccounts['data'] as $account) {
        if ($account['id'] == $adeskId) {
            $adeskAccount = $account;
            break;
        }
    }
    
    if (!$adeskAccount) {
        echo "Error: Adesk bank account ID $adeskId not found. Please try again.\n";
        $retry = true;
        while ($retry) {
            echo "Enter a valid Adesk bank account ID (or 'skip' to skip): ";
            $adeskId = trim(fgets(STDIN));
            
            if (strtolower($adeskId) === 'skip') {
                $retry = false;
                continue 2; // Skip to next VIPFLAT account
            }
            
            foreach ($adeskAccounts['data'] as $account) {
                if ($account['id'] == $adeskId) {
                    $adeskAccount = $account;
                    $retry = false;
                    break;
                }
            }
            
            if ($retry) {
                echo "Error: Adesk bank account ID $adeskId not found. Please try again.\n";
            }
        }
    }
    
    // Create mapping
    $metadata = [
        'name' => isset($vipflatAccount['name']) ? $vipflatAccount['name'] : 'Unnamed Account',
        'adesk_name' => isset($adeskAccount['name']) ? $adeskAccount['name'] : 'Unknown Adesk Account'
    ];
    
    $result = $mapper->addMapping('bank_accounts', $vipflatAccount['id'], $adeskId, $metadata);
    
    if ($result) {
        echo "✅ Successfully mapped VIPFLAT account {$vipflatAccount['id']} to Adesk account $adeskId\n";
    } else {
        echo "❌ Failed to create mapping for VIPFLAT account {$vipflatAccount['id']}\n";
    }
}

// Print all mappings
$allMappings = $mapper->getAllMappings('bank_accounts');
echo "\nAll bank account mappings:\n";
echo "--------------------------------------------------------------------------------\n";
echo "VIPFLAT ID | Adesk ID  | VIPFLAT Name                  | Adesk Name              \n";
echo "--------------------------------------------------------------------------------\n";

foreach ($allMappings as $vipflatId => $mapping) {
    $adeskId = $mapping['adesk_id'];
    $name = isset($mapping['metadata']['name']) ? $mapping['metadata']['name'] : 'Unknown';
    $adeskName = isset($mapping['metadata']['adesk_name']) ? $mapping['metadata']['adesk_name'] : 'Unknown';
    
    printf("%-10s | %-9s | %-30s | %-30s\n", $vipflatId, $adeskId, substr($name, 0, 30), substr($adeskName, 0, 30));
}
echo "--------------------------------------------------------------------------------\n";

// Provide next steps
echo "\nNext steps:\n";
echo "1. Run 'php migrate_without_bank_accounts.php' to migrate all other entities\n";
echo "2. This will use the bank account mappings you just created for transactions\n";
echo "3. For a specific entity type, use --entity=<type> parameter\n";

// End script
$logger->info("Bank account mapping completed");
exit(0);