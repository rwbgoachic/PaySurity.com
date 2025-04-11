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
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== PaySurity Legal System Test Runner ===${NC}"
echo "Started at $(date)"

# Create test-reports directory if it doesn't exist
mkdir -p test-reports

# Function to show help
show_help() {
  echo -e "${CYAN}Legal System Test Runner${NC}"
  echo "Usage: $0 [OPTIONS]"
  echo ""
  echo "Options:"
  echo "  --json           Generate a JSON report"
  echo "  --csv            Generate a CSV report"
  echo "  --validate       Run schema validation to ensure code/database consistency"
  echo "  --all            Run schema validation and then tests with console output"
  echo "  --help           Show this help message"
  echo ""
}

# Run schema validation
run_validation() {
  echo -e "${YELLOW}Running schema validation...${NC}"
  npx tsx scripts/validate-schema-consistency.ts
  if [ $? -ne 0 ]; then
    echo -e "${RED}Schema validation failed. Please fix the issues before running tests.${NC}"
    return 1
  fi
  return 0
}

# Process arguments
if [ "$1" == "--help" ]; then
  show_help
  exit 0
elif [ "$1" == "--validate" ]; then
  run_validation
  exit $?
elif [ "$1" == "--all" ]; then
  run_validation
  if [ $? -ne 0 ]; then
    exit 1
  fi
  echo -e "${YELLOW}Running tests with console output...${NC}"
  npx tsx scripts/run-legal-system-tests.ts
elif [ "$1" == "--json" ]; then
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