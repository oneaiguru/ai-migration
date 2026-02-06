<?php
/**
 * VIPFLAT to Adesk Migration Tool - Newfiles Migration Script
 * 
 * This script is a simplified entry point for migrating data from the newfiles directory
 * 
 * Usage: php migrate-newfiles.php [--test] [--entity=all|contractors|bank_accounts|...]
 */

// Modify the config data directory and execute standard migration script
$_SERVER['OVERRIDE_DATA_DIR'] = __DIR__ . '/newfiles/';

echo "Using data from: " . $_SERVER['OVERRIDE_DATA_DIR'] . "\n";

// Call the main migration script with all arguments passed through
$args = $_SERVER['argv'];
$args[0] = 'migrate.php';
$_SERVER['argv'] = $args;

require_once __DIR__ . '/migrate.php';