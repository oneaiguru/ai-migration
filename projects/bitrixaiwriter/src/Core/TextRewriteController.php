<?php
/**
 * Главный контроллер системы автоматизированного переписывания текстов
 * 
 * Координирует работу всех модулей и обеспечивает полный цикл обработки:
 * Экспорт данных → Обработка → Генерация → Проверка уникальности → Импорт
 */
namespace Core;

use Api\BitrixApiClient;
use Api\ClaudeApiClient;
use Core\PromptGenerator;
use Core\UniquenessChecker;
use Utils\ReportSanitizer;

class TextRewriteController {
    private $bitrixClient;
    private $claudeClient;
    private $promptGenerator;
    private $uniquenessChecker;
    private $logger;
    private $config;
    private $claudeParameters = [];
    
    private $processed = [
        'total' => 0,
        'success' => 0,
        'failed' => 0,
        'unique' => 0,
        'not_unique' => 0,
        'skipped' => 0,
        'errors' => [],
        'uniqueness_sum' => 0,
        'uniqueness_count' => 0
    ];
    
    private $textDatabase = [];
    
    /**
     * Конструктор
     *
     * @param BitrixApiClient $bitrixClient Клиент API Битрикс
     * @param ClaudeApiClient $claudeClient Клиент API Claude
     * @param PromptGenerator $promptGenerator Генератор промптов
     * @param UniquenessChecker $uniquenessChecker Проверка уникальности
     * @param array $config Конфигурация системы
     */
    public function __construct(
        BitrixApiClient $bitrixClient,
        ClaudeApiClient $claudeClient,
        PromptGenerator $promptGenerator,
        UniquenessChecker $uniquenessChecker,
        array $config = []
    ) {
        $this->bitrixClient = $bitrixClient;
        $this->claudeClient = $claudeClient;
        $this->promptGenerator = $promptGenerator;
        $this->uniquenessChecker = $uniquenessChecker;
        
        // Конфигурация по умолчанию
        $defaultConfig = [
            'batch_size' => 10,  // Размер пакета для обработки
            'retry_attempts' => 3, // Количество попыток при ошибке
            'min_uniqueness' => 70, // Минимальная уникальность (%)
            'log_file' => 'rewrite.log', // Файл логов
            'save_history' => true, // Сохранять историю текстов
            'use_external_api' => true, // Использовать внешний API для проверки уникальности
            'output_dir' => 'output', // Директория для выходных файлов
        ];
        
        $this->config = array_merge($defaultConfig, $config);
        $uniquenessConfig = $config['uniqueness'] ?? [];
        if (isset($uniquenessConfig['retry_attempts'])) {
            $this->config['retry_attempts'] = $uniquenessConfig['retry_attempts'];
        }
        if (isset($uniquenessConfig['use_external_api'])) {
            $this->config['use_external_api'] = $uniquenessConfig['use_external_api'];
        }
        if (isset($uniquenessConfig['threshold'])) {
            $this->config['min_uniqueness'] = $uniquenessConfig['threshold'];
        }

        $claudeConfig = $config['claude'] ?? [];
        $this->claudeParameters = array_intersect_key(
            $claudeConfig,
            array_flip(['temperature', 'max_tokens', 'top_p'])
        );
        
        // Инициализируем логгер
         $this->logger = new SimpleLogger($this->config['log_file']);
         
         // Resolve output_dir to absolute path relative to project root
         // This ensures reports are found by the admin API regardless of CWD
         $this->config['output_dir'] = $this->resolveOutputDir($this->config['output_dir']);
         
         // Создаем директорию для выходных файлов, если она не существует
         if (!is_dir($this->config['output_dir'])) {
             mkdir($this->config['output_dir'], 0755, true);
         }
    }
    
    /**
     * Загружает базу текстов для проверки уникальности
     *
     * @param string $filePath Путь к файлу с текстами
     * @return int Количество загруженных текстов
     */
    public function loadTextDatabase(string $filePath): int {
        if (!file_exists($filePath)) {
            $this->logger->warning("Text database file not found: $filePath");
            return 0;
        }
        
        $texts = file($filePath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        
        // Handle the case where file() fails (permissions or I/O errors)
        if ($texts === false) {
            $this->logger->error("Failed to read text database file: $filePath (check permissions or I/O errors)");
            return 0;
        }
        
        $this->textDatabase = $texts;
        $this->uniquenessChecker->addTextsForComparison($texts);
        
        $this->logger->info("Loaded " . count($texts) . " texts into the database");
        return count($texts);
    }
    
    /**
     * Запускает полный процесс обработки для заданного фильтра товаров
     *
     * @param array $filter Фильтр товаров для Битрикс API
     * @param int $limit Максимальное количество товаров для обработки
     * @return array Результаты обработки
     */
    public function runFullProcess(array $filter, int $limit = 100): array {
        $this->logger->info("Starting full process with limit: $limit");
        $startTime = microtime(true);
        
        try {
            // Сбрасываем статистику
            $this->resetStats();
            
            // Извлекаем товары
            $products = $this->bitrixClient->getProducts($filter, ['ID', 'NAME', 'DETAIL_TEXT'], $limit);
            
            if (empty($products)) {
                $this->logger->warning("No products found for the given filter");
                return $this->processed;
            }
            
            $this->logger->info("Found " . count($products) . " products to process");
            
            // Обрабатываем товары пакетами
            $batches = array_chunk($products, $this->config['batch_size']);
            
            foreach ($batches as $batchIndex => $batch) {
                $this->logger->info("Processing batch " . ($batchIndex + 1) . " of " . count($batches));
                $this->processBatch($batch);
            }
            
            // Создаем отчет
            $this->generateReport();
            
            $endTime = microtime(true);
            $duration = round($endTime - $startTime, 2);
            
            $this->logger->info("Full process completed in $duration seconds");
            $this->logger->info("Stats: " . json_encode($this->processed));
            
            return $this->processed;
            
        } catch (\Exception $e) {
            $this->logger->error("Error in full process: " . $e->getMessage());
            $this->processed['errors'][] = "Global error: " . $e->getMessage();
            return $this->processed;
        }
    }
    
    /**
     * Обрабатывает пакет товаров
     *
     * @param array $batch Массив товаров для обработки
     */
    private function processBatch(array $batch): void {
        $updates = [];
        $updateMetadata = [];
        
        foreach ($batch as $product) {
            $this->processed['total']++;
            
            try {
                $productId = $product['ID'];
                $originalText = $product['DETAIL_TEXT'];
                $productName = $product['NAME'];
                
                if (empty($originalText)) {
                    $this->logger->warning("Product #$productId has empty description, skipping");
                    $this->processed['skipped']++;
                    continue;
                }
                
                $this->logger->info("Processing product #$productId: $productName");
                
                // Генерируем новый текст
                $generated = $this->generateUniqueText($productId, $productName, $originalText);
                
                if ($generated === false) {
                    $this->processed['failed']++;
                    continue;
                }
                
                $newText = $generated['text'];
                $uniquenessValue = $generated['uniqueness'];
                
                // Добавляем в список обновлений
                $updates[$productId] = [
                    'DETAIL_TEXT' => $newText,
                    'DETAIL_TEXT_TYPE' => 'html'
                ];
                $updateMetadata[$productId] = [
                    'text' => $newText,
                    'uniqueness' => $uniquenessValue
                ];
                
            } catch (\Exception $e) {
                $this->logger->error("Error processing product #{$product['ID']}: " . $e->getMessage());
                $this->processed['errors'][] = "Product #{$product['ID']}: " . $e->getMessage();
                $this->processed['failed']++;
            }
        }
        
        // Обновляем товары в Битрикс
        if (!empty($updates)) {
            try {
                $results = $this->bitrixClient->bulkUpdateProducts($updates);
                
                foreach ($results as $productId => $result) {
                    if ($result['success']) {
                        $this->processed['success']++;
                        $this->processed['uniqueness_sum'] += $updateMetadata[$productId]['uniqueness'] ?? 0;
                        $this->processed['uniqueness_count']++;
                        
                        // Сохраняем текст в базу, если включено сохранение истории
                        if ($this->config['save_history']) {
                            $text = $updateMetadata[$productId]['text'] ?? null;
                            if ($text !== null) {
                                $this->textDatabase[] = $text;
                                $this->uniquenessChecker->addTextsForComparison([$text]);
                            }
                        }
                    } else {
                        $this->logger->error("Failed to update product #$productId: " . $result['error']);
                        $this->processed['errors'][] = "Update failed for #$productId: " . $result['error'];
                        $this->processed['failed']++;
                    }
                }
                
            } catch (\Exception $e) {
                $this->logger->error("Batch update error: " . $e->getMessage());
                $this->processed['errors'][] = "Batch update error: " . $e->getMessage();
                
                // Если весь пакет не обновился, считаем их как неудачные
                $this->processed['failed'] += count($updates);
            }
        }
    }
    
    /**
     * Генерирует уникальный текст для товара
     *
     * @param int $productId ID товара
     * @param string $productName Название товара
     * @param string $originalText Исходное описание
     * @return array|false Новый текст и метаданные или false в случае неудачи
     */
    private function generateUniqueText(int $productId, string $productName, string $originalText) {
        $attempts = 0;
        $maxAttempts = $this->config['retry_attempts'];
        
        while ($attempts < $maxAttempts) {
            try {
                // Создаем промпт
                $prompt = $this->promptGenerator->generatePrompt($originalText);
                
                // Генерируем текст
                $generatedText = $this->claudeClient->generateText(
                    $prompt,
                    $this->claudeParameters
                );
                
                // Защищаемся от пустого ответа, чтобы не перетирать описание пустым текстом
                if (trim($generatedText) === '') {
                    $this->logger->warning("Claude returned empty text for product #$productId, retrying...");
                    $attempts++;
                    continue;
                }

                // Проверяем уникальность
                $uniquenessResult = $this->uniquenessChecker->checkUniqueness(
                    $generatedText, 
                    $this->config['use_external_api']
                );
                
                $uniqueness = $uniquenessResult['uniqueness'];
                $isUnique = $uniquenessResult['is_unique'];
                
                $this->logger->info("Product #$productId uniqueness: $uniqueness%");
                
                // Если текст достаточно уникален, возвращаем его
                if ($isUnique) {
                    $this->processed['unique']++;
                    return [
                        'text' => $generatedText,
                        'uniqueness' => $uniqueness
                    ];
                }
                
                $this->logger->warning("Generated text for product #$productId is not unique enough ($uniqueness%), retrying...");
                $attempts++;
                
            } catch (\Exception $e) {
                $this->logger->error("Error generating text for product #$productId: " . $e->getMessage());
                $this->processed['errors'][] = "Generation error for #$productId: " . $e->getMessage();
                $attempts++;
            }
        }
        
        $this->processed['not_unique']++;
        $this->logger->error("Failed to generate unique text for product #$productId after $maxAttempts attempts");
        return false;
    }
    
    /**
     * Генерирует отчет о результатах обработки
     */
    private function generateReport(): void {
        $reportFile = $this->config['output_dir'] . '/report_' . date('Y-m-d_H-i-s') . '.json';
        
        $report = [
            'timestamp' => date('Y-m-d H:i:s'),
            'stats' => $this->processed,
            // Persist only non-sensitive config values to avoid leaking secrets in reports
            'config' => ReportSanitizer::sanitizeConfig($this->config)
        ];
        
        file_put_contents($reportFile, json_encode($report, JSON_PRETTY_PRINT));
        $this->logger->info("Report saved to $reportFile");
    }
    
    /**
     * Resolves output_dir to an absolute path relative to the project root
     * 
     * Ensures that reports are written to the same location regardless of
     * the current working directory, so the admin API can find them.
     *
     * @param string $outputDir The configured output directory path
     * @return string Absolute path to the output directory
     */
    private function resolveOutputDir(string $outputDir): string {
        // If already absolute, return as-is
        if (strpos($outputDir, '/') === 0 || (strlen($outputDir) > 1 && $outputDir[1] === ':')) {
            return $outputDir;
        }
        
        // Get project root (this file is in src/Core/, go up 2 levels)
        $projectRoot = dirname(__DIR__, 2);
        
        return rtrim($projectRoot, '/') . '/' . ltrim($outputDir, '/');
    }
    
    /**
     * Сбрасывает статистику обработки
     */
    private function resetStats(): void {
        $this->processed = [
            'total' => 0,
            'success' => 0,
            'failed' => 0,
            'unique' => 0,
            'not_unique' => 0,
            'skipped' => 0,
            'errors' => [],
            'uniqueness_sum' => 0,
            'uniqueness_count' => 0
        ];
    }
}

/**
 * Простой логгер для системы
 */
class SimpleLogger {
    private $logFile;
    
    /**
     * Конструктор
     *
     * @param string $logFile Путь к файлу логов
     */
    public function __construct(string $logFile) {
        $this->logFile = $logFile;
        
        // Ensure log directory exists
        $logDir = dirname($logFile);
        if (!is_dir($logDir) && $logDir !== '') {
            mkdir($logDir, 0755, true);
        }
    }
    
    /**
     * Записывает информационное сообщение
     *
     * @param string $message Сообщение
     */
    public function info(string $message): void {
        $this->log('INFO', $message);
    }
    
    /**
     * Записывает предупреждение
     *
     * @param string $message Сообщение
     */
    public function warning(string $message): void {
        $this->log('WARNING', $message);
    }
    
    /**
     * Записывает сообщение об ошибке
     *
     * @param string $message Сообщение
     */
    public function error(string $message): void {
        $this->log('ERROR', $message);
    }
    
    /**
     * Записывает сообщение в лог
     *
     * @param string $level Уровень сообщения
     * @param string $message Сообщение
     */
    private function log(string $level, string $message): void {
        $timestamp = date('Y-m-d H:i:s');
        $logMessage = "[$timestamp] [$level] $message" . PHP_EOL;
        
        file_put_contents($this->logFile, $logMessage, FILE_APPEND);
        
        if ($level === 'ERROR') {
            echo $logMessage; // Выводим ошибки в консоль
        }
    }
}
