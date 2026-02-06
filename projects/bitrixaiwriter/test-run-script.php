<?php
/**
 * Test runner for the text rewriter system
 * This script tests each component of the system to ensure everything is working properly
 */

// Validate PHP version
if (version_compare(PHP_VERSION, '8.0.0', '<')) {
    die("Error: PHP 8.0 or higher is required. Current version: " . PHP_VERSION . "\n");
}

// Check autoloader
if (!file_exists(__DIR__ . '/vendor/autoload.php')) {
    die("Error: Composer autoloader not found. Please run 'composer install' first.\n");
}

require_once __DIR__ . '/vendor/autoload.php';

// Define test functions
function testDependencies() {
    echo "Testing dependencies...\n";
    
    // Check required extensions
    $requiredExtensions = ['curl', 'json', 'mbstring'];
    $missingExtensions = [];
    
    foreach ($requiredExtensions as $ext) {
        if (!extension_loaded($ext)) {
            $missingExtensions[] = $ext;
        }
    }
    
    if (!empty($missingExtensions)) {
        die("Error: Missing PHP extensions: " . implode(', ', $missingExtensions) . "\n");
    }
    
    echo "All required PHP extensions are installed.\n";
    
    // Check for GuzzleHttp client
    if (!class_exists('GuzzleHttp\Client')) {
        die("Error: GuzzleHttp client not found. Please run 'composer install' first.\n");
    }
    
    echo "All dependencies OK.\n";
    return true;
}

function testDirectories() {
    echo "Testing directories...\n";
    
    // Check necessary directories
    $requiredDirs = ['config', 'logs', 'output'];
    
    foreach ($requiredDirs as $dir) {
        if (!is_dir(__DIR__ . '/' . $dir)) {
            echo "Creating directory: {$dir}\n";
            mkdir(__DIR__ . '/' . $dir, 0755, true);
        }
    }
    
    // Check permissions
    foreach ($requiredDirs as $dir) {
        if (!is_writable(__DIR__ . '/' . $dir)) {
            die("Error: Directory '{$dir}' is not writable.\n");
        }
    }
    
    echo "All directories OK.\n";
    return true;
}

function testConfiguration() {
    echo "Testing configuration...\n";
    
    $configFile = __DIR__ . '/config/config.json';
    
    // Check if config file exists
    if (!file_exists($configFile)) {
        echo "Config file not found, creating from example...\n";
        
        $exampleConfigFile = __DIR__ . '/config/config.example.json';
        if (!file_exists($exampleConfigFile)) {
            die("Error: Example config file not found: {$exampleConfigFile}\n");
        }
        
        copy($exampleConfigFile, $configFile);
        echo "Created config file. Please edit {$configFile} with your API credentials.\n";
        return false;
    }
    
    // Try to parse config file
    $config = json_decode(file_get_contents($configFile), true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        die("Error parsing config file: " . json_last_error_msg() . "\n");
    }
    
    // Check required configuration sections
    $requiredSections = ['bitrix', 'claude', 'uniqueness'];
    $missingSections = [];
    
    foreach ($requiredSections as $section) {
        if (!isset($config[$section]) || !is_array($config[$section])) {
            $missingSections[] = $section;
        }
    }
    
    if (!empty($missingSections)) {
        die("Error: Missing configuration sections: " . implode(', ', $missingSections) . "\n");
    }
    
    // Check required API keys
    if (!isset($config['claude']['api_key']) || $config['claude']['api_key'] === 'sk-ant-api03-your-api-key-here') {
        echo "Warning: Claude API key not set in config.json. Some tests will be skipped.\n";
        return false;
    }
    
    echo "Configuration OK.\n";
    return true;
}

function testClasses() {
    echo "Testing classes...\n";
    
    // List of required classes with their namespaces
    $requiredClasses = [
        'Api\BitrixApiClient',
        'Api\ClaudeApiClient',
        'Core\PromptGenerator',
        'Core\TextRewriteController',
        'Core\UniquenessChecker'
    ];
    
    $missingClasses = [];
    
    foreach ($requiredClasses as $class) {
        if (!class_exists($class)) {
            $missingClasses[] = $class;
        }
    }
    
    if (!empty($missingClasses)) {
        die("Error: Missing classes: " . implode(', ', $missingClasses) . "\n");
    }
    
    echo "All classes OK.\n";
    return true;
}

function testPromptGenerator() {
    echo "Testing prompt generator...\n";
    
    try {
        $promptGenerator = new Core\PromptGenerator();
        
        $sampleText = "Осциллограф цифровой АКТАКОМ ADS-4572 – это 2-канальный прибор с полосой пропускания 70 МГц, предназначенный для исследования электронных схем. Технические характеристики: Количество каналов: 2, Полоса пропускания: 70 МГц.";
        
        $prompt = $promptGenerator->generatePrompt($sampleText);
        
        if (empty($prompt)) {
            die("Error: PromptGenerator failed to generate a prompt.\n");
        }
        
        if (strpos($prompt, $sampleText) === false) {
            die("Error: Generated prompt doesn't contain the original text.\n");
        }
        
        echo "Prompt generator OK.\n";
        return true;
    } catch (Exception $e) {
        die("Error testing prompt generator: " . $e->getMessage() . "\n");
    }
}

function testUniquenessChecker() {
    echo "Testing uniqueness checker...\n";
    
    try {
        $uniquenessChecker = new Core\UniquenessChecker();
        
        $uniquenessChecker->setUniquenessThreshold(70);
        
        $text1 = "This is a test text for uniqueness checking.";
        $text2 = "This is a completely different text with no similarity.";
        $text3 = "This is a test text for checking uniqueness with some changes.";
        
        $uniquenessChecker->addTextsForComparison([$text1]);
        
        $result1 = $uniquenessChecker->checkLocalUniqueness($text2);
        $result2 = $uniquenessChecker->checkLocalUniqueness($text3);
        
        if (!$result1['is_unique']) {
            die("Error: UniquenessChecker failed to recognize a unique text.\n");
        }
        
        if ($result1['uniqueness'] < 90) {
            die("Error: UniquenessChecker gave a low uniqueness score for a completely different text.\n");
        }
        
        if ($result1['uniqueness'] < $result2['uniqueness']) {
            die("Error: UniquenessChecker gave a higher uniqueness score for a similar text.\n");
        }
        
        echo "Uniqueness checker OK.\n";
        return true;
    } catch (Exception $e) {
        die("Error testing uniqueness checker: " . $e->getMessage() . "\n");
    }
}

function testClaudeApi() {
    echo "Testing Claude API integration...\n";
    
    // Load config
    $configFile = __DIR__ . '/config/config.json';
    if (!file_exists($configFile)) {
        echo "Skipping Claude API test: config file not found.\n";
        return false;
    }
    
    $config = json_decode(file_get_contents($configFile), true);
    if (!isset($config['claude']['api_key']) || $config['claude']['api_key'] === 'sk-ant-api03-your-api-key-here') {
        echo "Skipping Claude API test: API key not configured.\n";
        return false;
    }
    
    try {
        $claudeClient = new Api\ClaudeApiClient($config['claude']['api_key']);
        
        if (isset($config['claude']['model'])) {
            $claudeClient->setModel($config['claude']['model']);
        }
        
        $testPrompt = "Summarize the following text in one sentence: The quick brown fox jumps over the lazy dog.";
        
        echo "Sending test request to Claude API...\n";
        $generationParameters = array_intersect_key(
            $config['claude'] ?? [],
            array_flip(['temperature', 'max_tokens', 'top_p'])
        );
        $response = $claudeClient->generateText($testPrompt, $generationParameters);
        
        if (empty($response)) {
            die("Error: Claude API returned an empty response.\n");
        }
        
        echo "Claude API test successful. Response: " . substr($response, 0, 50) . "...\n";
        return true;
    } catch (Exception $e) {
        echo "Error testing Claude API: " . $e->getMessage() . "\n";
        echo "Make sure your API key is valid and properly configured.\n";
        return false;
    }
}

function testCsvData() {
    echo "Testing CSV data access...\n";
    
    // Check if data directory exists
    if (!is_dir(__DIR__ . '/data')) {
        echo "Data directory not found. Checking original directory...\n";
        
        if (!is_dir(__DIR__ . '/oiriginal')) {
            echo "No data directories found. Skipping CSV test.\n";
            return false;
        }
        
        $dataDir = __DIR__ . '/oiriginal';
    } else {
        $dataDir = __DIR__ . '/data';
    }
    
    // Find CSV files
    $csvFiles = glob($dataDir . '/*.csv');
    
    if (empty($csvFiles)) {
        echo "No CSV files found in the data directory. Skipping CSV test.\n";
        return false;
    }
    
    // Try to read the first CSV file
    $csvFile = $csvFiles[0];
    echo "Testing CSV file: " . basename($csvFile) . "\n";
    
    $handle = fopen($csvFile, 'r');
    if ($handle === false) {
        die("Error: Could not open CSV file: {$csvFile}\n");
    }
    
    // Read header
    $header = fgetcsv($handle);
    if ($header === false) {
        die("Error: Could not read CSV header from file: {$csvFile}\n");
    }
    
    echo "CSV header: " . implode(', ', $header) . "\n";
    
    // Read first row
    $firstRow = fgetcsv($handle);
    if ($firstRow === false) {
        die("Error: Could not read first row from CSV file: {$csvFile}\n");
    }
    
    fclose($handle);
    
    echo "CSV data access OK.\n";
    return true;
}

function testCliScript() {
    echo "Testing CLI script...\n";
    
    $cliScript = __DIR__ . '/src/cli.php';
    
    if (!file_exists($cliScript)) {
        die("Error: CLI script not found: {$cliScript}\n");
    }
    
    // Try running the CLI script with --help
    $output = [];
    $returnVar = 0;
    
    exec("php {$cliScript} --help 2>&1", $output, $returnVar);
    
    if ($returnVar !== 0) {
        die("Error: Failed to run CLI script.\nOutput: " . implode("\n", $output) . "\n");
    }
    
    $helpTextFound = false;
    foreach ($output as $line) {
        if (strpos($line, 'Использование:') !== false || strpos($line, 'Usage:') !== false) {
            $helpTextFound = true;
            break;
        }
    }
    
    if (!$helpTextFound) {
        die("Error: CLI script didn't return expected help text.\nOutput: " . implode("\n", $output) . "\n");
    }
    
    echo "CLI script OK.\n";
    return true;
}

// Run all tests
echo "Starting system tests...\n";
echo "=========================================\n";

$testFunctions = [
    'testDependencies',
    'testDirectories',
    'testConfiguration',
    'testClasses',
    'testPromptGenerator',
    'testUniquenessChecker',
    'testClaudeApi',
    'testCsvData',
    'testCliScript'
];

$results = [];

foreach ($testFunctions as $testFunction) {
    try {
        echo "\n>>> Running {$testFunction}...\n";
        $results[$testFunction] = call_user_func($testFunction);
    } catch (Exception $e) {
        echo "Test {$testFunction} failed with exception: " . $e->getMessage() . "\n";
        $results[$testFunction] = false;
    }
    echo "=========================================\n";
}

// Print test summary
echo "\nTest Results Summary:\n";
echo "==========================================\n";

$passedTests = 0;
$totalTests = count($testFunctions);

foreach ($results as $test => $result) {
    echo str_pad($test, 30) . ": " . ($result ? "PASSED" : "FAILED") . "\n";
    if ($result) {
        $passedTests++;
    }
}

echo "==========================================\n";
echo "Passed {$passedTests} out of {$totalTests} tests.\n";

if ($passedTests === $totalTests) {
    echo "\n✅ All tests passed! The system is ready to use.\n";
    echo "Run the system with: php src/cli.php --action=process\n";
    exit(0);
} else {
    echo "\n⚠️ Some tests failed. Please fix the issues before using the system.\n";
    exit(1);
}
