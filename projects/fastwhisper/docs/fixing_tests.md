# Fixing Test Failures in test_storage_manager.py

The tests in `test_storage_manager.py` were failing because the `ENVIRONMENT` variable was incorrectly set to `code_interpreter`, causing the `StorageManager` to operate using a virtual filesystem instead of the real filesystem. This led to assertions failing when the tests expected real filesystem operations to occur.

### Changes Made:

1. **Updated `tests/conftest.py`**:
    - Modified the `mock_faster_whisper` fixture to set the `ENVIRONMENT` based on the `--test-environment` option.
    - Ensured that when `--test-environment=basic` is used, `ENVIRONMENT` is set to `basic` and `WhisperModel` is mocked accordingly.
    - This allows tests to correctly use the real filesystem in the `basic` environment and mock dependencies as needed.

These changes ensure that the `test_storage_manager.py` tests run in the correct environment and interact with the filesystem as expected, resolving the previous assertion errors.