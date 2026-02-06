<?php
/**
 * Скрипт установки и проверки системы автоматизированного переписывания текстов
 * 
 * Проверяет необходимые зависимости, создает директории и файлы,
 * настраивает конфигурацию для работы системы
 */

// Определяем корневую директорию проекта
define('ROOT_DIR', __DIR__);

// Проверка PHP версии
$requiredPhpVersion = '8.0.0';
if (version_compare(PHP_VERSION, $requiredPhpVersion, '<')) {
    die("Ошибка: Для работы системы требуется PHP версии $requiredPhpVersion или выше. Текущая версия: " . PHP_VERSION . "\n");
}

// Заголовок
echo "=================================================================\n";
echo "Установка системы автоматизации переписывания текстов SOUZ-PRIBOR\n";
echo "=================================================================\n\n";

// Проверка зависимостей
echo "Проверка зависимостей PHP...\n";
$requiredExtensions = ['curl', 'json', 'mbstring', 'openssl'];
$missingExtensions = [];

foreach ($requiredExtensions as $ext) {
    if (!extension_loaded($ext)) {
        $missingExtensions[] = $ext;
    }
}

if (!empty($missingExtensions)) {
    die("Ошибка: Отсутствуют необходимые расширения PHP: " . implode(', ', $missingExtensions) . "\n");
}
echo "✓ Все необходимые расширения PHP установлены.\n";

// Проверка наличия Composer
echo "\nПроверка наличия Composer...\n";
exec('composer --version', $composerOutput, $composerReturnVar);
if ($composerReturnVar !== 0) {
    echo "⚠ Composer не найден. Рекомендуется установить Composer для управления зависимостями.\n";
    echo "  Инструкция по установке: https://getcomposer.org/download/\n";
    
    $continue = readline("Продолжить установку без Composer? (y/n): ");
    if (strtolower($continue) !== 'y') {
        die("Установка прервана.\n");
    }
} else {
    echo "✓ Composer установлен: " . trim($composerOutput[0]) . "\n";
}

// Создание необходимых директорий
echo "\nСоздание необходимых директорий...\n";
$directories = [
    'config',
    'logs',
    'output',
    'src',
    'src/Api',
    'src/Core',
    'src/Utils',
    'web',
    'web/admin',
    'web/admin/css',
    'web/admin/js'
];

foreach ($directories as $dir) {
    $path = ROOT_DIR . '/' . $dir;
    if (!is_dir($path)) {
        echo "Создание директории: $dir\n";
        if (!mkdir($path, 0755, true)) {
            die("Ошибка: Не удалось создать директорию $dir. Проверьте права доступа.\n");
        }
    } else {
        echo "Директория $dir уже существует.\n";
    }
}

// Проверка прав доступа к директориям
echo "\nПроверка прав доступа к директориям...\n";
$writableDirs = ['logs', 'output', 'config'];
foreach ($writableDirs as $dir) {
    $path = ROOT_DIR . '/' . $dir;
    if (!is_writable($path)) {
        echo "⚠ Директория $dir не доступна для записи.\n";
        echo "  Рекомендуется установить права 755 для этой директории:\n";
        echo "  chmod 755 $path\n";
    } else {
        echo "✓ Директория $dir доступна для записи.\n";
    }
}

// Создание конфигурационного файла
echo "\nНастройка конфигурации...\n";
$configFile = ROOT_DIR . '/config/config.json';
$exampleConfigFile = ROOT_DIR . '/config/config.example.json';

if (file_exists($configFile)) {
    echo "Файл конфигурации уже существует.\n";
    $overwrite = readline("Перезаписать конфигурационный файл? (y/n): ");
    if (strtolower($overwrite) !== 'y') {
        echo "Конфигурационный файл оставлен без изменений.\n";
    } else {
        createConfig($configFile, $exampleConfigFile);
    }
} else {
    createConfig($configFile, $exampleConfigFile);
}

// Установка зависимостей через Composer
if ($composerReturnVar === 0) {
    echo "\nУстановка зависимостей через Composer...\n";
    
    // Проверка наличия composer.json
    if (!file_exists(ROOT_DIR . '/composer.json')) {
        echo "Файл composer.json не найден. Создание...\n";
        createComposerJson();
    }
    
    // Установка зависимостей
    echo "Запуск 'composer install'...\n";
    exec('cd ' . ROOT_DIR . ' && composer install --no-dev', $output, $returnVar);
    
    if ($returnVar !== 0) {
        echo "⚠ Не удалось установить зависимости. Вывод Composer:\n";
        echo implode("\n", $output) . "\n";
    } else {
        echo "✓ Зависимости успешно установлены.\n";
    }
}

// Проверка наличия API-клиентов и других критических файлов
echo "\nПроверка наличия основных файлов...\n";
$requiredFiles = [
    'src/Api/BitrixApiClient.php',
    'src/Api/ClaudeApiClient.php',
    'src/Core/PromptGenerator.php',
    'src/Core/TextRewriteController.php',
    'src/Core/UniquenessChecker.php',
    'src/cli.php'
];

$missingFiles = [];
foreach ($requiredFiles as $file) {
    $path = ROOT_DIR . '/' . $file;
    if (!file_exists($path)) {
        $missingFiles[] = $file;
    }
}

if (!empty($missingFiles)) {
    echo "⚠ Отсутствуют следующие файлы:\n";
    foreach ($missingFiles as $file) {
        echo "  - $file\n";
    }
    echo "Система может работать некорректно. Убедитесь, что все необходимые файлы скопированы.\n";
} else {
    echo "✓ Все необходимые файлы присутствуют.\n";
}

// Запуск тестового скрипта
echo "\nЗапуск тестового скрипта для проверки системы...\n";
if (file_exists(ROOT_DIR . '/test-run-script.php')) {
    exec('php ' . ROOT_DIR . '/test-run-script.php', $testOutput, $testReturnVar);
    
    echo implode("\n", $testOutput) . "\n";
    
    if ($testReturnVar !== 0) {
        echo "⚠ Тестовый скрипт завершился с ошибками.\n";
    } else {
        echo "✓ Тестовый скрипт выполнен успешно.\n";
    }
} else {
    echo "⚠ Тестовый скрипт не найден.\n";
}

// Завершение
echo "\n=================================================================\n";
echo "Установка завершена!\n";
echo "Для начала работы с системой откройте в браузере:\n";
echo "http://your-domain.com/admin/\n";
echo "=================================================================\n";

// Функции установки

/**
 * Создает файл конфигурации
 *
 * @param string $configFile Путь к файлу конфигурации
 * @param string $exampleConfigFile Путь к примеру файла конфигурации
 */
function createConfig(string $configFile, string $exampleConfigFile): void {
    // Проверяем наличие примера конфигурации
    if (!file_exists($exampleConfigFile)) {
        // Если пример не найден, создаем базовую конфигурацию
        $config = [
            'bitrix' => [
                'endpoint' => 'https://www.souz-pribor.ru/rest',
                'login' => 'admin',
                'password' => 'your_password_here',
                'timeout' => 30
            ],
            'claude' => [
                'api_key' => 'sk-ant-api03-your-api-key-here',
                'model' => 'claude-3-sonnet-20240229',
                'temperature' => 0.7,
                'max_tokens' => 1000,
                'top_p' => 0.9
            ],
            'text_ru' => [
                'api_key' => 'your_text_ru_api_key_here'
            ],
            'uniqueness' => [
                'threshold' => 70,
                'use_external_api' => true,
                'text_database' => 'output/text_database.txt',
                'retry_attempts' => 3
            ],
            'batch_size' => 10,
            'log_file' => 'logs/rewrite.log',
            'save_history' => true,
            'output_dir' => 'output',
            'debug' => false
        ];
        
        file_put_contents($configFile, json_encode($config, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        echo "Создан новый файл конфигурации на основе шаблона.\n";
    } else {
        // Копируем пример конфигурации
        copy($exampleConfigFile, $configFile);
        echo "Создан новый файл конфигурации на основе примера config.example.json.\n";
    }
    
    echo "Пожалуйста, отредактируйте файл config/config.json и введите корректные данные для доступа к API.\n";
}

/**
 * Создает файл composer.json
 */
function createComposerJson(): void {
    $composerJson = [
        'name' => 'souz-pribor/text-rewriter',
        'description' => 'System for automating product description rewriting using Claude AI',
        'type' => 'project',
        'require' => [
            'php' => '>=8.0',
            'guzzlehttp/guzzle' => '^7.0',
            'monolog/monolog' => '^2.0'
        ],
        'require-dev' => [
            'phpunit/phpunit' => '^9.0',
            'squizlabs/php_codesniffer' => '^3.0'
        ],
        'autoload' => [
            'psr-4' => [
                'Api\\' => 'src/Api/',
                'Core\\' => 'src/Core/',
                'Utils\\' => 'src/Utils/',
                'App\\' => 'src/'
            ]
        ],
        'autoload-dev' => [
            'psr-4' => [
                'Tests\\' => 'tests/'
            ]
        ],
        'scripts' => [
            'test' => 'phpunit',
            'test-coverage' => 'phpunit --coverage-html coverage',
            'cs-check' => 'phpcs',
            'cs-fix' => 'phpcbf'
        ]
    ];
    
    file_put_contents(ROOT_DIR . '/composer.json', json_encode($composerJson, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}