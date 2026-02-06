<?php
/**
 * CSV Fixer for VIPFLAT to Adesk Migration
 * 
 * This script fixes common issues in CSV files to prepare them for the migration tool.
 * 
 * Usage: php csv-fixer.php <input_csv_file> <output_csv_file>
 */

// Set error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('memory_limit', '512M');

// Helper functions
function fixCsv($inputFile, $outputFile) {
    $results = [
        'success' => false,
        'input_file' => basename($inputFile),
        'output_file' => basename($outputFile),
        'issues_fixed' => [],
        'stats' => [
            'original_rows' => 0,
            'fixed_rows' => 0,
            'skipped_rows' => 0
        ]
    ];
    
    // Check if input file exists
    if (!file_exists($inputFile)) {
        echo "Error: Input file '$inputFile' does not exist\n";
        return $results;
    }
    
    // Open input file
    $inputHandle = fopen($inputFile, 'r');
    if ($inputHandle === false) {
        echo "Error: Could not open input file '$inputFile'\n";
        return $results;
    }
    
    // Create output file
    $outputHandle = fopen($outputFile, 'w');
    if ($outputHandle === false) {
        echo "Error: Could not create output file '$outputFile'\n";
        fclose($inputHandle);
        return $results;
    }
    
    // Read header row
    $headerRow = fgetcsv($inputHandle, 0, ",", "\"", "\\");
    
    if ($headerRow === false) {
        echo "Error: Failed to read header row\n";
        fclose($inputHandle);
        fclose($outputHandle);
        return $results;
    }
    
    // Trim whitespace from headers
    $originalHeaders = $headerRow;
    $trimmedHeaders = array_map('trim', $headerRow);
    
    // Check if headers were fixed
    $headerFixCount = 0;
    foreach ($originalHeaders as $index => $header) {
        if ($header !== $trimmedHeaders[$index]) {
            $headerFixCount++;
        }
    }
    
    if ($headerFixCount > 0) {
        $results['issues_fixed'][] = "Fixed whitespace in $headerFixCount headers";
    }
    
    // Write fixed header to output file
    fputcsv($outputHandle, $trimmedHeaders, ',', '"', "\\");
    
    // Process data rows
    $rowCount = 1; // Start at 1 for header row
    $incompleteRows = 0;
    $encodingIssues = 0;
    
    while (($row = fgetcsv($inputHandle, 0, ",", "\"", "\\")) !== false) {
        $rowCount++;
        
        // Check if row has the correct number of fields
        if (count($row) !== count($trimmedHeaders)) {
            $incompleteRows++;
            
            // Pad or truncate row to match header count
            if (count($row) < count($trimmedHeaders)) {
                $row = array_pad($row, count($trimmedHeaders), '');
            } else {
                $row = array_slice($row, 0, count($trimmedHeaders));
            }
        }
        
        // Fix encoding issues
        $encodingFixed = false;
        foreach ($row as &$field) {
            // Try to detect and fix encoding issues
            if (!mb_check_encoding($field, 'UTF-8')) {
                // Try different encodings
                $encodings = ['Windows-1251', 'ISO-8859-1', 'CP1252'];
                foreach ($encodings as $encoding) {
                    $converted = @iconv($encoding, 'UTF-8//IGNORE', $field);
                    if ($converted !== false && mb_check_encoding($converted, 'UTF-8')) {
                        $field = $converted;
                        $encodingFixed = true;
                        break;
                    }
                }
                
                // If still not fixed, replace invalid characters
                if (!mb_check_encoding($field, 'UTF-8')) {
                    $field = preg_replace('/[^\x20-\x7E]/', '?', $field);
                    $encodingFixed = true;
                }
            }
        }
        
        if ($encodingFixed) {
            $encodingIssues++;
        }
        
        // Write fixed row to output file
        fputcsv($outputHandle, $row, ',', '"', "\\");
        $results['stats']['fixed_rows']++;
    }
    
    // Update results
    $results['stats']['original_rows'] = $rowCount;
    
    if ($incompleteRows > 0) {
        $results['issues_fixed'][] = "Fixed $incompleteRows rows with incorrect field count";
    }
    
    if ($encodingIssues > 0) {
        $results['issues_fixed'][] = "Fixed encoding issues in $encodingIssues rows";
    }
    
    // Close files
    fclose($inputHandle);
    fclose($outputHandle);
    
    $results['success'] = true;
    return $results;
}

// Main logic
function displayHelp() {
    echo "CSV Fixer for VIPFLAT to Adesk Migration\n";
    echo "=======================================\n\n";
    echo "This script fixes common issues in CSV files for migration:\n";
    echo "- Trims whitespace from headers\n";
    echo "- Ensures all rows have the same number of fields\n";
    echo "- Attempts to fix encoding issues\n\n";
    echo "Usage: php csv-fixer.php <input_csv_file> <output_csv_file>\n";
    echo "       php csv-fixer.php <input_directory> <output_directory>\n\n";
}

// Main execution
if ($argc < 3) {
    displayHelp();
    exit(1);
}

$inputPath = $argv[1];
$outputPath = $argv[2];

// Check if it's a directory
if (is_dir($inputPath)) {
    // Make sure output directory exists
    if (!is_dir($outputPath)) {
        if (!mkdir($outputPath, 0777, true)) {
            echo "Error: Could not create output directory '$outputPath'\n";
            exit(1);
        }
    }
    
    echo "Fixing CSV files in directory: $inputPath\n\n";
    
    $allResults = [];
    $filesFixed = 0;
    $filesFailed = 0;
    
    // Get all CSV files in the input directory
    $files = glob($inputPath . '/*.csv');
    
    foreach ($files as $file) {
        $fileName = basename($file);
        $outputFile = rtrim($outputPath, '/') . '/' . $fileName;
        
        echo "Processing $fileName... ";
        $result = fixCsv($file, $outputFile);
        
        if ($result['success']) {
            echo "✓ Fixed\n";
            $filesFixed++;
        } else {
            echo "✗ Failed\n";
            $filesFailed++;
        }
        
        $allResults[] = $result;
    }
    
    // Display summary
    echo "\nResults Summary\n";
    echo "==============\n";
    echo "Files processed: " . count($files) . "\n";
    echo "Files fixed: $filesFixed\n";
    echo "Files failed: $filesFailed\n\n";
    
    // Generate JSON report
    $reportPath = rtrim($outputPath, '/') . '/csv_fixing_report.json';
    file_put_contents($reportPath, json_encode($allResults, JSON_PRETTY_PRINT));
    echo "Fixing report saved to: $reportPath\n";
    
} else {
    // Single file fixing
    echo "Fixing CSV file: $inputPath\n\n";
    
    $result = fixCsv($inputPath, $outputPath);
    
    if ($result['success']) {
        echo "✓ Successfully fixed CSV file\n\n";
        
        echo "Issues fixed:\n";
        if (empty($result['issues_fixed'])) {
            echo "  - No issues found\n";
        } else {
            foreach ($result['issues_fixed'] as $issue) {
                echo "  - $issue\n";
            }
        }
        
        echo "\nStats:\n";
        echo "  - Original rows: " . $result['stats']['original_rows'] . "\n";
        echo "  - Fixed rows: " . $result['stats']['fixed_rows'] . "\n";
        echo "  - Skipped rows: " . $result['stats']['skipped_rows'] . "\n";
        
        echo "\nFixed file saved to: $outputPath\n";
    } else {
        echo "✗ Failed to fix CSV file\n";
    }
}