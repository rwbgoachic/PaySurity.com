#!/bin/bash

# Script to fix schema inconsistencies in IOLTA test files
# This script replaces clientId number type references with string type

echo "Fixing schema inconsistencies in test files..."

# List of test files to process
TEST_FILES=(
  "server/services/testing/test-iolta-service.ts"
  "server/services/testing/test-iolta-reconciliation.ts"
  "server/services/testing/test-client-portal.ts"
)

# Fix clientId type inconsistencies
for file in "${TEST_FILES[@]}"; do
  echo "Processing $file..."
  
  # Backup the file
  cp "$file" "${file}.bak"
  
  # Replace clientId numeric comparisons with string comparisons
  # Pattern 1: clientId === this.testClientId
  sed -i 's/clientId === this\.testClientId/clientId === this.testClientId.toString()/g' "$file"
  
  # Pattern 2: clientId !== this.testClientId
  sed -i 's/clientId !== this\.testClientId/clientId !== this.testClientId.toString()/g' "$file"
  
  # Pattern 3: clientLedgers.some(c => c.clientId === this.testClientId)
  sed -i 's/c\.clientId === this\.testClientId/c.clientId === this.testClientId.toString()/g' "$file"
  
  # Pattern 4: balances.some(b => b.clientId === this.testClientId)
  sed -i 's/b\.clientId === this\.testClientId/b.clientId === this.testClientId.toString()/g' "$file"
  
  # Fix accountStatus to status field
  sed -i 's/accountStatus: "active"/status: "active"/g' "$file"
  
  # Fix ioltaAccountId to trustAccountId field
  sed -i 's/ioltaAccountId/trustAccountId/g' "$file"
  
  echo "Completed processing $file"
done

echo "Schema inconsistency fixes complete!"