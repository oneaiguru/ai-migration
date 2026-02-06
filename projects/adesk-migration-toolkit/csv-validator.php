<?php
/**
 * CSV Validator for VIPFLAT to Adesk Migration
 * 
 * This script checks CSV files to ensure they meet the requirements for the migration tool.
 * 
 * Usage: php csv-validator.php <path_to_csv_file>
 */

// Configuration
$MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB max file size
$ENCODING = 'UTF-8';                // Required encoding
$REQUIRED_FILES = [
    'contacts.csv',                 // Contractors
    'accounts.csv',                 // Bank accounts
    'apartments.csv',               // Projects
    'target.csv',                   // Categories
    'debet.csv',                    // Income transactions
    'credit.csv',                   // Expense transactions
    'moving.csv',                   // Transfers
    'currency.csv',                 // Currencies
    'user_account.csv'              // Users
];

// Set error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('memory_limit', '512M');

// Helper functions
function checkUtf8($string) {
    return mb_check_encoding($string, 'UTF-8');
}

function validateCsv($filePath) {
    global $MAX_FILE_SIZE, $ENCODING;
    
    $results = [
        'file' => basename($filePath),
        'passed' => true,
        'errors' => [],
        'warnings' => [],
        'stats' => [
            'size' => 0,
            'rows' => 0,
            'header_fields' => 0
        ]
    ];
    
    // Check if file exists
    if (!file_exists($filePath)) {
        $results['passed'] = false;
        $results['errors'][] = "File does not exist";
        return $results;
    }
    
    // Check file size
    $fileSize = filesize($filePath);
    $results['stats']['size'] = $fileSize;
    
    if ($fileSize > $MAX_FILE_SIZE) {
        $results['passed'] = false;
        $results['errors'][] = "File is too large: " . round($fileSize / 1024 / 1024, 2) . " MB (max: " . round($MAX_FILE_SIZE / 1024 / 1024, 2) . " MB)";
    }
    
    // Read file contents
    $handle = fopen($filePath, 'r');
    if ($handle === false) {
        $results['passed'] = false;
        $results['errors'][] = "Could not open file";
        return $results;
    }
    
    // Check header row
    $headerRow = fgetcsv($handle, 0, ",", "\"", "\\");
    
    if ($headerRow === false) {
        $results['passed'] = false;
        $results['errors'][] = "Failed to read header row";
        fclose($handle);
        return $results;
    }
    
    // Check if headers have extra whitespace
    $trimmedHeaders = array_map('trim', $headerRow);
    $results['stats']['header_fields'] = count($headerRow);
    
    $whitespaceDifferences = array_diff_assoc($headerRow, $trimmedHeaders);
    if (!empty($whitespaceDifferences)) {
        $results['passed'] = false;
        $results['errors'][] = "Headers contain extra whitespace: " . implode(', ', array_keys($whitespaceDifferences));
    }
    
    // Check for empty headers
    $emptyHeaders = array_filter($trimmedHeaders, function($header) {
        return $header === '';
    });
    
    if (!empty($emptyHeaders)) {
        $results['passed'] = false;
        $results['errors'][] = "Found " . count($emptyHeaders) . " empty headers";
    }
    
    // Check rows
    $rowIndex = 1; // 1-indexed for user display (header is row 1)
    $incompleteRows = 0;
    $malformedRows = 0;
    $encodingErrors = 0;
    $rowSizes = [];
    
    while (($row = fgetcsv($handle, 0, ",", "\"", "\\")) !== false) {
        $rowIndex++;
        $rowSizes[] = count($row);
        
        // Check row field count
        if (count($row) != count($headerRow)) {
            $incompleteRows++;
            if ($incompleteRows <= 5) { // Limit detailed errors
                $results['errors'][] = "Row $rowIndex has " . count($row) . " fields, but header has " . count($headerRow) . " fields";
            }
        }
        
        // Check for encoding issues
        foreach ($row as $field) {
            if (!checkUtf8($field)) {
                $encodingErrors++;
                if ($encodingErrors <= 5) { // Limit detailed errors
                    $results['errors'][] = "Row $rowIndex contains non-UTF-8 characters";
                }
                break; // Only count one encoding error per row
            }
        }
    }
    
    $results['stats']['rows'] = $rowIndex - 1; // Don't count header
    
    if ($incompleteRows > 0) {
        $results['passed'] = false;
        if ($incompleteRows > 5) {
            $results['errors'][] = "... and " . ($incompleteRows - 5) . " more rows with incorrect field count";
        }
    }
    
    if ($encodingErrors > 0) {
        $results['passed'] = false;
        if ($encodingErrors > 5) {
            $results['errors'][] = "... and " . ($encodingErrors - 5) . " more rows with encoding issues";
        }
    }
    
    // Check for varying row sizes
    $uniqueSizes = array_unique($rowSizes);
    if (count($uniqueSizes) > 1) {
        $results['warnings'][] = "File has inconsistent row sizes: " . implode(', ', $uniqueSizes);
    }
    
    fclose($handle);
    return $results;
}

// Main logic
function displayHelp() {
    global $REQUIRED_FILES;
    
    echo "CSV Validator for VIPFLAT to Adesk Migration\n";
    echo "============================================\n\n";
    echo "Usage: php csv-validator.php <path_to_csv_file>\n";
    echo "       php csv-validator.php <directory_with_csv_files>\n\n";
    echo "Required files:\n";
    
    foreach ($REQUIRED_FILES as $file) {
        echo "- $file\n";
    }
    
    echo "\nEach CSV file must:\n";
    echo "- Be UTF-8 encoded\n";
    echo "- Have headers without leading/trailing whitespace\n";
    echo "- Have the same number of fields in each row\n";
    echo "- Not exceed 100MB in size\n";
}

// Main execution
if ($argc < 2) {
    displayHelp();
    exit(1);
}

$path = $argv[1];

// Check if it's a directory
if (is_dir($path)) {
    echo "Validating CSV files in directory: $path\n\n";
    
    $allResults = [];
    $filesChecked = 0;
    $filesPassed = 0;
    
    foreach ($REQUIRED_FILES as $requiredFile) {
        $filePath = rtrim($path, '/') . '/' . $requiredFile;
        
        if (file_exists($filePath)) {
            $result = validateCsv($filePath);
            $allResults[] = $result;
            $filesChecked++;
            
            if ($result['passed']) {
                $filesPassed++;
            }
        } else {
            $allResults[] = [
                'file' => $requiredFile,
                'passed' => false,
                'errors' => ['File not found'],
                'warnings' => [],
                'stats' => []
            ];
            $filesChecked++;
        }
    }
    
    // Display summary
    echo "Results Summary\n";
    echo "==============\n";
    echo "Files checked: $filesChecked/$filesChecked\n";
    echo "Files passed: $filesPassed/$filesChecked\n\n";
    
    // Display details
    echo "Detailed Results\n";
    echo "===============\n";
    
    foreach ($allResults as $result) {
        echo $result['file'] . ": " . ($result['passed'] ? "✓ PASSED" : "✗ FAILED") . "\n";
        
        if (!empty($result['stats'])) {
            echo "  Stats: " . $result['stats']['rows'] . " rows, " . 
                 $result['stats']['header_fields'] . " columns, " . 
                 round($result['stats']['size'] / 1024, 2) . " KB\n";
        }
        
        if (!empty($result['errors'])) {
            echo "  Errors:\n";
            foreach ($result['errors'] as $error) {
                echo "    - $error\n";
            }
        }
        
        if (!empty($result['warnings'])) {
            echo "  Warnings:\n";
            foreach ($result['warnings'] as $warning) {
                echo "    - $warning\n";
            }
        }
        
        echo "\n";
    }
    
    // Generate JSON report
    $reportPath = rtrim($path, '/') . '/csv_validation_report.json';
    file_put_contents($reportPath, json_encode($allResults, JSON_PRETTY_PRINT));
    echo "Validation report saved to: $reportPath\n";
    
} else {
    // Single file validation
    echo "Validating CSV file: $path\n\n";
    
    $result = validateCsv($path);
    
    echo "Results for " . $result['file'] . "\n";
    echo "=====================" . str_repeat("=", strlen($result['file'])) . "\n";
    echo "Status: " . ($result['passed'] ? "✓ PASSED" : "✗ FAILED") . "\n";
    
    if (!empty($result['stats'])) {
        echo "Stats: " . $result['stats']['rows'] . " rows, " . 
             $result['stats']['header_fields'] . " columns, " . 
             round($result['stats']['size'] / 1024, 2) . " KB\n";
    }
    
    if (!empty($result['errors'])) {
        echo "Errors:\n";
        foreach ($result['errors'] as $error) {
            echo "  - $error\n";
        }
    }
    
    if (!empty($result['warnings'])) {
        echo "Warnings:\n";
        foreach ($result['warnings'] as $warning) {
            echo "  - $warning\n";
        }
    }
    
    // Generate JSON report
    $reportDir = dirname($path);
    $reportPath = $reportDir . '/csv_validation_report_' . basename($path) . '.json';
    file_put_contents($reportPath, json_encode($result, JSON_PRETTY_PRINT));
    echo "\nValidation report saved to: $reportPath\n";
}