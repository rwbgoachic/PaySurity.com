#!/bin/bash

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                                                           ║"
echo "║             PaySurity Legal System Test Suite             ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"

START_TIME=$(date +%s)

# First ensure the necessary database columns exist
echo ""
echo "Running pre-test database fixes..."
echo "----------------------------------------"
npx tsx scripts/fix-iolta-tables.ts
npx tsx scripts/fix-jurisdiction-column.ts
npx tsx scripts/fix-iolta-transaction-balances.ts

# Run the IOLTA Trust Accounting tests
echo ""
echo "Running IOLTA Trust Accounting tests..."
echo "----------------------------------------"
npx tsx scripts/test-iolta.ts

# Store the exit code
IOLTA_RESULT=$?

if [ $IOLTA_RESULT -eq 0 ]; then
  echo "✓ IOLTA Trust Accounting tests passed"
else
  echo "✗ IOLTA Trust Accounting tests failed"
fi
echo "----------------------------------------"

END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                     Test Summary                          ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo "Duration: $DURATION seconds"
echo "Total Test Suites: 1"

PASSED_SUITES=0
FAILED_SUITES=0

if [ $IOLTA_RESULT -eq 0 ]; then
  PASSED_SUITES=$((PASSED_SUITES + 1))
else
  FAILED_SUITES=$((FAILED_SUITES + 1))
fi

echo "Passed: $PASSED_SUITES"
echo "Failed: $FAILED_SUITES"

# Set overall exit code
if [ $FAILED_SUITES -gt 0 ]; then
  echo ""
  echo "One or more test suites failed."
  exit 1
else
  echo ""
  echo "All test suites passed successfully!"
  exit 0
fi