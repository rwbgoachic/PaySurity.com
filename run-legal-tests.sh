#!/bin/bash

# Script to run all legal system tests
# Usage: ./run-legal-tests.sh [test_suite]
# If no test_suite is specified, it will run all legal system tests

# Ensure the script is executable
# chmod +x run-legal-tests.sh

# Set up environment
echo "======================================="
echo "Legal Practice Management System Tests"
echo "======================================="
echo ""

# Create test reports directory if it doesn't exist
mkdir -p test-reports

# Determine which test to run
TEST_SUITE=$1

if [ -z "$TEST_SUITE" ]; then
  echo "Running all legal system tests..."
  npx tsx scripts/test-legal-system.ts
  exit $?
fi

# Run specific test suite
case $TEST_SUITE in
  "iolta")
    echo "Running IOLTA trust accounting tests..."
    npx tsx scripts/test-legal-iolta.ts
    ;;
  "reconciliation")
    echo "Running IOLTA reconciliation tests..."
    npx tsx scripts/test-iolta-reconciliation.ts
    ;;
  "portal")
    echo "Running client portal tests..."
    npx tsx scripts/test-client-portal.ts
    ;;
  "time-expense")
    echo "Running time & expense tracking tests..."
    npx tsx scripts/test-legal-time-expense.ts
    ;;
  "reporting")
    echo "Running legal reporting tests..."
    npx tsx scripts/test-legal-reporting.ts
    ;;
  *)
    echo "Unknown test suite: $TEST_SUITE"
    echo "Available test suites: iolta, reconciliation, portal, time-expense, reporting"
    exit 1
    ;;
esac

# Return exit code from the test
exit $?