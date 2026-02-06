import tempfile
import os
import pytest
from llmcodeupdater.file_encoding_handler import FileEncodingHandler
import logging
import chardet
import unicodedata
def test_file_encoding_handler(caplog):
    """Unit test for FileEncodingHandler with logging capture using caplog."""
    with tempfile.TemporaryDirectory() as temp_dir:
        # Create a test file with Latin-1 encoding
        test_file = os.path.join(temp_dir, "test.py")
        content = "def café():\n    return 'Café'\n"
        
        # Explicitly encode with ISO-8859-1 (Latin-1)
        with open(test_file, 'wb') as f:
            f.write(content.encode('ISO-8859-1'))

        # Verify initial encoding
        with open(test_file, 'rb') as f:
            raw_content = f.read()
        
        # Use chardet to detect the actual encoding
        detected_encoding = chardet.detect(raw_content)
        print(f"Detected Encoding: {detected_encoding}")

        # Initialize handler and capture logs with caplog
        handler = FileEncodingHandler()
        with caplog.at_level(logging.INFO):
            result = handler.convert_to_utf8(test_file)

        # Verify conversion
        assert result['success'] is True, f"Conversion failed: {result.get('error')}"
        
        # Allow for potential variations in encoding detection
        assert result['original_encoding'] in ['ISO-8859-1', 'ISO-8859-9', 'latin1'], \
            f"Unexpected original encoding: {result['original_encoding']}"
        
        assert result['confidence'] > 0.8, "Low confidence in encoding detection"

        # Verify UTF-8 encoding
        with open(test_file, 'r', encoding='utf-8') as f:
            converted_content = f.read()
        assert 'café' in converted_content.lower(), "Conversion did not preserve special characters"

        # Print logs for debugging
        for record in caplog.records:
            print(f"{record.levelname}: {record.message}")

def test_multiple_encoding_scenarios():
    """Test FileEncodingHandler with simplified encoding scenarios."""
    encoding_scenarios = [
        ('ISO-8859-1', "Cafe et croissant dans une boulangerie a Paris.", ['ISO-8859-1', 'windows-1252', 'ascii']),
        ('windows-1252', "Résumé: An overview of one's career achievements.", ['windows-1252', 'ISO-8859-1']),
        ('utf-8', "Привет, как дела? Это тест русского текста.", ['utf-8']),  # Russian text in UTF-8
    ]

    handler = FileEncodingHandler()

    for original_encoding, test_string, allowed_encodings in encoding_scenarios:
        with tempfile.TemporaryDirectory() as temp_dir:
            test_file = os.path.join(temp_dir, f"test_{original_encoding}.py")

            # Write file with the specific encoding
            with open(test_file, 'wb') as f:
                f.write(test_string.encode(original_encoding))

            # Convert to UTF-8
            result = handler.convert_to_utf8(test_file)

            # Assertions
            assert result['success'] is True, f"Conversion failed for {original_encoding}"
            assert result['original_encoding'] in allowed_encodings, \
                f"Unexpected encoding {result['original_encoding']} for text '{test_string}'. Expected one of {allowed_encodings}"

            # Verify content preservation
            with open(test_file, 'r', encoding='utf-8') as f:
                converted_content = f.read()

            # Normalize Unicode before comparison
            original_normalized = unicodedata.normalize('NFC', test_string.lower())
            converted_normalized = unicodedata.normalize('NFC', converted_content.lower())

            assert original_normalized in converted_normalized, \
                f"Content mismatch for {original_encoding}: '{original_normalized}' not in '{converted_normalized}'"
