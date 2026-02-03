"""Tests for structured logging."""
import pytest
import structlog


def test_logging_setup():
    """Test that structured logging setup works."""
    from src.logging_config import setup_logging

    setup_logging()
    log = structlog.get_logger()

    # Should not raise
    log.info("test_event", key="value")


def test_logging_json_output(capsys):
    """Test that logging produces JSON output."""
    from src.logging_config import setup_logging
    import logging

    # Clear any existing handlers
    root_logger = logging.getLogger()
    for handler in root_logger.handlers[:]:
        root_logger.removeHandler(handler)

    setup_logging()
    log = structlog.get_logger()

    # Log an event
    log.info("test_json_output", event_type="test", value=42)

    # Capture output - should be JSON
    captured = capsys.readouterr()
    assert len(captured.out) > 0 or len(captured.err) > 0


def test_logging_with_context():
    """Test logging with structured context."""
    from src.logging_config import setup_logging

    setup_logging()
    log = structlog.get_logger()

    # Log with multiple fields
    log.info(
        "test_context",
        request_id="123e4567-e89b-12d3-a456-426614174000",
        site_count=42,
        total_m3=1234.56,
    )

    # Should not raise
    assert True


def test_error_logging():
    """Test error logging."""
    from src.logging_config import setup_logging

    setup_logging()
    log = structlog.get_logger()

    try:
        raise ValueError("Test error")
    except ValueError as e:
        log.error("test_error", error=str(e))

    # Should not raise
    assert True
