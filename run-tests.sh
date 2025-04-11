#!/bin/bash
# PaySurity.com Test Runner Script
# This script provides a simple interface to run various test suites

# Set colors for output
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print banner
echo -e "${BLUE}"
echo "  ____              _____             _ _          "
echo " |  _ \ __ _ _   _/ / __|  _ _ _  _  | | |_ _  _   "
echo " | |_) / _\` | | | | \__ \ | '_| || | |_   _| || |  "
echo " |  __/ (_| | |_| | |__) || |  \_, |   |_|  \_, |  "
echo " |_|   \__,_|\__, |_|____/ |_|  |__/        |__/   "
echo "             |___/                                  "
echo -e "       ${YELLOW}Comprehensive Test Runner${NC}"
echo ""

# Function to run tests
run_test() {
  echo -e "${YELLOW}Running $1 tests...${NC}"
  npx tsx $2
  
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}$1 tests completed successfully!${NC}"
  else
    echo -e "${RED}$1 tests failed!${NC}"
  fi
  
  echo ""
}

# Display menu
show_menu() {
  echo -e "${BLUE}Available Test Suites:${NC}"
  echo "1. Run all tests (master test suite)"
  echo "2. Run wallet system tests"
  echo "3. Run POS system tests"
  echo "4. Run API tests"
  echo "5. Run merchant onboarding tests"
  echo "6. Run affiliate marketing tests"
  echo "7. Run comprehensive tests with auto-fix"
  echo "q. Quit"
  echo ""
  echo -n "Enter your choice: "
}

# Main loop
while true; do
  show_menu
  read choice
  
  case $choice in
    1)
      run_test "Master Test Suite" "scripts/run-master-test-suite.ts"
      ;;
    2)
      run_test "Wallet System" "scripts/test-wallet-system.ts"
      ;;
    3)
      run_test "POS Systems" "scripts/test-pos-systems.ts"
      ;;
    4)
      run_test "API Endpoints" "scripts/test-api-endpoints.ts"
      ;;
    5)
      run_test "Merchant Onboarding" "scripts/test-merchant-onboarding.ts"
      ;;
    6)
      run_test "Affiliate Marketing" "scripts/test-affiliate-marketing.ts"
      ;;
    7)
      run_test "Comprehensive Tests" "scripts/run-comprehensive-tests.ts"
      ;;
    q|Q)
      echo -e "${GREEN}Exiting test runner. Goodbye!${NC}"
      exit 0
      ;;
    *)
      echo -e "${RED}Invalid choice. Please try again.${NC}"
      ;;
  esac
  
  echo -e "${BLUE}Press Enter to continue...${NC}"
  read
  clear
done