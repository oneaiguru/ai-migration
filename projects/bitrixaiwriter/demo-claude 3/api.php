<?php
/**
 * API processor for CSV data
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

// Get action
$action = $_REQUEST['action'] ?? '';

try {
    switch ($action) {
        case 'test':
            // Test one item
            if (!isset($_POST['description'])) {
                throw new Exception('No description provided');
            }
            
            $description = $_POST['description'];
            
            // If the description contains HTML, strip tags for display but keep original for processing
            $cleanDescription = $description;
            if (strpos($description, '<') !== false && strpos($description, '>') !== false) {
                $cleanDescription = strip_tags($description);
            }
            
            // Generate prompt using the original description (with HTML)
            $prompt = $promptGenerator->generatePrompt($description);
            
            // Get new description from Claude
            $newDescription = $claudeClient->generateText($prompt);
            
            echo json_encode([
                'success' => true,
                'originalDescription' => $cleanDescription,
                'newDescription' => $newDescription
            ]);
            break;
            
        default:
            throw new Exception('Unknown action: ' . $action);
    }
} catch (Exception $e) {
    // Send error response
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
