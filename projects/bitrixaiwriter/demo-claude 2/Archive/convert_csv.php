<?php
/**
 * Sample CSV file format converter
 * Run this script to convert your original CSV to the proper format for the demo
 */

// Input and output file paths
$inputFile = 'pa.csv';
$outputFile = 'sample-converted.csv';

// Check if input file exists
if (!file_exists($inputFile)) {
    die("Input file '$inputFile' not found.\n");
}

// Open input file
$handle = fopen($inputFile, 'r');
if (!$handle) {
    die("Failed to open input file.\n");
}

// Open output file
$outputHandle = fopen($outputFile, 'w');
if (!$outputHandle) {
    fclose($handle);
    die("Failed to create output file.\n");
}

// Read the header row
$headers = fgetcsv($handle, 0, ';');
if (!$headers) {
    fclose($handle);
    fclose($outputHandle);
    die("Failed to read headers from input file.\n");
}

// Find the required columns
$idIndex = array_search('ID', $headers);
$nameIndex = array_search('Название', $headers);
$descIndex = array_search('Описание', $headers);

if ($descIndex === false) {
    fclose($handle);
    fclose($outputHandle);
    die("Required column 'Описание' not found in the input file.\n");
}

// Write the output header
fputcsv($outputHandle, ['product_name', 'description']);

// Process each row
$rowCount = 0;
while (($data = fgetcsv($handle, 0, ';')) !== false) {
    // Skip rows with missing data
    if (count($data) <= max($idIndex, $nameIndex, $descIndex)) {
        continue;
    }
    
    // Get the values
    $id = $idIndex !== false && isset($data[$idIndex]) ? $data[$idIndex] : "Item-" . ($rowCount + 1);
    $name = $nameIndex !== false && isset($data[$nameIndex]) ? $data[$nameIndex] : $id;
    $description = isset($data[$descIndex]) ? $data[$descIndex] : "";
    
    // Clean the description (remove HTML tags)
    $description = trim($description, '"\'');
    if (strpos($description, '<') !== false && strpos($description, '>') !== false) {
        $description = strip_tags($description);
    }
    
    // Skip items with empty descriptions
    if (empty($description)) {
        continue;
    }
    
    // Write the output row
    fputcsv($outputHandle, [$name, $description]);
    $rowCount++;
}

// Close files
fclose($handle);
fclose($outputHandle);

echo "Conversion complete.\n";
echo "$rowCount items processed and saved to $outputFile\n";

// Print some instructions
echo "\nHow to use:\n";
echo "1. Upload the generated '$outputFile' file using the web interface\n";
echo "2. Or move it to your web directory as 'sample.csv'\n";
