<?php
/**
 * VIPFLAT to Adesk Migration Tool - Logger Class
 * 
 * This class provides logging functionality for the migration process.
 * 
 * File: classes/Logger.php
 */

class Logger {
    private $logDir;
    private $logLevel;
    private $dateFormat;
    private $logFile;
    private $logLevels = ['debug', 'info', 'warning', 'error'];
    
    /**
     * Constructor
     * 
     * @param string $logDir Directory to store log files
     * @param string $logLevel Minimum log level to record ('debug', 'info', 'warning', 'error')
     * @param string $dateFormat Date format for log file names
     */
    public function __construct($logDir, $logLevel = 'info', $dateFormat = 'Y-m-d') {
        $this->logDir = rtrim($logDir, '/') . '/';
        $this->logLevel = array_search(strtolower($logLevel), $this->logLevels);
        $this->dateFormat = $dateFormat;
        
        // Create logs directory if it doesn't exist
        if (!file_exists($this->logDir)) {
            mkdir($this->logDir, 0777, true);
        }
        
        // Set up log file
        $this->logFile = $this->logDir . 'migration_' . date($this->dateFormat) . '.log';
        
        // Initial log entry
        $this->log('info', 'Logger initialized');
    }
    
    /**
     * Log a message with specified level
     * 
     * @param string $level Log level ('debug', 'info', 'warning', 'error')
     * @param string $message Message to log
     * @return bool Success flag
     */
    public function log($level, $message) {
        $levelIndex = array_search(strtolower($level), $this->logLevels);
        
        // Check if level is valid and meets minimum log level
        if ($levelIndex === false || $levelIndex < $this->logLevel) {
            return false;
        }
        
        // Format the log entry
        $timestamp = date('Y-m-d H:i:s');
        $levelUppercase = strtoupper($level);
        $logEntry = "[$timestamp] [$levelUppercase] $message" . PHP_EOL;
        
        // Write to log file
        file_put_contents($this->logFile, $logEntry, FILE_APPEND);
        
        // Also output to console if it's a warning or error
        if ($levelIndex >= 2) { // warning or error
            echo $logEntry;
        }
        
        return true;
    }
    
    /**
     * Log debug message
     * 
     * @param string $message Message to log
     * @return bool Success flag
     */
    public function debug($message) {
        return $this->log('debug', $message);
    }
    
    /**
     * Log info message
     * 
     * @param string $message Message to log
     * @return bool Success flag
     */
    public function info($message) {
        return $this->log('info', $message);
    }
    
    /**
     * Log warning message
     * 
     * @param string $message Message to log
     * @return bool Success flag
     */
    public function warning($message) {
        return $this->log('warning', $message);
    }
    
    /**
     * Log error message
     * 
     * @param string $message Message to log
     * @return bool Success flag
     */
    public function error($message) {
        return $this->log('error', $message);
    }
    
    /**
     * Get the current log file path
     * 
     * @return string Log file path
     */
    public function getLogFile() {
        return $this->logFile;
    }
}