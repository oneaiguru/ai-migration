<?php
/**
 * VIPFLAT to Adesk Migration Tool - Step-by-Step Migration Script
 * 
 * This interactive script guides you through the migration process,
 * checking API connectivity and migrating entities in the correct order.
 * 
 * Usage: php migrate-step-by-step.php [--test]
 */

// Set error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Increase memory limit for handling large CSV files
ini_set('memory_limit', '512M');

// Parse command line arguments
$options = getopt('', ['test', 'from-dir:']);
$isTestMode = isset($options['test']);
$dataDir = isset($options['from-dir']) ? $options['from-dir'] : null;

// Load configuration
$config = require_once __DIR__ . '/config.php';

// Override data directory if specified
if ($dataDir) {
    $dataDir = rtrim($dataDir, '/') . '/';
    if (!file_exists($dataDir)) {
        echo "Error: Directory $dataDir does not exist.\n";
        exit(1);
    }
    $config['data_dir'] = $dataDir;
}

// Load required classes
require_once __DIR__ . '/classes/Logger.php';
require_once __DIR__ . '/classes/AdeskApi.php';
require_once __DIR__ . '/classes/IdMapper.php';
require_once __DIR__ . '/classes/DataExporter.php';

// ASCII art banner
echo "
 __      _____ ___ _____ _      _  _____ 
 \ \    / /_ _|  _ \_   _| |    /_\|_   _|
  \ \/\/ / | || |_) || | | |   / _ \ | |  
   \_/\_/ |___|____/ |_| |___/_/ \_\|_|  
                                          
  __  __ ___ ____ ____      _  _____ ___ ___  _   _ 
 |  \/  |_ _/ ___|  _ \    / \|_   _|_ _/ _ \| \ | |
 | |\/| || | |  _| |_) |  / _ \ | |  | | | | |  \| |
 | |  | || | |_| |  _ <  / ___ \| |  | | |_| | |\  |
 |_|  |_|___\____|_| \_\/_/   \_\_| |___\___/|_| \_|
                                                     
  _____ ___   ___  _     
 |_   _/ _ \ / _ \| |    
   | || | | | | | | |    
   | || |_| | |_| | |___ 
   |_| \___/ \___/|_____|
                         
";

echo "Welcome to the VIPFLAT to Adesk Migration Tool (Step-by-Step)\n";
echo "==========================================================\n\n";

echo "This tool will guide you through the process of migrating data from VIPFLAT to Adesk.\n";
echo "Mode: " . ($isTestMode ? "TEST (no real data will be migrated)" : "LIVE (actual migration)") . "\n";
echo "Data directory: " . $config['data_dir'] . "\n\n";

// Initialize components
$logger = new Logger($config['logs_dir'], $config['log_level'], $config['log_file_format']);
$api = new AdeskApi(
    $config['adesk_api_url'],
    $config['adesk_api_token'],
    $config['adesk_api_version'],
    $logger,
    $config['retry_attempts'],
    $config['retry_delay']
);
$mapper = new IdMapper($config['mappings_dir'], $logger);
$exporter = new DataExporter($config['data_dir'], $config, $logger);

// Step 1: Check API connectivity
echo "Step 1: Checking API connectivity...\n";
$endpoints = [
    'account' => 'Account information',
    'organization' => 'Organization information',
    'transactions/categories' => 'Transaction categories',
    'contractors' => 'Contractors',
    'projects' => 'Projects',
    'bank-accounts' => 'Bank accounts',
    'transactions' => 'Transactions'
];

$workingEndpoints = 0;
foreach ($endpoints as $endpoint => $description) {
    echo "  Testing $description endpoint... ";
    $result = $api->get($endpoint);
    if ($result !== false) {
        echo "✓ Working\n";
        $workingEndpoints++;
    } else {
        echo "✗ Failed\n";
    }
}

echo "\n  $workingEndpoints of " . count($endpoints) . " endpoints are working.\n";

if ($workingEndpoints < 4) { // If fewer than 4 endpoints work, it's a critical issue
    echo "\n⚠️ Warning: Too many API endpoints are not accessible. This might indicate:\n";
    echo "  - API token is invalid or expired\n";
    echo "  - API URL is incorrect\n";
    echo "  - Network connectivity issues\n\n";
    
    if (!$isTestMode) {
        echo "Would you like to continue anyway? (y/n): ";
        $handle = fopen("php://stdin", "r");
        $line = fgets($handle);
        if (trim(strtolower($line)) != 'y') {
            echo "Migration cancelled.\n";
            exit;
        }
        fclose($handle);
    }
}

// Step 2: Check for legal entity
echo "\nStep 2: Checking for legal entity...\n";
$legalEntityId = $api->getDefaultLegalEntityId();
echo "  Using legal entity ID: $legalEntityId\n";

// Step 3: Validate CSV files
echo "\nStep 3: Validating CSV files...\n";
$csvFiles = [
    'contractors' => $config['csv_files']['contractors'],
    'bank_accounts' => $config['csv_files']['bank_accounts'],
    'projects' => $config['csv_files']['projects'],
    'categories' => $config['csv_files']['categories'],
    'income_transactions' => $config['csv_files']['income_transactions'],
    'expense_transactions' => $config['csv_files']['expense_transactions'],
    'transfers' => $config['csv_files']['transfers'],
    'users' => $config['csv_files']['users'],
];

$allFilesValid = true;
foreach ($csvFiles as $entityType => $filename) {
    $filePath = $config['data_dir'] . $filename;
    echo "  Checking $filename... ";
    
    if (!file_exists($filePath)) {
        echo "✗ File not found\n";
        $allFilesValid = false;
        continue;
    }
    
    $data = $exporter->exportFromCsv($entityType, ['limit' => 1]);
    if ($data === false || empty($data)) {
        echo "✗ Invalid format or empty\n";
        $allFilesValid = false;
    } else {
        $rowCount = count(file($filePath)) - 1; // Minus header row
        echo "✓ Valid ($rowCount records)\n";
    }
}

if (!$allFilesValid) {
    echo "\n⚠️ Warning: Some CSV files are missing or invalid.\n";
    
    if (!$isTestMode) {
        echo "Would you like to continue anyway? (y/n): ";
        $handle = fopen("php://stdin", "r");
        $line = fgets($handle);
        if (trim(strtolower($line)) != 'y') {
            echo "Migration cancelled.\n";
            exit;
        }
        fclose($handle);
    }
}

// Step 4: Migration
echo "\nStep 4: Starting migration process...\n";

// Define migration order
$migrationOrder = [
    'categories' => 'Transaction categories',
    'contractors' => 'Contractors', 
    'bank_accounts' => 'Bank accounts',
    'users' => 'Users and default accounts',
    'projects' => 'Projects',
    'income_transactions' => 'Income transactions',
    'expense_transactions' => 'Expense transactions',
    'transfers' => 'Transfers between accounts'
];

$results = [
    'timestamp' => date('Y-m-d H:i:s'),
    'mode' => 'full',
    'is_test_mode' => $isTestMode,
    'entities' => []
];

// Import migration functions from migrate.php
require_once __DIR__ . '/migrate.php';

// Run migration for each entity type
foreach ($migrationOrder as $entityType => $description) {
    echo "\n  Migrating $description...\n";
    
    $handler = $migrationHandlers[$entityType];
    $entityResults = $handler($entityType, $api, $exporter, $mapper, 'full', null, null, $isTestMode, $config);
    $results['entities'][$entityType] = $entityResults;
    
    $successCount = isset($entityResults['success']) ? count($entityResults['success']) : 0;
    $errorCount = isset($entityResults['error']) ? count($entityResults['error']) : 0;
    $totalCount = isset($entityResults['total']) ? $entityResults['total'] : ($successCount + $errorCount);
    
    echo "    $successCount of $totalCount migrated successfully";
    if ($errorCount > 0) {
        echo " ($errorCount errors)";
    }
    echo "\n";
    
    // If a critical step has too many errors, ask if want to continue
    if ($errorCount > 0 && in_array($entityType, ['categories', 'bank_accounts', 'users']) && 
        $errorCount / $totalCount > 0.5 && !$isTestMode) {
        echo "\n⚠️ Warning: High error rate in $description migration.\n";
        echo "Would you like to continue with the next steps? (y/n): ";
        $handle = fopen("php://stdin", "r");
        $line = fgets($handle);
        if (trim(strtolower($line)) != 'y') {
            echo "Migration cancelled.\n";
            exit;
        }
        fclose($handle);
    }
}

// Generate migration report
$reportFile = $config['logs_dir'] . 'migration_report_' . date('Y-m-d_H-i-s') . '.json';
file_put_contents($reportFile, json_encode($results, JSON_PRETTY_PRINT));

// Step 5: Summary
echo "\nStep 5: Migration Summary\n";
echo "======================\n";
echo "Mode: " . ($isTestMode ? "TEST (no real data migrated)" : "LIVE (actual migration)") . "\n";
echo "Timestamp: " . date('Y-m-d H:i:s') . "\n";

foreach ($results['entities'] as $entityType => $entityResults) {
    $successCount = isset($entityResults['success']) ? count($entityResults['success']) : 0;
    $errorCount = isset($entityResults['error']) ? count($entityResults['error']) : 0;
    $totalCount = isset($entityResults['total']) ? $entityResults['total'] : ($successCount + $errorCount);
    
    echo "\n$migrationOrder[$entityType]: $successCount of $totalCount migrated successfully";
    if ($errorCount > 0) {
        echo " ($errorCount errors)";
    }
}

echo "\n\nDetailed report saved to: $reportFile";
echo "\nLog files are available in: " . $config['logs_dir'] . "\n";

echo "\nMigration process completed.\n";
echo "Thank you for using the VIPFLAT to Adesk Migration Tool!\n";

exit(0);