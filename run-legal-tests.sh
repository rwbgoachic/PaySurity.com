#!/bin/bash

echo "==============================================="
echo "Running Legal System Tests"
echo "==============================================="

# Check if the database columns exist first
npx tsx scripts/fix-iolta-tables.ts

# Run the specialized IOLTA tests
echo ""
echo "Running IOLTA Tests..."
echo "==============================================="
npx tsx scripts/run-iolta-tests.ts

# Exit with the status of the last command
exit $?