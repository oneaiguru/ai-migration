<?php

namespace Utils;

/**
 * Helper for removing secrets from report payloads and stored files.
 */
class ReportSanitizer
{
    private const SECRET_PLACEHOLDER = '[redacted]';

    private const SECRET_PATHS = [
        ['claude', 'api_key'],
        ['text_ru', 'api_key'],
        ['admin_api', 'api_key'],
        ['bitrix', 'login'],
        ['bitrix', 'password'],
    ];

    /**
     * Returns a sanitized copy of the config with known secrets redacted.
     */
    public static function sanitizeConfig(array $config): array
    {
        foreach (self::SECRET_PATHS as $path) {
            $ref = &$config;
            $found = true;
            foreach ($path as $segment) {
                if (!isset($ref[$segment])) {
                    $found = false;
                    break;
                }
                $ref = &$ref[$segment];
            }

            if ($found) {
                $ref = self::SECRET_PLACEHOLDER;
            }

            unset($ref);
        }

        return $config;
    }

    /**
     * Redacts secrets from the report payload.
     */
    public static function sanitizeReportData(array $reportData): array
    {
        if (isset($reportData['config']) && is_array($reportData['config'])) {
            $reportData['config'] = self::sanitizeConfig($reportData['config']);
        }

        return $reportData;
    }

    /**
     * Redacts secrets and rewrites the report on disk when changes are found.
     *
     * @return array|null Sanitized report or null if it could not be read
     */
    public static function sanitizeReportFile(string $filePath, bool $throwOnError = false, ?bool &$wasUpdated = null): ?array
    {
        $wasUpdated = false;
        $contents = file_get_contents($filePath);
        if ($contents === false) {
            if ($throwOnError) {
                throw new \RuntimeException("Не удалось прочитать отчет: {$filePath}");
            }
            return null;
        }

        $reportData = json_decode($contents, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            if ($throwOnError) {
                throw new \RuntimeException('Ошибка при чтении отчета: ' . json_last_error_msg());
            }
            return null;
        }

        $sanitizedData = self::sanitizeReportData($reportData);

        if ($sanitizedData !== $reportData) {
            file_put_contents(
                $filePath,
                json_encode($sanitizedData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)
            );
            $wasUpdated = true;
        }

        return $sanitizedData;
    }

    /**
     * Sanitizes all report_*.json files inside the given output directory.
     *
     * @return array Stats with scanned/updated counts and error details
     */
    public static function sanitizeExistingReports(string $outputDir): array
    {
        $stats = [
            'scanned' => 0,
            'updated' => 0,
            'errors' => []
        ];

        if (!is_dir($outputDir)) {
            return $stats;
        }

        $pattern = rtrim($outputDir, "/\\") . '/report_*.json';
        foreach (glob($pattern) as $reportFile) {
            $stats['scanned']++;
            try {
                $updated = false;
                $result = self::sanitizeReportFile($reportFile, true, $updated);
                if ($result !== null && $updated) {
                    $stats['updated']++;
                }
            } catch (\Throwable $e) {
                $stats['errors'][] = [
                    'file' => $reportFile,
                    'error' => $e->getMessage()
                ];
            }
        }

        return $stats;
    }
}
