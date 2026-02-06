#!/usr/bin/env php
<?php

declare(strict_types=1);

require_once __DIR__ . '/../vendor/autoload.php';

use Utils\ReportSanitizer;

$baseDir = realpath(__DIR__ . '/..');
$configPath = $baseDir . '/config/config.json';
$config = [];

if (file_exists($configPath)) {
    $config = json_decode(file_get_contents($configPath), true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        fwrite(STDERR, "Failed to parse config: " . json_last_error_msg() . PHP_EOL);
        exit(1);
    }
}

$outputDir = $config['output_dir'] ?? 'output';
if (!isAbsolutePath($outputDir)) {
    $outputDir = $baseDir . '/' . $outputDir;
}

$stats = ReportSanitizer::sanitizeExistingReports($outputDir);

echo "Output directory: {$outputDir}" . PHP_EOL;
echo "Reports scanned: {$stats['scanned']}" . PHP_EOL;
echo "Reports updated: {$stats['updated']}" . PHP_EOL;

if (!empty($stats['errors'])) {
    fwrite(STDERR, "Errors encountered while sanitizing reports:" . PHP_EOL);
    foreach ($stats['errors'] as $error) {
        fwrite(STDERR, "- {$error['file']}: {$error['error']}" . PHP_EOL);
    }
    exit(2);
}

if ($stats['scanned'] === 0) {
    echo "No report_*.json files found to sanitize." . PHP_EOL;
}

/**
 * Determines if the given path is absolute (Unix or Windows style).
 */
function isAbsolutePath(string $path): bool
{
    return str_starts_with($path, '/') || preg_match('/^[A-Za-z]:\\\\/', $path) === 1;
}
