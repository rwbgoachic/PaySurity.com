#!/bin/bash

# Run Legal Tests
# This script runs the legal system tests and generates a report

# Ensure we're in the project directory
cd "$(dirname "$0")"

# Check if tsx is installed
if ! command -v npx &> /dev/null; then
  echo "npx is not installed. Please install Node.js and npm."
  exit 1
fi

# Define colors for better visibility
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Running Legal System Tests ===${NC}"
echo "Started at $(date)"

# Create test-reports directory if it doesn't exist
mkdir -p test-reports

# Run the tests
if [ "$1" == "--json" ]; then
  echo -e "${YELLOW}Generating JSON report...${NC}"
  npx tsx scripts/generate-legal-test-report.ts json
elif [ "$1" == "--csv" ]; then
  echo -e "${YELLOW}Generating CSV report...${NC}"
  npx tsx scripts/generate-legal-test-report.ts csv
else
  echo -e "${YELLOW}Running tests with console output...${NC}"
  npx tsx scripts/run-legal-system-tests.ts
fi

# Check if the tests were successful
if [ $? -eq 0 ]; then
  echo -e "${GREEN}All tests passed!${NC}"
  exit 0
else
  echo -e "${RED}Some tests failed. Check the report for details.${NC}"
  exit 1
fi