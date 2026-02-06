<?php
/**
 * API для веб-интерфейса системы автоматизированного переписывания текстов
 * 
 * Предоставляет RESTful API для взаимодействия с системой через веб-интерфейс
 */

// Автозагрузка классов
require_once __DIR__ . '/../../vendor/autoload.php';

use Api\BitrixApiClient;
use Api\ClaudeApiClient;
use Core\PromptGenerator;
use Core\UniquenessChecker;
use Utils\ReportSanitizer;

// Загрузка конфигурации
$configFile = __DIR__ . '/../../config/config.json';
if (!file_exists($configFile)) {
    sendErrorResponse('Файл конфигурации не найден', 500);
}

$config = json_decode(file_get_contents($configFile), true);
if (json_last_error() !== JSON_ERROR_NONE) {
    sendErrorResponse('Ошибка при чтении конфигурации: ' . json_last_error_msg(), 500);
}

setCorsHeaders($config);

// Обработка preflight-запросов OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Базовая аутентификация для API
authenticate($config);

// Получение параметров запроса
$requestPath = $_SERVER['PATH_INFO'] ?? '/';
$requestMethod = $_SERVER['REQUEST_METHOD'];
$requestData = json_decode(file_get_contents('php://input'), true);
if (json_last_error() !== JSON_ERROR_NONE) {
    $requestData = [];
}

// Обработка запроса в зависимости от пути и метода
try {
    $response = routeRequest($requestPath, $requestMethod, $requestData, $config);
    echo json_encode($response);
} catch (Exception $e) {
    sendErrorResponse($e->getMessage(), 500);
}

/**
 * Маршрутизация запросов API
 *
 * @param string $path Путь запроса
 * @param string $method Метод HTTP (GET, POST)
 * @param array $data Данные запроса
 * @param array $config Конфигурация системы
 * @return array Ответ API
 * @throws Exception При ошибке обработки
 */
function routeRequest(string $path, string $method, array $data, array $config): array {
    // Инициализируем экземпляры классов, когда они нужны
    $controller = null;
    
    // Маршрутизация запросов
    switch (true) {
        // Получение статистики
        case $path === '/stats' && $method === 'GET':
            return getStats($config);
            
        // Запуск обработки
        case $path === '/process' && $method === 'POST':
            return startProcess($data, $config);
            
        // Тестирование на одном товаре
        case $path === '/test' && $method === 'POST':
            return testProduct($data, $config);
            
        // Получение журнала
        case $path === '/logs' && $method === 'GET':
            return getLogs($config);
            
        // Очистка журнала
        case $path === '/logs/clear' && $method === 'POST':
            return clearLogs($config);
            
        // Получение списка отчетов
        case $path === '/reports' && $method === 'GET':
            return getReports($config);
            
        // Получение конкретного отчета
        case preg_match('#^/reports/([^/]+)$#', $path, $matches) && $method === 'GET':
            return getReport($matches[1], $config);
            
        // Удаление отчета
        case preg_match('#^/reports/([^/]+)$#', $path, $matches) && $method === 'DELETE':
            return deleteReport($matches[1], $config);
            
        // Проверка статуса системы
        case $path === '/status' && $method === 'GET':
            return getSystemStatus($config);
            
        default:
            throw new Exception('Неизвестный путь API: ' . $path);
    }
}

/**
 * Resolves output directory path relative to project root
 *
 * @param array $config Configuration array
 * @return string Absolute path to output directory
 */
function getOutputDir(array $config): string {
    $outputDir = $config['output_dir'] ?? 'output';
    
    // If already absolute, return as-is
    if (strpos($outputDir, '/') === 0 || (strlen($outputDir) > 1 && $outputDir[1] === ':')) {
        return $outputDir;
    }
    
    // Resolve relative to project root
    return realpath(__DIR__ . '/../../') . '/' . $outputDir;
}

/**
 * Получение статистики обработки
 *
 * @param array $config Конфигурация системы
 * @return array Данные статистики
 */
function getStats(array $config): array {
    $outputDir = getOutputDir($config);
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
    
    // Validate JSON decode
    if ($reportData === null || json_last_error() !== JSON_ERROR_NONE) {
        return [
            'total_processed' => 0,
            'success' => 0,
            'failed' => 0,
            'average_uniqueness' => 0,
            'last_processed' => null
        ];
    }
    
    // Рассчитываем среднюю уникальность (если есть данные)
    $avgUniqueness = 0;
    if (isset($reportData['stats'])) {
        $stats = $reportData['stats'];
        // Предпочтительно считаем среднюю уникальность по накопленным значениям
        if (
            isset($stats['uniqueness_sum'], $stats['uniqueness_count']) &&
            $stats['uniqueness_count'] > 0
        ) {
            $avgUniqueness = round($stats['uniqueness_sum'] / $stats['uniqueness_count'], 1);
        } elseif (($stats['unique'] ?? 0) > 0 && ($stats['success'] ?? 0) > 0) {
            // Fallback для старых отчетов: доля уникальных среди успешных
            $avgUniqueness = round(($stats['unique'] * 100) / max(1, $stats['success']), 1);
        }
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
 * Запуск процесса обработки текстов
 *
 * @param array $data Параметры запроса
 * @param array $config Конфигурация системы
 * @return array Результат запуска
 */
function startProcess(array $data, array $config): array {
    $limit = isset($data['limit']) ? (int)$data['limit'] : 100;
    if ($limit < 1) {
        $limit = 1;
    }
    if ($limit > 10000) {
        $limit = 10000; // safety clamp
    }
    $filter = $data['filter'] ?? [];
    
    if (is_string($filter)) {
        $filter = json_decode($filter, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new Exception('Ошибка в формате фильтра JSON: ' . json_last_error_msg());
        }
    }
    
    // Запускаем процесс через CLI для избежания таймаутов браузера
    $filterJson = json_encode($filter);
    if ($filterJson === false) {
        throw new Exception('Не удалось сериализовать фильтр для запуска процесса');
    }
    $cliScript = realpath(__DIR__ . '/../../src/cli.php');
    if ($cliScript === false || !file_exists($cliScript)) {
        throw new Exception('CLI скрипт не найден по ожидаемому пути');
    }

    // PHP_BINARY points to FPM/CGI binary under web contexts, not CLI.
    // Use PHP_BINDIR to get the CLI binary, with fallback to 'php' in PATH.
    $phpBinaryCandiates = [
        PHP_BINDIR . '/php',  // CLI binary in bin dir
        'php',                 // Fallback to PATH
    ];
    $phpBinary = null;
    foreach ($phpBinaryCandiates as $candidate) {
        exec(sprintf('%s -v > /dev/null 2>&1', escapeshellarg($candidate)), $phpOutput, $phpStatus);
        if ($phpStatus === 0) {
            $phpBinary = $candidate;
            break;
        }
    }
    if ($phpBinary === null) {
        throw new Exception('PHP CLI не найден или недоступен для запуска фонового процесса');
    }

    $command = sprintf(
        '%s %s --action=process --limit=%d --filter=%s > /dev/null 2>&1 & echo $!',
        escapeshellarg($phpBinary),
        escapeshellarg($cliScript),
        $limit,
        escapeshellarg($filterJson)
    );
    
    exec($command, $output, $returnVar);
    
    $pid = isset($output[0]) ? (int)$output[0] : 0;
    if ($returnVar !== 0 || $pid <= 0) {
        throw new Exception('Ошибка при запуске процесса: ' . implode("\n", $output));
    }
    
    return [
        'success' => true,
        'message' => "Процесс обработки запущен для {$limit} товаров",
        'started_at' => date('Y-m-d H:i:s')
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
        throw new Exception('ID товара не указан');
    }
    
    $productId = (int) $data['productId'];
    
    // Инициализируем необходимые компоненты
    $bitrixClient = new BitrixApiClient(
        $config['bitrix']['endpoint'],
        $config['bitrix']['login'],
        $config['bitrix']['password']
    );
    
    $claudeClient = new ClaudeApiClient(
        $config['claude']['api_key']
    );
    $claudeClient->setModel($config['claude']['model']);
    
    $promptGenerator = new PromptGenerator();
    
    $uniquenessChecker = new UniquenessChecker(
        $config['text_ru']['api_key'] ?? null,
        []
    );
    $uniquenessChecker->setUniquenessThreshold($config['uniqueness']['threshold'] ?? 70);
    $useExternalApi = $config['uniqueness']['use_external_api'] ?? ($config['use_external_api'] ?? true);
    $textDatabasePath = $config['uniqueness']['text_database'] ?? null;
    if (!empty($textDatabasePath) && file_exists($textDatabasePath)) {
        $texts = file($textDatabasePath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        if ($texts !== false) {
            $uniquenessChecker->addTextsForComparison($texts);
        }
    }
    
    // Получаем информацию о товаре
    $product = $bitrixClient->getProductDetails($productId);
    
    if (empty($product)) {
        throw new Exception("Товар с ID {$productId} не найден");
    }
    
    $originalText = $product['DETAIL_TEXT'];
    $productName = $product['NAME'];
    
    if (empty($originalText)) {
        throw new Exception("У товара отсутствует описание");
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
    $uniquenessResult = $uniquenessChecker->checkUniqueness($generatedText, $useExternalApi);
    $uniqueness = $uniquenessResult['uniqueness'];
    $isUnique = $uniquenessResult['is_unique'];
    
    // Сохраняем результаты в файл
    $outputDir = getOutputDir($config);
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

/**
 * Получение журнала системы
 *
 * @param array $config Конфигурация системы
 * @return array Содержимое журнала
 */
function getLogs(array $config): array {
    $logFile = $config['log_file'] ?? 'logs/rewrite.log';
    
    if (!file_exists($logFile)) {
        return [
            'entries' => []
        ];
    }
    
    // Читаем последние 100 строк лога
    $lines = [];
    $fp = fopen($logFile, 'r');
    if ($fp) {
        $pos = -1;
        $line = '';
        $count = 0;
        $maxLines = 100;
        
        while ($count < $maxLines && fseek($fp, $pos, SEEK_END) !== -1) {
            $char = fgetc($fp);
            if ($char === "\n") {
                $lines[] = $line;
                $line = '';
                $count++;
                if ($count >= $maxLines) break;
            } else {
                $line = $char . $line;
            }
            $pos--;
        }
        
        fclose($fp);
    }
    
    // Возвращаем лог в хронологическом порядке
    $lines = array_reverse($lines);
    
    // Парсим записи лога
    $entries = [];
    foreach ($lines as $line) {
        if (preg_match('/\[(.*?)\] \[(.*?)\] (.*)/', $line, $matches)) {
            $entries[] = [
                'timestamp' => $matches[1],
                'level' => $matches[2],
                'message' => $matches[3]
            ];
        }
    }
    
    return [
        'entries' => $entries
    ];
}

/**
 * Очистка журнала системы
 *
 * @param array $config Конфигурация системы
 * @return array Результат очистки
 */
function clearLogs(array $config): array {
    $logFile = $config['log_file'] ?? 'logs/rewrite.log';
    
    if (file_exists($logFile)) {
        file_put_contents($logFile, '');
    }
    
    return [
        'success' => true,
        'message' => 'Журнал успешно очищен'
    ];
}

/**
 * Получение списка отчетов
 *
 * @param array $config Конфигурация системы
 * @return array Список отчетов
 */
function getReports(array $config): array {
    $outputDir = getOutputDir($config);
    ReportSanitizer::sanitizeExistingReports($outputDir);
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
        
        // Skip invalid report files to prevent API 500s
        if ($reportData === null || json_last_error() !== JSON_ERROR_NONE || !is_array($reportData)) {
            continue;
        }

        // Require expected report structure
        if (!isset($reportData['stats']) || !is_array($reportData['stats'])) {
            continue;
        }
        
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
 * Получение конкретного отчета
 *
 * @param string $filename Имя файла отчета
 * @param array $config Конфигурация системы
 * @return array Содержимое отчета
 */
function getReport(string $filename, array $config): array {
    $outputDir = getOutputDir($config);
    validateReportFilename($filename);
    $reportFile = $outputDir . '/' . $filename;

    if (!file_exists($reportFile)) {
        throw new Exception('Отчет не найден');
    }
    
    $reportData = ReportSanitizer::sanitizeReportFile($reportFile, true);

    return $reportData;
}

/**
 * Удаление отчета
 *
 * @param string $filename Имя файла отчета
 * @param array $config Конфигурация системы
 * @return array Результат удаления
 */
function deleteReport(string $filename, array $config): array {
    $outputDir = getOutputDir($config);
    validateReportFilename($filename);
    $reportFile = $outputDir . '/' . $filename;
    
    if (!file_exists($reportFile)) {
        throw new Exception('Отчет не найден');
    }
    
    if (unlink($reportFile)) {
        return [
            'success' => true,
            'message' => 'Отчет успешно удален'
        ];
    } else {
        throw new Exception('Ошибка при удалении отчета');
    }
}

/**
 * Валидирует имя файла отчета и предотвращает выход за пределы директории
 *
 * @param string $filename Имя файла
 * @return void
 * @throws Exception Если имя файла некорректно
 */
function validateReportFilename(string $filename): void {
    // Запрещаем любые разделители директорий и последовательности обхода
    if (strpos($filename, '/') !== false || strpos($filename, '\\') !== false || strpos($filename, '..') !== false) {
        throw new Exception('Некорректное имя отчета');
    }

    if (!preg_match('/^report_[A-Za-z0-9._-]+\.json$/', $filename)) {
        throw new Exception('Некорректное имя отчета');
    }
}

/**
 * Проверка статуса системы
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
        $exists = is_dir(__DIR__ . '/../../' . $dir);
        $writable = $exists && is_writable(__DIR__ . '/../../' . $dir);
        $status['directories'][$dir] = [
            'exists' => $exists,
            'writable' => $writable
        ];
    }
    
    // Проверка подключения к Bitrix API (мок)
    try {
        require_once __DIR__ . '/../../src/Api/BitrixApiClient.php';
        $bitrixClient = new \Api\BitrixApiClient(
            $config['bitrix']['endpoint'],
            $config['bitrix']['login'],
            $config['bitrix']['password']
        );
        $bitrixClient->auth(); // Попытка авторизации
        $status['bitrix_api'] = true;
    } catch (\Exception $e) {
        $status['bitrix_error'] = $e->getMessage();
    }
    
    // Проверка подключения к Claude API
    try {
        require_once __DIR__ . '/../../src/Api/ClaudeApiClient.php';
        if (!empty($config['claude']['api_key']) && 
            $config['claude']['api_key'] !== 'sk-ant-api03-your-api-key-here') {
            $claudeClient = new \Api\ClaudeApiClient(
                $config['claude']['api_key']
            );
            $claudeClient->setModel($config['claude']['model']);

            // Делаем недорогой пинг вместо платной генерации
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
 * Базовая аутентификация для API
 *
 * @param array $config Конфигурация системы
 * @return void
 * @throws Exception Если аутентификация не прошла
 */
function authenticate(array $config): void {
    $clientIp = $_SERVER['REMOTE_ADDR'] ?? '';
    $isLocal = $clientIp === '127.0.0.1' || $clientIp === '::1';

    $apiConfig = $config['admin_api'] ?? [];
    $apiKey = trim($apiConfig['api_key'] ?? '');
    $allowLocal = $apiConfig['allow_local_without_key'] ?? false;

    // Allow only when explicitly configured and no key is present
    if ($isLocal && $allowLocal && $apiKey === '') {
        return;
    }

    if ($apiKey === '') {
        sendErrorResponse('API key is not configured', 401);
    }

    $providedKey = $_SERVER['HTTP_X_API_KEY'] ?? '';
    if ($providedKey === '' || !hash_equals($apiKey, $providedKey)) {
        sendErrorResponse('Unauthorized', 401);
    }
}

/**
 * Отправка сообщения об ошибке
 *
 * @param string $message Сообщение об ошибке
 * @param int $code HTTP-код ответа
 * @return void
 */
function sendErrorResponse(string $message, int $code = 400): void {
    http_response_code($code);
    echo json_encode([
        'error' => true,
        'message' => $message
    ]);
    exit;
}

/**
 * Устанавливает CORS-заголовки с учетом списка разрешенных источников
 */
function setCorsHeaders(array $config): void {
    header('Content-Type: application/json');
    header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, X-API-KEY');

    $allowedOrigins = $config['admin_api']['allowed_origins'] ?? [];
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';

    if (!empty($allowedOrigins) && $origin !== '' && in_array($origin, $allowedOrigins, true)) {
        header('Access-Control-Allow-Origin: ' . $origin);
    } else {
        header_remove('Access-Control-Allow-Origin');
    }
}
