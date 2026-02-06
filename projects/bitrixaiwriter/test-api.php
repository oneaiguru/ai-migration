<?php
/**
 * Тестовый скрипт для проверки работоспособности API
 */

// Создаем директории для тестирования
if (!is_dir('logs')) {
    mkdir('logs', 0755, true);
}
if (!is_dir('output')) {
    mkdir('output', 0755, true);
}

// Подключаем необходимые классы
require_once 'src/Api/BitrixApiClient.php';
require_once 'src/Api/ClaudeApiClient.php';

// Функции для тестирования API

/**
 * Получение статуса системы
 *
 * @param array $config Конфигурация системы
 * @return array Статус системы
 */
function getSystemStatus(array $config): array {
    $status = [
        'system' => true,
        'config' => true,
        'bitrix_api' => false,
        'claude_api' => false,
        'directories' => []
    ];
    
    // Проверка директорий
    $requiredDirs = ['config', 'logs', 'output'];
    foreach ($requiredDirs as $dir) {
        $exists = is_dir($dir);
        $writable = $exists && is_writable($dir);
        $status['directories'][$dir] = [
            'exists' => $exists,
            'writable' => $writable
        ];
    }
    
    // Проверка подключения к Bitrix API (мок)
    try {
        $bitrixClient = new \Api\BitrixApiClient(
            $config['bitrix']['endpoint'],
            $config['bitrix']['login'],
            $config['bitrix']['password']
        );
        $auth = $bitrixClient->auth(); // Попытка авторизации
        $status['bitrix_api'] = true;
    } catch (\Exception $e) {
        $status['bitrix_error'] = $e->getMessage();
    }
    
    // Проверка подключения к Claude API
    try {
        if (!empty($config['claude']['api_key']) && 
            $config['claude']['api_key'] !== 'sk-ant-api03-your-api-key-here') {
            $claudeClient = new \Api\ClaudeApiClient(
                $config['claude']['api_key']
            );
            $claudeClient->setModel($config['claude']['model']);
            
            $status['claude_api'] = $claudeClient->checkConnection();
        } else {
            $status['claude_error'] = 'API key not configured';
        }
    } catch (\Exception $e) {
        $status['claude_error'] = $e->getMessage();
    }
    
    return $status;
}

/**
 * Получение статистики обработки
 *
 * @param array $config Конфигурация системы
 * @return array Данные статистики
 */
function getStats(array $config): array {
    $outputDir = $config['output_dir'] ?? 'output';
    $reportFiles = glob($outputDir . '/report_*.json');
    
    if (empty($reportFiles)) {
        return [
            'total_processed' => 0,
            'success' => 0,
            'failed' => 0,
            'average_uniqueness' => 0,
            'last_processed' => null
        ];
    }
    
    // Сортировка отчетов по дате (самые новые вначале)
    usort($reportFiles, function($a, $b) {
        return filemtime($b) - filemtime($a);
    });
    
    // Получаем данные из последнего отчета
    $latestReport = $reportFiles[0];
    $reportData = json_decode(file_get_contents($latestReport), true);
    
    // Рассчитываем среднюю уникальность (если есть данные)
    $avgUniqueness = 0;
    if (isset($reportData['stats']) && $reportData['stats']['unique'] > 0) {
        // Предполагаем, что в отчете сохраняются данные об уникальности каждого текста
        $avgUniqueness = round($reportData['stats']['unique'] * 100 / max(1, $reportData['stats']['success']), 1);
    }
    
    return [
        'total_processed' => $reportData['stats']['total'] ?? 0,
        'success' => $reportData['stats']['success'] ?? 0,
        'failed' => $reportData['stats']['failed'] ?? 0,
        'unique' => $reportData['stats']['unique'] ?? 0,
        'not_unique' => $reportData['stats']['not_unique'] ?? 0,
        'skipped' => $reportData['stats']['skipped'] ?? 0,
        'average_uniqueness' => $avgUniqueness,
        'last_processed' => date('Y-m-d H:i:s', filemtime($latestReport))
    ];
}

/**
 * Получение списка отчетов
 *
 * @param array $config Конфигурация системы
 * @return array Список отчетов
 */
function getReports(array $config): array {
    $outputDir = $config['output_dir'] ?? 'output';
    $reportFiles = glob($outputDir . '/report_*.json');
    
    if (empty($reportFiles)) {
        return [
            'reports' => []
        ];
    }
    
    // Сортировка отчетов по дате (самые новые вначале)
    usort($reportFiles, function($a, $b) {
        return filemtime($b) - filemtime($a);
    });
    
    $reports = [];
    foreach ($reportFiles as $file) {
        $reportData = json_decode(file_get_contents($file), true);
        $reports[] = [
            'filename' => basename($file),
            'date' => date('Y-m-d H:i:s', filemtime($file)),
            'processed' => $reportData['stats']['total'] ?? 0,
            'success' => $reportData['stats']['success'] ?? 0,
            'size' => round(filesize($file) / 1024, 2) // размер в КБ
        ];
    }
    
    return [
        'reports' => $reports
    ];
}

/**
 * Тестирование генерации на одном товаре
 *
 * @param array $data Параметры запроса
 * @param array $config Конфигурация системы
 * @return array Результат тестирования
 */
function testProduct(array $data, array $config): array {
    if (!isset($data['productId'])) {
        throw new \Exception('ID товара не указан');
    }
    
    $productId = (int) $data['productId'];
    
    // Инициализируем необходимые компоненты
    $bitrixClient = new \Api\BitrixApiClient(
        $config['bitrix']['endpoint'],
        $config['bitrix']['login'],
        $config['bitrix']['password']
    );
    
    $claudeClient = new \Api\ClaudeApiClient(
        $config['claude']['api_key']
    );
    $claudeClient->setModel($config['claude']['model']);
    
    // Упрощенная версия PromptGenerator для тестирования
    class PromptGenerator {
        public function generatePrompt(string $text): string {
            return "Переформулируй следующее описание товара, сохраняя все технические характеристики, но делая текст более привлекательным для покупателей:\n\n$text";
        }
    }
    $promptGenerator = new PromptGenerator();
    
    // Упрощенная версия UniquenessChecker для тестирования
    class UniquenessChecker {
        private $apiKey;
        private $textsDatabase = [];
        private $threshold = 70;
        
        public function __construct($apiKey, array $texts = []) {
            $this->apiKey = $apiKey;
            $this->textsDatabase = $texts;
        }
        
        public function setUniquenessThreshold(int $threshold): void {
            $this->threshold = $threshold;
        }
        
        public function addTextsForComparison(array $texts): void {
            $this->textsDatabase = array_merge($this->textsDatabase, $texts);
        }
        
        public function checkUniqueness(string $text, bool $useExternalApi = false): array {
            // Симуляция проверки уникальности
            $uniqueness = rand(75, 98); // Случайное значение от 75% до 98%
            
            return [
                'uniqueness' => $uniqueness,
                'is_unique' => $uniqueness >= $this->threshold,
                'details' => [
                    'method' => $useExternalApi ? 'external_api' : 'local',
                    'threshold' => $this->threshold,
                    'compared_texts' => count($this->textsDatabase)
                ]
            ];
        }
    }
    $uniquenessChecker = new UniquenessChecker(
        $config['text_ru']['api_key'] ?? null,
        []
    );
    $uniquenessChecker->setUniquenessThreshold($config['uniqueness']['threshold'] ?? 70);
    
    // Получаем информацию о товаре
    $product = $bitrixClient->getProductDetails($productId);
    
    if (empty($product)) {
        throw new \Exception("Товар с ID {$productId} не найден");
    }
    
    $originalText = $product['DETAIL_TEXT'];
    $productName = $product['NAME'];
    
    if (empty($originalText)) {
        throw new \Exception("У товара отсутствует описание");
    }
    
    // Генерируем промпт
    $prompt = $promptGenerator->generatePrompt($originalText);
    
    // Генерируем текст
    $startTime = microtime(true);
    $generationParameters = array_intersect_key(
        $config['claude'] ?? [],
        array_flip(['temperature', 'max_tokens', 'top_p'])
    );
    $generatedText = $claudeClient->generateText($prompt, $generationParameters);
    $endTime = microtime(true);
    $duration = round($endTime - $startTime, 2);
    
    // Проверяем уникальность
    $uniquenessResult = $uniquenessChecker->checkUniqueness($generatedText, false);
    $uniqueness = $uniquenessResult['uniqueness'];
    $isUnique = $uniquenessResult['is_unique'];
    
    // Сохраняем результаты в файл
    $outputDir = $config['output_dir'] ?? 'output';
    if (!is_dir($outputDir)) {
        mkdir($outputDir, 0755, true);
    }
    
    $resultFile = $outputDir . "/test_result_{$productId}_" . date('Y-m-d_H-i-s') . ".txt";
    
    $content = "Тестирование генерации для товара ID: {$productId}\n";
    $content .= "Название: {$productName}\n";
    $content .= "Дата: " . date('Y-m-d H:i:s') . "\n";
    $content .= "Уникальность: {$uniqueness}%\n\n";
    $content .= "ОРИГИНАЛЬНЫЙ ТЕКСТ:\n-----\n{$originalText}\n-----\n\n";
    $content .= "СГЕНЕРИРОВАННЫЙ ТЕКСТ:\n-----\n{$generatedText}\n-----\n";
    
    file_put_contents($resultFile, $content);
    
    return [
        'success' => true,
        'product' => [
            'id' => $productId,
            'name' => $productName
        ],
        'uniqueness' => $uniqueness,
        'is_unique' => $isUnique,
        'generation_time' => $duration,
        'original_text' => $originalText,
        'generated_text' => $generatedText,
        'result_file' => basename($resultFile)
    ];
}

// Конфигурация для тестирования
$config = json_decode(file_get_contents('config/config.json'), true);

echo "=== Testing API ===\n\n";

// Тестируем получение статуса системы
echo "Testing getSystemStatus()...\n";
$status = getSystemStatus($config);
echo "Status: " . json_encode($status, JSON_PRETTY_PRINT) . "\n\n";

// Тестируем получение статистики
echo "Testing getStats()...\n";
$stats = getStats($config);
echo "Stats: " . json_encode($stats, JSON_PRETTY_PRINT) . "\n\n";

// Создаем тестовый отчет, если его еще нет
$outputDir = $config['output_dir'] ?? 'output';
$reportFile = $outputDir . '/report_' . date('Y-m-d_H-i-s') . '.json';
$reportData = [
    'timestamp' => date('Y-m-d H:i:s'),
    'stats' => [
        'total' => 10,
        'success' => 8,
        'failed' => 2,
        'unique' => 7,
        'not_unique' => 1,
        'skipped' => 0,
        'errors' => ['Error 1', 'Error 2']
    ],
    'config' => [
        'batch_size' => 10,
        'min_uniqueness' => 70
    ]
];
file_put_contents($reportFile, json_encode($reportData, JSON_PRETTY_PRINT));
echo "Created test report: $reportFile\n\n";

// Тестируем получение списка отчетов
echo "Testing getReports()...\n";
$reports = getReports($config);
echo "Reports: " . json_encode($reports, JSON_PRETTY_PRINT) . "\n\n";

// Тестируем тестирование продукта
echo "Testing testProduct()...\n";
try {
    $testResult = testProduct(['productId' => 10001], $config);
    echo "Test result: " . json_encode($testResult, JSON_PRETTY_PRINT) . "\n\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n\n";
}

echo "=== API Testing Complete ===\n";
