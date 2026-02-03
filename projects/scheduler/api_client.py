#!/usr/bin/env python3
"""
DeepSeek API Client
------------------
Client for interacting with DeepSeek API, optimizing for cost and performance.
"""

import json
import logging
import time
import datetime
from typing import Dict, Any, Optional, List
import requests
from requests.exceptions import RequestException

logger = logging.getLogger("DeepSeekClient")

class DeepSeekClient:
    """Client for making requests to the DeepSeek API with cost optimization."""
    
    def __init__(self, base_url: str = "https://api.deepseek.com", api_key: str = None):
        """
        Initialize the DeepSeek API client.
        
        Args:
            base_url: DeepSeek API base URL
            api_key: DeepSeek API key
        """
        self.base_url = base_url
        self.api_key = api_key
        self.headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}"
        }
        
    def is_off_peak_hours(self) -> bool:
        """
        Check if current time is in DeepSeek's off-peak hours (16:30-00:30 UTC).
        
        Returns:
            True if current time is in off-peak hours
        """
        now = datetime.datetime.utcnow().time()
        off_peak_start = datetime.time(16, 30)
        off_peak_end = datetime.time(0, 30)
        
        # Handle the case where off-peak spans across midnight
        if now >= off_peak_start or now < off_peak_end:
            return True
        return False
    
    def call_api(self, model: str, system_prompt: str, user_prompt: str, 
                 temperature: float = 1.0, max_tokens: int = 4096,
                 stream: bool = False, retry_count: int = 0, max_retries: int = 3) -> str:
        """
        Call the DeepSeek API with the given parameters.
        
        Args:
            model: Model to use ('deepseek-chat' for V3 or 'deepseek-reasoner' for R1)
            system_prompt: System message prompt
            user_prompt: User message prompt
            temperature: Temperature parameter (0.0 to 1.5)
            max_tokens: Maximum number of tokens to generate
            stream: Whether to stream the response
            retry_count: Current retry attempt for transient errors
            max_retries: Maximum retry attempts before failing
            
        Returns:
            API response text or raises an exception on error
        """
        url = f"{self.base_url}/chat/completions"
        
        payload = {
            "model": model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            "temperature": temperature,
            "max_tokens": max_tokens,
            "stream": stream
        }
        
        # Log API call with cost optimization info
        is_off_peak = self.is_off_peak_hours()
        logger.info(f"Calling DeepSeek API with model: {model} (off-peak: {is_off_peak})")
        
        response = None
        try:
            response = requests.post(url, headers=self.headers, json=payload)
            response.raise_for_status()
            
            if stream:
                return self._handle_stream_response(response)
            else:
                return self._handle_standard_response(response)
                
        except RequestException as e:
            logger.error(f"API request failed: {e}")
            
            resp = getattr(e, "response", None) or response
            status_code = resp.status_code if resp is not None else None

            # Handle specific error codes
            if status_code == 401:
                raise ValueError("Authentication failed. Check your API key.")
            elif status_code == 402:
                raise ValueError("Insufficient balance in DeepSeek account.")
            elif status_code == 429:
                if retry_count >= max_retries:
                    raise ValueError("Rate limit reached and max retries exhausted.")
                retry_after = int(resp.headers.get('Retry-After', '5')) if resp else 5
                logger.warning(f"Rate limit reached. Retrying after {retry_after} seconds (attempt {retry_count + 1}/{max_retries}).")
                time.sleep(retry_after)
                return self.call_api(model, system_prompt, user_prompt, temperature, max_tokens, stream, retry_count + 1, max_retries)
            elif status_code == 503:
                if retry_count >= max_retries:
                    raise ValueError("Service unavailable and max retries exhausted.")
                logger.warning(f"Server overloaded. Retrying after 10 seconds (attempt {retry_count + 1}/{max_retries}).")
                time.sleep(10)
                return self.call_api(model, system_prompt, user_prompt, temperature, max_tokens, stream, retry_count + 1, max_retries)
            else:
                raise
    
    def _handle_standard_response(self, response) -> str:
        """Process a standard (non-stream) API response."""
        try:
            data = response.json()
            message = data['choices'][0]['message']['content']
            
            # Log token usage for cost tracking
            usage = data.get('usage', {})
            prompt_tokens = usage.get('prompt_tokens', 0)
            completion_tokens = usage.get('completion_tokens', 0)
            total_tokens = usage.get('total_tokens', 0)
            
            logger.info(f"API call completed. Tokens used: {prompt_tokens} (prompt) + "
                       f"{completion_tokens} (completion) = {total_tokens} (total)")
            
            return message
        except (KeyError, json.JSONDecodeError) as e:
            logger.error(f"Failed to parse API response: {e}")
            logger.debug(f"Response content: {response.text}")
            raise ValueError("Invalid response format from API")
    
    def _handle_stream_response(self, response) -> str:
        """Process a streaming API response."""
        full_response = ""
        
        try:
            for line in response.iter_lines():
                if line:
                    line = line.decode('utf-8')
                    if line.startswith('data: ') and not line.startswith('data: [DONE]'):
                        data = json.loads(line[6:])
                        content = data['choices'][0]['delta'].get('content', '')
                        full_response += content
            
            return full_response
        except Exception as e:
            logger.error(f"Error processing stream response: {e}")
            raise

    def estimate_cost(self, model: str, input_tokens: int, output_tokens: int, 
                     cache_hit: bool = False) -> float:
        """
        Estimate the cost of an API call in USD.
        
        Args:
            model: Model name ('deepseek-chat' or 'deepseek-reasoner')
            input_tokens: Number of input tokens
            output_tokens: Number of output tokens
            cache_hit: Whether the request is a cache hit
            
        Returns:
            Estimated cost in USD
        """
        # Prices per 1M tokens
        is_off_peak = self.is_off_peak_hours()
        
        if model == "deepseek-chat":  # DeepSeek-V3
            if is_off_peak:  # 50% off during off-peak
                input_price_hit = 0.035
                input_price_miss = 0.135
                output_price = 0.550
            else:  # Standard pricing
                input_price_hit = 0.07
                input_price_miss = 0.27
                output_price = 1.10
        else:  # deepseek-reasoner (DeepSeek-R1)
            if is_off_peak:  # 75% off during off-peak
                input_price_hit = 0.035
                input_price_miss = 0.135
                output_price = 0.550
            else:  # Standard pricing
                input_price_hit = 0.14
                input_price_miss = 0.55
                output_price = 2.19
        
        # Calculate cost
        input_cost = (input_tokens / 1_000_000) * (input_price_hit if cache_hit else input_price_miss)
        output_cost = (output_tokens / 1_000_000) * output_price
        total_cost = input_cost + output_cost
        
        return total_cost

    def choose_optimal_model(self, task_description: str, 
                            reasoning_required: bool = False) -> str:
        """
        Choose the optimal model based on task requirements and current time.
        
        Args:
            task_description: Description of the task
            reasoning_required: Whether the task requires reasoning
            
        Returns:
            Optimal model name
        """
        if reasoning_required:
            return "deepseek-reasoner"  # DeepSeek-R1
        else:
            return "deepseek-chat"      # DeepSeek-V3
