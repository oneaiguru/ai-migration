<?php
/**
 * Генератор промптов для Claude API
 * 
 * Отвечает за создание оптимизированных промптов для AI-генерации
 * уникальных описаний товаров с сохранением ключевых характеристик
 */
namespace Core;

class PromptGenerator {
    // Базовый шаблон промпта
    private $basePromptTemplate = <<<EOT
Ты - эксперт по написанию продающих описаний товаров для интернет-магазина технических приборов и оборудования.

<инструкции>
1. Перепиши описание товара, сделав его уникальным (не менее 70% уникальности).
2. Сохрани ВСЕ технические характеристики товара и их значения.
3. Структурируй текст для удобочитаемости (используй подзаголовки, маркированные списки).
4. Добавь 1-2 преимущества использования товара, которые логически следуют из его характеристик.
5. Избегай фраз: "данный товар", "данное устройство", "данный прибор".
6. Не добавляй информацию, которой нет в исходном описании.
7. Объем текста: примерно такой же как в оригинале или до 20% больше.
8. Не используй слова и фразы из исходного текста там, где их можно заменить синонимами.
9. Следуй принципам SEO-оптимизированного текста.
</инструкции>

<исходное_описание>
{ORIGINAL_DESCRIPTION}
</исходное_описание>

<технические_характеристики>
{TECHNICAL_SPECS}
</технические_характеристики>

<ключевые_слова>
{KEYWORDS}
</ключевые_слова>

Создай уникальное, информативное и продающее описание товара:
EOT;

    /**
     * Создает оптимизированный промпт для генерации текста
     *
     * @param string $originalDescription Исходное описание товара
     * @param array $technicalSpecs Технические характеристики товара
     * @param array $keywords Ключевые слова для SEO
     * @return string Готовый промпт для отправки в AI API
     */
    public function generatePrompt(string $originalDescription, array $technicalSpecs = [], array $keywords = []): string {
        // Извлекаем технические характеристики, если они не предоставлены
        if (empty($technicalSpecs)) {
            $technicalSpecs = $this->extractTechnicalSpecs($originalDescription);
        }
        
        // Формируем строку с техническими характеристиками
        $techSpecsStr = empty($technicalSpecs) ? 'Нет технических характеристик' : 
            implode("\n", array_map(function($key, $value) {
                return "$key: $value";
            }, array_keys($technicalSpecs), $technicalSpecs));
        
        // Формируем строку с ключевыми словами
        $keywordsStr = empty($keywords) ? 'Нет ключевых слов' : implode(', ', $keywords);
        
        // Подставляем данные в шаблон
        $prompt = str_replace(
            ['{ORIGINAL_DESCRIPTION}', '{TECHNICAL_SPECS}', '{KEYWORDS}'],
            [$originalDescription, $techSpecsStr, $keywordsStr],
            $this->basePromptTemplate
        );
        
        return $prompt;
    }
    
    /**
     * Создает промпт с примерами успешных перефразировок для few-shot learning
     *
     * @param string $originalDescription Исходное описание товара
     * @param array $examples Массив примеров [исходный текст => перефразированный текст]
     * @return string Промпт с примерами
     */
    public function generateFewShotPrompt(string $originalDescription, array $examples): string {
        $basePrompt = $this->generatePrompt($originalDescription);
        
        $examplesText = "<примеры_успешных_перефразировок>\n";
        foreach ($examples as $original => $rewritten) {
            $examplesText .= "<оригинал>\n$original\n</оригинал>\n\n";
            $examplesText .= "<перефразировано>\n$rewritten\n</перефразировано>\n\n";
        }
        $examplesText .= "</примеры_успешных_перефразировок>\n\n";
        
        // Вставляем примеры перед финальной инструкцией
        $finalPrompt = str_replace(
            'Создай уникальное, информативное и продающее описание товара:',
            $examplesText . 'Создай уникальное, информативное и продающее описание товара:',
            $basePrompt
        );
        
        return $finalPrompt;
    }
    
    /**
     * Регулирует параметры генерации в зависимости от типа товара
     *
     * @param string $productCategory Категория товара
     * @return array Оптимальные параметры для API запроса
     */
    public function getOptimalParameters(string $productCategory): array {
        $parameters = [
            'temperature' => 0.7,
            'max_tokens' => 1000,
            'top_p' => 0.9,
        ];
        
        // Регулируем параметры в зависимости от категории товара
        switch ($productCategory) {
            case 'измерительные приборы':
                $parameters['temperature'] = 0.5; // Более консервативно для точных данных
                break;
            case 'защитное оборудование':
                $parameters['temperature'] = 0.6;
                break;
            case 'электроника':
                $parameters['temperature'] = 0.7; // Больше креативности
                break;
            default:
                // Используем стандартные параметры
        }
        
        return $parameters;
    }
    
    /**
     * Извлекает технические характеристики из текста описания
     *
     * @param string $text Текст описания
     * @return array Массив технических характеристик [название => значение]
     */
    private function extractTechnicalSpecs(string $text): array {
        $specs = [];
        
        // Простой паттерн для поиска характеристик в формате "Название: Значение"
        preg_match_all('/([^:]+):\s*([^;\n]+)[;\n]/', $text, $matches, PREG_SET_ORDER);
        
        foreach ($matches as $match) {
            if (count($match) >= 3) {
                $key = trim($match[1]);
                $value = trim($match[2]);
                $specs[$key] = $value;
            }
        }
        
        return $specs;
    }
}

// Backward compatibility for legacy scripts that referenced the global class name
if (!class_exists('PromptGenerator', false)) {
    class_alias(__NAMESPACE__ . '\\PromptGenerator', 'PromptGenerator');
}
