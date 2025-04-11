#!/bin/bash

# Legal System Tests Runner
# This script runs all tests for the legal practice management system

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Banner
echo -e "${BLUE}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                                                           ║${NC}"
echo -e "${BLUE}║             PaySurity Legal System Test Suite             ║${NC}"
echo -e "${BLUE}║                                                           ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════╝${NC}"

# Create directory for test reports if it doesn't exist
mkdir -p test-reports

# Track test results
PASSED=0
FAILED=0
TOTAL=0

# Function to run a test and update counters
run_test() {
  TEST_NAME=$1
  TEST_COMMAND=$2
  
  echo -e "\n${YELLOW}Running $TEST_NAME tests...${NC}"
  echo -e "${YELLOW}----------------------------------------${NC}"
  
  # Run the test
  if $TEST_COMMAND; then
    echo -e "\n${GREEN}✓ $TEST_NAME tests passed${NC}"
    PASSED=$((PASSED + 1))
  else
    echo -e "\n${RED}✗ $TEST_NAME tests failed${NC}"
    FAILED=$((FAILED + 1))
  fi
  
  TOTAL=$((TOTAL + 1))
  echo -e "${YELLOW}----------------------------------------${NC}"
}

# Start timestamp
START_TIME=$(date +%s)

# Run each test suite
run_test "IOLTA Trust Accounting" "npx tsx scripts/test-iolta.ts"

# Add more tests as they're implemented
# run_test "Document Management" "npx tsx scripts/test-legal-document-management.ts"
# run_test "Time & Expense Tracking" "npx tsx scripts/test-legal-time-expense.ts"
# run_test "Billing & Invoicing" "npx tsx scripts/test-legal-billing.ts"
# run_test "Client Portal" "npx tsx scripts/test-client-portal.ts"
# run_test "Legal Reporting" "npx tsx scripts/test-legal-reporting.ts"

# End timestamp
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

# Display summary
echo -e "\n${BLUE}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                     Test Summary                          ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════╝${NC}"
echo -e "Duration: ${DURATION} seconds"
echo -e "Total Test Suites: ${TOTAL}"
echo -e "${GREEN}Passed: ${PASSED}${NC}"
echo -e "${RED}Failed: ${FAILED}${NC}"

# Set exit code based on test results
if [ $FAILED -eq 0 ]; then
  echo -e "\n${GREEN}All test suites passed!${NC}"
  exit 0
else
  echo -e "\n${RED}One or more test suites failed.${NC}"
  exit 1
fi