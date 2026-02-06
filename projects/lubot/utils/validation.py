# utils/validation.py

import re
from urllib.parse import urlparse
from typing import Optional

def validate_user_input(input_str: str, max_length: int = 1000) -> bool:
    return bool(input_str) and len(input_str.strip()) <= max_length

def validate_user_id(user_id: int) -> bool:
    return isinstance(user_id, int) and user_id > 0

def validate_string(input_string: str, min_length: int = 1, max_length: int = 255) -> bool:
    return isinstance(input_string, str) and min_length <= len(input_string) <= max_length

def validate_integer(input_number: int, min_value: Optional[int] = None, max_value: Optional[int] = None) -> bool:
    if not isinstance(input_number, int):
        return False
    if min_value is not None and input_number < min_value:
        return False
    if max_value is not None and input_number > max_value:
        return False
    return True

def validate_telegram_chat_id(chat_id: int) -> bool:
    return isinstance(chat_id, int) and chat_id != 0

def validate_telegram_message_length(message: str, max_length: int = 4096) -> bool:
    return len(message) <= max_length

def validate_url(url: str) -> bool:
    try:
        result = urlparse(url)
        return all([result.scheme, result.netloc])
    except ValueError:
        return False

def validate_referral_code(code: str, expected_length: int = 8) -> bool:
    return bool(re.fullmatch(rf'[A-Z0-9]{{{expected_length}}}', code))

def validate_gender(gender: str) -> bool:
    valid_genders = ['Мужчина', 'Женщина', 'Не хочу указывать']
    return gender in valid_genders

def validate_email(email: str) -> bool:
    # Simple regex for validating an email
    return bool(re.match(r"[^@]+@[^@]+\.[^@]+", email))

def validate_password(password: str, min_length: int = 8) -> bool:
    # Check if the password meets the minimum length requirement
    return len(password) >= min_length
