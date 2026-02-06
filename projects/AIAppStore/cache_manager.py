import json
import os
from typing import Any

class CacheManager:
    def __init__(self, cache_file: str):
        self.cache_file = cache_file
        self.cache = self.load_cache()

    def load_cache(self) -> dict:
        if os.path.exists(self.cache_file):
            with open(self.cache_file, "r") as f:
                try:
                    return json.load(f)
                except json.JSONDecodeError:
                    return {}
        return {}

    def save_cache(self):
        with open(self.cache_file, "w") as f:
            json.dump(self.cache, f, indent=2)

    def is_cached(self, key: str) -> bool:
        return key in self.cache

    def get_from_cache(self, key: str) -> Any:
        return self.cache.get(key)

    def add_to_cache(self, key: str, data: Any):
        self.cache[key] = data
        self.save_cache()

    def remove_from_cache(self, key: str):
        if key in self.cache:
            del self.cache[key]
            self.save_cache()