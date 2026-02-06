<?php
/**
 * Оптимизированный командный интерфейс для запуска системы автоматизации переписывания текстов
 * 
 * Позволяет запускать различные операции системы через командную строку
 * с ускоренной обработкой транзакций и минимальными задержками
 * 
 * Использование:
 *   php cli_fast.php --action=<action> [options]
 * 
 * Доступные действия:
 *   process - Обработка товаров
 *   export - Экспорт товаров из Битрикс
 *   import - Импорт товаров в Битрикс
 *   test - Тестирование генерации на одном товаре
 *   stats - Просмотр статистики
 */
namespace App;

// Автозагрузка классов
require_once __DIR__ . '/Api/BitrixApiClient_fast.php';
require_once __DIR__ . '/Api/ClaudeApiClient.php';
require_once __DIR__ . '/Core/UniquenessChecker_fast.php';
require_once __DIR__ . '/Core/PromptGenerator.php';
require_once __DIR__ . '/Core/TextRewriteController.php';
require_once __DIR__ . '/Utils/ReportSanitizer.php';

use Exception;
use Api\BitrixApiClient;
use Api\ClaudeApiClient;
use Core\TextRewriteController;
use Core\PromptGenerator;
use Core\UniquenessChecker;

// Загрузка конфигурации
$configFile = __DIR__ . '/../config/config.json';
if (!file_exists($configFile)) {
    die("Ошибка: Файл конфигурации не найден: {$configFile}\n");
}

$config = json_decode(file_get_contents($configFile), true);
if (json_last_error() !== JSON_ERROR_NONE) {
    die("Ошибка при чтении конфигурации: " . json_last_error_msg() . "\n");
}

// Парсинг аргументов командной строки
$shortopts = "";
$longopts = [
    "action::",
    "filter::",
    "limit::",
    "product-id::",
    "verbose::",
    "config::",
    "file::",
    "help::",
    "parallel-requests::" // Новый параметр для указания количества параллельных запросов
];
$options = getopt($shortopts, $longopts);

// Вывод справки
if (isset($options['help'])) {
    showHelp();
    exit(0);
}

// Проверка наличия действия
if (!isset($options['action'])) {
    echo "Ошибка: Не указано действие. Используйте --action=<action>\n";
    showHelp();
    exit(1);
}

// Применение дополнительных опций из командной строки
if (isset($options['config'])) {
    $customConfigFile = $options['config'];
    if (!file_exists($customConfigFile)) {
        die("Ошибка: Указанный файл конфигурации не найден: {$customConfigFile}\n");
    }
    
    $customConfig = json_decode(file_get_contents($customConfigFile), true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        die("Ошибка при чтении пользовательской конфигурации: " . json_last_error_msg() . "\n");
    }
    
    // Объединяем конфигурации
    $config = array_merge($config, $customConfig);
    echo "Пользовательская конфигурация загружена: {$customConfigFile}\n";
}

// Включение подробного вывода
$verbose = isset($options['verbose']) && $options['verbose'] !== 'false';

// Определение количества параллельных запросов
$parallelRequests = isset($options['parallel-requests']) ? (int)$options['parallel-requests'] : 2;

// Инициализация компонентов системы
try {
    // Создаем экземпляры основных классов
    $bitrixClient = new BitrixApiClient(
        $config['bitrix']['endpoint'],
        $config['bitrix']['login'],
        $config['bitrix']['password']
    );
    
    // Устанавливаем количество параллельных запросов для ускорения обработки
    $bitrixClient->setConcurrentRequests($parallelRequests);
    
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
    
    // Создаем главный контроллер
    $controller = new TextRewriteController(
        $bitrixClient,
        $claudeClient,
        $promptGenerator,
        $uniquenessChecker,
        $config
    );
    
    // Если есть база текстов для проверки уникальности
    if (isset($config['uniqueness']['text_database']) && file_exists($config['uniqueness']['text_database'])) {
        $controller->loadTextDatabase($config['uniqueness']['text_database']);
    }
    
    // Выполнение действия
    $action = $options['action'];
    
    // Начало замера времени выполнения
    $startTime = microtime(true);
    
    switch ($action) {
        case 'process':
            processProducts($controller, $options, $verbose);
            break;
            
        case 'export':
            exportProducts($bitrixClient, $options, $verbose, $config);
            break;
            
        case 'import':
            importProducts($bitrixClient, $options, $verbose);
            break;
            
        case 'test':
            testGeneration($controller, $bitrixClient, $claudeClient, $promptGenerator, $uniquenessChecker, $options, $verbose, $config);
            break;
            
        case 'stats':
            showStats($config);
            break;
            
        default:
            echo "Ошибка: Неизвестное действие: {$action}\n";
            showHelp();
            exit(1);
    }
    
    // Конец замера времени выполнения
    $endTime = microtime(true);
    $executionTime = round($endTime - $startTime, 2);
    echo "\nВремя выполнения: {$executionTime} секунд\n";
    
} catch (Exception $e) {
    die("Критическая ошибка: " . $e->getMessage() . "\n");
}

/**
 * Обработка товаров
 *
 * @param TextRewriteController $controller Контроллер системы
 * @param array $options Опции командной строки
 * @param bool $verbose Подробный вывод
 */
function processProducts(TextRewriteController $controller, array $options, bool $verbose): void {
    echo "Запуск обработки товаров...\n";
    
    // Парсинг фильтра товаров
    $filter = [];
    if (isset($options['filter'])) {
        $filterJson = $options['filter'];
        $filter = json_decode($filterJson, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            die("Ошибка при разборе фильтра: " . json_last_error_msg() . "\n");
        }
        
        echo "Применен фильтр: " . json_encode($filter, JSON_UNESCAPED_UNICODE) . "\n";
    }
    
    // Ограничение количества товаров
    $limit = 100;
    if (isset($options['limit']) && is_numeric($options['limit'])) {
        $limit = (int) $options['limit'];
    }
    
    echo "Ограничение количества товаров: {$limit}\n";
    
    // Запуск обработки
    $startTime = microtime(true);
    $results = $controller->runFullProcess($filter, $limit);
    $endTime = microtime(true);
    $duration = round($endTime - $startTime, 2);
    
    // Вывод результатов
    echo "\nОбработка завершена за {$duration} секунд.\n";
    echo "Результаты:\n";
    echo "- Всего обработано: {$results['total']}\n";
    echo "- Успешно: {$results['success']}\n";
    echo "- Неудачно: {$results['failed']}\n";
    echo "- Уникальных: {$results['unique']}\n";
    echo "- Недостаточно уникальных: {$results['not_unique']}\n";
    echo "- Пропущено: {$results['skipped']}\n";
    
    if ($verbose && !empty($results['errors'])) {
        echo "\nОшибки:\n";
        foreach ($results['errors'] as $error) {
            echo "- {$error}\n";
        }
    }
}

/**
 * Экспорт товаров из Битрикс
 *
 * @param BitrixApiClient $bitrixClient Клиент API Битрикс
 * @param array $options Опции командной строки
 * @param bool $verbose Подробный вывод
 * @param array $config Конфигурация
 */
function exportProducts(BitrixApiClient $bitrixClient, array $options, bool $verbose, array $config): void {
    echo "Экспорт товаров из Битрикс...\n";
    
    // Парсинг фильтра товаров
    $filter = [];
    if (isset($options['filter'])) {
        $filterJson = $options['filter'];
        $filter = json_decode($filterJson, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            die("Ошибка при разборе фильтра: " . json_last_error_msg() . "\n");
        }
        
        echo "Применен фильтр: " . json_encode($filter, JSON_UNESCAPED_UNICODE) . "\n";
    }
    
    // Путь для сохранения CSV
    $outputDir = $config['output_dir'] ?? 'output';
    if (!is_dir($outputDir)) {
        mkdir($outputDir, 0755, true);
    }
    
    $csvPath = $outputDir . '/export_' . date('Y-m-d_H-i-s') . '.csv';
    
    // Экспорт товаров
    try {
        $count = $bitrixClient->exportProductsToCsv($filter, $csvPath);
        echo "Экспорт успешно завершен.\n";
        echo "Экспортировано товаров: {$count}\n";
        echo "Файл сохранен: {$csvPath}\n";
    } catch (Exception $e) {
        die("Ошибка при экспорте: " . $e->getMessage() . "\n");
    }
}

/**
 * Импорт товаров в Битрикс (оптимизированная версия)
 *
 * @param BitrixApiClient $bitrixClient Клиент API Битрикс
 * @param array $options Опции командной строки
 * @param bool $verbose Подробный вывод
 */
function importProducts(BitrixApiClient $bitrixClient, array $options, bool $verbose): void {
    echo "Импорт товаров в Битрикс (оптимизированная версия)...\n";
    
    // Проверка наличия файла для импорта
    if (!isset($options['file'])) {
        die("Ошибка: Не указан файл для импорта. Используйте --file=<path>\n");
    }
    
    $filePath = $options['file'];
    if (!file_exists($filePath)) {
        die("Ошибка: Файл для импорта не найден: {$filePath}\n");
    }
    
    // Маппинг полей CSV и Битрикс
    $mapping = [
        'ID' => 'ID',
        'NAME' => 'NAME',
        'DETAIL_TEXT' => 'DETAIL_TEXT',
        'DETAIL_TEXT_TYPE' => 'DETAIL_TEXT_TYPE'
    ];
    
    // Импорт товаров
    try {
        $startTime = microtime(true);
        $results = $bitrixClient->importProductsFromCsv($filePath, $mapping);
        $endTime = microtime(true);
        $duration = round($endTime - $startTime, 2);
        
        echo "Импорт успешно завершен за {$duration} секунд.\n";
        echo "Результаты:\n";
        echo "- Всего записей: {$results['total']}\n";
        echo "- Успешно: {$results['success']}\n";
        echo "- Неудачно: {$results['failed']}\n";
        
        // Проверка на несоответствие (MISMATCH)
        if ($results['total'] != ($results['success'] + $results['failed'])) {
            echo "ВНИМАНИЕ: НЕСООТВЕТСТВИЕ В КОЛИЧЕСТВЕ ТРАНЗАКЦИЙ!\n";
            echo "- Total: {$results['total']}\n";
            echo "- Success: {$results['success']}\n";
            echo "- Failed: {$results['failed']}\n";
            echo "- Expected total: " . ($results['success'] + $results['failed']) . "\n";
            echo "- Mismatch: " . ($results['total'] - ($results['success'] + $results['failed'])) . "\n";
        }
        
        if ($verbose && !empty($results['errors'])) {
            echo "\nОшибки:\n";
            foreach ($results['errors'] as $error) {
                echo "- {$error}\n";
            }
        }
    } catch (Exception $e) {
        die("Ошибка при импорте: " . $e->getMessage() . "\n");
    }
}

/**
 * Тестирование генерации на одном товаре
 *
 * @param TextRewriteController $controller Контроллер системы
 * @param BitrixApiClient $bitrixClient Клиент API Битрикс
 * @param ClaudeApiClient $claudeClient Клиент API Claude
 * @param PromptGenerator $promptGenerator Генератор промптов
 * @param UniquenessChecker $uniquenessChecker Проверка уникальности
 * @param array $options Опции командной строки
 * @param bool $verbose Подробный вывод
 * @param array $config Конфигурация для записи файлов
 */
function testGeneration(
    TextRewriteController $controller,
    BitrixApiClient $bitrixClient,
    ClaudeApiClient $claudeClient,
    PromptGenerator $promptGenerator,
    UniquenessChecker $uniquenessChecker,
    array $options,
    bool $verbose,
    array $config
): void {
    echo "Тестирование генерации текста...\n";
    
    // Проверка наличия ID товара
    if (!isset($options['product-id'])) {
        die("Ошибка: Не указан ID товара. Используйте --product-id=<id>\n");
    }
    
    $productId = (int) $options['product-id'];
    echo "Тестирование для товара ID: {$productId}\n";
    
    try {
        // Получаем информацию о товаре
        $product = $bitrixClient->getProductDetails($productId);
        
        if (empty($product)) {
            die("Ошибка: Товар с ID {$productId} не найден\n");
        }
        
        $originalText = $product['DETAIL_TEXT'];
        $productName = $product['NAME'];
        
        if (empty($originalText)) {
            die("Ошибка: У товара отсутствует описание\n");
        }
        
        // Генерируем промпт
        echo "Генерация промпта...\n";
        $prompt = $promptGenerator->generatePrompt($originalText);
        
        if ($verbose) {
            echo "\nПромпт:\n-----\n";
            echo $prompt;
            echo "\n-----\n";
        }
        
        // Генерируем текст
        echo "Отправка запроса к Claude API...\n";
        $startTime = microtime(true);
        $generationParameters = array_intersect_key(
            $config['claude'] ?? [],
            array_flip(['temperature', 'max_tokens', 'top_p'])
        );
        $generatedText = $claudeClient->generateText($prompt, $generationParameters);
        $endTime = microtime(true);
        $duration = round($endTime - $startTime, 2);
        
        echo "Текст сгенерирован за {$duration} секунд.\n";
        
        // Проверяем уникальность
        echo "Проверка уникальности...\n";
        $uniquenessResult = $uniquenessChecker->checkUniqueness($generatedText, false);
        $uniqueness = $uniquenessResult['uniqueness'];
        $isUnique = $uniquenessResult['is_unique'];
        
        echo "Уникальность: {$uniqueness}%\n";
        echo "Статус: " . ($isUnique ? "Уникален" : "Недостаточно уникален") . "\n";
        
        // Выводим результаты
        echo "\nОригинальный текст:\n-----\n";
        echo $originalText;
        echo "\n-----\n\n";
        
        echo "Сгенерированный текст:\n-----\n";
        echo $generatedText;
        echo "\n-----\n";
        
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
        echo "Результаты сохранены в файл: {$resultFile}\n";
        
    } catch (Exception $e) {
        die("Ошибка при тестировании: " . $e->getMessage() . "\n");
    }
}

/**
 * Просмотр статистики
 *
 * @param array $config Конфигурация
 */
function showStats(array $config): void {
    echo "Просмотр статистики...\n";
    
    $outputDir = $config['output_dir'] ?? 'output';
    if (!is_dir($outputDir)) {
        echo "Директория с отчетами не найдена: {$outputDir}\n";
        return;
    }
    
    // Поиск файлов отчетов
    $reportFiles = glob($outputDir . '/report_*.json');
    
    if (empty($reportFiles)) {
        echo "Отчеты не найдены в директории: {$outputDir}\n";
        return;
    }
    
    // Сортировка отчетов по дате (самые новые вначале)
    usort($reportFiles, function($a, $b) {
        return filemtime($b) - filemtime($a);
    });
    
    echo "Найдено отчетов: " . count($reportFiles) . "\n\n";
    
    // Последний отчет
    $latestReport = $reportFiles[0];
    $reportData = json_decode(file_get_contents($latestReport), true);
    
    echo "Последний отчет: " . basename($latestReport) . "\n";
    echo "Дата создания: " . date('Y-m-d H:i:s', filemtime($latestReport)) . "\n\n";
    
    // Вывод статистики
    if (isset($reportData['stats'])) {
        $stats = $reportData['stats'];
        
        echo "Статистика:\n";
        echo "- Всего обработано: " . ($stats['total'] ?? 'Н/Д') . "\n";
        echo "- Успешно: " . ($stats['success'] ?? 'Н/Д') . "\n";
        echo "- Неудачно: " . ($stats['failed'] ?? 'Н/Д') . "\n";
        echo "- Уникальных: " . ($stats['unique'] ?? 'Н/Д') . "\n";
        echo "- Недостаточно уникальных: " . ($stats['not_unique'] ?? 'Н/Д') . "\n";
        echo "- Пропущено: " . ($stats['skipped'] ?? 'Н/Д') . "\n";
        
        if (!empty($stats['errors'])) {
            echo "\nПоследние ошибки:\n";
            $errorsCount = min(count($stats['errors']), 5);
            for ($i = 0; $i < $errorsCount; $i++) {
                echo "- " . $stats['errors'][$i] . "\n";
            }
            
            if (count($stats['errors']) > 5) {
                echo "... и еще " . (count($stats['errors']) - 5) . " ошибок.\n";
            }
        }
    } else {
        echo "Структура отчета не содержит статистики.\n";
    }
    
    echo "\nСписок всех отчетов:\n";
    $i = 1;
    foreach ($reportFiles as $file) {
        $fileDate = date('Y-m-d H:i:s', filemtime($file));
        $fileSize = round(filesize($file) / 1024, 2);
        echo "{$i}. " . basename($file) . " - {$fileDate} ({$fileSize} КБ)\n";
        $i++;
        
        if ($i > 10) {
            echo "... и еще " . (count($reportFiles) - 10) . " отчетов.\n";
            break;
        }
    }
}

/**
 * Вывод справки
 */
function showHelp(): void {
    echo <<<EOT
Оптимизированная система автоматизации переписывания текстов

Использование:
  php cli_fast.php --action=<action> [options]

Доступные действия:
  process   - Обработка товаров
  export    - Экспорт товаров из Битрикс
  import    - Импорт товаров в Битрикс (ускоренный вариант)
  test      - Тестирование генерации на одном товаре
  stats     - Просмотр статистики

Общие опции:
  --help                   - Показать эту справку
  --verbose=[true]         - Подробный вывод
  --config=<path>          - Путь к пользовательскому файлу конфигурации
  --parallel-requests=<N>  - Количество параллельных запросов (по умолчанию 2)

Опции для 'process':
  --filter=<json>     - Фильтр товаров в формате JSON
  --limit=<number>    - Ограничение количества товаров (по умолчанию 100)

Опции для 'export':
  --filter=<json>     - Фильтр товаров в формате JSON

Опции для 'import':
  --file=<path>       - Путь к CSV-файлу для импорта

Опции для 'test':
  --product-id=<id>   - ID товара для тестирования

Примеры:
  php cli_fast.php --action=process --limit=50
  php cli_fast.php --action=export --filter='{"SECTION_ID": 10}'
  php cli_fast.php --action=import --file=data/1.csv --parallel-requests=4
  php cli_fast.php --action=test --product-id=10001
  php cli_fast.php --action=stats

EOT;
}
