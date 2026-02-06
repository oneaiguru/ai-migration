<?php
/**
 * Simple Claude API client
 */
class ClaudeClient {
    private $apiKey;
    private $apiUrl = 'https://api.anthropic.com/v1/messages';
    private $model = 'claude-3-sonnet-20240229';
    
    public function __construct($apiKey) {
        $this->apiKey = $apiKey;
    }
    
    public function setModel($model) {
        $this->model = $model;
        return $this;
    }
    
    public function generateText($prompt, $parameters = []) {
        // Default parameters
        $defaultParams = [
            'temperature' => 0.7,
            'max_tokens' => 1000,
            'top_p' => 0.9,
        ];
        
        // Merge with provided parameters
        $parameters = array_merge($defaultParams, $parameters);
        
        // Prepare data for API request
        $data = [
            'model' => $this->model,
            'messages' => [
                [
                    'role' => 'user',
                    'content' => $prompt
                ]
            ],
            'temperature' => $parameters['temperature'],
            'max_tokens' => $parameters['max_tokens'],
            'top_p' => $parameters['top_p']
        ];
        
        // Make API request
        $curl = curl_init();
        curl_setopt_array($curl, [
            CURLOPT_URL => $this->apiUrl,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_ENCODING => '',
            CURLOPT_MAXREDIRS => 10,
            CURLOPT_TIMEOUT => 30,
            CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
            CURLOPT_CUSTOMREQUEST => 'POST',
            CURLOPT_POSTFIELDS => json_encode($data),
            CURLOPT_HTTPHEADER => [
                'Content-Type: application/json',
                'x-api-key: ' . $this->apiKey,
                'anthropic-version: 2023-06-01'
            ],
        ]);
        
        $response = curl_exec($curl);
        $err = curl_error($curl);
        $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
        
        curl_close($curl);
        
        if ($err) {
            throw new Exception("cURL Error: " . $err);
        }
        
        if ($httpCode !== 200) {
            throw new Exception("API Error: HTTP code $httpCode - $response");
        }
        
        $decodedResponse = json_decode($response, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new Exception("Invalid JSON response: " . json_last_error_msg());
        }
        
        return $this->extractTextFromResponse($decodedResponse);
    }
    
    private function extractTextFromResponse($response) {
        if (!isset($response['content']) || !is_array($response['content']) || empty($response['content'])) {
            throw new Exception("Unexpected API response structure: Missing content array");
        }
        
        $textParts = [];
        foreach ($response['content'] as $part) {
            if (isset($part['type']) && $part['type'] === 'text' && isset($part['text'])) {
                $textParts[] = $part['text'];
            }
        }
        
        if (empty($textParts)) {
            throw new Exception("No text content found in API response");
        }
        
        return implode("\n", $textParts);
    }
}