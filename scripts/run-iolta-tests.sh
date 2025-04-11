#!/bin/bash

# Set text colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
RESET='\033[0m'

echo -e "${YELLOW}==============================================${RESET}"
echo -e "${YELLOW}PaySurity.com IOLTA Trust Accounting System Tests${RESET}"
echo -e "${YELLOW}==============================================${RESET}"
echo ""

# Run TypeScript directly using ts-node
echo -e "${YELLOW}Running IOLTA trust accounting tests...${RESET}"
npx ts-node scripts/test-legal-iolta.ts

# Check the exit code from the test script
EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
  echo -e "${GREEN}IOLTA trust accounting tests completed successfully!${RESET}"
  exit 0
else
  echo -e "${RED}IOLTA trust accounting tests failed with exit code $EXIT_CODE.${RESET}"
  exit $EXIT_CODE
fi