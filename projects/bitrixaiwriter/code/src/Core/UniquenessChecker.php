<?php
/**
 * Класс для проверки уникальности текста
 * 
 * Проверяет уникальность сгенерированных текстов как с помощью
 * внешних API, так и путем локального сравнения с другими текстами
 */
class UniquenessChecker {
    private $textRuApiKey;
    private $previousTexts = [];
    private $uniquenessThreshold = 70; // Минимальный процент уникальности
    
    /**
     * Конструктор
     *
     * @param string $textRuApiKey API ключ для сервиса Text.ru
     * @param array $previousTexts Массив ранее сгенерированных текстов для сравнения
     */
    public function __construct(?string $textRuApiKey = null, array $previousTexts = []) {
        $this->textRuApiKey = $textRuApiKey;
        $this->previousTexts = $previousTexts;
    }
    
    /**
     * Устанавливает порог уникальности
     *
     * @param int $threshold Процент уникальности (1-100)
     * @return self
     */
    public function setUniquenessThreshold(int $threshold): self {
        if ($threshold < 1 || $threshold > 100) {
            throw new InvalidArgumentException("Threshold must be between 1 and 100");
        }
        $this->uniquenessThreshold = $threshold;
        return $this;
    }
    
    /**
     * Добавляет тексты в коллекцию для сравнения
     *
     * @param array $texts Массив текстов
     * @return self
     */
    public function addTextsForComparison(array $texts): self {
        $this->previousTexts = array_merge($this->previousTexts, $texts);
        return $this;
    }
    
    /**
     * Проверяет уникальность текста с помощью внешнего API
     *
     * @param string $text Текст для проверки
     * @return array Результат проверки [уникальность, совпадения]
     * @throws Exception Если API недоступен или вернул ошибку
     */
    public function checkWithExternalApi(string $text): array {
        if (empty($this->textRuApiKey)) {
            throw new Exception("API key for Text.ru is not set");
        }
        
        // Отправляем запрос на проверку
        $data = [
            'text' => $text,
            'userkey' => $this->textRuApiKey
        ];
        
        $curl = curl_init('https://api.text.ru/post');
        curl_setopt($curl, CURLOPT_POST, 1);
        curl_setopt($curl, CURLOPT_POSTFIELDS, $data);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
        // Enforce TLS verification so API keys and payloads are not exposed to MITM
        curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, true);
        curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, 2);
        $result = curl_exec($curl);
        curl_close($curl);
        
        if (!$result) {
            throw new Exception("Failed to send text for checking");
        }
        
        $response = json_decode($result, true);
        
        if (!isset($response['text_uid'])) {
            throw new Exception("Invalid API response: " . print_r($response, true));
        }
        
        $uid = $response['text_uid'];
        
        // Ожидаем результатов проверки (с пробами через каждые 5 секунд)
        $attempts = 0;
        $maxAttempts = 10;
        $uniqueness = null;
        
        while ($attempts < $maxAttempts) {
            sleep(5);
            
            // Запрос результатов проверки
            $data = [
                'uid' => $uid,
                'userkey' => $this->textRuApiKey,
                'jsonvisible' => 'detail' // Получаем детализированный отчет
            ];
            
            $curl = curl_init('https://api.text.ru/post');
            curl_setopt($curl, CURLOPT_POST, 1);
            curl_setopt($curl, CURLOPT_POSTFIELDS, $data);
            curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
            // Enforce TLS verification so API keys and payloads are not exposed to MITM
            curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, true);
            curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, 2);
            $result = curl_exec($curl);
            curl_close($curl);
            
            $response = json_decode($result, true);
            
            // Проверяем, готов ли результат
            if (isset($response['result_json']) && isset($response['unique'])) {
                $uniqueness = (float) $response['unique'];
                $details = json_decode($response['result_json'], true);
                
                return [
                    'uniqueness' => $uniqueness,
                    'is_unique' => $uniqueness >= $this->uniquenessThreshold,
                    'matches' => $details['matches'] ?? [],
                    'text_uid' => $uid,
                    'words_count' => $response['words_count'] ?? 0
                ];
            }
            
            $attempts++;
        }
        
        throw new Exception("Failed to get uniqueness check results after $maxAttempts attempts");
    }
    
    /**
     * Проверяет локальную уникальность текста относительно ранее сгенерированных
     * 
     * @param string $text Текст для проверки
     * @return array Результат проверки
     */
    public function checkLocalUniqueness(string $text): array {
        if (empty($this->previousTexts)) {
            return [
                'uniqueness' => 100.0,
                'is_unique' => true,
                'similar_texts' => []
            ];
        }
        
        // Создаем хэш текста для быстрого сравнения
        $similarities = [];
        $textWords = $this->getWords($text);
        $textLength = count($textWords);
        
        foreach ($this->previousTexts as $index => $previousText) {
            $previousWords = $this->getWords($previousText);
            $similarity = $this->calculateJaccardSimilarity($textWords, $previousWords);
            
            if ($similarity > 0.1) { // Порог для рассмотрения как похожий текст
                $similarities[$index] = [
                    'similarity' => $similarity,
                    'similarity_percent' => round($similarity * 100, 2)
                ];
            }
        }
        
        // Рассчитываем примерную уникальность на основе максимального сходства
        $maxSimilarity = !empty($similarities) ? max(array_column($similarities, 'similarity')) : 0;
        $uniqueness = round((1 - $maxSimilarity) * 100, 2);
        
        return [
            'uniqueness' => $uniqueness,
            'is_unique' => $uniqueness >= $this->uniquenessThreshold,
            'similar_texts' => $similarities
        ];
    }
    
    /**
     * Проверяет как внешнюю, так и локальную уникальность текста
     *
     * @param string $text Текст для проверки
     * @param bool $useExternalApi Использовать ли внешний API
     * @return array Результат проверки
     */
    public function checkUniqueness(string $text, bool $useExternalApi = true): array {
        // Проверяем локальную уникальность
        $localResult = $this->checkLocalUniqueness($text);
        
        // Если текст не уникален локально, нет смысла проверять внешне
        if (!$localResult['is_unique']) {
            return [
                'uniqueness' => $localResult['uniqueness'],
                'is_unique' => false,
                'source' => 'local',
                'local_result' => $localResult
            ];
        }
        
        // Проверяем через внешний API, если требуется
        if ($useExternalApi && !empty($this->textRuApiKey)) {
            try {
                $externalResult = $this->checkWithExternalApi($text);
                
                // Комбинируем результаты, приоритет отдаем внешней проверке
                return [
                    'uniqueness' => $externalResult['uniqueness'],
                    'is_unique' => $externalResult['is_unique'],
                    'source' => 'external',
                    'external_result' => $externalResult,
                    'local_result' => $localResult
                ];
            } catch (Exception $e) {
                // Если внешняя проверка не удалась, используем локальную
                error_log("External uniqueness check failed: " . $e->getMessage());
            }
        }
        
        // Возвращаем результат локальной проверки
        return [
            'uniqueness' => $localResult['uniqueness'],
            'is_unique' => $localResult['is_unique'],
            'source' => 'local',
            'local_result' => $localResult,
            'external_error' => $useExternalApi ? 'Failed or not attempted' : 'Not requested'
        ];
    }
    
    /**
     * Разбивает текст на отдельные слова
     *
     * @param string $text Текст
     * @return array Массив слов
     */
    private function getWords(string $text): array {
        // Приводим к нижнему регистру
        $text = mb_strtolower($text);
        
        // Удаляем все символы, кроме букв и цифр
        $text = preg_replace('/[^\p{L}\p{N}\s]/u', '', $text);
        
        // Разбиваем на слова и удаляем пустые строки
        $words = preg_split('/\s+/', $text, -1, PREG_SPLIT_NO_EMPTY);
        
        return $words;
    }
    
    /**
     * Вычисляет коэффициент Жаккара для оценки сходства текстов
     *
     * @param array $words1 Слова первого текста
     * @param array $words2 Слова второго текста
     * @return float Коэффициент сходства (0-1)
     */
    private function calculateJaccardSimilarity(array $words1, array $words2): float {
        // Создаем множества из слов
        $set1 = array_flip($words1);
        $set2 = array_flip($words2);
        
        // Находим пересечение множеств
        $intersection = array_intersect_key($set1, $set2);
        
        // Находим объединение множеств
        $union = $set1 + $set2;

        // Избегаем деления на ноль, когда оба текста не содержат слов
        if (count($union) === 0) {
            return 0.0;
        }
        
        // Вычисляем коэффициент Жаккара
        $similarity = count($intersection) / count($union);
        
        return $similarity;
    }
}
