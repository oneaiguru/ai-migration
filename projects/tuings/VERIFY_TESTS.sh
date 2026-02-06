#!/bin/bash

# Things TUI Clone - Test Verification Script
# This script verifies that all tests run successfully and coverage is generated
# Run this before submitting PR

set -e  # Exit on first error

echo "======================================"
echo "Things TUI Clone - Test Verification"
echo "======================================"
echo ""

# Check prerequisites
echo "1. Checking prerequisites..."
echo "   Node version: $(node --version)"
echo "   npm version: $(npm --version)"
echo ""

# Check Things 3 is running (optional)
if pgrep -q "Things"; then
  echo "   ✅ Things 3 app is running"
else
  echo "   ⚠️  Things 3 app not running (tests may fail)"
fi
echo ""

# Install dependencies
echo "2. Installing dependencies..."
npm install --silent
echo "   ✅ Dependencies installed"
echo ""

# Build TypeScript
echo "3. Building TypeScript..."
npm run build > /dev/null 2>&1
echo "   ✅ TypeScript compiled"
echo ""

# Run tests
echo "4. Running BDD tests..."
echo "   (This may take 30-40 seconds)"
npm run test:bdd

# Check test output for summary
TEST_COUNT=$(npm run test:bdd 2>&1 | grep "scenarios" | tail -1)
echo ""
echo "   Test Summary: $TEST_COUNT"
echo ""

# Generate coverage
echo "5. Generating coverage report..."
npm run test:coverage > /dev/null 2>&1
echo "   ✅ Coverage report generated"
echo ""

# Show coverage summary
echo "6. Coverage Summary:"
grep "Statements" coverage/index.html | tail -1 | sed 's/<[^>]*>//g' | xargs
echo ""

# Show coverage details
echo "7. Coverage by Module:"
npm run test:coverage 2>&1 | grep -A 20 "File.*Stmts.*Branch" | tail -10
echo ""

echo "======================================"
echo "✅ Verification Complete!"
echo "======================================"
echo ""
echo "Next steps:"
echo "1. View detailed coverage: open coverage/index.html"
echo "2. Review test scenarios: cat features/*.feature"
echo "3. Check step definitions: cat features/step_definitions/common.steps.ts"
echo ""
