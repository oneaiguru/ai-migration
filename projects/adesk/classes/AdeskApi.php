<?php
/**
 * VIPFLAT to Adesk Migration Tool - Adesk API Class
 * 
 * This class handles all interactions with the Adesk API.
 * 
 * File: classes/AdeskApi.php
 */
class AdeskApi {
    private $apiUrl;
    private $apiToken;
    private $apiVersion;
    private $logger;
    private $retryAttempts;
    private $retryDelay;
    private $legalEntities = null; // Cache for legal entities
    
    /**
     * Constructor
     * 
     * @param string $apiUrl The Adesk API URL
     * @param string $apiToken The Adesk API token
     * @param string $apiVersion The Adesk API version to use
     * @param Logger $logger The logger instance
     * @param int $retryAttempts Number of retry attempts for failed API calls
     * @param int $retryDelay Seconds to wait between retry attempts
     */
    public function __construct($apiUrl, $apiToken, $apiVersion = 'v1', $logger = null, $retryAttempts = 3, $retryDelay = 5) {
        $this->apiUrl = rtrim($apiUrl, '/');
        $this->apiToken = $apiToken;
        $this->apiVersion = $apiVersion;
        $this->logger = $logger;
        $this->retryAttempts = $retryAttempts;
        $this->retryDelay = $retryDelay;
        
        if (empty($this->apiToken)) {
            $this->log('error', 'API token is required');
            throw new Exception('API token is required');
        }
    }
    
    /**
     * Get a list of transaction categories
     * 
     * @param array $params Additional parameters
     * @return array|false The categories on success, false on failure
     */
    public function getCategories($params = []) {
        return $this->get('transactions/categories', $params);
    }
    
    /**
     * Create or update a transaction category
     * 
     * @param array $data The category data
     * @return array|false The created/updated category on success, false on failure
     */
    public function createCategory($data) {
        return $this->post('transactions/category', $data);
    }
    
    /**
     * Get a list of projects
     * 
     * @param array $params Additional parameters
     * @return array|false The projects on success, false on failure
     */
    public function getProjects($params = []) {
        return $this->get('projects', $params);
    }
    
    /**
     * Create a new project
     * 
     * @param array $data The project data
     * @return array|false The created project on success, false on failure
     */
    public function createProject($data) {
        return $this->post('project', $data);
    }
    
    /**
     * Update an existing project
     * 
     * @param int $id The project ID
     * @param array $data The project data
     * @return array|false The updated project on success, false on failure
     */
    public function updateProject($id, $data) {
        return $this->post("project/$id", $data);
    }
    
    /**
     * Delete a project
     * 
     * @param int $id The project ID
     * @return array|false The result on success, false on failure
     */
    public function deleteProject($id) {
        return $this->post("project/$id/remove");
    }
    
    /**
     * Get a list of bank accounts
     * 
     * @param array $params Additional parameters
     * @return array|false The bank accounts on success, false on failure
     */
    public function getBankAccounts($params = []) {
        return $this->get('bank-accounts', $params);
    }
    
    /**
     * Get a bank account by ID
     * 
     * @param int $id The bank account ID
     * @return array|false The bank account on success, false on failure
     */
    public function getBankAccount($id) {
        return $this->get("bank-account/$id");
    }
    
    /**
     * Create a new bank account
     * 
     * @param array $data The bank account data
     * @return array|false The created bank account on success, false on failure
     */
    public function createBankAccount($data) {
        return $this->post('bank-account', $data);
    }
    
    /**
     * Update an existing bank account
     * 
     * @param int $id The bank account ID
     * @param array $data The bank account data
     * @return array|false The result on success, false on failure
     */
    public function updateBankAccount($id, $data) {
        return $this->post("bank-account/$id", $data);
    }
    
    /**
     * Delete a bank account
     * 
     * @param int $id The bank account ID
     * @return array|false The result on success, false on failure
     */
    public function deleteBankAccount($id) {
        return $this->post("bank-account/$id/remove");
    }
    
    /**
     * Get a list of contractors
     * 
     * @param array $params Additional parameters
     * @return array|false The contractors on success, false on failure
     */
    public function getContractors($params = []) {
        return $this->get('contractors', $params);
    }
    
    /**
     * Get a contractor by ID
     * 
     * @param int $id The contractor ID
     * @return array|false The contractor on success, false on failure
     */
    public function getContractor($id) {
        return $this->get("contractor/$id");
    }
    
    /**
     * Create a new contractor
     * 
     * @param array $data The contractor data
     * @return array|false The created contractor on success, false on failure
     */
    public function createContractor($data) {
        return $this->post('contractor', $data);
    }
    
    /**
     * Update an existing contractor
     * 
     * @param int $id The contractor ID
     * @param array $data The contractor data
     * @return array|false The result on success, false on failure
     */
    public function updateContractor($id, $data) {
        return $this->post("contractor/$id", $data);
    }
    
    /**
     * Delete a contractor
     * 
     * @param int $id The contractor ID
     * @return array|false The result on success, false on failure
     */
    public function deleteContractor($id) {
        return $this->post("contractor/$id/remove");
    }
    
    /**
     * Get a list of transactions
     * 
     * @param array $params Additional parameters
     * @return array|false The transactions on success, false on failure
     */
    public function getTransactions($params = []) {
        return $this->get('transactions', $params);
    }
    
    /**
     * Get a transaction by ID
     * 
     * @param int $id The transaction ID
     * @return array|false The transaction on success, false on failure
     */
    public function getTransaction($id) {
        return $this->get("transaction/$id");
    }
    
    /**
     * Create a new transaction
     * 
     * @param array $data The transaction data
     * @return array|false The created transaction on success, false on failure
     */
    public function createTransaction($data) {
        return $this->post('transaction', $data);
    }
    
    /**
     * Update an existing transaction
     * 
     * @param int $id The transaction ID
     * @param array $data The transaction data
     * @return array|false The result on success, false on failure
     */
    public function updateTransaction($id, $data) {
        return $this->post("transaction/$id", $data);
    }
    
    /**
     * Delete a transaction
     * 
     * @param int $id The transaction ID
     * @return array|false The result on success, false on failure
     */
    public function deleteTransaction($id) {
        return $this->post("transaction/$id/remove");
    }
    
    /**
     * Complete a planned transaction
     * 
     * @param int $id The transaction ID
     * @return array|false The result on success, false on failure
     */
    public function completeTransaction($id) {
        return $this->post("transaction/$id/complete");
    }
    
    /**
     * Get legal entities
     * 
     * @return array|false The legal entities on success, false on failure
     */
    public function getLegalEntities() {
        if ($this->legalEntities === null) {
            // Try direct API endpoint
            $response = $this->get('legal-entities');
            if ($response && isset($response['success']) && $response['success'] && isset($response['legal_entities'])) {
                $this->legalEntities = $response['legal_entities'];
                $this->log('info', "Retrieved " . count($this->legalEntities) . " legal entities from API");
            } else {
                $this->log('warning', "Failed to retrieve legal entities using direct API endpoint");
                
                // Try inferring from bank accounts
                $accounts = $this->getBankAccounts();
                if ($accounts && isset($accounts['data']) && !empty($accounts['data'])) {
                    $legalEntitiesMap = [];
                    
                    foreach ($accounts['data'] as $account) {
                        if (isset($account['legal_entity']) && !empty($account['legal_entity'])) {
                            $id = $account['legal_entity'];
                            
                            // If we don't already have this entity, add it
                            if (!isset($legalEntitiesMap[$id])) {
                                $legalEntitiesMap[$id] = [
                                    'id' => $id,
                                    'name' => isset($account['legal_entity_name']) ? $account['legal_entity_name'] : 'Unknown',
                                    'source' => 'inferred_from_bank_account',
                                    'bank_account_id' => $account['id']
                                ];
                            }
                        }
                    }
                    
                    $this->legalEntities = array_values($legalEntitiesMap);
                    if (!empty($this->legalEntities)) {
                        $this->log('info', "Inferred " . count($this->legalEntities) . " legal entities from bank accounts");
                    } else {
                        $this->log('warning', "Could not infer any legal entities from bank accounts");
                        $this->legalEntities = [];
                    }
                } else {
                    $this->log('warning', "Failed to retrieve bank accounts to infer legal entities");
                    $this->legalEntities = [];
                }
            }
        }
        return $this->legalEntities;
    }

    /**
     * Find a legal entity by name or other attributes
     * 
     * @param array $criteria Array of criteria to match (name, full_name, inn, etc)
     * @return array|null The matching legal entity or null if not found
     */
    public function findLegalEntityByCriteria($criteria) {
        // If no criteria provided, return null
        if (empty($criteria)) {
            return null;
        }
        
        $this->log('info', "Searching for legal entity with criteria: " . json_encode($criteria));
        
        // Try to get legal entities
        $entities = $this->getLegalEntities();
        
        if (empty($entities)) {
            $this->log('warning', "No legal entities available to search");
            return null;
        }
        
        // Search for matches
        foreach ($entities as $entity) {
            $matches = true;
            
            // Check each criterion
            foreach ($criteria as $key => $value) {
                if (!isset($entity[$key]) || $entity[$key] != $value) {
                    $matches = false;
                    break;
                }
            }
            
            if ($matches) {
                $this->log('info', "Found matching legal entity: ID {$entity['id']}");
                return $entity;
            }
        }
        
        // No match found
        $this->log('warning', "No legal entity matched the criteria");
        return null;
    }
    
    /**
     * Get default legal entity ID
     * 
     * @param array $searchCriteria Optional criteria to search for a specific entity
     * @return int|false The default legal entity ID on success, false on failure
     */
    public function getDefaultLegalEntityId($searchCriteria = []) {
        // First try to get from environment
        $envLegalEntity = getenv('LEGAL_ENTITY_ID');
        if ($envLegalEntity) {
            $this->log('info', "Using legal entity ID: " . $envLegalEntity . " from environment variable");
            return $envLegalEntity;
        }
        
        // Then try from config constant
        if (defined('LEGAL_ENTITY_ID') && LEGAL_ENTITY_ID) {
            $this->log('info', "Using legal entity ID: " . LEGAL_ENTITY_ID . " from constant");
            return LEGAL_ENTITY_ID;
        }
        
        // If search criteria provided, try to find by criteria
        if (!empty($searchCriteria)) {
            $entity = $this->findLegalEntityByCriteria($searchCriteria);
            if ($entity) {
                $this->log('info', "Using legal entity ID: " . $entity['id'] . " found by criteria");
                return $entity['id'];
            }
        }
        
        // Try to find by search terms in name - VIPFLATS
        try {
            // Common search terms for the entity we're looking for
            $searchTerms = ['VIPFLATS', 'VIPFLATSVIPFLATS', 'VIP', 'FLATS'];
            
            $entities = $this->getLegalEntities();
            if (!empty($entities)) {
                // First look for exact matches
                foreach ($entities as $entity) {
                    foreach ($searchTerms as $term) {
                        if (isset($entity['name']) && strtoupper($entity['name']) == $term) {
                            $this->log('info', "Using legal entity ID: " . $entity['id'] . " matched by name: " . $term);
                            return $entity['id'];
                        }
                    }
                }
                
                // Then look for partial matches
                foreach ($entities as $entity) {
                    foreach ($searchTerms as $term) {
                        if (isset($entity['name']) && stripos($entity['name'], $term) !== false) {
                            $this->log('info', "Using legal entity ID: " . $entity['id'] . " with partial name match: " . $term);
                            return $entity['id'];
                        }
                    }
                }
                
                // If no matches, use the first entity as default
                $this->log('info', "Using legal entity ID: " . $entities[0]['id'] . " (first available)");
                return $entities[0]['id'];
            }
        } catch (Exception $e) {
            $this->log('warning', "Error finding legal entity by name: " . $e->getMessage());
        }
        
        // Try API as a fallback option
        try {
            $entities = $this->getLegalEntities();
            if (!empty($entities)) {
                // Use the first entity as default
                $this->log('info', "Using legal entity ID: " . $entities[0]['id'] . " from API");
                return $entities[0]['id'];
            }
        } catch (Exception $e) {
            $this->log('warning', "Error getting legal entities from API: " . $e->getMessage());
        }
        
        // Try to get from organization info - sometimes organizations have a default legal entity
        try {
            $organization = $this->get('organization');
            if ($organization && isset($organization['default_legal_entity']) && !empty($organization['default_legal_entity'])) {
                $this->log('info', "Using default legal entity ID from organization: " . $organization['default_legal_entity']);
                return $organization['default_legal_entity'];
            }
        } catch (Exception $e) {
            $this->log('warning', "Error getting organization info: " . $e->getMessage());
        }
        
        // Try to infer from existing bank accounts
        try {
            $accounts = $this->getBankAccounts();
            if ($accounts && isset($accounts['data']) && !empty($accounts['data'])) {
                foreach ($accounts['data'] as $account) {
                    if (isset($account['legal_entity']) && !empty($account['legal_entity'])) {
                        $this->log('info', "Using legal entity ID: " . $account['legal_entity'] . " from existing bank account: " . $account['name']);
                        return $account['legal_entity'];
                    }
                }
            }
        } catch (Exception $e) {
            $this->log('warning', "Error inferring legal entity from bank accounts: " . $e->getMessage());
        }
        
        // Fallback to ID from documentation - this is a last resort
        $defaultId = 1;
        $this->log('warning', "No legal entity found through any method. Using default ID $defaultId. This may cause issues with bank account creation.");
        $this->log('warning', "IMPORTANT: Create a legal entity in Adesk manually and set LEGAL_ENTITY_ID in the .env file.");
        $this->log('warning', "The legal entity ID is required for bank account creation. You can find the ID by:");
        $this->log('warning', "1. Creating a bank account in the Adesk web interface");
        $this->log('warning', "2. Using browser dev tools to inspect the network requests");
        $this->log('warning', "3. Finding the legal_entity parameter in the request");
        return $defaultId;
    }
    
    /**
     * Create a new transfer
     * 
     * @param array $data The transfer data
     * @return array|false The created transfer on success, false on failure
     */
    public function createTransfer($data) {
        return $this->post('transfer', $data);
    }
    
    /**
     * Make a GET request to the Adesk API
     * 
     * @param string $endpoint The API endpoint
     * @param array $params Query parameters
     * @return array|false The API response on success, false on failure
     */
    public function get($endpoint, $params = []) {
        // Build URL with query params
        $url = $this->apiUrl . '/' . $this->apiVersion . '/' . $endpoint;
        if (!empty($params)) {
            $url .= '?' . http_build_query($params);
        }
        
        return $this->makeRequest('GET', $url);
    }
    
    /**
     * Make a POST request to the Adesk API
     * 
     * @param string $endpoint The API endpoint
     * @param array $data Request data
     * @return array|false The API response on success, false on failure
     */
    public function post($endpoint, $data = []) {
        $url = $this->apiUrl . '/' . $this->apiVersion . '/' . $endpoint;
        return $this->makeRequest('POST', $url, $data);
    }
    
    /**
     * Make an HTTP request with retry logic
     * 
     * @param string $method The HTTP method
     * @param string $url The URL
     * @param array $data Request data for POST requests
     * @return array|false The API response on success, false on failure
     */
    private function makeRequest($method, $url, $data = []) {
        $attempts = 0;
        
        while ($attempts < $this->retryAttempts) {
            $attempts++;
            
            $this->log('debug', "Making $method request to $url" . ($attempts > 1 ? " (attempt $attempts)" : ""));
            
            $ch = curl_init();
            
            // Set URL
            curl_setopt($ch, CURLOPT_URL, $url);
            
            // Set method
            // Adesk v2 expects the token via X-API-Token (per docs)
            $headers = [
                'Accept: application/json',
                'X-API-Token: ' . $this->apiToken,
            ];
            
            if ($method === 'POST') {
                curl_setopt($ch, CURLOPT_POST, 1);
                $payload = json_encode($data, JSON_UNESCAPED_UNICODE);
                curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
                $headers[] = 'Content-Type: application/json';
            }
            
            // Set options
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_TIMEOUT, 30);
            curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 5);
            curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
            
            // Execute request
            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $error = curl_error($ch);
            
            curl_close($ch);
            
            // Handle response
            if ($response === false) {
                $this->log('error', "cURL error: $error");
                sleep($this->retryDelay);
                continue;
            }
            
            $responseData = json_decode($response, true);
            
            // Rate limit response (429)
            if ($httpCode === 429) {
                $this->log('warning', "Rate limit exceeded. Waiting before retry.");
                sleep($this->retryDelay * 2); // Wait longer for rate limit
                continue;
            }
            
            // Server error responses (5xx)
            if ($httpCode >= 500) {
                $this->log('warning', "Server error: $httpCode. Retrying...");
                sleep($this->retryDelay);
                continue;
            }
            
            // Authentication error (401)
            if ($httpCode === 401) {
                $this->log('error', "Authentication failed: Invalid API token");
                return false;
            }
            
            // Payment required error (402)
            if (isset($responseData['code']) && $responseData['code'] === 21) {
                $this->log('error', "Payment required: Subscription expired");
                return false;
            }
            
            // Success response
            if ($httpCode >= 200 && $httpCode < 300) {
                return $responseData;
            }
            
            // Other client errors (4xx)
            $this->log('error', "API error: HTTP $httpCode. Response: " . json_encode($responseData));
            return false;
        }
        
        $this->log('error', "Failed after {$this->retryAttempts} attempts");
        return false;
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
