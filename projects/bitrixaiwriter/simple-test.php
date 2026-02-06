<?php
/**
 * Простой тестовый скрипт для проверки работоспособности системы
 * без внешних зависимостей и автозагрузки
 */

// Загружаем необходимые классы
require_once __DIR__ . '/src/Api/BitrixApiClient.php';
require_once __DIR__ . '/src/Api/ClaudeApiClient.php';

// Загружаем конфигурацию
$configFile = __DIR__ . '/config/config.json';
if (!file_exists($configFile)) {
    die("Ошибка: Файл конфигурации не найден: {$configFile}\n");
}

$config = json_decode(file_get_contents($configFile), true);
if (json_last_error() !== JSON_ERROR_NONE) {
    die("Ошибка при чтении конфигурации: " . json_last_error_msg() . "\n");
}

// Инициализируем клиенты API
$bitrixClient = new Api\BitrixApiClient(
    $config['bitrix']['endpoint'],
    $config['bitrix']['login'],
    $config['bitrix']['password']
);

$claudeClient = new Api\ClaudeApiClient(
    $config['claude']['api_key']
);
$claudeClient->setModel($config['claude']['model']);
$generationParameters = array_intersect_key(
    $config['claude'] ?? [],
    array_flip(['temperature', 'max_tokens', 'top_p'])
);

// Функция для вывода сообщений
function log_message($message) {
    echo "[" . date('Y-m-d H:i:s') . "] " . $message . "\n";
}

// Функция для тестирования работы с Битрикс API
function test_bitrix_api($bitrixClient) {
    log_message("Тестирование работы с Битрикс API...");
    
    try {
        // Получаем список товаров
        $products = $bitrixClient->getProducts([], ['ID', 'NAME'], 3);
        log_message("Успешно получен список товаров:");
        
        foreach ($products as $product) {
            log_message("  - ID: {$product['ID']}, Название: {$product['NAME']}");
        }
        
        // Получаем детальную информацию о первом товаре
        if (!empty($products)) {
            $productId = $products[0]['ID'];
            $productDetails = $bitrixClient->getProductDetails($productId);
            
            log_message("\nДетальная информация о товаре ID={$productId}:");
            log_message("  - Название: {$productDetails['NAME']}");
            log_message("  - Бренд: {$productDetails['PROPERTY_BRAND_VALUE']}");
            log_message("  - Описание: " . substr($productDetails['DETAIL_TEXT'], 0, 100) . "...");
        }
        
        return true;
    } catch (Exception $e) {
        log_message("Ошибка при тестировании Битрикс API: " . $e->getMessage());
        return false;
    }
}

// Функция для тестирования работы с Claude API
function test_claude_api($claudeClient, array $generationParameters) {
    log_message("\nТестирование работы с Claude API...");
    
    try {
        // Тестовый запрос к Claude API
        $prompt = "Переформулируй следующее описание товара, сохраняя все технические характеристики, но делая текст более привлекательным для покупателей:\n\n" .
                  "Осциллограф цифровой АКТАКОМ ADS-4572 – это 2-канальный прибор с полосой пропускания 70 МГц, предназначенный для исследования электронных схем и сигналов. " .
                  "Технические характеристики: Количество каналов: 2, Полоса пропускания: 70 МГц, Частота дискретизации: 1 Гвыб/с, Скорость записи: 50,000 осциллограмм/с.";
        
        log_message("Отправляем запрос к Claude API...");
        log_message("Промпт: " . substr($prompt, 0, 100) . "...");
        
        $response = $claudeClient->generateText($prompt, $generationParameters);
        
        log_message("\nОтвет от Claude API:");
        log_message($response);
        
        return true;
    } catch (Exception $e) {
        log_message("Ошибка при тестировании Claude API: " . $e->getMessage());
        return false;
    }
}

// Запускаем тесты
log_message("Запуск тестирования системы...");
log_message("======================================");

// Тестируем работу с Битрикс API
$bitrixTest = test_bitrix_api($bitrixClient);

// Тестируем работу с Claude API
$claudeTest = test_claude_api($claudeClient, $generationParameters);

log_message("======================================");
log_message("Результаты тестирования:");
log_message("  - Битрикс API: " . ($bitrixTest ? "УСПЕШНО" : "ОШИБКА"));
log_message("  - Claude API: " . ($claudeTest ? "УСПЕШНО" : "ОШИБКА"));
log_message("======================================");

if ($bitrixTest && $claudeTest) {
    log_message("Все тесты пройдены успешно!");
    exit(0);
} else {
    log_message("Тестирование завершилось с ошибками.");
    exit(1);
}
