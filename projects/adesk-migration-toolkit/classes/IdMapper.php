<?php
/**
 * VIPFLAT to Adesk Migration Tool - ID Mapper Class
 * 
 * This class manages the mapping between VIPFLAT IDs and Adesk IDs
 * to support future synchronization and incremental updates.
 * 
 * File: classes/IdMapper.php
 */
class IdMapper {
    private $mappings = [];
    private $mappingsDir;
    private $logger;
    
    /**
     * Constructor
     * 
     * @param string $mappingsDir Directory to store mapping files
     * @param Logger $logger Logger instance
     */
    public function __construct($mappingsDir, $logger = null) {
        $this->mappingsDir = rtrim($mappingsDir, '/') . '/';
        $this->logger = $logger;
        
        // Ensure directory exists
        if (!file_exists($this->mappingsDir)) {
            mkdir($this->mappingsDir, 0777, true);
        }
    }
    
    /**
     * Load mappings for an entity type
     * 
     * @param string $entityType The entity type (e.g., 'contractors', 'transactions')
     * @return array The mappings
     */
    public function loadMappings($entityType) {
        // Return from cache if already loaded
        if (isset($this->mappings[$entityType])) {
            return $this->mappings[$entityType];
        }
        
        // Attempt to load from file
        $mappingFile = $this->getMappingFilePath($entityType);
        
        if (file_exists($mappingFile)) {
            $content = file_get_contents($mappingFile);
            $data = json_decode($content, true);
            
            if (is_array($data)) {
                $this->mappings[$entityType] = $data;
                $this->log('debug', "Loaded " . count($data) . " mappings for $entityType");
                return $data;
            }
        }
        
        // No mappings found
        $this->mappings[$entityType] = [];
        return [];
    }
    
    /**
     * Save mappings for an entity type
     * 
     * @param string $entityType The entity type
     * @return bool Success flag
     */
    public function saveMappings($entityType) {
        if (!isset($this->mappings[$entityType])) {
            $this->log('warning', "No mappings to save for $entityType");
            return false;
        }
        
        $mappingFile = $this->getMappingFilePath($entityType);
        $content = json_encode($this->mappings[$entityType], JSON_PRETTY_PRINT);
        
        $result = file_put_contents($mappingFile, $content);
        
        if ($result === false) {
            $this->log('error', "Failed to save mappings for $entityType");
            return false;
        }
        
        $this->log('debug', "Saved " . count($this->mappings[$entityType]) . " mappings for $entityType");
        return true;
    }
    
    /**
     * Add a mapping between a VIPFLAT ID and an Adesk ID
     * 
     * @param string $entityType The entity type
     * @param mixed $vipflatId The VIPFLAT ID
     * @param mixed $adeskId The Adesk ID
     * @param array $metadata Optional metadata about the mapping
     * @return bool Success flag
     */
    public function addMapping($entityType, $vipflatId, $adeskId, $metadata = []) {
        // Load existing mappings
        $this->loadMappings($entityType);
        
        // Add or update mapping
        $this->mappings[$entityType][$vipflatId] = [
            'adesk_id' => $adeskId,
            'last_updated' => date('Y-m-d H:i:s'),
            'metadata' => $metadata
        ];
        
        // Save immediately
        return $this->saveMappings($entityType);
    }
    
    /**
     * Get an Adesk ID from a VIPFLAT ID
     * 
     * @param string $entityType The entity type
     * @param mixed $vipflatId The VIPFLAT ID
     * @return mixed|null The Adesk ID or null if not found
     */
    public function getAdeskId($entityType, $vipflatId) {
        // Load mappings if not already loaded
        $this->loadMappings($entityType);
        
        if (isset($this->mappings[$entityType][$vipflatId])) {
            return $this->mappings[$entityType][$vipflatId]['adesk_id'];
        }
        
        return null;
    }
    
    /**
     * Get a VIPFLAT ID from an Adesk ID
     * 
     * @param string $entityType The entity type
     * @param mixed $adeskId The Adesk ID
     * @return mixed|null The VIPFLAT ID or null if not found
     */
    public function getVipflatId($entityType, $adeskId) {
        // Load mappings if not already loaded
        $this->loadMappings($entityType);
        
        foreach ($this->mappings[$entityType] as $vipflatId => $mapping) {
            if ($mapping['adesk_id'] == $adeskId) {
                return $vipflatId;
            }
        }
        
        return null;
    }
    
    /**
     * Get all VIPFLAT IDs that have been mapped
     * 
     * @param string $entityType The entity type
     * @return array List of VIPFLAT IDs
     */
    public function getAllVipflatIds($entityType) {
        // Load mappings if not already loaded
        $this->loadMappings($entityType);
        
        return array_keys($this->mappings[$entityType]);
    }
    
    /**
     * Get all mappings for an entity type
     * 
     * @param string $entityType The entity type
     * @return array The mappings
     */
    public function getAllMappings($entityType) {
        // Load mappings if not already loaded
        return $this->loadMappings($entityType);
    }
    
    /**
     * Get VIPFLAT IDs that have been updated since a specific time
     * 
     * @param string $entityType The entity type
     * @param string $since Timestamp in Y-m-d H:i:s format
     * @return array List of VIPFLAT IDs
     */
    public function getUpdatedSince($entityType, $since) {
        // Load mappings if not already loaded
        $this->loadMappings($entityType);
        
        $ids = [];
        foreach ($this->mappings[$entityType] as $vipflatId => $mapping) {
            if (isset($mapping['last_updated']) && strtotime($mapping['last_updated']) >= strtotime($since)) {
                $ids[] = $vipflatId;
            }
        }
        
        return $ids;
    }
    
    /**
     * Remove a mapping
     * 
     * @param string $entityType The entity type
     * @param mixed $vipflatId The VIPFLAT ID
     * @return bool Success flag
     */
    public function removeMapping($entityType, $vipflatId) {
        // Load mappings if not already loaded
        $this->loadMappings($entityType);
        
        if (isset($this->mappings[$entityType][$vipflatId])) {
            unset($this->mappings[$entityType][$vipflatId]);
            return $this->saveMappings($entityType);
        }
        
        return false;
    }
    
    /**
     * Get mapping file path for an entity type
     * 
     * @param string $entityType The entity type
     * @return string File path
     */
    private function getMappingFilePath($entityType) {
        return $this->mappingsDir . $entityType . '_mappings.json';
    }
    
    /**
     * Add a mapping between a user ID and their default account ID
     * 
     * @param mixed $userId The user ID
     * @param mixed $accountId The account ID
     * @param array $metadata Optional metadata about the mapping
     * @return bool Success flag
     */
    public function addUserAccountMapping($userId, $accountId, $metadata = []) {
        // User ID to default account mapping is stored as a special entity type
        return $this->addMapping('user_accounts', $userId, $accountId, $metadata);
    }
    
    /**
     * Get default account ID for a user
     * 
     * @param mixed $userId The user ID
     * @return mixed|null The account ID or null if not found
     */
    public function getUserDefaultAccount($userId) {
        return $this->getAdeskId('user_accounts', $userId);
    }
    
    /**
     * Get all user-account mappings
     * 
     * @return array The mappings
     */
    public function getAllUserAccountMappings() {
        return $this->getAllMappings('user_accounts');
    }
    
    /**
     * Log a message if a logger is available
     * 
     * @param string $level The log level
     * @param string $message The message to log
     */
    private function log($level, $message) {
        if ($this->logger) {
            $this->logger->log($level, $message);
        }
    }
}