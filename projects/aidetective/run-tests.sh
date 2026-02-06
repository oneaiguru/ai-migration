#!/bin/bash

# Add the current directory to PYTHONPATH
export PYTHONPATH=$PYTHONPATH:$(pwd)

# Install pytest-asyncio if needed
pip install pytest pytest-asyncio pytest-cov > /dev/null

# Function to display help
show_help() {
    echo "Usage: ./run_tests.sh [options] [test_path]"
    echo ""
    echo "Options:"
    echo "  -h, --help     Show this help message"
    echo "  -a, --all      Run all tests"
    echo "  -v, --verbose  Run tests with verbose output"
    echo "  -c, --cov      Run tests with coverage"
    echo "  -r, --repo     Run repository tests only"
    echo "  -i, --int      Run integration tests only"
    echo ""
    echo "Examples:"
    echo "  ./run_tests.sh                     # Run repository tests (default)"
    echo "  ./run_tests.sh -a                  # Run all tests"
    echo "  ./run_tests.sh -v tests/test_repositories.py  # Run repo tests with verbose output"
    echo "  ./run_tests.sh -c                  # Run repo tests with coverage report"
    echo "  ./run_tests.sh -i                  # Run integration tests"
}

# Default settings
VERBOSE=""
COVERAGE=""
TEST_PATH="tests/test_repositories.py"

# Parse arguments
while [[ $# -gt 0 ]]; do
    case "$1" in
        -h|--help)
            show_help
            exit 0
            ;;
        -a|--all)
            TEST_PATH="tests/"
            shift
            ;;
        -v|--verbose)
            VERBOSE="-v"
            shift
            ;;
        -c|--cov)
            COVERAGE="--cov=."
            shift
            ;;
        -r|--repo)
            TEST_PATH="tests/test_repositories.py"
            shift
            ;;
        -i|--int)
            TEST_PATH="tests/integration/"
            shift
            ;;
        *)
            # If argument doesn't start with -, assume it's a test path
            if [[ "$1" != -* && -n "$1" ]]; then
                TEST_PATH="$1"
            fi
            shift
            ;;
    esac
done

# Run tests
echo "Running tests in $TEST_PATH..."
pytest $TEST_PATH $VERBOSE $COVERAGE