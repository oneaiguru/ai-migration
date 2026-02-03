# Testing Guide

This project uses **pytest** for all unit and integration tests.

## Running Tests Locally

1. Install development dependencies:
   ```bash
   pip install -e .[dev]
   ```

2. Execute the test suite with coverage:
   ```bash
   pytest --cov= --cov-report=term-missing
   ```

Coverage results will be displayed in the terminal and an XML report is
produced as `coverage.xml`.

## Continuous Integration

Automated tests run on every push and pull request via GitHub Actions.
The workflow installs dependencies, runs the test suite and uploads the
coverage report as an artifact.

