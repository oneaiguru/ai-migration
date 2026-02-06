<?php
/**
 * VIPFLAT to Adesk Migration Tool
 * 
 * This script handles the migration of financial data from VIPFLAT to Adesk.
 * 
 * Usage: php migrate.php [--mode=full|incremental] [--entity=all|contractors|bank_accounts|...]
 *                        [--start-date=YYYY-MM-DD] [--end-date=YYYY-MM-DD] [--test]
 * 
 * File: migrate.php
 */

// Set error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Increase memory limit for handling large CSV files
ini_set('memory_limit', '512M');

// Load configuration
$config = require_once __DIR__ . '/config.php';

// Allow overriding data directory (used by migrate-newfiles.php)
if (isset($_SERVER['OVERRIDE_DATA_DIR'])) {
    $config['data_dir'] = $_SERVER['OVERRIDE_DATA_DIR'];
    echo "Using override data directory: " . $config['data_dir'] . "\n";
}

// Load classes
require_once __DIR__ . '/classes/Logger.php';
require_once __DIR__ . '/classes/AdeskApi.php';
require_once __DIR__ . '/classes/IdMapper.php';
require_once __DIR__ . '/classes/DataExporter.php';

// Parse command line arguments
$options = getopt('', ['mode:', 'entity:', 'start-date:', 'end-date:', 'test', 'from-dir:']);

$mode = isset($options['mode']) ? $options['mode'] : 'full';
$entityType = isset($options['entity']) ? $options['entity'] : 'all';
$startDate = isset($options['start-date']) ? $options['start-date'] : null;
$endDate = isset($options['end-date']) ? $options['end-date'] : null;
$isTestMode = isset($options['test']);
$dataDir = isset($options['from-dir']) ? $options['from-dir'] : null;

// Override data directory if specified
if ($dataDir) {
    $dataDir = rtrim($dataDir, '/') . '/';
    if (!file_exists($dataDir)) {
        echo "Error: Directory $dataDir does not exist.\n";
        exit(1);
    }
    $config['data_dir'] = $dataDir;
    echo "Using data from: {$config['data_dir']}\n";
}

// Initialize logger
$logger = new Logger(
    $config['logs_dir'],
    $config['log_level'],
    $config['log_file_format']
);

// Log script start
$logger->info("Starting migration in $mode mode" . ($isTestMode ? ' (TEST MODE)' : ''));
$logger->info("Entity type: $entityType");
if ($startDate) $logger->info("Start date: $startDate");
if ($endDate) $logger->info("End date: $endDate");

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

// Migration order and handlers
$migrationHandlers = [
    'categories' => 'migrateCategories',
    'contractors' => 'migrateContractors',
    'bank_accounts' => 'migrateBankAccounts',
    'users' => 'migrateUsers',  // Add users migration before transactions
    'projects' => 'migrateProjects',
    'income_transactions' => 'migrateIncomeTransactions',
    'expense_transactions' => 'migrateExpenseTransactions',
    'transfers' => 'migrateTransfers'
];

// Results tracking
$results = [
    'timestamp' => date('Y-m-d H:i:s'),
    'mode' => $mode,
    'entity_type' => $entityType,
    'start_date' => $startDate,
    'end_date' => $endDate,
    'is_test_mode' => $isTestMode,
    'entities' => []
];

// Migrate specific entity or all entities
if ($entityType === 'all') {
    foreach ($migrationHandlers as $type => $handler) {
        $entityResults = $handler($type, $adesk, $exporter, $mapper, $mode, $startDate, $endDate, $isTestMode, $config);
        $results['entities'][$type] = $entityResults;
    }
} else if (isset($migrationHandlers[$entityType])) {
    $handler = $migrationHandlers[$entityType];
    $entityResults = $handler($entityType, $adesk, $exporter, $mapper, $mode, $startDate, $endDate, $isTestMode, $config);
    $results['entities'][$entityType] = $entityResults;
} else {
    $logger->error("Unsupported entity type: $entityType");
    exit(1);
}

// Generate migration report
$reportFile = $config['logs_dir'] . 'migration_report_' . date('Y-m-d_H-i-s') . '.json';
file_put_contents($reportFile, json_encode($results, JSON_PRETTY_PRINT));

// Print summary
echo "\nMigration Summary:\n";
echo "=====================================\n";
echo "Mode: " . ($mode == 'full' ? 'Full Migration' : 'Incremental Update') . "\n";
echo "Test Mode: " . ($isTestMode ? 'Yes' : 'No') . "\n";

foreach ($results['entities'] as $type => $entityResults) {
    $successCount = isset($entityResults['success']) ? count($entityResults['success']) : 0;
    $errorCount = isset($entityResults['error']) ? count($entityResults['error']) : 0;
    $totalCount = $successCount + $errorCount;
    
    echo "\n$type: $successCount of $totalCount migrated successfully";
    if ($errorCount > 0) {
        echo " ($errorCount errors)";
    }
    echo "\n";
}

echo "\nDetailed report saved to: $reportFile\n";

// End script
$logger->info("Migration completed");
exit(0);

/**
 * Normalize VIPFLAT transaction types into Adesk-compatible values.
 *
 * @param string|null $value VIPFLAT transaction type value.
 * @param string $defaultType Default type to fall back to.
 * @return string
 */
function normalizeTransactionType($value, $defaultType) {
    if ($value === null || $value === '') {
        return $defaultType;
    }

    $normalized = mb_strtolower(trim((string)$value));
    $isRefund = strpos($normalized, 'возврат') !== false || strpos($normalized, 'refund') !== false;
    $isIncome = strpos($normalized, 'приход') !== false || strpos($normalized, 'income') !== false;
    $isExpense = strpos($normalized, 'расход') !== false || strpos($normalized, 'expense') !== false || strpos($normalized, 'outcome') !== false;

    if ($isIncome) {
        return $isRefund ? 'income_refund' : 'income';
    }
    if ($isExpense) {
        return $isRefund ? 'outcome_refund' : 'outcome';
    }

    return $defaultType;
}

/**
 * Resolve related transaction IDs for refunds.
 *
 * @param IdMapper $mapper
 * @param Logger $logger
 * @param string $entityType
 * @param string|null $vipflatId
 * @param bool $isTestMode
 * @param string $transactionId
 * @return string|null
 */
function resolveRelatedTransactionId($mapper, $logger, $entityType, $vipflatId, $isTestMode, $transactionId) {
    if ($vipflatId === null || $vipflatId === '') {
        return null;
    }

    if ($isTestMode) {
        return 'test_' . $vipflatId;
    }

    $relatedId = $mapper->getAdeskId($entityType, $vipflatId);
    if (!$relatedId) {
        $logger->warning("Transaction {$transactionId} references missing related {$entityType} ID {$vipflatId}");
        return null;
    }

    return $relatedId;
}

/**
 * Migrate transaction categories
 * 
 * @param string $entityType Entity type
 * @param AdeskApi $adesk Adesk API client
 * @param DataExporter $exporter Data exporter
 * @param IdMapper $mapper ID mapper
 * @param string $mode Migration mode ('full' or 'incremental')
 * @param string|null $startDate Start date filter
 * @param string|null $endDate End date filter
 * @param bool $isTestMode Whether to run in test mode
 * @param array $config Configuration array
 * @return array Migration results
 */
function migrateCategories($entityType, $adesk, $exporter, $mapper, $mode, $startDate, $endDate, $isTestMode, $config) {
    global $logger;
    
    $logger->info("Starting migration of transaction categories");
    
    // Export categories
    $categories = $exporter->export('categories');
    
    if ($categories === false || empty($categories)) {
        $logger->error("Failed to export categories or no categories found");
        return [
            'success' => [],
            'error' => [],
            'total' => 0
        ];
    }
    
    $logger->info("Found " . count($categories) . " categories to migrate");
    
    // In incremental mode, filter only unmapped categories
    if ($mode === 'incremental') {
        $mappedIds = $mapper->getAllVipflatIds('categories');
        $categories = array_filter($categories, function($category) use ($mappedIds) {
            return !in_array($category['id'], $mappedIds);
        });
        
        $logger->info("After filtering, " . count($categories) . " new categories to migrate");
    }
    
    // Sort categories by parent_id to ensure parents are created before children
    usort($categories, function($a, $b) {
        $aParent = isset($a['parent_id']) && !empty($a['parent_id']) ? $a['parent_id'] : 0;
        $bParent = isset($b['parent_id']) && !empty($b['parent_id']) ? $b['parent_id'] : 0;
        return $aParent - $bParent;
    });
    
    $fieldMapping = $config['field_mappings']['categories'];
    $batchSize = $config['batch_size'];
    $successCount = 0;
    $errorCount = 0;
    $success = [];
    $errors = [];
    
    // Process in batches
    $batches = array_chunk($categories, $batchSize);
    
    foreach ($batches as $batchIndex => $batch) {
        $logger->info("Processing batch " . ($batchIndex + 1) . " of " . count($batches));
        
        foreach ($batch as $category) {
            // Map fields
            $adeskData = [];
            foreach ($fieldMapping as $vipflatField => $adeskField) {
                if (isset($category[$vipflatField])) {
                    // Special handling for type field
                    if ($vipflatField === 'operation_type' && $adeskField === 'type') {
                        if (isset($config['operation_type_mapping'][$category[$vipflatField]])) {
                            $adeskData[$adeskField] = $config['operation_type_mapping'][$category[$vipflatField]];
                        } else {
                            // Default to 1 (income) if operation type is not recognized
                            $adeskData[$adeskField] = 1;
                        }
                    } 
                    // Special handling for parent_id
                    else if ($vipflatField === 'parent_id' && $adeskField === 'parent_id') {
                        if (!empty($category[$vipflatField])) {
                            $parentAdeskId = $mapper->getAdeskId('categories', $category[$vipflatField]);
                            if ($parentAdeskId) {
                                $adeskData['group'] = (int)$parentAdeskId;
                            }
                        }
                    }
                    // Special handling for inverted boolean fields
                    else if ($adeskField === 'is_archived' && $vipflatField === 'is_active') {
                        $adeskData[$adeskField] = !($category[$vipflatField] == 1 || $category[$vipflatField] === true || $category[$vipflatField] === 'true');
                    } else {
                        $adeskData[$adeskField] = $category[$vipflatField];
                    }
                }
            }
            
            // Set default values for required fields
            if (!isset($adeskData['type'])) {
                $adeskData['type'] = 1; // Default to income
            }
            
            if (!isset($adeskData['kind'])) {
                $adeskData['kind'] = 1; // Default to operational
            }
            
            // Ensure all required fields are set
            $requiredFields = ['name', 'type', 'kind'];
            foreach ($requiredFields as $field) {
                if (!isset($adeskData[$field]) || (is_string($adeskData[$field]) && empty($adeskData[$field]))) {
                    $logger->warning("Missing required field $field for category {$category['id']}, setting default value");
                    if ($field === 'name' && isset($category['name'])) {
                        $adeskData['name'] = $category['name'];
                    } else if ($field === 'name') {
                        $adeskData['name'] = "Category {$category['id']}";
                    } else if ($field === 'type') {
                        $adeskData['type'] = 1; // Income
                    } else if ($field === 'kind') {
                        $adeskData['kind'] = 1; // Operational
                    }
                }
            }
            
            if ($isTestMode) {
                // In test mode, simulate success without API calls
                $logger->info("TEST MODE: Would migrate category {$category['id']} ({$category['name']})");
                $success[] = [
                    'vipflat_id' => $category['id'],
                    'adesk_id' => 'test_' . $category['id'],
                    'name' => $category['name']
                ];
                // Do not persist mappings in test mode
                $successCount++;
                continue;
            }
            
            // Create or update category in Adesk
            $response = $adesk->createCategory($adeskData);
            
            if ($response && isset($response['success']) && $response['success']) {
                $adeskId = $response['category']['id'];
                $mapper->addMapping('categories', $category['id'], $adeskId);
                $logger->info("Migrated category {$category['id']} ({$category['name']}) to Adesk ID $adeskId");
                $success[] = [
                    'vipflat_id' => $category['id'],
                    'adesk_id' => $adeskId,
                    'name' => $category['name']
                ];
                $successCount++;
            } else {
                $logger->error("Failed to migrate category {$category['id']} ({$category['name']}): " . json_encode($response));
                $errors[] = [
                    'vipflat_id' => $category['id'],
                    'name' => $category['name'],
                    'error' => $response ? json_encode($response) : 'API call failed'
                ];
                $errorCount++;
            }
        }
        
        // Sleep between batches to avoid rate limits
        if ($batchIndex < count($batches) - 1) {
            sleep($config['sleep_between_batches']);
        }
    }
    
    $logger->info("Category migration completed: $successCount successful, $errorCount failed");
    
    return [
        'success' => $success,
        'error' => $errors,
        'total' => count($categories)
    ];
}

/**
 * Migrate contractors
 * 
 * @param string $entityType Entity type
 * @param AdeskApi $adesk Adesk API client
 * @param DataExporter $exporter Data exporter
 * @param IdMapper $mapper ID mapper
 * @param string $mode Migration mode ('full' or 'incremental')
 * @param string|null $startDate Start date filter
 * @param string|null $endDate End date filter
 * @param bool $isTestMode Whether to run in test mode
 * @param array $config Configuration array
 * @return array Migration results
 */
function migrateContractors($entityType, $adesk, $exporter, $mapper, $mode, $startDate, $endDate, $isTestMode, $config) {
    global $logger;
    
    $logger->info("Starting migration of contractors");
    
    // Export contractors (no artificial cap; use --test mode separately)
    $contractors = $exporter->export('contractors');
    
    if ($contractors === false || empty($contractors)) {
        $logger->error("Failed to export contractors or no contractors found");
        return [
            'success' => [],
            'error' => [],
            'total' => 0
        ];
    }
    
    $logger->info("Found " . count($contractors) . " contractors to migrate");
    
    // In incremental mode, filter only unmapped contractors
    if ($mode === 'incremental') {
        $mappedIds = $mapper->getAllVipflatIds('contractors');
        $contractors = array_filter($contractors, function($contractor) use ($mappedIds) {
            return !in_array($contractor['id'], $mappedIds);
        });
        
        $logger->info("After filtering, " . count($contractors) . " new contractors to migrate");
    }
    
    $fieldMapping = $config['field_mappings']['contractors'];
    $batchSize = $config['batch_size'];
    $successCount = 0;
    $errorCount = 0;
    $success = [];
    $errors = [];
    
    // Process in batches
    $batches = array_chunk($contractors, $batchSize);
    
    foreach ($batches as $batchIndex => $batch) {
        $logger->info("Processing batch " . ($batchIndex + 1) . " of " . count($batches));
        
        foreach ($batch as $contractor) {
            // Map fields
            $adeskData = [];
            
            // Handle combined fields
            $contactPerson = '';
            if (isset($contractor['given_name'])) {
                $contactPerson .= $contractor['given_name'] . ' ';
            }
            if (isset($contractor['surname'])) {
                $contactPerson .= $contractor['surname'] . ' ';
            }
            if (isset($contractor['middle_name'])) {
                $contactPerson .= $contractor['middle_name'];
            }
            $contactPerson = trim($contactPerson);
            
            // Set name (prefer company_name if available, otherwise use contact person)
            if (isset($contractor['company_name']) && !empty($contractor['company_name'])) {
                $adeskData['name'] = $contractor['company_name'];
                if (!empty($contactPerson)) {
                    $adeskData['contact_person'] = $contactPerson;
                }
            } else if (!empty($contactPerson)) {
                $adeskData['name'] = $contactPerson;
            } else {
                // If neither company name nor contact person is available, use ID as name
                $adeskData['name'] = "Contractor {$contractor['id']}";
            }
            
            // Map remaining fields
            foreach ($fieldMapping as $vipflatField => $adeskField) {
                if (isset($contractor[$vipflatField]) && 
                    !in_array($vipflatField, ['given_name', 'surname', 'middle_name', 'company_name'])) {
                    $adeskData[$adeskField] = $contractor[$vipflatField];
                }
            }
            
            if ($isTestMode) {
                // In test mode, simulate success without API calls
                $logger->info("TEST MODE: Would migrate contractor {$contractor['id']} ({$adeskData['name']})");
                $success[] = [
                    'vipflat_id' => $contractor['id'],
                    'adesk_id' => 'test_' . $contractor['id'],
                    'name' => $adeskData['name']
                ];
                // Do not persist mappings in test mode
                $successCount++;
                continue;
            }
            
            // Create contractor in Adesk
            $response = $adesk->createContractor($adeskData);
            
            if ($response && isset($response['success']) && $response['success']) {
                $adeskId = $response['contractor']['id'];
                $mapper->addMapping('contractors', $contractor['id'], $adeskId);
                $logger->info("Migrated contractor {$contractor['id']} ({$adeskData['name']}) to Adesk ID $adeskId");
                $success[] = [
                    'vipflat_id' => $contractor['id'],
                    'adesk_id' => $adeskId,
                    'name' => $adeskData['name']
                ];
                $successCount++;
            } else {
                $logger->error("Failed to migrate contractor {$contractor['id']} ({$adeskData['name']}): " . json_encode($response));
                $errors[] = [
                    'vipflat_id' => $contractor['id'],
                    'name' => $adeskData['name'],
                    'error' => $response ? json_encode($response) : 'API call failed'
                ];
                $errorCount++;
            }
        }
        
        // Sleep between batches to avoid rate limits
        if ($batchIndex < count($batches) - 1) {
            sleep($config['sleep_between_batches']);
        }
    }
    
    $logger->info("Contractor migration completed: $successCount successful, $errorCount failed");
    
    return [
        'success' => $success,
        'error' => $errors,
        'total' => count($contractors)
    ];
}

/**
 * Migrate bank accounts
 * 
 * @param string $entityType Entity type
 * @param AdeskApi $adesk Adesk API client
 * @param DataExporter $exporter Data exporter
 * @param IdMapper $mapper ID mapper
 * @param string $mode Migration mode ('full' or 'incremental')
 * @param string|null $startDate Start date filter
 * @param string|null $endDate End date filter
 * @param bool $isTestMode Whether to run in test mode
 * @param array $config Configuration array
 * @return array Migration results
 */
function migrateBankAccounts($entityType, $adesk, $exporter, $mapper, $mode, $startDate, $endDate, $isTestMode, $config) {
    global $logger;
    
    $logger->info("Starting migration of bank accounts");
    
    // Export bank accounts
    $bankAccounts = $exporter->export('bank_accounts');
    
    if ($bankAccounts === false || empty($bankAccounts)) {
        $logger->error("Failed to export bank accounts or no bank accounts found");
        return [
            'success' => [],
            'error' => [],
            'total' => 0
        ];
    }
    
    $logger->info("Found " . count($bankAccounts) . " bank accounts to migrate");
    
    // In incremental mode, filter only unmapped bank accounts
    if ($mode === 'incremental') {
        $mappedIds = $mapper->getAllVipflatIds('bank_accounts');
        $bankAccounts = array_filter($bankAccounts, function($account) use ($mappedIds) {
            return !in_array($account['id'], $mappedIds);
        });
        
        $logger->info("After filtering, " . count($bankAccounts) . " new bank accounts to migrate");
    }
    
    $fieldMapping = $config['field_mappings']['bank_accounts'];
    $batchSize = $config['batch_size'];
    $successCount = 0;
    $errorCount = 0;
    $success = [];
    $errors = [];
    
    // Process in batches
    $batches = array_chunk($bankAccounts, $batchSize);
    
    foreach ($batches as $batchIndex => $batch) {
        $logger->info("Processing batch " . ($batchIndex + 1) . " of " . count($batches));
        
        foreach ($batch as $account) {
            // Map fields
            $adeskData = [];
            foreach ($fieldMapping as $vipflatField => $adeskField) {
                if (isset($account[$vipflatField])) {
                    // Special handling for specific fields
                    if ($vipflatField === 'account_payment' && $adeskField === 'number') {
                        $adeskData[$adeskField] = (string)$account[$vipflatField];
                    } else if ($vipflatField === 'account_bik' && $adeskField === 'bank_code') {
                        $adeskData[$adeskField] = (string)$account[$vipflatField];
                    } else {
                        $adeskData[$adeskField] = $account[$vipflatField];
                    }
                }
            }
            
            // Set default values
            if (!isset($adeskData['name'])) {
                $adeskData['name'] = "Account {$account['id']}";
            }
            
            // Default to bank account (type 2)
            if (!isset($adeskData['type'])) {
                $adeskData['type'] = 2; // Bank account
            }
            
            // Default currency to RUR
            if (!isset($adeskData['currency'])) {
                $adeskData['currency'] = 'RUR';
            }
            
            // Legal entity is required for bank accounts - try to get it from API
            $defaultLegalEntityId = $adesk->getDefaultLegalEntityId();
            if ($defaultLegalEntityId) {
                $adeskData['legal_entity'] = $defaultLegalEntityId;
                $logger->info("Using legal entity ID: $defaultLegalEntityId from API");
            } else if (isset($config['legal_entity_id']) && !empty($config['legal_entity_id'])) {
                $adeskData['legal_entity'] = $config['legal_entity_id'];
                $logger->info("Using legal entity ID: {$config['legal_entity_id']} from config");
            } else {
                $logger->warning("No legal entity found in API or config. Bank account creation may fail.");
            }
            
            if ($isTestMode) {
                // In test mode, simulate success without API calls
                $logger->info("TEST MODE: Would migrate bank account {$account['id']} ({$adeskData['name']})");
                $success[] = [
                    'vipflat_id' => $account['id'],
                    'adesk_id' => 'test_' . $account['id'],
                    'name' => $adeskData['name']
                ];
                // Do not persist mappings in test mode
                $successCount++;
                continue;
            }
            
            // Create bank account in Adesk
            $response = $adesk->createBankAccount($adeskData);
            
            if ($response && isset($response['success']) && $response['success']) {
                $adeskId = $response['bankAccount']['id'];
                $mapper->addMapping('bank_accounts', $account['id'], $adeskId);
                $logger->info("Migrated bank account {$account['id']} ({$adeskData['name']}) to Adesk ID $adeskId");
                $success[] = [
                    'vipflat_id' => $account['id'],
                    'adesk_id' => $adeskId,
                    'name' => $adeskData['name']
                ];
                $successCount++;
            } else {
                $logger->error("Failed to migrate bank account {$account['id']} ({$adeskData['name']}): " . json_encode($response));
                $errors[] = [
                    'vipflat_id' => $account['id'],
                    'name' => $adeskData['name'],
                    'error' => $response ? json_encode($response) : 'API call failed'
                ];
                $errorCount++;
            }
        }
        
        // Sleep between batches to avoid rate limits
        if ($batchIndex < count($batches) - 1) {
            sleep($config['sleep_between_batches']);
        }
    }
    
    $logger->info("Bank account migration completed: $successCount successful, $errorCount failed");
    
    return [
        'success' => $success,
        'error' => $errors,
        'total' => count($bankAccounts)
    ];
}

/**
 * Migrate projects (apartments)
 * 
 * @param string $entityType Entity type
 * @param AdeskApi $adesk Adesk API client
 * @param DataExporter $exporter Data exporter
 * @param IdMapper $mapper ID mapper
 * @param string $mode Migration mode ('full' or 'incremental')
 * @param string|null $startDate Start date filter
 * @param string|null $endDate End date filter
 * @param bool $isTestMode Whether to run in test mode
 * @param array $config Configuration array
 * @return array Migration results
 */
function migrateProjects($entityType, $adesk, $exporter, $mapper, $mode, $startDate, $endDate, $isTestMode, $config) {
    global $logger;
    
    $logger->info("Starting migration of projects (apartments)");
    
    // Export projects
    $projects = $exporter->export('projects');
    
    if ($projects === false || empty($projects)) {
        $logger->error("Failed to export projects or no projects found");
        return [
            'success' => [],
            'error' => [],
            'total' => 0
        ];
    }
    
    $logger->info("Found " . count($projects) . " projects to migrate");
    
    // In incremental mode, filter only unmapped projects
    if ($mode === 'incremental') {
        $mappedIds = $mapper->getAllVipflatIds('projects');
        $projects = array_filter($projects, function($project) use ($mappedIds) {
            return !in_array($project['id'], $mappedIds);
        });
        
        $logger->info("After filtering, " . count($projects) . " new projects to migrate");
    }
    
    $fieldMapping = $config['field_mappings']['projects'];
    $batchSize = $config['batch_size'];
    $successCount = 0;
    $errorCount = 0;
    $success = [];
    $errors = [];
    
    // Process in batches
    $batches = array_chunk($projects, $batchSize);
    
    foreach ($batches as $batchIndex => $batch) {
        $logger->info("Processing batch " . ($batchIndex + 1) . " of " . count($batches));
        
        foreach ($batch as $project) {
            // Map fields
            $adeskData = [];
            foreach ($fieldMapping as $vipflatField => $adeskField) {
                if (isset($project[$vipflatField])) {
                    // Special handling for inverted boolean fields
                    if ($adeskField === 'is_archived' && $vipflatField === 'is_active') {
                        $adeskData[$adeskField] = !($project[$vipflatField] == 1 || $project[$vipflatField] === true || $project[$vipflatField] === 'true');
                    } else {
                        $adeskData[$adeskField] = $project[$vipflatField];
                    }
                }
            }
            
            // Ensure name is set
            if (!isset($adeskData['name']) || empty($adeskData['name'])) {
                if (isset($project['title'])) {
                    $adeskData['name'] = $project['title'];
                } else {
                    $adeskData['name'] = "Project {$project['id']}";
                }
            }
            
            if ($isTestMode) {
                // In test mode, simulate success without API calls
                $logger->info("TEST MODE: Would migrate project {$project['id']} ({$adeskData['name']})");
                $success[] = [
                    'vipflat_id' => $project['id'],
                    'adesk_id' => 'test_' . $project['id'],
                    'name' => $adeskData['name']
                ];
                // Do not persist mappings in test mode
                $successCount++;
                continue;
            }
            
            // Create project in Adesk
            $response = $adesk->createProject($adeskData);
            
            if ($response && isset($response['success']) && $response['success']) {
                $adeskId = $response['project']['id'];
                $mapper->addMapping('projects', $project['id'], $adeskId);
                $logger->info("Migrated project {$project['id']} ({$adeskData['name']}) to Adesk ID $adeskId");
                $success[] = [
                    'vipflat_id' => $project['id'],
                    'adesk_id' => $adeskId,
                    'name' => $adeskData['name']
                ];
                $successCount++;
            } else {
                $logger->error("Failed to migrate project {$project['id']} ({$adeskData['name']}): " . json_encode($response));
                $errors[] = [
                    'vipflat_id' => $project['id'],
                    'name' => $adeskData['name'],
                    'error' => $response ? json_encode($response) : 'API call failed'
                ];
                $errorCount++;
            }
        }
        
        // Sleep between batches to avoid rate limits
        if ($batchIndex < count($batches) - 1) {
            sleep($config['sleep_between_batches']);
        }
    }
    
    $logger->info("Project migration completed: $successCount successful, $errorCount failed");
    
    return [
        'success' => $success,
        'error' => $errors,
        'total' => count($projects)
    ];
}

/**
 * Migrate income transactions
 * 
 * @param string $entityType Entity type
 * @param AdeskApi $adesk Adesk API client
 * @param DataExporter $exporter Data exporter
 * @param IdMapper $mapper ID mapper
 * @param string $mode Migration mode ('full' or 'incremental')
 * @param string|null $startDate Start date filter
 * @param string|null $endDate End date filter
 * @param bool $isTestMode Whether to run in test mode
 * @param array $config Configuration array
 * @return array Migration results
 */
function migrateIncomeTransactions($entityType, $adesk, $exporter, $mapper, $mode, $startDate, $endDate, $isTestMode, $config) {
    global $logger;
    
    $logger->info("Starting migration of income transactions");
    
    // Apply date filters if specified
    $filters = [];
    if ($startDate) {
        $filters['operation_date'] = ['operator' => '>=', 'value' => $startDate];
    }
    if ($endDate) {
        if (isset($filters['operation_date'])) {
            // If start date is also specified, we need to handle this differently
            $filters['operation_date'] = [
                ['operator' => '>=', 'value' => $startDate],
                ['operator' => '<=', 'value' => $endDate]
            ];
        } else {
            $filters['operation_date'] = ['operator' => '<=', 'value' => $endDate];
        }
    }
    
    // Export transactions
    $transactions = $exporter->export('income_transactions', $filters);
    
    if ($transactions === false || empty($transactions)) {
        $logger->error("Failed to export income transactions or no transactions found");
        return [
            'success' => [],
            'error' => [],
            'total' => 0
        ];
    }
    
    $logger->info("Found " . count($transactions) . " income transactions to migrate");
    
    // In incremental mode, filter only unmapped transactions
    if ($mode === 'incremental') {
        $mappedIds = $mapper->getAllVipflatIds('income_transactions');
        $transactions = array_filter($transactions, function($transaction) use ($mappedIds) {
            return !in_array($transaction['id'], $mappedIds);
        });
        
        $logger->info("After filtering, " . count($transactions) . " new income transactions to migrate");
    }
    
    $fieldMapping = $config['field_mappings']['income_transactions'];
    $batchSize = $config['batch_size'];
    $successCount = 0;
    $errorCount = 0;
    $success = [];
    $errors = [];
    
    // Process in batches
    $batches = array_chunk($transactions, $batchSize);
    
    foreach ($batches as $batchIndex => $batch) {
        $logger->info("Processing batch " . ($batchIndex + 1) . " of " . count($batches));
        
        foreach ($batch as $transaction) {
            // Prepare related entity IDs
            $mappedIds = [];
            $requiredEntityMissing = false;
            
            // Map bank account ID (required)
            if (isset($transaction['accounts_id']) && !empty($transaction['accounts_id'])) {
                $mappedIds['bank_account'] = $mapper->getAdeskId('bank_accounts', $transaction['accounts_id']);
                if (!$mappedIds['bank_account'] && !$isTestMode) {
                    $logger->error("Cannot find mapped bank account for ID {$transaction['accounts_id']}");
                    $errors[] = [
                        'vipflat_id' => $transaction['id'],
                        'error' => "Missing bank account mapping for ID {$transaction['accounts_id']}"
                    ];
                    $errorCount++;
                    $requiredEntityMissing = true;
                    continue;
                }
            } else {
                // For empty accounts_id, check if a user ID is present and use their default account
                $userId = null;
                if (isset($transaction['user_to_id']) && !empty($transaction['user_to_id'])) {
                    $userId = $transaction['user_to_id'];
                } else if (isset($transaction['user_id']) && !empty($transaction['user_id'])) {
                    $userId = $transaction['user_id'];
                }

                if ($userId) {
                    $defaultAccountId = $mapper->getUserDefaultAccount($userId);
                    if ($defaultAccountId) {
                        $mappedIds['bank_account'] = $defaultAccountId;
                        $logger->info("Using default user account {$defaultAccountId} for transaction {$transaction['id']} with empty accounts_id");
                    } else {
                        $logger->error("Transaction {$transaction['id']} has empty accounts_id and no default account found for user {$userId}");
                        $errors[] = [
                            'vipflat_id' => $transaction['id'],
                            'error' => "Missing bank account ID and no default account found for user {$userId}"
                        ];
                        $errorCount++;
                        $requiredEntityMissing = true;
                        continue;
                    }
                } else {
                    $logger->error("Transaction {$transaction['id']} has no bank account ID and no user ID");
                    $errors[] = [
                        'vipflat_id' => $transaction['id'],
                        'error' => "Missing both bank account ID and user ID"
                    ];
                    $errorCount++;
                    $requiredEntityMissing = true;
                    continue;
                }
            }
            
            // Map category ID (optional)
            if (isset($transaction['target_id']) && !empty($transaction['target_id'])) {
                $mappedIds['category'] = $mapper->getAdeskId('categories', $transaction['target_id']);
                if (!$mappedIds['category'] && !$isTestMode) {
                    $logger->warning("Cannot find mapped category for ID {$transaction['target_id']}, will create transaction without category");
                }
            }
            
            // Map contractor ID (optional)
            if (isset($transaction['contacts_id']) && !empty($transaction['contacts_id'])) {
                $mappedIds['contractor'] = $mapper->getAdeskId('contractors', $transaction['contacts_id']);
                if (!$mappedIds['contractor'] && !$isTestMode) {
                    $logger->warning("Cannot find mapped contractor for ID {$transaction['contacts_id']}, will create transaction without contractor");
                }
            }
            
            // Map project ID (optional)
            if (isset($transaction['apartment_id']) && !empty($transaction['apartment_id'])) {
                $mappedIds['project'] = $mapper->getAdeskId('projects', $transaction['apartment_id']);
                if (!$mappedIds['project'] && !$isTestMode) {
                    $logger->warning("Cannot find mapped project for ID {$transaction['apartment_id']}, will create transaction without project");
                }
            }
            
            // Skip if any required entity is missing
            if ($requiredEntityMissing) {
                continue;
            }
            
            // Map fields
            $transactionType = normalizeTransactionType($transaction['type'] ?? null, 'income');
            $adeskData = [
                'type' => $transactionType,
            ];
            
            foreach ($fieldMapping as $vipflatField => $adeskField) {
                // Always allow mapped bank account fallback to flow through
                $hasValue = isset($transaction[$vipflatField]) && $transaction[$vipflatField] !== '';
                $isBankAccountField = $vipflatField === 'accounts_id';

                if ($hasValue || ($isBankAccountField && isset($mappedIds['bank_account']))) {
                    // Special handling for mapped entity IDs
                    if (in_array($vipflatField, ['accounts_id', 'target_id', 'contacts_id', 'apartment_id'])) {
                        $mappedField = str_replace('_id', '', $vipflatField);
                        $mappedField = str_replace('accounts', 'bank_account', $mappedField);
                        $mappedField = str_replace('apartment', 'project', $mappedField);
                        $mappedField = str_replace('target', 'category', $mappedField);
                        $mappedField = str_replace('contacts', 'contractor', $mappedField);
                        
                        if (isset($mappedIds[$mappedField]) || $isTestMode) {
                            $adeskData[$adeskField] = $isTestMode
                                ? 'test_' . ($transaction[$vipflatField] ?? $mappedIds[$mappedField])
                                : $mappedIds[$mappedField];
                        }
                    }
                    // Special handling for date fields
                    else if ($vipflatField === 'operation_date' && $adeskField === 'date') {
                        // Ensure date is in the format YYYY-MM-DD
                        $date = DateTime::createFromFormat('Y-m-d', $transaction[$vipflatField]);
                        if ($date) {
                            $adeskData[$adeskField] = $date->format('Y-m-d');
                        } else {
                            // Try to parse other date formats
                            $date = new DateTime($transaction[$vipflatField]);
                            $adeskData[$adeskField] = $date->format('Y-m-d');
                        }
                    }
                    // Special handling for type fields (refunds)
                    else if ($vipflatField === 'type' && $adeskField === 'type') {
                        $adeskData[$adeskField] = $transactionType;
                    }
                    // Special handling for related transactions (refunds)
                    else if ($vipflatField === 'doc_credit_id' && $adeskField === 'related_transaction') {
                        $relatedId = resolveRelatedTransactionId(
                            $mapper,
                            $logger,
                            'income_transactions',
                            $transaction[$vipflatField],
                            $isTestMode,
                            $transaction['id']
                        );
                        if ($relatedId !== null) {
                            $adeskData[$adeskField] = $relatedId;
                        }
                    }
                    // Special handling for is_not_stat (mapped to is_owner_transfer)
                    else if ($vipflatField === 'is_not_stat' && $adeskField === 'is_owner_transfer') {
                        $adeskData[$adeskField] = ($transaction[$vipflatField] == 1 || $transaction[$vipflatField] === true || $transaction[$vipflatField] === 'true');
                    }
                    // Direct mapping for other fields
                    else if (!in_array($vipflatField, ['type', 'doc_credit_id'])) {
                        $adeskData[$adeskField] = $transaction[$vipflatField];
                    }
                }
            }
            
            // Add description if missing
            if (!isset($adeskData['description']) || empty($adeskData['description'])) {
                $adeskData['description'] = "Income transaction #{$transaction['id']}";
            }
            
            if ($isTestMode) {
                // In test mode, simulate success without API calls
                $logger->info("TEST MODE: Would migrate income transaction {$transaction['id']} (amount: {$transaction['amount']})");
                $success[] = [
                    'vipflat_id' => $transaction['id'],
                    'adesk_id' => 'test_' . $transaction['id'],
                    'amount' => $transaction['amount']
                ];
                // Do not persist mappings in test mode
                $successCount++;
                continue;
            }
            
            // Create transaction in Adesk
            $response = $adesk->createTransaction($adeskData);
            
            if ($response && isset($response['success']) && $response['success']) {
                $adeskId = $response['transaction']['id'];
                $mapper->addMapping('income_transactions', $transaction['id'], $adeskId);
                $logger->info("Migrated income transaction {$transaction['id']} (amount: {$transaction['amount']}) to Adesk ID $adeskId");
                $success[] = [
                    'vipflat_id' => $transaction['id'],
                    'adesk_id' => $adeskId,
                    'amount' => $transaction['amount']
                ];
                $successCount++;
            } else {
                $logger->error("Failed to migrate income transaction {$transaction['id']} (amount: {$transaction['amount']}): " . json_encode($response));
                $errors[] = [
                    'vipflat_id' => $transaction['id'],
                    'amount' => $transaction['amount'],
                    'error' => $response ? json_encode($response) : 'API call failed'
                ];
                $errorCount++;
            }
        }
        
        // Sleep between batches to avoid rate limits
        if ($batchIndex < count($batches) - 1) {
            sleep($config['sleep_between_batches']);
        }
    }
    
    $logger->info("Income transaction migration completed: $successCount successful, $errorCount failed");
    
    return [
        'success' => $success,
        'error' => $errors,
        'total' => count($transactions)
    ];
}

/**
 * Migrate expense transactions
 * 
 * @param string $entityType Entity type
 * @param AdeskApi $adesk Adesk API client
 * @param DataExporter $exporter Data exporter
 * @param IdMapper $mapper ID mapper
 * @param string $mode Migration mode ('full' or 'incremental')
 * @param string|null $startDate Start date filter
 * @param string|null $endDate End date filter
 * @param bool $isTestMode Whether to run in test mode
 * @param array $config Configuration array
 * @return array Migration results
 */
function migrateExpenseTransactions($entityType, $adesk, $exporter, $mapper, $mode, $startDate, $endDate, $isTestMode, $config) {
    global $logger;
    
    $logger->info("Starting migration of expense transactions");
    
    // Apply date filters if specified
    $filters = [];
    if ($startDate) {
        $filters['operation_date'] = ['operator' => '>=', 'value' => $startDate];
    }
    if ($endDate) {
        if (isset($filters['operation_date'])) {
            // If start date is also specified, we need to handle this differently
            $filters['operation_date'] = [
                ['operator' => '>=', 'value' => $startDate],
                ['operator' => '<=', 'value' => $endDate]
            ];
        } else {
            $filters['operation_date'] = ['operator' => '<=', 'value' => $endDate];
        }
    }
    
    // Export transactions
    $transactions = $exporter->export('expense_transactions', $filters);
    
    if ($transactions === false || empty($transactions)) {
        $logger->error("Failed to export expense transactions or no transactions found");
        return [
            'success' => [],
            'error' => [],
            'total' => 0
        ];
    }
    
    $logger->info("Found " . count($transactions) . " expense transactions to migrate");
    
    // In incremental mode, filter only unmapped transactions
    if ($mode === 'incremental') {
        $mappedIds = $mapper->getAllVipflatIds('expense_transactions');
        $transactions = array_filter($transactions, function($transaction) use ($mappedIds) {
            return !in_array($transaction['id'], $mappedIds);
        });
        
        $logger->info("After filtering, " . count($transactions) . " new expense transactions to migrate");
    }
    
    $fieldMapping = $config['field_mappings']['expense_transactions'];
    $batchSize = $config['batch_size'];
    $successCount = 0;
    $errorCount = 0;
    $success = [];
    $errors = [];
    
    // Process in batches
    $batches = array_chunk($transactions, $batchSize);
    
    foreach ($batches as $batchIndex => $batch) {
        $logger->info("Processing batch " . ($batchIndex + 1) . " of " . count($batches));
        
        foreach ($batch as $transaction) {
            // Prepare related entity IDs
            $mappedIds = [];
            $requiredEntityMissing = false;
            
            // Map bank account ID (required)
            if (isset($transaction['accounts_id']) && !empty($transaction['accounts_id'])) {
                $mappedIds['bank_account'] = $mapper->getAdeskId('bank_accounts', $transaction['accounts_id']);
                if (!$mappedIds['bank_account'] && !$isTestMode) {
                    $logger->error("Cannot find mapped bank account for ID {$transaction['accounts_id']}");
                    $errors[] = [
                        'vipflat_id' => $transaction['id'],
                        'error' => "Missing bank account mapping for ID {$transaction['accounts_id']}"
                    ];
                    $errorCount++;
                    $requiredEntityMissing = true;
                    continue;
                }
            } else {
                // For empty accounts_id, check if a user ID is present and use their default account
                $userId = null;
                if (isset($transaction['user_from_id']) && !empty($transaction['user_from_id'])) {
                    $userId = $transaction['user_from_id'];
                } else if (isset($transaction['user_id']) && !empty($transaction['user_id'])) {
                    $userId = $transaction['user_id'];
                }

                if ($userId) {
                    $defaultAccountId = $mapper->getUserDefaultAccount($userId);
                    if ($defaultAccountId) {
                        $mappedIds['bank_account'] = $defaultAccountId;
                        $logger->info("Using default user account {$defaultAccountId} for transaction {$transaction['id']} with empty accounts_id");
                    } else {
                        $logger->error("Transaction {$transaction['id']} has empty accounts_id and no default account found for user {$userId}");
                        $errors[] = [
                            'vipflat_id' => $transaction['id'],
                            'error' => "Missing bank account ID and no default account found for user {$userId}"
                        ];
                        $errorCount++;
                        $requiredEntityMissing = true;
                        continue;
                    }
                } else {
                    $logger->error("Transaction {$transaction['id']} has no bank account ID and no user ID");
                    $errors[] = [
                        'vipflat_id' => $transaction['id'],
                        'error' => "Missing both bank account ID and user ID"
                    ];
                    $errorCount++;
                    $requiredEntityMissing = true;
                    continue;
                }
            }
            
            // Map category ID (optional)
            if (isset($transaction['target_id']) && !empty($transaction['target_id'])) {
                $mappedIds['category'] = $mapper->getAdeskId('categories', $transaction['target_id']);
                if (!$mappedIds['category'] && !$isTestMode) {
                    $logger->warning("Cannot find mapped category for ID {$transaction['target_id']}, will create transaction without category");
                }
            }
            
            // Map contractor ID (optional)
            if (isset($transaction['contacts_id']) && !empty($transaction['contacts_id'])) {
                $mappedIds['contractor'] = $mapper->getAdeskId('contractors', $transaction['contacts_id']);
                if (!$mappedIds['contractor'] && !$isTestMode) {
                    $logger->warning("Cannot find mapped contractor for ID {$transaction['contacts_id']}, will create transaction without contractor");
                }
            }
            
            // Map project ID (optional)
            if (isset($transaction['apartment_id']) && !empty($transaction['apartment_id'])) {
                $mappedIds['project'] = $mapper->getAdeskId('projects', $transaction['apartment_id']);
                if (!$mappedIds['project'] && !$isTestMode) {
                    $logger->warning("Cannot find mapped project for ID {$transaction['apartment_id']}, will create transaction without project");
                }
            }
            
            // Skip if any required entity is missing
            if ($requiredEntityMissing) {
                continue;
            }
            
            // Map fields
            $transactionType = normalizeTransactionType($transaction['type'] ?? null, 'outcome');
            $adeskData = [
                'type' => $transactionType,
            ];
            
            foreach ($fieldMapping as $vipflatField => $adeskField) {
                // Always allow mapped bank account fallback to flow through
                $hasValue = isset($transaction[$vipflatField]) && $transaction[$vipflatField] !== '';
                $isBankAccountField = $vipflatField === 'accounts_id';

                if ($hasValue || ($isBankAccountField && isset($mappedIds['bank_account']))) {
                    // Special handling for mapped entity IDs
                    if (in_array($vipflatField, ['accounts_id', 'target_id', 'contacts_id', 'apartment_id'])) {
                        $mappedField = str_replace('_id', '', $vipflatField);
                        $mappedField = str_replace('accounts', 'bank_account', $mappedField);
                        $mappedField = str_replace('apartment', 'project', $mappedField);
                        $mappedField = str_replace('target', 'category', $mappedField);
                        $mappedField = str_replace('contacts', 'contractor', $mappedField);
                        
                        if (isset($mappedIds[$mappedField]) || $isTestMode) {
                            $adeskData[$adeskField] = $isTestMode
                                ? 'test_' . ($transaction[$vipflatField] ?? $mappedIds[$mappedField])
                                : $mappedIds[$mappedField];
                        }
                    }
                    // Special handling for date fields
                    else if ($vipflatField === 'operation_date' && $adeskField === 'date') {
                        // Ensure date is in the format YYYY-MM-DD
                        $date = DateTime::createFromFormat('Y-m-d', $transaction[$vipflatField]);
                        if ($date) {
                            $adeskData[$adeskField] = $date->format('Y-m-d');
                        } else {
                            // Try to parse other date formats
                            $date = new DateTime($transaction[$vipflatField]);
                            $adeskData[$adeskField] = $date->format('Y-m-d');
                        }
                    }
                    // Special handling for type fields (refunds)
                    else if ($vipflatField === 'type' && $adeskField === 'type') {
                        $adeskData[$adeskField] = $transactionType;
                    }
                    // Special handling for related transactions (refunds)
                    else if ($vipflatField === 'doc_debet_id' && $adeskField === 'related_transaction') {
                        $relatedId = resolveRelatedTransactionId(
                            $mapper,
                            $logger,
                            'expense_transactions',
                            $transaction[$vipflatField],
                            $isTestMode,
                            $transaction['id']
                        );
                        if ($relatedId !== null) {
                            $adeskData[$adeskField] = $relatedId;
                        }
                    }
                    // Special handling for is_not_stat (mapped to is_owner_transfer)
                    else if ($vipflatField === 'is_not_stat' && $adeskField === 'is_owner_transfer') {
                        $adeskData[$adeskField] = ($transaction[$vipflatField] == 1 || $transaction[$vipflatField] === true || $transaction[$vipflatField] === 'true');
                    }
                    // Special handling for is_only_calc (mapped to is_planned)
                    else if ($vipflatField === 'is_only_calc' && $adeskField === 'is_planned') {
                        $adeskData[$adeskField] = ($transaction[$vipflatField] == 1 || $transaction[$vipflatField] === true || $transaction[$vipflatField] === 'true');
                    }
                    // Direct mapping for other fields
                    else if (!in_array($vipflatField, ['type', 'doc_debet_id'])) {
                        $adeskData[$adeskField] = $transaction[$vipflatField];
                    }
                }
            }
            
            // Add description if missing
            if (!isset($adeskData['description']) || empty($adeskData['description'])) {
                $adeskData['description'] = "Expense transaction #{$transaction['id']}";
            }
            
            if ($isTestMode) {
                // In test mode, simulate success without API calls
                $logger->info("TEST MODE: Would migrate expense transaction {$transaction['id']} (amount: {$transaction['amount']})");
                $success[] = [
                    'vipflat_id' => $transaction['id'],
                    'adesk_id' => 'test_' . $transaction['id'],
                    'amount' => $transaction['amount']
                ];
                // Do not persist mappings in test mode
                $successCount++;
                continue;
            }
            
            // Create transaction in Adesk
            $response = $adesk->createTransaction($adeskData);
            
            if ($response && isset($response['success']) && $response['success']) {
                $adeskId = $response['transaction']['id'];
                $mapper->addMapping('expense_transactions', $transaction['id'], $adeskId);
                $logger->info("Migrated expense transaction {$transaction['id']} (amount: {$transaction['amount']}) to Adesk ID $adeskId");
                $success[] = [
                    'vipflat_id' => $transaction['id'],
                    'adesk_id' => $adeskId,
                    'amount' => $transaction['amount']
                ];
                $successCount++;
            } else {
                $logger->error("Failed to migrate expense transaction {$transaction['id']} (amount: {$transaction['amount']}): " . json_encode($response));
                $errors[] = [
                    'vipflat_id' => $transaction['id'],
                    'amount' => $transaction['amount'],
                    'error' => $response ? json_encode($response) : 'API call failed'
                ];
                $errorCount++;
            }
        }
        
        // Sleep between batches to avoid rate limits
        if ($batchIndex < count($batches) - 1) {
            sleep($config['sleep_between_batches']);
        }
    }
    
    $logger->info("Expense transaction migration completed: $successCount successful, $errorCount failed");
    
    return [
        'success' => $success,
        'error' => $errors,
        'total' => count($transactions)
    ];
}

/**
 * Migrate users and create default cash accounts for them
 * 
 * @param string $entityType Entity type
 * @param AdeskApi $adesk Adesk API client
 * @param DataExporter $exporter Data exporter
 * @param IdMapper $mapper ID mapper
 * @param string $mode Migration mode ('full' or 'incremental')
 * @param string|null $startDate Start date filter
 * @param string|null $endDate End date filter
 * @param bool $isTestMode Whether to run in test mode
 * @param array $config Configuration array
 * @return array Migration results
 */
function migrateUsers($entityType, $adesk, $exporter, $mapper, $mode, $startDate, $endDate, $isTestMode, $config) {
    global $logger;
    
    $logger->info("Starting migration of users and creating default cash accounts");
    
    // Export users
    $users = $exporter->export('users');
    
    if ($users === false || empty($users)) {
        $logger->error("Failed to export users or no users found");
        return [
            'success' => [],
            'error' => [],
            'total' => 0
        ];
    }
    
    $logger->info("Found " . count($users) . " users to process");
    
    // In incremental mode, filter only unmapped users
    if ($mode === 'incremental') {
        $mappedUserIds = $mapper->getAllVipflatIds('user_accounts');
        $users = array_filter($users, function($user) use ($mappedUserIds) {
            return !in_array($user['id'], $mappedUserIds);
        });
        
        $logger->info("After filtering, " . count($users) . " new users to process");
    }
    
    $batchSize = $config['batch_size'];
    $successCount = 0;
    $errorCount = 0;
    $success = [];
    $errors = [];
    
    // Process users in batches
    $batches = array_chunk($users, $batchSize);
    
    foreach ($batches as $batchIndex => $batch) {
        $logger->info("Processing batch " . ($batchIndex + 1) . " of " . count($batches));
        
        foreach ($batch as $user) {
            // Prepare user full name for account naming
            $fullName = '';
            
            // Combine name parts in the format "lastname firstname middlename"
            if (!empty($user['name'])) {
                $fullName .= $user['name'] . ' ';
            }
            if (!empty($user['surname'])) {
                $fullName .= $user['surname'] . ' ';
            }
            if (!empty($user['lastname'])) {
                $fullName .= $user['lastname'];
            }
            
            $fullName = trim($fullName);
            
            // If the name is empty, use an ID-based name
            if (empty($fullName)) {
                $fullName = "User {$user['id']}";
            }
            
            // Create default cash account name for the user according to the format "Account <FYO>"
            $accountName = "Account {$fullName}";
            
            // Prepare account data for Adesk API
            $accountData = [
                'name' => $accountName,
                'type' => 1, // 1 means cash account type
                'currency' => 'RUR', // Default currency
                // Try to get default legal entity from API
                'legal_entity' => $adesk->getDefaultLegalEntityId() ?: (isset($config['legal_entity_id']) ? $config['legal_entity_id'] : null)
            ];
            
            // Remove null values from the account data (not needed now but kept for future use)
            $accountData = array_filter($accountData, function($value) {
                return $value !== null;
            });
            
            if ($isTestMode) {
                // In test mode, simulate success without API calls
                $logger->info("TEST MODE: Would create default cash account for user {$user['id']} ({$fullName})");
                $accountId = 'test_account_' . $user['id'];
                $success[] = [
                    'user_id' => $user['id'],
                    'account_id' => $accountId,
                    'account_name' => $accountName,
                    'user_name' => $fullName
                ];
                $successCount++;
                continue;
            }
            
            // Create bank account in Adesk API
            $response = $adesk->createBankAccount($accountData);
            
            if ($response && isset($response['success']) && $response['success']) {
                $accountId = $response['bankAccount']['id'];
                
                // Save mapping between user and their default account
                $mapper->addUserAccountMapping($user['id'], $accountId, [
                    'name' => $accountName,
                    'user_name' => $fullName
                ]);
                
                $logger->info("Created default cash account for user {$user['id']} ({$fullName}) with Adesk ID $accountId");
                $success[] = [
                    'user_id' => $user['id'],
                    'account_id' => $accountId,
                    'account_name' => $accountName,
                    'user_name' => $fullName
                ];
                $successCount++;
            } else {
                $logger->error("Failed to create default cash account for user {$user['id']} ({$fullName}): " . json_encode($response));
                $errors[] = [
                    'user_id' => $user['id'],
                    'user_name' => $fullName,
                    'error' => $response ? json_encode($response) : 'API call failed'
                ];
                $errorCount++;
            }
        }
        
        // Sleep between batches to avoid rate limits
        if ($batchIndex < count($batches) - 1) {
            sleep($config['sleep_between_batches']);
        }
    }
    
    $logger->info("User migration completed: $successCount successful, $errorCount failed");
    
    return [
        'success' => $success,
        'error' => $errors,
        'total' => count($users)
    ];
}

/**
 * Migrate transfer transactions
 * 
 * @param string $entityType Entity type
 * @param AdeskApi $adesk Adesk API client
 * @param DataExporter $exporter Data exporter
 * @param IdMapper $mapper ID mapper
 * @param string $mode Migration mode ('full' or 'incremental')
 * @param string|null $startDate Start date filter
 * @param string|null $endDate End date filter
 * @param bool $isTestMode Whether to run in test mode
 * @param array $config Configuration array
 * @return array Migration results
 */
function migrateTransfers($entityType, $adesk, $exporter, $mapper, $mode, $startDate, $endDate, $isTestMode, $config) {
    global $logger;
    
    $logger->info("Starting migration of transfers");
    
    // Apply date filters if specified
    $filters = [];
    if ($startDate) {
        $filters['dtdoc'] = ['operator' => '>=', 'value' => $startDate];
    }
    if ($endDate) {
        if (isset($filters['dtdoc'])) {
            // If start date is also specified, we need to handle this differently
            $filters['dtdoc'] = [
                ['operator' => '>=', 'value' => $startDate],
                ['operator' => '<=', 'value' => $endDate]
            ];
        } else {
            $filters['dtdoc'] = ['operator' => '<=', 'value' => $endDate];
        }
    }
    
    // Export transfers
    $transfers = $exporter->export('transfers', $filters);
    
    if ($transfers === false || empty($transfers)) {
        $logger->error("Failed to export transfers or no transfers found");
        return [
            'success' => [],
            'error' => [],
            'total' => 0
        ];
    }
    
    $logger->info("Found " . count($transfers) . " transfers to migrate");
    
    // In incremental mode, filter only unmapped transfers
    if ($mode === 'incremental') {
        $mappedIds = $mapper->getAllVipflatIds('transfers');
        $transfers = array_filter($transfers, function($transfer) use ($mappedIds) {
            return !in_array($transfer['id'], $mappedIds);
        });
        
        $logger->info("After filtering, " . count($transfers) . " new transfers to migrate");
    }
    
    $fieldMapping = $config['field_mappings']['transfers'];
    $batchSize = $config['batch_size'];
    $successCount = 0;
    $errorCount = 0;
    $success = [];
    $errors = [];
    
    // Process in batches
    $batches = array_chunk($transfers, $batchSize);
    
    foreach ($batches as $batchIndex => $batch) {
        $logger->info("Processing batch " . ($batchIndex + 1) . " of " . count($batches));
        
        foreach ($batch as $transfer) {
            // Map source account (required)
            $fromAccountId = null;
            if (isset($transfer['accounts_from_id']) && !empty($transfer['accounts_from_id'])) {
                $fromAccountId = $mapper->getAdeskId('bank_accounts', $transfer['accounts_from_id']);
                if (!$fromAccountId && !$isTestMode) {
                    $logger->error("Cannot find mapped source account for ID {$transfer['accounts_from_id']}");
                    $errors[] = [
                        'vipflat_id' => $transfer['id'],
                        'error' => "Missing source account mapping for ID {$transfer['accounts_from_id']}"
                    ];
                    $errorCount++;
                    continue;
                }
            } else {
                // For empty accounts_from_id, check if a user ID is present
                $userFromId = null;
                if (isset($transfer['user_from_id']) && !empty($transfer['user_from_id'])) {
                    $userFromId = $transfer['user_from_id'];
                } else if (isset($transfer['user_id']) && !empty($transfer['user_id'])) {
                    $userFromId = $transfer['user_id'];
                }

                if ($userFromId) {
                    $defaultAccountId = $mapper->getUserDefaultAccount($userFromId);
                    if ($defaultAccountId) {
                        $fromAccountId = $defaultAccountId;
                        $logger->info("Using default user account {$defaultAccountId} for transfer {$transfer['id']} source with empty accounts_from_id");
                    } else {
                        $logger->error("Transfer {$transfer['id']} has empty accounts_from_id and no default account found for user {$userFromId}");
                        $errors[] = [
                            'vipflat_id' => $transfer['id'],
                            'error' => "Missing source account ID and no default account found for user {$userFromId}"
                        ];
                        $errorCount++;
                        continue;
                    }
                } else {
                    $logger->error("Transfer {$transfer['id']} has no source account ID and no user ID");
                    $errors[] = [
                        'vipflat_id' => $transfer['id'],
                        'error' => "Missing both source account ID and user ID"
                    ];
                    $errorCount++;
                    continue;
                }
            }
            
            // Map destination account (required)
            $toAccountId = null;
            if (isset($transfer['accounts_to_id']) && !empty($transfer['accounts_to_id'])) {
                $toAccountId = $mapper->getAdeskId('bank_accounts', $transfer['accounts_to_id']);
                if (!$toAccountId && !$isTestMode) {
                    $logger->error("Cannot find mapped destination account for ID {$transfer['accounts_to_id']}");
                    $errors[] = [
                        'vipflat_id' => $transfer['id'],
                        'error' => "Missing destination account mapping for ID {$transfer['accounts_to_id']}"
                    ];
                    $errorCount++;
                    continue;
                }
            } else {
                // For empty accounts_to_id, check if a user ID is present
                $userToId = null;
                if (isset($transfer['user_to_id']) && !empty($transfer['user_to_id'])) {
                    $userToId = $transfer['user_to_id'];
                } else if (isset($transfer['user_id']) && !empty($transfer['user_id'])) {
                    $userToId = $transfer['user_id'];
                }

                if ($userToId) {
                    $defaultAccountId = $mapper->getUserDefaultAccount($userToId);
                    if ($defaultAccountId) {
                        $toAccountId = $defaultAccountId;
                        $logger->info("Using default user account {$defaultAccountId} for transfer {$transfer['id']} destination with empty accounts_to_id");
                    } else {
                        $logger->error("Transfer {$transfer['id']} has empty accounts_to_id and no default account found for user {$userToId}");
                        $errors[] = [
                            'vipflat_id' => $transfer['id'],
                            'error' => "Missing destination account ID and no default account found for user {$userToId}"
                        ];
                        $errorCount++;
                        continue;
                    }
                } else {
                    $logger->error("Transfer {$transfer['id']} has no destination account ID and no user ID");
                    $errors[] = [
                        'vipflat_id' => $transfer['id'],
                        'error' => "Missing both destination account ID and user ID"
                    ];
                    $errorCount++;
                    continue;
                }
            }
            
            // Map fields
            $adeskData = [];
            
            // Map date
            if (isset($transfer['dtdoc'])) {
                // Ensure date is in the format YYYY-MM-DD
                $date = DateTime::createFromFormat('Y-m-d', $transfer['dtdoc']);
                if ($date) {
                    $adeskData['date'] = $date->format('Y-m-d');
                } else {
                    // Try to parse other date formats
                    $date = new DateTime($transfer['dtdoc']);
                    $adeskData['date'] = $date->format('Y-m-d');
                }
            } else {
                // Default to current date if not provided
                $adeskData['date'] = date('Y-m-d');
            }
            
            // Map amount
            if (isset($transfer['amount_from'])) {
                $adeskData['amount'] = $transfer['amount_from'];
            } else {
                $logger->error("Transfer {$transfer['id']} has no amount");
                $errors[] = [
                    'vipflat_id' => $transfer['id'],
                    'error' => "Missing amount"
                ];
                $errorCount++;
                continue;
            }
            
            // Map source and destination accounts
            $adeskData['from_bank_account'] = $isTestMode ? 'test_' . $transfer['accounts_from_id'] : $fromAccountId;
            $adeskData['to_bank_account'] = $isTestMode ? 'test_' . $transfer['accounts_to_id'] : $toAccountId;
            
            // Map description
            if (isset($transfer['comment']) && !empty($transfer['comment'])) {
                $adeskData['description'] = $transfer['comment'];
            } else {
                $adeskData['description'] = "Transfer #{$transfer['id']}";
            }
            
            // Map destination amount if different (for currency conversions)
            if (isset($transfer['amount_to']) && $transfer['amount_to'] != $transfer['amount_from']) {
                $adeskData['amount_to'] = $transfer['amount_to'];
            }
            
            // Map is_planned flag
            if (isset($transfer['is_only_calc']) && ($transfer['is_only_calc'] == 1 || $transfer['is_only_calc'] === true || $transfer['is_only_calc'] === 'true')) {
                $adeskData['is_planned'] = true;
            }
            
            if ($isTestMode) {
                // In test mode, simulate success without API calls
                $logger->info("TEST MODE: Would migrate transfer {$transfer['id']} (amount: {$transfer['amount_from']})");
                $success[] = [
                    'vipflat_id' => $transfer['id'],
                    'adesk_id' => 'test_' . $transfer['id'],
                    'amount' => $transfer['amount_from']
                ];
                // Do not persist mappings in test mode
                $successCount++;
                continue;
            }
            
            // Create transfer in Adesk
            $response = $adesk->createTransfer($adeskData);
            
            if ($response && isset($response['success']) && $response['success']) {
                $adeskId = $response['transfer']['id'] ?? ($response['id'] ?? null);
                if ($adeskId) {
                    $mapper->addMapping('transfers', $transfer['id'], $adeskId);
                    $logger->info("Migrated transfer {$transfer['id']} (amount: {$transfer['amount_from']}) to Adesk ID $adeskId");
                    $success[] = [
                        'vipflat_id' => $transfer['id'],
                        'adesk_id' => $adeskId,
                        'amount' => $transfer['amount_from']
                    ];
                    $successCount++;
                } else {
                    $logger->warning("Transfer created but no ID returned for transfer {$transfer['id']}");
                    $success[] = [
                        'vipflat_id' => $transfer['id'],
                        'adesk_id' => 'unknown',
                        'amount' => $transfer['amount_from']
                    ];
                    $successCount++;
                }
            } else {
                $logger->error("Failed to migrate transfer {$transfer['id']} (amount: {$transfer['amount_from']}): " . json_encode($response));
                $errors[] = [
                    'vipflat_id' => $transfer['id'],
                    'amount' => $transfer['amount_from'],
                    'error' => $response ? json_encode($response) : 'API call failed'
                ];
                $errorCount++;
            }
        }
        
        // Sleep between batches to avoid rate limits
        if ($batchIndex < count($batches) - 1) {
            sleep($config['sleep_between_batches']);
        }
    }
    
    $logger->info("Transfer migration completed: $successCount successful, $errorCount failed");
    
    return [
        'success' => $success,
        'error' => $errors,
        'total' => count($transfers)
    ];
}
