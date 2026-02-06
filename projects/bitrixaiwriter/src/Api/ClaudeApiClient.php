<?php
/**
 * Класс для работы с Claude API
 * 
 * Обеспечивает взаимодействие с API Claude (Anthropic)
 * для генерации уникальных описаний товаров
 */
namespace Api;

class ClaudeApiClient {
    private $apiKey;
    private $apiUrl = 'https://api.anthropic.com/v1/messages';
    private $model = 'claude-3-sonnet-20240229';
    private $maxRetries = 3;
    
    /**
     * Конструктор
     *
     * @param string $apiKey API ключ для доступа к сервису Claude
     */
    public function __construct(string $apiKey) {
        $this->apiKey = $apiKey;
    }
    
    /**
     * Устанавливает используемую модель
     *
     * @param string $model Идентификатор модели (claude-3-opus, claude-3-sonnet, claude-3-haiku)
     * @return self
     */
    public function setModel(string $model): self {
        $this->model = $model;
        return $this;
    }
    
    /**
     * Генерирует текст через Claude API
     *
     * @param string $prompt Промпт для модели
     * @param array $parameters Дополнительные параметры запроса
     * @return string Сгенерированный текст
     * @throws \Exception В случае ошибки запроса
     */
    public function generateText(string $prompt, array $parameters = []): string {
        $attempts = 0;
        $lastError = null;
        
        // Устанавливаем значения по умолчанию
        $defaultParams = [
            'temperature' => 0.7,
            'max_tokens' => 1000,
            'top_p' => 0.9,
        ];
        
        // Объединяем с переданными параметрами
        $parameters = array_merge($defaultParams, $parameters);
        
        while ($attempts < $this->maxRetries) {
            try {
                $response = $this->makeRequest($prompt, $parameters);
                return $this->extractTextFromResponse($response);
            } catch (\Exception $e) {
                $lastError = $e;
                $attempts++;
                
                // Экспоненциальная задержка между повторами
                if ($attempts < $this->maxRetries) {
                    $sleepTime = pow(2, $attempts) * 100000; // в микросекундах
                    usleep($sleepTime);
                }
            }
        }
        
        // Если все попытки не удались, выбрасываем последнюю ошибку
        throw $lastError;
    }
    
    /**
     * Выполняет асинхронную генерацию нескольких текстов
     *
     * @param array $prompts Массив промптов
     * @param array $parameters Параметры запроса
     * @return array Массив сгенерированных текстов
     */
    public function generateMultipleTexts(array $prompts, array $parameters = []): array {
        $results = [];
        
        foreach ($prompts as $key => $prompt) {
            try {
                $results[$key] = $this->generateText($prompt, $parameters);
            } catch (\Exception $e) {
                $results[$key] = [
                    'error' => true,
                    'message' => $e->getMessage()
                ];
            }
        }
        
        return $results;
    }

    /**
     * Выполняет недорогую проверку доступности API без генерации текста
     *
     * @return bool true, если соединение успешно
     * @throws \Exception В случае ошибки запроса
     */
    public function checkConnection(): bool {
        $curl = curl_init();

        curl_setopt_array($curl, [
            CURLOPT_URL => 'https://api.anthropic.com/v1/models',
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 10,
            CURLOPT_HTTPHEADER => [
                'Accept: application/json',
                'x-api-key: ' . $this->apiKey,
                'anthropic-version: 2023-06-01'
            ],
            CURLOPT_SSL_VERIFYPEER => true,
            CURLOPT_SSL_VERIFYHOST => 2,
        ]);

        $response = curl_exec($curl);
        $err = curl_error($curl);
        $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);

        curl_close($curl);

        if ($err) {
            throw new \Exception("cURL Error: " . $err);
        }

        if ($httpCode !== 200) {
            throw new \Exception("API Error: HTTP code $httpCode - $response");
        }

        $decodedResponse = json_decode($response, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new \Exception("Invalid JSON response: " . json_last_error_msg());
        }

        // Наличие поля data говорит о корректном ответе от API
        if (!isset($decodedResponse['data'])) {
            throw new \Exception("Unexpected API response structure");
        }

        return true;
    }

    /**
     * Выполняет запрос к API
     *
     * @param string $prompt Промпт для модели
     * @param array $parameters Дополнительные параметры
     * @return array Ответ API в виде массива
     * @throws \Exception В случае ошибки запроса
     */
    private function makeRequest(string $prompt, array $parameters): array {
        $curl = curl_init();
        
        $data = [
            'model' => $this->model,
            'messages' => [
                [
                    'role' => 'user',
                    'content' => $prompt
                ]
            ],
            'temperature' => $parameters['temperature'],
            'max_tokens' => $parameters['max_tokens'],
            'top_p' => $parameters['top_p']
        ];
        
        curl_setopt_array($curl, [
            CURLOPT_URL => $this->apiUrl,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_ENCODING => '',
            CURLOPT_MAXREDIRS => 10,
            CURLOPT_TIMEOUT => 30,
            CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
            CURLOPT_CUSTOMREQUEST => 'POST',
            CURLOPT_POSTFIELDS => json_encode($data),
            CURLOPT_HTTPHEADER => [
                'Content-Type: application/json',
                'x-api-key: ' . $this->apiKey,
                'anthropic-version: 2023-06-01'
            ],
            CURLOPT_SSL_VERIFYPEER => true,
            CURLOPT_SSL_VERIFYHOST => 2,
        ]);
        
        $response = curl_exec($curl);
        $err = curl_error($curl);
        $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
        
        curl_close($curl);
        
        if ($err) {
            throw new \Exception("cURL Error: " . $err);
        }
        
        if ($httpCode !== 200) {
            throw new \Exception("API Error: HTTP code $httpCode - $response");
        }
        
        $decodedResponse = json_decode($response, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new \Exception("Invalid JSON response: " . json_last_error_msg());
        }
        
        return $decodedResponse;
    }
    
    /**
     * Извлекает текст из ответа API
     *
     * @param array $response Ответ API
     * @return string Извлеченный текст
     * @throws \Exception Если структура ответа неожиданная
     */
    private function extractTextFromResponse(array $response): string {
        if (!isset($response['content']) || !is_array($response['content']) || empty($response['content'])) {
            throw new \Exception("Unexpected API response structure: Missing content array");
        }
        
        // Извлекаем текст из массива content
        $textParts = [];
        foreach ($response['content'] as $part) {
            if (isset($part['type']) && $part['type'] === 'text' && isset($part['text'])) {
                $textParts[] = $part['text'];
            }
        }
        
        if (empty($textParts)) {
            throw new \Exception("No text content found in API response");
        }
        
        return implode("\n", $textParts);
    }
    
    /**
     * Отслеживает использование API и расходы
     *
     * @param string $prompt Отправленный промпт
     * @param string $response Полученный ответ
     * @return array Информация об использовании (токены, примерная стоимость)
     */
    public function trackUsage(string $prompt, string $response): array {
        // Примерная оценка количества токенов (4 символа ~ 1 токен)
        $promptTokens = (int) (mb_strlen($prompt) / 4);
        $responseTokens = (int) (mb_strlen($response) / 4);
        $totalTokens = $promptTokens + $responseTokens;
        
        // Примерная стоимость (на основе цен Claude API)
        // Для claude-3-sonnet: $8 за 1M input tokens, $24 за 1M output tokens
        $inputCost = ($promptTokens / 1000000) * 8;
        $outputCost = ($responseTokens / 1000000) * 24;
        $totalCost = $inputCost + $outputCost;
        
        return [
            'prompt_tokens' => $promptTokens,
            'response_tokens' => $responseTokens,
            'total_tokens' => $totalTokens,
            'estimated_cost_usd' => $totalCost,
            'timestamp' => date('Y-m-d H:i:s')
        ];
    }
}
