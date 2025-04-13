#!/bin/bash

# Comprehensive Test Runner Script
#
# This script runs all the major test suites in order to verify the entire system is working properly.
# It includes:
# 1. IOLTA trust account system tests
# 2. Client portal tests
# 3. IOLTA-Client portal integration tests
# 4. Legal document management tests
# 5. Affiliate marketing tests
# 6. Payroll pricing tests

echo -e "\n🔍 Starting Comprehensive System Tests\n"
start_time=$(date +%s)

# Define test suites
declare -A tests
tests["IOLTA Trust Accounting System"]="npx tsx scripts/test-iolta.ts"
tests["Client Portal System"]="npx tsx scripts/test-client-portal.ts"
tests["IOLTA-Client Portal Integration"]="npx tsx scripts/test-iolta-client-portal-integration.ts"
tests["Legal Document Management"]="npx tsx scripts/test-legal-document-management.ts"
tests["Affiliate Marketing System"]="npx tsx scripts/test-affiliate-marketing.ts"
tests["Payroll Pricing System"]="npx tsx scripts/test-payroll-pricing.ts"

# Track results
declare -A results
passed=0
failed=0
total=${#tests[@]}

# Run each test
for name in "${!tests[@]}"; do
  script=${tests[$name]}
  
  echo -e "\n🧪 Running Test Suite: $name"
  echo -e "Executing: $script"
  
  # Run the test and capture the exit code
  if $script; then
    results[$name]="PASSED"
    ((passed++))
    echo -e "✅ $name tests PASSED"
  else
    results[$name]="FAILED"
    ((failed++))
    echo -e "❌ $name tests FAILED"
  fi
done

# Calculate duration
end_time=$(date +%s)
duration=$((end_time - start_time))

# Print summary
echo -e "\n📊 Test Results Summary"
echo "======================="
echo "Total Test Suites: $total"
echo "Passed: $passed"
echo "Failed: $failed"
echo "Duration: ${duration} seconds"
echo "======================="

# Detailed results
echo -e "\nDetailed Results:"
for name in "${!results[@]}"; do
  status=${results[$name]}
  if [[ "$status" == "PASSED" ]]; then
    echo "✅ $name: $status"
  else
    echo "❌ $name: $status"
  fi
done

# Exit with error code if any tests failed
if [[ $failed -gt 0 ]]; then
  echo -e "\n❌ Some tests failed. Please review the output above for details."
  exit 1
else
  echo -e "\n✅ All tests passed successfully! The system is working properly."
  exit 0
fi