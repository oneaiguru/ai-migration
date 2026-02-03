import unittest
from unittest.mock import patch, MagicMock
import time
from fastwhisper.core.retry_decorator import retry_operation

class TestRetryOperation(unittest.TestCase):
    def setUp(self):
        self.logger = MagicMock()

    @patch('time.sleep')  # Mock sleep to speed up tests
    def test_retry_once_on_failure(self, mock_sleep):
        """Test that a function is retried once upon failure."""
        call_count = 0

        @retry_operation(max_retries=1, logger=self.logger)
        def flaky_function():
            nonlocal call_count
            call_count += 1
            if call_count == 1:
                raise IOError("Temporary failure")
            return "success"

        result = flaky_function()
        self.assertEqual(result, "success")
        self.assertEqual(call_count, 2)
        mock_sleep.assert_called_once_with(1)

    @patch('time.sleep')
    def test_retry_up_to_max_retries(self, mock_sleep):
        """Test that function is retried correct number of times before failing."""
        call_count = 0
        max_retries = 3

        @retry_operation(max_retries=max_retries, logger=self.logger)
        def failing_function():
            nonlocal call_count
            call_count += 1
            raise IOError("Always fails")

        with self.assertRaises(IOError):
            failing_function()

        self.assertEqual(call_count, max_retries + 1)
        self.assertEqual(mock_sleep.call_count, max_retries)

    @patch('time.sleep')
    def test_exponential_backoff(self, mock_sleep):
        """Test that exponential backoff is implemented correctly."""
        @retry_operation(max_retries=3, delay_base=1, logger=self.logger)
        def failing_function():
            raise IOError("Always fails")

        with self.assertRaises(IOError):
            failing_function()

        # Check exponential backoff delays: 1s, 2s, 4s
        mock_sleep.assert_has_calls([
            unittest.mock.call(1),
            unittest.mock.call(2),
            unittest.mock.call(4)
        ])