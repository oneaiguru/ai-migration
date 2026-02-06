<?php
/**
 * Simple Migration Script for VIPFLAT to Adesk Migration
 * 
 * This standalone script migrates data from the newfiles directory
 * to Adesk without depending on the main migrate.php file.
 */

// Set error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('memory_limit', '512M');

// Load configuration
$config = require_once __DIR__ . '/config.php';

// Set data directory to newfiles
$config['data_dir'] = __DIR__ . '/newfiles/';
echo "Using data from: {$config['data_dir']}\n";

// Get command line arguments
$options = getopt('', ['entity::', 'test']);
$entityType = isset($options['entity']) ? $options['entity'] : 'all';
$isTestMode = isset($options['test']);

echo "Mode: " . ($isTestMode ? "TEST (no actual migration)" : "LIVE (actual migration)") . "\n";
echo "Entity type: $entityType\n\n";

// Delegate to the main migrator to avoid drifting logic.
$cmd = 'php ' . escapeshellarg(__DIR__ . '/migrate.php') . ' --mode=full';
if ($entityType !== 'all') {
    $cmd .= ' --entity=' . escapeshellarg($entityType);
}
$cmd .= ' --from-dir=' . escapeshellarg(rtrim($config['data_dir'], '/') . '/');
if ($isTestMode) {
    $cmd .= ' --test';
}

echo "Delegating to migrate.php...\n";
passthru($cmd, $exitCode);
exit($exitCode);
