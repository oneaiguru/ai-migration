<?php
/**
 * CSV Migration Checker for VIPFLAT to Adesk Migration
 * 
 * This script tests if a CSV file can be successfully processed by the migration tool.
 * 
 * Usage: php csv-check-migration.php <csv_file> <entity_type>
 */

// Set error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('memory_limit', '512M');

// Load configuration
$config = require_once __DIR__ . '/config.php';

// Load classes
require_once __DIR__ . '/classes/Logger.php';
require_once __DIR__ . '/classes/DataExporter.php';

// Function to test if a CSV file can be processed
function testCsvProcessing($csvFile, $entityType, $config) {
    $results = [
        'success' => false,
        'errors' => [],
        'warnings' => [],
        'stats' => [
            'records_read' => 0,
            'fields_required' => 0,
            'fields_missing' => []
        ]
    ];
    
    // Check if entity type is supported
    if (!isset($config['field_mappings'][$entityType])) {
        $results['errors'][] = "Entity type '$entityType' is not supported";
        return $results;
    }
    
    // Check required fields based on field mappings
    $requiredFields = [];
    $fieldMappings = $config['field_mappings'][$entityType];
    $results['stats']['fields_required'] = count($fieldMappings);
    
    // Create logger
    $logger = new Logger(
        $config['logs_dir'],
        'debug',
        $config['log_file_format'],
        'migration_check_'
    );
    
    // Create data exporter with custom CSV file
    $dataDir = dirname($csvFile) . '/';
    $customConfig = $config;
    $customConfig['csv_files'][$entityType] = basename($csvFile);
    
    $exporter = new DataExporter($dataDir, $customConfig, $logger);
    
    // Try to export data
    $data = $exporter->exportFromCsv($entityType, ['limit' => 10]);
    
    if ($data === false) {
        $results['errors'][] = "Failed to export data from CSV file";
        return $results;
    }
    
    $results['stats']['records_read'] = count($data);
    
    // Check if any data was read
    if (count($data) === 0) {
        $results['errors'][] = "No data was exported from CSV file";
        return $results;
    }
    
    // Check if all required fields are present
    $missingFields = [];
    $sampleRecord = $data[0];
    
    // Define essential fields for each entity type
    $essentialFields = [
        'contractors' => ['id', 'given_name', 'surname'],  // These fields are enough
        'bank_accounts' => ['id', 'name'],
        'projects' => ['id', 'title'],
        'categories' => ['id', 'name'],
        'income_transactions' => ['id', 'amount', 'operation_date', 'accounts_id'],
        'expense_transactions' => ['id', 'amount', 'operation_date', 'accounts_id'],
        'transfers' => ['id', 'dtdoc', 'amount_from', 'accounts_from_id', 'accounts_to_id']
    ];
    
    // Check only for essential fields
    $fieldsToCheck = isset($essentialFields[$entityType]) ? $essentialFields[$entityType] : array_keys($fieldMappings);
    
    foreach ($fieldsToCheck as $field) {
        if (!isset($sampleRecord[$field])) {
            $missingFields[] = $field;
        }
    }
    
    if (!empty($missingFields)) {
        $results['errors'][] = "Missing required fields: " . implode(', ', $missingFields);
        $results['stats']['fields_missing'] = $missingFields;
    }
    
    // All checks passed
    if (empty($results['errors'])) {
        $results['success'] = true;
    }
    
    return $results;
}

// Main logic
function displayHelp() {
    echo "CSV Migration Checker for VIPFLAT to Adesk Migration\n";
    echo "==================================================\n\n";
    echo "This script tests if a CSV file can be successfully processed by the migration tool.\n\n";
    echo "Usage: php csv-check-migration.php <csv_file> <entity_type>\n\n";
    echo "Supported entity types:\n";
    echo "- contractors (contacts.csv)\n";
    echo "- bank_accounts (accounts.csv)\n";
    echo "- projects (apartments.csv)\n";
    echo "- categories (target.csv)\n";
    echo "- income_transactions (debet.csv)\n";
    echo "- expense_transactions (credit.csv)\n";
    echo "- transfers (moving.csv)\n";
}

// Main execution
if ($argc < 3) {
    displayHelp();
    exit(1);
}

$csvFile = $argv[1];
$entityType = $argv[2];

// Check if file exists
if (!file_exists($csvFile)) {
    echo "Error: File '$csvFile' does not exist\n";
    exit(1);
}

echo "Testing CSV file '$csvFile' for entity type '$entityType'...\n\n";

$results = testCsvProcessing($csvFile, $entityType, $config);

if ($results['success']) {
    echo "✓ SUCCESS: CSV file can be processed by the migration tool\n\n";
} else {
    echo "✗ FAILURE: CSV file cannot be processed by the migration tool\n\n";
}

echo "Results:\n";
echo "--------\n";
echo "Records read: " . $results['stats']['records_read'] . "\n";
echo "Fields required: " . $results['stats']['fields_required'] . "\n";

if (!empty($results['errors'])) {
    echo "\nErrors:\n";
    foreach ($results['errors'] as $error) {
        echo "- $error\n";
    }
}

if (!empty($results['warnings'])) {
    echo "\nWarnings:\n";
    foreach ($results['warnings'] as $warning) {
        echo "- $warning\n";
    }
}

// Generate JSON report
$reportDir = dirname($csvFile);
$reportPath = $reportDir . '/migration_check_report_' . basename($csvFile) . '.json';
file_put_contents($reportPath, json_encode($results, JSON_PRETTY_PRINT));
echo "\nCheck report saved to: $reportPath\n";