#!/bin/bash

# PaySurity.com Comprehensive Test Runner
# This script runs all test scripts across the platform

echo "🚀 PaySurity.com Test Suite Runner"
echo "================================="

# Create test-reports directory if it doesn't exist
mkdir -p test-reports

# Set execution permission
chmod +x scripts/*.ts

echo "⚙️ Running Environment Setup..."
export NODE_ENV=test
export TEST_MODE=true

# Function to run a test and track status
run_test() {
  test_name=$1
  test_script=$2
  
  echo ""
  echo "🧪 Running $test_name..."
  echo "-------------------------------"
  
  # Execute the test script with tsx
  npx tsx $test_script
  
  # Check exit status
  if [ $? -eq 0 ]; then
    echo "✅ $test_name completed successfully"
    return 0
  else
    echo "❌ $test_name failed"
    return 1
  fi
}

# Initialize counters
TOTAL_TESTS=0
PASSED_TESTS=0

# Individual Test Runners
test_scripts=(
  "API Tests:scripts/test-api-endpoints.ts"
  "Wallet System Tests:scripts/test-wallet-system.ts"
  "POS System Tests:scripts/test-pos-systems.ts"
  "Merchant Onboarding Tests:scripts/test-merchant-onboarding.ts"
  "Affiliate Program Tests:scripts/test-affiliate-marketing.ts"
)

# Run each test script
for test_pair in "${test_scripts[@]}"; do
  IFS=":" read -r test_name test_script <<< "$test_pair"
  TOTAL_TESTS=$((TOTAL_TESTS + 1))
  
  run_test "$test_name" "$test_script"
  
  if [ $? -eq 0 ]; then
    PASSED_TESTS=$((PASSED_TESTS + 1))
  fi
done

# Run comprehensive test suite
echo ""
echo "🔍 Running Comprehensive Test Suite..."
echo "-------------------------------"
TOTAL_TESTS=$((TOTAL_TESTS + 1))

npx tsx scripts/run-comprehensive-tests.ts

if [ $? -eq 0 ]; then
  echo "✅ Comprehensive Test Suite completed successfully"
  PASSED_TESTS=$((PASSED_TESTS + 1))
else
  echo "❌ Comprehensive Test Suite failed"
fi

# Run master test suite
echo ""
echo "🏆 Running Master Test Suite..."
echo "-------------------------------"
TOTAL_TESTS=$((TOTAL_TESTS + 1))

npx tsx scripts/run-master-test-suite.ts

if [ $? -eq 0 ]; then
  echo "✅ Master Test Suite completed successfully"
  PASSED_TESTS=$((PASSED_TESTS + 1))
else
  echo "❌ Master Test Suite failed"
fi

# Print summary
echo ""
echo "📊 Test Summary"
echo "================="
echo "Total Tests: $TOTAL_TESTS"
echo "Passed: $PASSED_TESTS"
echo "Failed: $((TOTAL_TESTS - PASSED_TESTS))"

# Calculate pass percentage
PASS_PERCENTAGE=$((PASSED_TESTS * 100 / TOTAL_TESTS))
echo "Pass Rate: $PASS_PERCENTAGE%"

# Exit with appropriate code
if [ $PASSED_TESTS -eq $TOTAL_TESTS ]; then
  echo "✅ All tests passed!"
  exit 0
else
  echo "❌ Some tests failed."
  exit 1
fi