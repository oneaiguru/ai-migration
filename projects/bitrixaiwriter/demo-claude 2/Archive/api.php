<?php
/**
 * API processor for CSV files
 */
require_once 'ClaudeClient.php';
require_once 'PromptGenerator.php';

// Set headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Replace with your Claude API key
$apiKey = 'sk-ant-api03-your-api-key-here';

// Initialize Claude client
$claudeClient = new ClaudeClient($apiKey);
$promptGenerator = new PromptGenerator();

// Create directories
$uploadsDir = 'uploads/';
$resultsDir = 'results/';

if (!is_dir($uploadsDir)) {
    mkdir($uploadsDir, 0755, true);
}
if (!is_dir($resultsDir)) {
    mkdir($resultsDir, 0755, true);
}

// Get action
$action = $_REQUEST['action'] ?? '';

try {
    switch ($action) {
        case 'upload':
            // Handle file upload
            if (!isset($_FILES['file'])) {
                throw new Exception('No file uploaded');
            }
            
            $file = $_FILES['file'];
            if ($file['error'] !== UPLOAD_ERR_OK) {
                throw new Exception('File upload error: ' . $file['error']);
            }
            
            $fileExtension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
            if ($fileExtension !== 'csv') {
                throw new Exception('Only CSV files are supported');
            }
            
            // Generate unique filename
            $uploadPath = $uploadsDir . time() . '_' . basename($file['name']);
            
            if (!move_uploaded_file($file['tmp_name'], $uploadPath)) {
                throw new Exception('Failed to save uploaded file');
            }
            
            // Preview CSV (first 5 rows)
            $preview = previewCsv($uploadPath, 5);
            
            echo json_encode([
                'success' => true,
                'message' => 'File uploaded successfully',
                'file' => basename($uploadPath),
                'preview' => $preview
            ]);
            break;
            
        case 'process':
            // Check if file exists
            if (!isset($_POST['file'])) {
                throw new Exception('No file specified');
            }
            
            $filePath = $uploadsDir . $_POST['file'];
            
            if (!file_exists($filePath)) {
                throw new Exception('File not found: ' . $filePath);
            }
            
            // Set up streaming response
            header('Content-Type: text/event-stream');
            header('Cache-Control: no-cache');
            ob_implicit_flush(true);
            
            // Process CSV
            processCsv($filePath, $claudeClient, $promptGenerator);
            
            break;
            
        case 'test':
            // Test one item
            if (!isset($_POST['description'])) {
                throw new Exception('No description provided');
            }
            
            $description = $_POST['description'];
            $prompt = $promptGenerator->generatePrompt($description);
            $newDescription = $claudeClient->generateText($prompt);
            
            echo json_encode([
                'success' => true,
                'originalDescription' => $description,
                'newDescription' => $newDescription
            ]);
            break;
            
        default:
            throw new Exception('Unknown action: ' . $action);
    }
} catch (Exception $e) {
    // Send error response
    if (strpos($_SERVER['CONTENT_TYPE'] ?? '', 'text/event-stream') !== false) {
        echo "data: " . json_encode(['error' => $e->getMessage()]) . "\n\n";
    } else {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => $e->getMessage()
        ]);
    }
}

/**
 * Preview CSV contents
 */
function previewCsv($filePath, $maxRows = 5) {
    // Detect the delimiter (semicolon or comma)
    $firstLine = file($filePath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES)[0] ?? '';
    $delimiter = (strpos($firstLine, ';') !== false) ? ';' : ',';
    
    // Open the file
    $handle = fopen($filePath, 'r');
    if (!$handle) {
        throw new Exception('Could not open file');
    }
    
    // Read headers
    $headers = fgetcsv($handle, 0, $delimiter);
    if (!$headers) {
        fclose($handle);
        throw new Exception('Error reading CSV headers');
    }
    
    // Identify the description column
    $descIndex = -1;
    $nameIndex = -1;
    
    foreach ($headers as $index => $header) {
        $headerLower = strtolower(trim($header));
        if ($headerLower === 'описание' || $headerLower === 'description') {
            $descIndex = $index;
        }
        if ($headerLower === 'название' || $headerLower === 'name' || $headerLower === 'product_name') {
            $nameIndex = $index;
        }
    }
    
    if ($descIndex === -1) {
        fclose($handle);
        throw new Exception('CSV must contain a description column (named "Описание" or "description")');
    }
    
    // Read rows
    $rows = [];
    $rowCount = 0;
    
    while (($data = fgetcsv($handle, 0, $delimiter)) !== false && $rowCount < $maxRows) {
        // Skip rows with incorrect number of fields
        if (count($data) < count($headers)) {
            continue;
        }
        
        $row = [];
        foreach ($headers as $index => $header) {
            // Make sure to trim and strip quotes from values
            $value = isset($data[$index]) ? trim($data[$index], '"\'') : '';
            $row[$header] = $value;
        }
        
        $rows[] = $row;
        $rowCount++;
    }
    
    // Count total rows (excluding header)
    fseek($handle, 0);
    $totalRows = count(file($filePath)) - 1;
    
    fclose($handle);
    
    return [
        'headers' => $headers,
        'rows' => $rows,
        'totalRows' => $totalRows,
        'descriptionColumn' => $headers[$descIndex],
        'nameColumn' => $nameIndex >= 0 ? $headers[$nameIndex] : null
    ];
}

/**
 * Process CSV with Claude API
 */
function processCsv($filePath, $claudeClient, $promptGenerator) {
    // Detect the delimiter (semicolon or comma)
    $firstLine = file($filePath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES)[0] ?? '';
    $delimiter = (strpos($firstLine, ';') !== false) ? ';' : ',';
    
    // Open the file
    $handle = fopen($filePath, 'r');
    if (!$handle) {
        throw new Exception('Could not open file');
    }
    
    // Read headers
    $headers = fgetcsv($handle, 0, $delimiter);
    if (!$headers) {
        fclose($handle);
        throw new Exception('Error reading CSV headers');
    }
    
    // Identify description and name columns
    $descIndex = -1;
    $nameIndex = -1;
    
    foreach ($headers as $index => $header) {
        $headerLower = strtolower(trim($header));
        if ($headerLower === 'описание' || $headerLower === 'description') {
            $descIndex = $index;
        }
        if ($headerLower === 'название' || $headerLower === 'name' || $headerLower === 'product_name') {
            $nameIndex = $index;
        }
    }
    
    if ($descIndex === -1) {
        fclose($handle);
        throw new Exception('CSV must contain a description column (named "Описание" or "description")');
    }
    
    // Count total rows (excluding header)
    fseek($handle, 0);
    $totalRows = count(file($filePath)) - 1;
    
    // Reset pointer to skip header
    fseek($handle, 0);
    fgetcsv($handle, 0, $delimiter); // Skip header row
    
    // Create output file
    $outputFile = $resultsDir . 'processed_' . time() . '.csv';
    $outputHandle = fopen($outputFile, 'w');
    
    // Write output headers
    $outputHeaders = $headers;
    $outputHeaders[] = 'Новое описание';
    fputcsv($outputHandle, $outputHeaders, $delimiter);
    
    // Process rows
    $processed = 0;
    
    while (($data = fgetcsv($handle, 0, $delimiter)) !== false) {
        $processed++;
        
        // Get product name or default
        $productName = ($nameIndex !== -1 && isset($data[$nameIndex])) ? $data[$nameIndex] : "Item $processed";
        
        // Send progress update
        echo "data: " . json_encode([
            'status' => 'processing',
            'processed' => $processed,
            'total' => $totalRows,
            'percent' => round(($processed / $totalRows) * 100),
            'currentItem' => $productName
        ]) . "\n\n";
        
        // Skip invalid rows
        if (count($data) < count($headers) || !isset($data[$descIndex])) {
            $outputRow = $data;
            $outputRow[] = 'Error: Invalid data';
            fputcsv($outputHandle, $outputRow, $delimiter);
            continue;
        }
        
        // Get description
        $description = trim($data[$descIndex], '"\'');
        
        // Skip empty descriptions
        if (empty($description)) {
            $outputRow = $data;
            $outputRow[] = 'Error: Empty description';
            fputcsv($outputHandle, $outputRow, $delimiter);
            continue;
        }
        
        // If the description contains HTML, strip tags
        if (strpos($description, '<') !== false && strpos($description, '>') !== false) {
            $description = strip_tags($description);
        }
        
        // Generate prompt and get new description
        try {
            $prompt = $promptGenerator->generatePrompt($description);
            $newDescription = $claudeClient->generateText($prompt);
            
            // Save result
            $outputRow = $data;
            $outputRow[] = $newDescription;
            fputcsv($outputHandle, $outputRow, $delimiter);
            
        } catch (Exception $e) {
            $outputRow = $data;
            $outputRow[] = 'Error: ' . $e->getMessage();
            fputcsv($outputHandle, $outputRow, $delimiter);
        }
        
        // Flush output buffer
        flush();
    }
    
    fclose($handle);
    fclose($outputHandle);
    
    // Send completion
    echo "data: " . json_encode([
        'status' => 'complete',
        'processed' => $processed,
        'total' => $totalRows,
        'outputFile' => $outputFile
    ]) . "\n\n";
}
