<?php
/**
 * Класс для работы с API Битрикс
 * 
 * Обеспечивает выгрузку и загрузку данных о товарах
 * через REST API Битрикс
 */
class BitrixApiClient {
    private $endpoint;
    private $login;
    private $password;
    private $auth = null;
    private $timeout = 30;
    
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
     * Выполняет авторизацию в API
     *
     * @return array Данные авторизации
     * @throws Exception В случае ошибки авторизации
     */
    public function auth(): array {
        if ($this->auth !== null) {
            return $this->auth;
        }
        
        $url = $this->endpoint . '/user.login.json';
        $data = [
            'LOGIN' => $this->login,
            'PASSWORD' => $this->password
        ];
        
        $response = $this->makeRequest($url, $data);
        
        if (!isset($response['result']) || !$response['result']) {
            throw new Exception("Authentication failed: " . json_encode($response));
        }
        
        $this->auth = $response['result'];
        return $this->auth;
    }
    
    /**
     * Получает список товаров
     *
     * @param array $filter Фильтр для выборки товаров
     * @param array $select Поля для выборки
     * @param int $limit Максимальное количество товаров
     * @return array Массив товаров
     * @throws Exception В случае ошибки запроса
     */
    public function getProducts(array $filter = [], array $select = [], int $limit = 100): array {
        $auth = $this->auth();
        
        $url = $this->endpoint . '/catalog.product.list.json';
        $data = [
            'auth' => $auth['sessid'],
            'filter' => $filter,
            'select' => empty($select) ? ['*'] : $select,
            'order' => ['ID' => 'ASC'],
            'start' => 0
        ];
        
        $allProducts = [];
        $totalProcessed = 0;
        
        // Постранично запрашиваем товары
        do {
            $response = $this->makeRequest($url, $data);
            
            if (!isset($response['result']) || !is_array($response['result'])) {
                throw new Exception("Failed to get products: " . json_encode($response));
            }
            
            $products = $response['result'];
            $count = count($products);
            
            $allProducts = array_merge($allProducts, $products);
            $totalProcessed += $count;
            
            // Переходим к следующей странице
            $data['start'] += $count;
            
            // Прекращаем, если достигнут лимит или больше нет товаров
            if ($totalProcessed >= $limit || $count == 0) {
                break;
            }
            
        } while (true);
        
        return $allProducts;
    }
    
    /**
     * Получает детальную информацию о товаре
     *
     * @param int $productId ID товара
     * @return array Данные о товаре
     * @throws Exception В случае ошибки запроса
     */
    public function getProductDetails(int $productId): array {
        $auth = $this->auth();
        
        $url = $this->endpoint . '/catalog.product.get.json';
        $data = [
            'auth' => $auth['sessid'],
            'id' => $productId
        ];
        
        $response = $this->makeRequest($url, $data);
        
        if (!isset($response['result']) || !is_array($response['result'])) {
            throw new Exception("Failed to get product details: " . json_encode($response));
        }
        
        return $response['result'];
    }
    
    /**
     * Обновляет информацию о товаре
     *
     * @param int $productId ID товара
     * @param array $fields Поля для обновления
     * @return bool Результат обновления
     * @throws Exception В случае ошибки запроса
     */
    public function updateProduct(int $productId, array $fields): bool {
        $auth = $this->auth();
        
        $url = $this->endpoint . '/catalog.product.update.json';
        $data = [
            'auth' => $auth['sessid'],
            'id' => $productId,
            'fields' => $fields
        ];
        
        $response = $this->makeRequest($url, $data);
        
        if (!isset($response['result']) || !$response['result']) {
            throw new Exception("Failed to update product: " . json_encode($response));
        }
        
        return true;
    }
    
    /**
     * Обновляет описание товара
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
     * Массовое обновление товаров
     *
     * @param array $updates Массив обновлений [product_id => [поля]]
     * @return array Результаты обновления по каждому товару
     */
    public function bulkUpdateProducts(array $updates): array {
        $results = [];
        
        foreach ($updates as $productId => $fields) {
            try {
                $success = $this->updateProduct($productId, $fields);
                $results[$productId] = [
                    'success' => $success,
                    'error' => null
                ];
            } catch (Exception $e) {
                $results[$productId] = [
                    'success' => false,
                    'error' => $e->getMessage()
                ];
            }
        }
        
        return $results;
    }
    
    /**
     * Экспортирует товары в CSV файл
     *
     * @param array $filter Фильтр для выборки товаров
     * @param string $filePath Путь для сохранения CSV файла
     * @param string $delimiter Разделитель полей в CSV
     * @return int Количество экспортированных товаров
     */
    public function exportProductsToCsv(array $filter, string $filePath, string $delimiter = ';'): int {
        // Получаем товары
        $products = $this->getProducts($filter, ['ID', 'NAME', 'DETAIL_TEXT', 'PREVIEW_TEXT', 'CODE', 'PROPERTY_*']);
        
        if (empty($products)) {
            return 0;
        }
        
        // Открываем файл для записи
        $file = fopen($filePath, 'w');
        
        if (!$file) {
            throw new Exception("Failed to open file for writing: $filePath");
        }
        
        // Определяем заголовки колонок на основе первого товара
        $headers = array_keys($products[0]);
        fputcsv($file, $headers, $delimiter);
        
        // Записываем данные товаров
        foreach ($products as $product) {
            fputcsv($file, $product, $delimiter);
        }
        
        fclose($file);
        
        return count($products);
    }
    
    /**
     * Импортирует товары из CSV файла
     *
     * @param string $filePath Путь к CSV файлу
     * @param array $mapping Соответствие полей CSV полям Битрикс
     * @param string $delimiter Разделитель полей в CSV
     * @return array Результаты импорта
     */
    public function importProductsFromCsv(string $filePath, array $mapping, string $delimiter = ';'): array {
        if (!file_exists($filePath)) {
            throw new Exception("CSV file not found: $filePath");
        }
        
        // Открываем файл для чтения
        $file = fopen($filePath, 'r');
        
        if (!$file) {
            throw new Exception("Failed to open file for reading: $filePath");
        }
        
        // Читаем заголовки
        $headers = fgetcsv($file, 0, $delimiter);
        
        if (!$headers) {
            fclose($file);
            throw new Exception("Failed to read CSV headers");
        }
        
        $results = [
            'total' => 0,
            'success' => 0,
            'failed' => 0,
            'errors' => []
        ];
        
        // Обрабатываем строки данных
        while (($row = fgetcsv($file, 0, $delimiter)) !== false) {
            $results['total']++;
            
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
                $results['errors'][] = "Row {$results['total']}: Missing product ID";
                continue;
            }
            
            // Обновляем товар
            try {
                $this->updateProduct((int) $data['ID'], $fields);
                $results['success']++;
            } catch (Exception $e) {
                $results['failed']++;
                $results['errors'][] = "Row {$results['total']}, ID {$data['ID']}: " . $e->getMessage();
            }
        }
        
        fclose($file);
        
        return $results;
    }
    
    /**
     * Выполняет запрос к API
     *
     * @param string $url URL запроса
     * @param array $data Данные для отправки
     * @return array Ответ API
     * @throws Exception В случае ошибки запроса
     */
    private function makeRequest(string $url, array $data): array {
        $curl = curl_init();
        
        curl_setopt_array($curl, [
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_ENCODING => '',
            CURLOPT_MAXREDIRS => 10,
            CURLOPT_TIMEOUT => $this->timeout,
            CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
            CURLOPT_CUSTOMREQUEST => 'POST',
            CURLOPT_POSTFIELDS => json_encode($data),
            CURLOPT_HTTPHEADER => [
                'Content-Type: application/json',
            ],
        ]);
        
        $response = curl_exec($curl);
        $err = curl_error($curl);
        $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
        
        curl_close($curl);
        
        if ($err) {
            throw new Exception("cURL Error: " . $err);
        }
        
        if ($httpCode >= 400) {
            throw new Exception("API Error: HTTP code $httpCode - $response");
        }
        
        $decodedResponse = json_decode($response, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new Exception("Invalid JSON response: " . json_last_error_msg());
        }
        
        if (isset($decodedResponse['error'])) {
            throw new Exception("API returned error: " . json_encode($decodedResponse['error']));
        }
        
        return $decodedResponse;
    }
}
