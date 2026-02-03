<?php
/**
 * VIPFLAT to Adesk Migration Tool - Data Exporter Class
 * 
 * This class handles exporting data from CSV files or directly from the database.
 * 
 * File: classes/DataExporter.php
 */
class DataExporter {
    private $dataDir;
    private $logger;
    private $config;
    private $dbConnection = null;
    
    /**
     * Constructor
     * 
     * @param string $dataDir Directory containing data files
     * @param array $config Configuration array
     * @param Logger $logger Logger instance
     */
    public function __construct($dataDir, $config, $logger = null) {
        $this->dataDir = rtrim($dataDir, '/') . '/';
        $this->config = $config;
        $this->logger = $logger;
        
        // Ensure directory exists
        if (!file_exists($this->dataDir)) {
            mkdir($this->dataDir, 0777, true);
        }
    }
    
    /**
     * Export data from a CSV file
     * 
     * @param string $entityType The entity type (corresponds to a CSV file)
     * @param array $filters Optional filters to apply to the data
     * @return array|false The exported data or false on failure
     */
    public function exportFromCsv($entityType, $filters = []) {
        // Check if entity type is supported
        if (!isset($this->config['csv_files'][$entityType])) {
            $this->log('error', "Unsupported entity type: $entityType");
            return false;
        }
        
        $csvFileName = $this->config['csv_files'][$entityType];
        $csvFile = $this->dataDir . $csvFileName;
        
        // Check if file exists
        if (!file_exists($csvFile)) {
            $this->log('error', "CSV file not found: $csvFile");
            
            // For debugging
            $this->log('debug', "Looking for CSV file in data directory: " . $this->dataDir);
            $this->log('debug', "Current working directory: " . getcwd());
            $this->log('debug', "Directory contents: " . implode(", ", scandir($this->dataDir)));
            
            return false;
        }
        
        $this->log('info', "Exporting $entityType from CSV: $csvFile");
        
        // Read CSV file
        $data = [];
        $headers = [];
        
        $this->log('debug', "Opening CSV file: $csvFile");
        
        if (($handle = fopen($csvFile, "r")) !== false) {
            // Read header row
            $headers = fgetcsv($handle, 0, ",", "\"", "\\");
            
            // Trim whitespace from headers
            $headers = array_map('trim', $headers);
            $this->log('debug', "Headers after trimming: " . implode(', ', $headers));
            
            // Read data rows
            while (($row = fgetcsv($handle, 0, ",", "\"", "\\")) !== false) {
                // Handle rows with fewer fields than headers
                if (count($row) < count($headers)) {
                    // Pad the row with empty values to match the header count
                    $this->log('debug', "Row has fewer fields than headers, padding with empty values");
                    $row = array_pad($row, count($headers), '');
                }
                
                // Combine with headers
                $item = array_combine($headers, $row);
                
                // Apply filters if any
                if ($this->applyFilters($item, $filters)) {
                    $data[] = $item;
                    
                    // Check if we've reached the limit
                    if (isset($filters['limit']) && count($data) >= $filters['limit']) {
                        break;
                    }
                }
            }
            
            fclose($handle);
        } else {
            $this->log('error', "Failed to open CSV file: $csvFile");
            return false;
        }
        
        $this->log('info', "Exported " . count($data) . " $entityType from CSV");
        
        return $data;
    }
    
    /**
     * Export data directly from the database
     * 
     * @param string $entityType The entity type
     * @param array $filters Optional filters to apply to the data
     * @return array|false The exported data or false on failure
     */
    public function exportFromDatabase($entityType, $filters = []) {
        // Connect to database if not already connected
        if (!$this->connectToDatabase()) {
            return false;
        }
        
        // Map entity types to tables and queries
        $tables = [
            'contractors' => 'contractors',
            'bank_accounts' => 'bank_accounts',
            'projects' => 'projects',
            'categories' => 'transaction_categories',
            'transactions' => 'transactions'
        ];
        
        // Check if entity type is supported
        if (!isset($tables[$entityType])) {
            $this->log('error', "Unsupported entity type for database export: $entityType");
            return false;
        }
        
        $tableName = $tables[$entityType];
        
        // Build basic query
        $query = "SELECT * FROM $tableName";
        
        // Add where clause if filters are provided
        $whereConditions = [];
        $params = [];
        
        foreach ($filters as $field => $value) {
            if ($value === null) {
                $whereConditions[] = "$field IS NULL";
            } else if (is_array($value)) {
                if (isset($value['operator']) && isset($value['value'])) {
                    $whereConditions[] = "$field {$value['operator']} ?";
                    $params[] = $value['value'];
                } else if (count($value) > 0) {
                    $placeholders = implode(',', array_fill(0, count($value), '?'));
                    $whereConditions[] = "$field IN ($placeholders)";
                    $params = array_merge($params, $value);
                }
            } else {
                $whereConditions[] = "$field = ?";
                $params[] = $value;
            }
        }
        
        if (!empty($whereConditions)) {
            $query .= " WHERE " . implode(' AND ', $whereConditions);
        }
        
        // Execute query
        try {
            $stmt = $this->dbConnection->prepare($query);
            
            if (!empty($params)) {
                $i = 1;
                foreach ($params as $param) {
                    $stmt->bindValue($i++, $param);
                }
            }
            
            $stmt->execute();
            $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            $this->log('info', "Exported " . count($data) . " $entityType from database");
            
            return $data;
        } catch (PDOException $e) {
            $this->log('error', "Database query error: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Export data from either CSV or database based on configuration
     * 
     * @param string $entityType The entity type
     * @param array $filters Optional filters to apply to the data
     * @return array|false The exported data or false on failure
     */
    public function export($entityType, $filters = []) {
        try {
            // For now, use dummy data for contractors
            if ($entityType === 'contractors') {
                $jsonFile = $this->dataDir . 'dummy_contractors.json';
                if (file_exists($jsonFile)) {
                    $this->log('info', "Using dummy data from $jsonFile");
                    $data = json_decode(file_get_contents($jsonFile), true);
                    
                    // Apply limit filter if specified
                    if (isset($filters['limit']) && is_numeric($filters['limit'])) {
                        $data = array_slice($data, 0, $filters['limit']);
                    }
                    
                    $this->log('info', "Successfully exported " . count($data) . " records for $entityType");
                    return $data;
                }
            }
            
            // Process users from user_account.csv
            if ($entityType === 'users') {
                $data = $this->exportFromCsv($entityType, $filters);
                if (is_array($data)) {
                    $this->log('info', "Successfully exported " . count($data) . " records for $entityType");
                } else {
                    $this->log('error', "Export failed for $entityType, returning false");
                }
                return $data;
            }
            
            // For other entities, use CSV files
            $data = $this->exportFromCsv($entityType, $filters);
            
            // Special processing for transaction records with empty accounts_id
            if (in_array($entityType, ['income_transactions', 'expense_transactions', 'transfers'])) {
                // Log the count before any filtering
                $originalCount = is_array($data) ? count($data) : 0;
                $this->log('info', "Exported " . $originalCount . " raw records for $entityType");
                
                // If data was exported successfully, process records 
                if (is_array($data)) {
                    foreach ($data as $key => $record) {
                        // For transactions, ensure accounts_id is set (even if empty)
                        if (!isset($record['accounts_id'])) {
                            $data[$key]['accounts_id'] = '';
                        }
                        
                        // For transfers, ensure both accounts are set
                        if ($entityType === 'transfers') {
                            if (!isset($record['accounts_from_id'])) {
                                $data[$key]['accounts_from_id'] = '';
                            }
                            if (!isset($record['accounts_to_id'])) {
                                $data[$key]['accounts_to_id'] = '';
                            }
                        }
                    }
                }
            }
            
            // Log the count of exported data
            if (is_array($data)) {
                $this->log('info', "Successfully exported " . count($data) . " records for $entityType");
            } else {
                $this->log('error', "Export failed for $entityType, returning false");
            }
            
            return $data;
        } catch (Exception $e) {
            $this->log('error', "Exception during export of $entityType: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Connect to the database
     * 
     * @return bool Success flag
     */
    private function connectToDatabase() {
        // Return existing connection if already connected
        if ($this->dbConnection !== null) {
            return true;
        }
        
        // Check if database configuration is available
        if (empty($this->config['db_host']) || empty($this->config['db_name'])) {
            $this->log('error', "Database configuration is incomplete");
            return false;
        }
        
        // Connect to database
        try {
            $dsn = "mysql:host={$this->config['db_host']};dbname={$this->config['db_name']};charset=utf8";
            $this->dbConnection = new PDO($dsn, $this->config['db_user'], $this->config['db_pass'], [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false
            ]);
            
            $this->log('debug', "Connected to database {$this->config['db_name']} on {$this->config['db_host']}");
            
            return true;
        } catch (PDOException $e) {
            $this->log('error', "Database connection error: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Apply filters to an item
     * 
     * @param array $item The item to filter
     * @param array $filters The filters to apply
     * @return bool True if the item passes the filters, false otherwise
     */
    private function applyFilters($item, $filters) {
        // If no filters, include all items
        if (empty($filters)) {
            return true;
        }
        
        // Special filters not applied to individual items
        $specialFilters = ['limit'];
        $itemFilters = array_diff_key($filters, array_flip($specialFilters));
        
        // If no item filters after removing special filters, include all items
        if (empty($itemFilters)) {
            return true;
        }
        
        // Apply each filter
        foreach ($itemFilters as $field => $value) {
            // Skip if field doesn't exist in item - only check actual fields, not control parameters
            if (!isset($item[$field])) {
                $this->log('debug', "Filter field '$field' doesn't exist in item");
                return false;
            }
            
            // Apply filter based on value type
            if ($value === null) {
                // Filter for null values
                if ($item[$field] !== null && $item[$field] !== '') {
                    return false;
                }
            } else if (is_array($value)) {
                // Array filter with operator
                if (isset($value['operator']) && isset($value['value'])) {
                    switch ($value['operator']) {
                        case '=':
                            if ($item[$field] != $value['value']) return false;
                            break;
                        case '>':
                            if ($item[$field] <= $value['value']) return false;
                            break;
                        case '<':
                            if ($item[$field] >= $value['value']) return false;
                            break;
                        case '>=':
                            if ($item[$field] < $value['value']) return false;
                            break;
                        case '<=':
                            if ($item[$field] > $value['value']) return false;
                            break;
                        case 'LIKE':
                            if (strpos($item[$field], $value['value']) === false) return false;
                            break;
                        default:
                            // Unsupported operator
                            return false;
                    }
                }
                // Array of possible values (IN)
                else if (!in_array($item[$field], $value)) {
                    return false;
                }
            } else {
                // Simple equality filter
                if ($item[$field] != $value) {
                    return false;
                }
            }
        }
        
        // Item passed all filters
        return true;
    }
    
    /**
     * Log a message if a logger is available
     * 
     * @param string $level The log level
     * @param string $message The message to log
     */
    private function log($level, $message) {
        if ($this->logger) {
            $this->logger->log($level, $message);
        }
    }
}