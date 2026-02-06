<?php
/**
 * VIPFLAT to Adesk Migration Tool - Configuration File
 * 
 * This file contains all the configuration settings for the migration tool.
 */

// Load environment variables from .env file
if (file_exists(__DIR__ . '/.env')) {
    $envFile = file_get_contents(__DIR__ . '/.env');
    $lines = explode("\n", $envFile);
    foreach ($lines as $line) {
        $line = trim($line);
        if (empty($line) || strpos($line, '#') === 0) {
            continue;
        }
        
        list($key, $value) = explode('=', $line, 2);
        $key = trim($key);
        $value = trim($value);
        
        // Remove quotes if present
        if (strpos($value, '"') === 0 && strrpos($value, '"') === strlen($value) - 1) {
            $value = substr($value, 1, -1);
        } elseif (strpos($value, "'") === 0 && strrpos($value, "'") === strlen($value) - 1) {
            $value = substr($value, 1, -1);
        }
        
        putenv("$key=$value");
        $_ENV[$key] = $value;
    }
}

// Basic API configuration
$config = [
    'adesk_api_url' => getenv('ADESK_API_URL') ?: 'https://api.adesk.ru',
    'adesk_api_token' => getenv('ADESK_API_TOKEN') ?: '',
    'adesk_api_version' => getenv('ADESK_API_VERSION') ?: 'v1',
    
    // Database connection settings (if using direct export)
    'db_host' => getenv('DB_HOST') ?: 'localhost',
    'db_name' => getenv('DB_NAME') ?: 'vipflat',
    'db_user' => getenv('DB_USER') ?: 'root',
    'db_pass' => getenv('DB_PASS') ?: '',
    
    // Data directories
    'data_dir' => __DIR__ . '/newfiles/',
    'logs_dir' => __DIR__ . '/logs/',
    'mappings_dir' => __DIR__ . '/data/mappings/',
    
    // CSV files (relative to data_dir)
    'csv_files' => [
        'contractors' => 'contacts.csv',
        'bank_accounts' => 'accounts.csv',
        'projects' => 'apartments.csv',
        'categories' => 'target.csv',
        'income_transactions' => 'debet.csv',
        'expense_transactions' => 'credit.csv',
        'transfers' => 'moving.csv',
        'currencies' => 'currency.csv',
        'users' => 'user_account.csv',
    ],
    
    // Migration settings
    'batch_size' => getenv('BATCH_SIZE') ? (int)getenv('BATCH_SIZE') : 100, // Number of items to process in a batch
    'sleep_between_batches' => getenv('SLEEP_BETWEEN_BATCHES') ? (int)getenv('SLEEP_BETWEEN_BATCHES') : 1, // Sleep seconds between batches to avoid rate limits
    'retry_attempts' => getenv('RETRY_ATTEMPTS') ? (int)getenv('RETRY_ATTEMPTS') : 3, // Number of retry attempts for failed API calls
    'retry_delay' => getenv('RETRY_DELAY') ? (int)getenv('RETRY_DELAY') : 5, // Seconds to wait between retry attempts
    'legal_entity_id' => getenv('LEGAL_ENTITY_ID') ? (int)getenv('LEGAL_ENTITY_ID') : null, // Legal entity ID for account creation
    
    // Logging settings
    'log_level' => getenv('LOG_LEVEL') ?: 'info', // debug, info, warning, error
    'log_file_format' => 'Y-m-d', // Date format for log files
    
    // Field mappings
    'field_mappings' => [
        'contractors' => [
            'id' => 'id',
            'company_name' => 'name',
            'given_name' => 'contact_person',
            'surname' => 'contact_person',
            'middle_name' => 'contact_person',
            'phone_number' => 'phone_number',
            'email' => 'email',
            'job_title' => 'description',
        ],
        'bank_accounts' => [
            'id' => 'id',
            'name' => 'name',
            'account_payment' => 'number',
            'account_bik' => 'bank_code',
            'currency' => 'currency',
            'type' => 'type', // 1 for cash, 2 for bank
            'initial_amount' => 'initial_amount',
            'initial_amount_date' => 'initial_amount_date',
        ],
        'projects' => [
            'id' => 'id',
            'title' => 'name',
            'description' => 'description',
            'is_active' => 'is_archived', // Note: inverted (is_active = !is_archived)
            'budget_income' => 'plan_income',
            'budget_expense' => 'plan_outcome',
        ],
        'categories' => [
            'id' => 'id',
            'name' => 'name',
            'parent_id' => 'parent_id',
            'operation_type' => 'type', // Need to map: "Приход" -> 1, "Расход" -> 2
            'kind' => 'kind', // 1 - operational, 2 - investment, 3 - financial
            'is_owner_transfer' => 'is_owner_transfer',
        ],
        'income_transactions' => [
            'id' => 'id',
            'type' => 'type', // "Приход" -> 'income', "Возврат прихода" -> special handling
            'amount' => 'amount',
            'operation_date' => 'date', // Format: Y-m-d
            'comment' => 'description',
            'target_id' => 'category',
            'apartment_id' => 'project',
            'accounts_id' => 'bank_account',
            'contacts_id' => 'contractor',
            'is_not_stat' => 'is_owner_transfer',
            'doc_credit_id' => 'related_transaction', // For refunds
        ],
        'expense_transactions' => [
            'id' => 'id',
            'type' => 'type', // "Расход" -> 'outcome', "Возврат расхода" -> special handling
            'amount' => 'amount',
            'operation_date' => 'date', // Format: Y-m-d
            'comment' => 'description',
            'target_id' => 'category',
            'apartment_id' => 'project',
            'accounts_id' => 'bank_account',
            'contacts_id' => 'contractor',
            'is_not_stat' => 'is_owner_transfer',
            'is_only_calc' => 'is_planned',
            'doc_debet_id' => 'related_transaction', // For refunds
        ],
        'transfers' => [
            'id' => 'id',
            'dtdoc' => 'date', // Format: Y-m-d
            'amount_from' => 'amount',
            'accounts_from_id' => 'from_bank_account',
            'accounts_to_id' => 'to_bank_account',
            'comment' => 'description',
            'is_only_calc' => 'is_planned',
        ],
        'users' => [
            'id' => 'id',
            'surname' => 'lastname',
            'name' => 'firstname',
            'lastname' => 'middlename',
            'contacts_id' => 'contacts_id',
            'inn' => 'inn',
            'created_at' => 'created_at',
            'updated_at' => 'updated_at',
        ],
        'user_accounts' => [
            'id' => 'id',
            'name' => 'name',
            'type' => 'type', // 1 for cash (default for user accounts)
            'currency' => 'currency',
            'user_id' => 'user_id',
        ],
    ],
    
    // Currency mapping
    'currency_mapping' => [
        'RUB' => 'RUR',
        'USD' => 'USD',
        'EUR' => 'EUR',
        'KZT' => 'KZT',
        'UAH' => 'UAH',
        'GBP' => 'GBP',
        'BYN' => 'BYN',
    ],
    
    // Operation type mapping
    'operation_type_mapping' => [
        'Приход' => 1, // Income
        'Расход' => 2, // Expense
    ],
];

// Create required directories if they don't exist
foreach ([$config['data_dir'], $config['logs_dir'], $config['mappings_dir']] as $dir) {
    if (!file_exists($dir)) {
        mkdir($dir, 0777, true);
    }
}

return $config;