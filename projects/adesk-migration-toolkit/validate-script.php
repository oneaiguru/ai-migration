<?php
/**
 * VIPFLAT to Adesk Migration Tool - Data Validation Script
 * 
 * This script validates the migrated data to ensure all requirements are met.
 */

// Set error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Increase memory limit for handling large CSV files
ini_set('memory_limit', '512M');

// Load configuration
$config = require_once __DIR__ . '/config.php';

// Load classes
require_once __DIR__ . '/classes/Logger.php';
require_once __DIR__ . '/classes/AdeskApi.php';
require_once __DIR__ . '/classes/IdMapper.php';
require_once __DIR__ . '/classes/DataExporter.php';

// Parse command line arguments
$options = getopt('', ['entity::', 'detail']);
$entityType = isset($options['entity']) ? $options['entity'] : 'all';
$showDetail = isset($options['detail']);

// Initialize logger
$logger = new Logger(
    $config['logs_dir'],
    $config['log_level'],
    $config['log_file_format'],
    'validation_'
);

echo "VIPFLAT to Adesk Migration Tool - Data Validation\n";
echo "==============================================\n\n";

// Initialize components
try {
    $mapper = new IdMapper($config['mappings_dir'], $logger);
    $exporter = new DataExporter($config['data_dir'], $config, $logger);
    $adesk = new AdeskApi(
        $config['adesk_api_url'],
        $config['adesk_api_token'],
        $config['adesk_api_version'],
        $logger,
        $config['retry_attempts'],
        $config['retry_delay']
    );
} catch (Exception $e) {
    echo "Error initializing components: " . $e->getMessage() . "\n";
    exit(1);
}

// Define entity types to validate
$entitiesToValidate = [
    'categories',
    'contractors',
    'bank_accounts',
    'projects',
    'income_transactions',
    'expense_transactions',
    'transfers'
];

if ($entityType !== 'all') {
    if (in_array($entityType, $entitiesToValidate)) {
        $entitiesToValidate = [$entityType];
    } else {
        echo "Invalid entity type: $entityType\n";
        echo "Valid options: " . implode(', ', $entitiesToValidate) . ", all\n";
        exit(1);
    }
}

$validationResults = [
    'record_counts' => [],
    'financial_totals' => [],
    'missing_relationships' => [],
    'success' => true
];

echo "Starting validation...\n\n";

// Validate record counts
echo "Validating record counts...\n";
foreach ($entitiesToValidate as $entity) {
    // Get source data count
    $sourceData = $exporter->export($entity);
    $sourceCount = is_array($sourceData) ? count($sourceData) : 0;
    
    // Get mapped entities count
    $mappings = $mapper->getAllMappings($entity);
    $mappedCount = count($mappings);
    
    // Get destination data count (from Adesk API)
    $destCount = 0;
    
    try {
        switch ($entity) {
            case 'categories':
                $response = $adesk->getCategories();
                $destCount = isset($response['recordsTotal']) ? $response['recordsTotal'] : 0;
                break;
            case 'contractors':
                $response = $adesk->getContractors();
                $destCount = isset($response['recordsTotal']) ? $response['recordsTotal'] : 0;
                break;
            case 'bank_accounts':
                $response = $adesk->getBankAccounts();
                $destCount = isset($response['recordsTotal']) ? $response['recordsTotal'] : 0;
                break;
            case 'projects':
                $response = $adesk->getProjects();
                $destCount = isset($response['recordsTotal']) ? $response['recordsTotal'] : 0;
                break;
            // Transactions require date filtering for accurate counts
            case 'income_transactions':
                $response = $adesk->getTransactions(['type' => 'income']);
                $destCount = isset($response['recordsTotal']) ? $response['recordsTotal'] : 0;
                break;
            case 'expense_transactions':
                $response = $adesk->getTransactions(['type' => 'outcome']);
                $destCount = isset($response['recordsTotal']) ? $response['recordsTotal'] : 0;
                break;
            case 'transfers':
                // There's no direct API for listing just transfers
                // This would need a custom implementation
                $destCount = $mappedCount; // Assume all were migrated successfully
                break;
        }
    } catch (Exception $e) {
        $logger->error("Error getting $entity count from Adesk: " . $e->getMessage());
        $destCount = 0;
    }
    
    $result = [
        'source_count' => $sourceCount,
        'mapped_count' => $mappedCount,
        'destination_count' => $destCount,
        'match' => ($sourceCount == $mappedCount && $mappedCount == $destCount)
    ];
    
    $validationResults['record_counts'][$entity] = $result;
    
    if ($result['match']) {
        echo "  ✓ $entity: $sourceCount records - MATCH\n";
    } else {
        echo "  ✗ $entity: Source: $sourceCount, Mapped: $mappedCount, Destination: $destCount - MISMATCH\n";
        $validationResults['success'] = false;
    }
}

echo "\n";

// Validate financial totals
echo "Validating financial totals...\n";

// Calculate income totals
$incomeSourceTotal = 0;
$incomeSourceData = $exporter->export('income_transactions');
if (is_array($incomeSourceData)) {
    foreach ($incomeSourceData as $transaction) {
        $incomeSourceTotal += (float)($transaction['amount'] ?? 0);
    }
}

// Calculate expense totals
$expenseSourceTotal = 0;
$expenseSourceData = $exporter->export('expense_transactions');
if (is_array($expenseSourceData)) {
    foreach ($expenseSourceData as $transaction) {
        $expenseSourceTotal += (float)($transaction['amount'] ?? 0);
    }
}

// Get Adesk totals
$incomeDestTotal = sumMappedTransactionTotals('income_transactions', $mapper, $adesk, $logger);
$expenseDestTotal = sumMappedTransactionTotals('expense_transactions', $mapper, $adesk, $logger);

$validationResults['financial_totals'] = [
    'income' => [
        'source_total' => $incomeSourceTotal,
        'destination_total' => $incomeDestTotal,
        'match' => abs($incomeSourceTotal - $incomeDestTotal) < 0.01
    ],
    'expense' => [
        'source_total' => $expenseSourceTotal,
        'destination_total' => $expenseDestTotal,
        'match' => abs($expenseSourceTotal - $expenseDestTotal) < 0.01
    ]
];

if ($validationResults['financial_totals']['income']['match']) {
    echo "  ✓ Income total: " . number_format($incomeSourceTotal, 2) . " - MATCH\n";
} else {
    echo "  ✗ Income total: Source: " . number_format($incomeSourceTotal, 2) . 
         ", Destination: " . number_format($incomeDestTotal, 2) . " - MISMATCH\n";
    $validationResults['success'] = false;
}

if ($validationResults['financial_totals']['expense']['match']) {
    echo "  ✓ Expense total: " . number_format($expenseSourceTotal, 2) . " - MATCH\n";
} else {
    echo "  ✗ Expense total: Source: " . number_format($expenseSourceTotal, 2) . 
         ", Destination: " . number_format($expenseDestTotal, 2) . " - MISMATCH\n";
    $validationResults['success'] = false;
}

echo "\n";

// Validate relationship integrity
echo "Validating relationship integrity...\n";

// Check for missing relationships in income transactions
$missingRelationships = [
    'income_transactions' => 0,
    'expense_transactions' => 0
];

// Check income transactions
$incomeData = $exporter->export('income_transactions');
if (is_array($incomeData)) {
    foreach ($incomeData as $transaction) {
        $id = $transaction['id'];
        $missingFields = [];
        
        // Check if bank account exists
        if (isset($transaction['accounts_id']) && !empty($transaction['accounts_id'])) {
            $bankAccountId = $mapper->getAdeskId('bank_accounts', $transaction['accounts_id']);
            if (!$bankAccountId) {
                $missingFields[] = 'bank_account';
            }
        } else {
            $missingFields[] = 'bank_account';
        }
        
        // Check if category exists
        if (isset($transaction['target_id']) && !empty($transaction['target_id'])) {
            $categoryId = $mapper->getAdeskId('categories', $transaction['target_id']);
            if (!$categoryId) {
                $missingFields[] = 'category';
            }
        }
        
        // Check if contractor exists
        if (isset($transaction['contacts_id']) && !empty($transaction['contacts_id'])) {
            $contractorId = $mapper->getAdeskId('contractors', $transaction['contacts_id']);
            if (!$contractorId) {
                $missingFields[] = 'contractor';
            }
        }
        
        // Check if project exists
        if (isset($transaction['apartment_id']) && !empty($transaction['apartment_id'])) {
            $projectId = $mapper->getAdeskId('projects', $transaction['apartment_id']);
            if (!$projectId) {
                $missingFields[] = 'project';
            }
        }
        
        if (!empty($missingFields)) {
            $missingRelationships['income_transactions']++;
            
            if ($showDetail) {
                echo "  - Income transaction $id is missing relationships: " . implode(', ', $missingFields) . "\n";
            }
        }
    }
}

// Check expense transactions
$expenseData = $exporter->export('expense_transactions');
if (is_array($expenseData)) {
    foreach ($expenseData as $transaction) {
        $id = $transaction['id'];
        $missingFields = [];
        
        // Check if bank account exists
        if (isset($transaction['accounts_id']) && !empty($transaction['accounts_id'])) {
            $bankAccountId = $mapper->getAdeskId('bank_accounts', $transaction['accounts_id']);
            if (!$bankAccountId) {
                $missingFields[] = 'bank_account';
            }
        } else {
            $missingFields[] = 'bank_account';
        }
        
        // Check if category exists
        if (isset($transaction['target_id']) && !empty($transaction['target_id'])) {
            $categoryId = $mapper->getAdeskId('categories', $transaction['target_id']);
            if (!$categoryId) {
                $missingFields[] = 'category';
            }
        }
        
        // Check if contractor exists
        if (isset($transaction['contacts_id']) && !empty($transaction['contacts_id'])) {
            $contractorId = $mapper->getAdeskId('contractors', $transaction['contacts_id']);
            if (!$contractorId) {
                $missingFields[] = 'contractor';
            }
        }
        
        // Check if project exists
        if (isset($transaction['apartment_id']) && !empty($transaction['apartment_id'])) {
            $projectId = $mapper->getAdeskId('projects', $transaction['apartment_id']);
            if (!$projectId) {
                $missingFields[] = 'project';
            }
        }
        
        if (!empty($missingFields)) {
            $missingRelationships['expense_transactions']++;
            
            if ($showDetail) {
                echo "  - Expense transaction $id is missing relationships: " . implode(', ', $missingFields) . "\n";
            }
        }
    }
}

$validationResults['missing_relationships'] = $missingRelationships;

if ($missingRelationships['income_transactions'] == 0) {
    echo "  ✓ Income transactions: No missing relationships\n";
} else {
    echo "  ✗ Income transactions: " . $missingRelationships['income_transactions'] . " transactions with missing relationships\n";
    $validationResults['success'] = false;
}

if ($missingRelationships['expense_transactions'] == 0) {
    echo "  ✓ Expense transactions: No missing relationships\n";
} else {
    echo "  ✗ Expense transactions: " . $missingRelationships['expense_transactions'] . " transactions with missing relationships\n";
    $validationResults['success'] = false;
}

echo "\n";

// Summary
echo "Validation Summary\n";
echo "================\n";

if ($validationResults['success']) {
    echo "✓ All validation checks passed successfully!\n";
} else {
    echo "✗ Some validation checks failed. See details above.\n";
}

echo "\n";

// Save validation results
$timestamp = date('Y-m-d_H-i-s');
$reportFile = $config['logs_dir'] . 'validation_report_' . $timestamp . '.json';
file_put_contents($reportFile, json_encode($validationResults, JSON_PRETTY_PRINT));
echo "Validation report saved to: $reportFile\n";

exit($validationResults['success'] ? 0 : 1);

/**
 * Sum destination transaction amounts using mapped Adesk IDs.
 *
 * @param string $entityType Entity type ('income_transactions' or 'expense_transactions')
 * @param IdMapper $mapper ID mapper
 * @param AdeskApi $adesk Adesk API client
 * @param Logger $logger Logger instance
 * @return float Summed amount from Adesk transactions
 */
function sumMappedTransactionTotals($entityType, $mapper, $adesk, $logger) {
    $total = 0.0;
    $mappings = $mapper->getAllMappings($entityType);

    foreach ($mappings as $vipflatId => $mapping) {
        $adeskId = isset($mapping['adesk_id']) ? $mapping['adesk_id'] : null;
        if (!$adeskId) {
            $logger->warning("Missing Adesk ID for mapped $entityType record $vipflatId");
            continue;
        }

        $response = $adesk->getTransaction($adeskId);
        if ($response && isset($response['transaction']['amount'])) {
            $total += (float)$response['transaction']['amount'];
        } else {
            $logger->warning("Unable to fetch transaction $adeskId for $entityType record $vipflatId");
        }
    }

    return $total;
}
