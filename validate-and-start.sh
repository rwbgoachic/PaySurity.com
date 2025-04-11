#!/bin/bash

# Schema Validation and Application Startup Script
# This script validates the database schema before starting the application

# Define colors for better visibility
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== PaySurity Schema Validation and Application Startup ===${NC}"
echo "Started at $(date)"

# Run schema validation
echo -e "${YELLOW}Running schema validation...${NC}"
npx tsx scripts/validate-schema-consistency.ts

# Check if validation was successful
if [ $? -ne 0 ]; then
  echo -e "${RED}Schema validation failed. Please fix the issues before starting the application.${NC}"
  echo -e "${YELLOW}Run './run-legal-tests.sh --validate' for more detailed validation information.${NC}"
  exit 1
fi

echo -e "${GREEN}Schema validation passed. Starting application...${NC}"
npm run dev