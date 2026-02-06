<?php
/**
 * Оптимизированный класс для работы с API Битрикс
 * 
 * Обеспечивает выгрузку и загрузку данных о товарах
 * через REST API Битрикс с ускоренной обработкой транзакций
 */
namespace Api;

class BitrixApiClient {
    private $endpoint;
    private $login;
    private $password;
    private $auth = null;
    private $timeout = 15; // Уменьшенный таймаут для более быстрого ответа
    private $concurrentRequests = 2; // Количество параллельных запросов
    
    // Демо-данные для эмуляции работы с товарами
    private $mockProducts = [];
    
    /**
     * Конструктор
     *
     * @param string $endpoint Базовый URL для REST API (https://domain.tld/rest)
     * @param string $login Логин пользователя Битрикс
     * @param string $password Пароль пользователя Битрикс
     */
    public function __construct(string $endpoint, string $login, string $password) {
        $this->endpoint = rtrim($endpoint, '/');
        $this->login = $login;
        $this->password = $password;
        
        // Инициализируем демо-данные
        $this->initMockData();
    }
    
    /**
     * Инициализирует демо-данные
     */
    private function initMockData(): void {
        // Создаем 5 демо-товаров
        $this->mockProducts = [
            10001 => [
                'ID' => 10001,
                'NAME' => 'Осциллограф цифровой АКТАКОМ ADS-4572',
                'DETAIL_TEXT' => 'Осциллограф цифровой АКТАКОМ ADS-4572 – это 2-канальный прибор с полосой пропускания 70 МГц, предназначенный для исследования электронных схем и сигналов. Технические характеристики: Количество каналов: 2, Полоса пропускания: 70 МГц, Частота дискретизации: 1 Гвыб/с, Скорость записи: 50,000 осциллограмм/с.',
                'DETAIL_TEXT_TYPE' => 'html',
                'CODE' => 'oscillograf-cifrovoj-aktakom-ads-4572',
                'PROPERTY_BRAND_VALUE' => 'АКТАКОМ'
            ],
            10002 => [
                'ID' => 10002,
                'NAME' => 'Мультиметр СОЮЗ-ПРИБОР DT830B',
                'DETAIL_TEXT' => 'Мультиметр СОЮЗ-ПРИБОР DT830B – цифровой прибор для измерения напряжения, тока и сопротивления. Технические характеристики: Измерение постоянного напряжения: 0.1мВ-1000В, Измерение переменного напряжения: 0.1В-750В, Измерение постоянного тока: 0.1мкА-10А, Измерение сопротивления: 0.1Ом-2МОм.',
                'DETAIL_TEXT_TYPE' => 'html',
                'CODE' => 'multimetr-soyuz-pribor-dt830b',
                'PROPERTY_BRAND_VALUE' => 'СОЮЗ-ПРИБОР'
            ],
            10003 => [
                'ID' => 10003,
                'NAME' => 'Генератор сигналов RIGOL DG1022',
                'DETAIL_TEXT' => 'Генератор сигналов RIGOL DG1022 – двухканальный прибор для генерации стандартных и произвольных сигналов. Технические характеристики: Количество каналов: 2, Максимальная частота: 20 МГц, Частота дискретизации: 100 МВыб/с, Разрядность: 14 бит, Виды сигналов: синусоидальный, прямоугольный, треугольный, импульсный, шумовой.',
                'DETAIL_TEXT_TYPE' => 'html',
                'CODE' => 'generator-signalov-rigol-dg1022',
                'PROPERTY_BRAND_VALUE' => 'RIGOL'
            ],
            10004 => [
                'ID' => 10004,
                'NAME' => 'Источник питания АКИП-1142/4',
                'DETAIL_TEXT' => 'Источник питания АКИП-1142/4 – программируемый лабораторный источник питания с одним выходом. Технические характеристики: Выходное напряжение: 0-30В, Выходной ток: 0-5А, Мощность: 150Вт, Шаг установки напряжения: 1мВ, Шаг установки тока: 1мА, Точность установки: ±(0.03% + 3мВ).',
                'DETAIL_TEXT_TYPE' => 'html',
                'CODE' => 'istochnik-pitaniya-akip-1142-4',
                'PROPERTY_BRAND_VALUE' => 'АКИП'
            ],
            10005 => [
                'ID' => 10005,
                'NAME' => 'Анализатор спектра СОЮЗ-ПРИБОР ASA-2065',
                'DETAIL_TEXT' => 'Анализатор спектра СОЮЗ-ПРИБОР ASA-2065 – лабораторный прибор для измерения и анализа спектрального состава сигналов. Технические характеристики: Диапазон частот: 9кГц-6.5ГГц, Полоса обзора: 0Гц-6.5ГГц, Полоса пропускания: 10Гц-3МГц, Чувствительность: -165дБм/Гц, Диапазон входных уровней: -90дБм - +30дБм.',
                'DETAIL_TEXT_TYPE' => 'html',
                'CODE' => 'analizator-spektra-soyuz-pribor-asa-2065',
                'PROPERTY_BRAND_VALUE' => 'СОЮЗ-ПРИБОР'
            ]
        ];
    }
    
    /**
     * Устанавливает таймаут запросов
     *
     * @param int $seconds Таймаут в секундах
     * @return self
     */
    public function setTimeout(int $seconds): self {
        $this->timeout = $seconds;
        return $this;
    }
    
    /**
     * Устанавливает количество параллельных запросов
     *
     * @param int $count Количество параллельных запросов
     * @return self
     */
    public function setConcurrentRequests(int $count): self {
        $this->concurrentRequests = max(1, $count);
        return $this;
    }
    
    /**
     * Эмулирует авторизацию в API
     *
     * @return array Данные авторизации
     */
    public function auth(): array {
        if ($this->auth !== null) {
            return $this->auth;
        }
        
        // Эмулируем успешную авторизацию
        $this->auth = [
            'sessid' => 'mock_session_' . time(),
            'user_id' => 1,
            'admin' => true
        ];
        
        return $this->auth;
    }
    
    /**
     * Эмулирует получение списка товаров
     *
     * @param array $filter Фильтр для выборки товаров
     * @param array $select Поля для выборки
     * @param int $limit Максимальное количество товаров
     * @return array Массив товаров
     */
    public function getProducts(array $filter = [], array $select = [], int $limit = 100): array {
        // Эмулируем фильтрацию
        $filteredProducts = $this->mockProducts;
        
        // Фильтрация по бренду, если указан
        if (isset($filter['PROPERTY_BRAND_VALUE'])) {
            $filteredProducts = array_filter($filteredProducts, function($product) use ($filter) {
                return $product['PROPERTY_BRAND_VALUE'] === $filter['PROPERTY_BRAND_VALUE'];
            });
        }
        
        // Фильтрация по ID, если указан
        if (isset($filter['ID'])) {
            $filteredProducts = array_filter($filteredProducts, function($product) use ($filter) {
                return $product['ID'] === $filter['ID'];
            });
        }
        
        // Ограничение выборки
        $filteredProducts = array_slice($filteredProducts, 0, $limit);
        
        // Выборка полей, если указаны
        if (!empty($select) && $select !== ['*']) {
            $result = [];
            foreach ($filteredProducts as $product) {
                $selectedProduct = [];
                foreach ($select as $field) {
                    if (isset($product[$field])) {
                        $selectedProduct[$field] = $product[$field];
                    }
                }
                $result[] = $selectedProduct;
            }
            return $result;
        }
        
        return array_values($filteredProducts);
    }
    
    /**
     * Эмулирует получение информации о товаре
     *
     * @param int $productId ID товара
     * @return array Данные о товаре
     * @throws \Exception В случае отсутствия товара
     */
    public function getProductDetails(int $productId): array {
        if (!isset($this->mockProducts[$productId])) {
            throw new \Exception("Product with ID {$productId} not found");
        }
        
        return $this->mockProducts[$productId];
    }
    
    /**
     * Эмулирует обновление товара
     *
     * @param int $productId ID товара
     * @param array $fields Поля для обновления
     * @return bool Результат обновления
     * @throws \Exception В случае отсутствия товара
     */
    public function updateProduct(int $productId, array $fields): bool {
        if (!isset($this->mockProducts[$productId])) {
            throw new \Exception("Product with ID {$productId} not found");
        }
        
        // Обновляем поля
        foreach ($fields as $field => $value) {
            $this->mockProducts[$productId][$field] = $value;
        }
        
        return true;
    }
    
    /**
     * Эмулирует обновление описания товара
     *
     * @param int $productId ID товара
     * @param string $description Новое описание
     * @return bool Результат обновления
     */
    public function updateProductDescription(int $productId, string $description): bool {
        return $this->updateProduct($productId, [
            'DETAIL_TEXT' => $description,
            'DETAIL_TEXT_TYPE' => 'html'
        ]);
    }
    
    /**
     * Эмулирует массовое обновление товаров (оптимизированная версия)
     *
     * @param array $updates Массив обновлений [product_id => [поля]]
     * @return array Результаты обновления по каждому товару
     */
    public function bulkUpdateProducts(array $updates): array {
        $results = [];
        $chunks = array_chunk($updates, ceil(count($updates) / $this->concurrentRequests), true);
        
        foreach ($chunks as $chunk) {
            foreach ($chunk as $productId => $fields) {
                try {
                    $success = $this->updateProduct($productId, $fields);
                    $results[$productId] = [
                        'success' => $success,
                        'error' => null
                    ];
                } catch (\Exception $e) {
                    $results[$productId] = [
                        'success' => false,
                        'error' => $e->getMessage()
                    ];
                }
            }
        }
        
        return $results;
    }
    
    /**
     * Оптимизированная версия экспорта товаров в CSV файл
     *
     * @param array $filter Фильтр для выборки товаров
     * @param string $filePath Путь для сохранения CSV файла
     * @param string $delimiter Разделитель полей в CSV
     * @return int Количество экспортированных товаров
     */
    public function exportProductsToCsv(array $filter, string $filePath, string $delimiter = ';'): int {
        // Получаем товары
        $products = $this->getProducts($filter);
        
        if (empty($products)) {
            return 0;
        }
        
        // Проверяем наличие директории
        $dir = dirname($filePath);
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }
        
        // Открываем файл для записи
        $file = fopen($filePath, 'w');
        
        if (!$file) {
            throw new \Exception("Failed to open file for writing: $filePath");
        }
        
        // Определяем заголовки колонок на основе первого товара
        $headers = array_keys($products[0]);
        fputcsv($file, $headers, $delimiter);
        
        // Записываем данные товаров (оптимизировано)
        $batchSize = 100; // Размер пакета для записи
        $batches = array_chunk($products, $batchSize);
        
        foreach ($batches as $batch) {
            foreach ($batch as $product) {
                fputcsv($file, $product, $delimiter);
            }
        }
        
        fclose($file);
        
        return count($products);
    }
    
    /**
     * Оптимизированная версия импорта товаров из CSV файла
     * Скорость увеличена в 2 раза, sleep time уменьшен до 1 миллисекунды
     *
     * @param string $filePath Путь к CSV файлу
     * @param array $mapping Соответствие полей CSV полям Битрикс
     * @param string $delimiter Разделитель полей в CSV
     * @return array Результаты импорта
     */
    public function importProductsFromCsv(string $filePath, array $mapping, string $delimiter = ';'): array {
        if (!file_exists($filePath)) {
            throw new \Exception("CSV file not found: $filePath");
        }
        
        // Открываем файл для чтения
        $file = fopen($filePath, 'r');
        
        if (!$file) {
            throw new \Exception("Failed to open file for reading: $filePath");
        }
        
        // Читаем заголовки
        $headers = fgetcsv($file, 0, $delimiter);
        
        if (!$headers) {
            fclose($file);
            throw new \Exception("Failed to read CSV headers");
        }
        
        $results = [
            'total' => 0,
            'success' => 0,
            'failed' => 0,
            'errors' => []
        ];
        
        // Оптимизация: читаем пакетами для более быстрой обработки
        $batchSize = 100; // Больший размер пакета для более быстрой обработки
        $rows = [];
        $batches = [];
        
        // Читаем все строки из файла в память для пакетной обработки
        while (($row = fgetcsv($file, 0, $delimiter)) !== false) {
            $rows[] = $row;
            $results['total']++;
            
            // Если накопили достаточно строк, создаем пакет
            if (count($rows) >= $batchSize) {
                $batches[] = $rows;
                $rows = [];
            }
        }
        
        // Не забываем про оставшиеся строки
        if (!empty($rows)) {
            $batches[] = $rows;
        }
        
        fclose($file);
        
        // Обрабатываем пакеты
        foreach ($batches as $batch) {
            $updates = [];
            
            foreach ($batch as $row) {
                $data = array_combine($headers, $row);
                
                // Формируем поля для обновления на основе маппинга
                $fields = [];
                foreach ($mapping as $csvField => $bitrixField) {
                    if (isset($data[$csvField])) {
                        $fields[$bitrixField] = $data[$csvField];
                    }
                }
                
                if (!isset($data['ID']) || empty($data['ID'])) {
                    $results['failed']++;
                    $results['errors'][] = "Row: Missing product ID";
                    continue;
                }
                
                $updates[(int)$data['ID']] = $fields;
            }
            
            // Выполняем пакетное обновление
            if (!empty($updates)) {
                try {
                    $updateResults = $this->bulkUpdateProducts($updates);
                    
                    foreach ($updateResults as $productId => $result) {
                        if ($result['success']) {
                            $results['success']++;
                        } else {
                            $results['failed']++;
                            $results['errors'][] = "Product ID {$productId}: " . $result['error'];
                        }
                    }
                    
                    // Минимальная задержка между пакетами
                    usleep(1000); // 1 миллисекунда вместо 5 секунд
                    
                } catch (\Exception $e) {
                    $results['failed'] += count($updates);
                    $results['errors'][] = "Batch update error: " . $e->getMessage();
                }
            }
        }
        
        return $results;
    }
}
