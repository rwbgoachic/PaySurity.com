#!/bin/bash

echo "==============================================="
echo "Running Legal System Tests"
echo "==============================================="

# Check if the database columns exist first
npx tsx scripts/fix-iolta-tables.ts

# Fix any issues with balance_after in transactions
npx tsx scripts/fix-iolta-transaction-balances.ts

# Run the specialized IOLTA tests
echo ""
echo "Running IOLTA Tests..."
echo "==============================================="
npx tsx scripts/run-iolta-tests.ts

# Exit with the status of the last command
exit $?