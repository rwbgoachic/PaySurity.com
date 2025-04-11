# Schema Validation System

## Overview

The Schema Validation System is a critical component of the PaySurity legal practice management platform, designed to ensure consistency between our database schema, code, and test files. This system prevents the types of schema mismatches that can lead to runtime errors, data corruption, or test failures.

## Components

1. **Schema Validator Script** (`scripts/validate-schema-consistency.ts`)
   - Validates database schema against code definitions
   - Checks for column type mismatches
   - Identifies nullability inconsistencies
   - Scans test files for potential schema-related issues

2. **Legal Tests Runner** (`run-legal-tests.sh`)
   - Enhanced to include schema validation
   - Can run validation independently with `--validate` flag
   - Can run validation and tests together with `--all` flag

3. **Validation Startup Script** (`validate-and-start.sh`)
   - Runs schema validation before starting the application
   - Prevents application startup if schema validation fails

## Usage

### Validating Schema Only

```bash
./run-legal-tests.sh --validate
```

This will run the schema validation and report any issues without running the tests.

### Running Validation and Tests Together

```bash
./run-legal-tests.sh --all
```

This will first validate the schema and then run all legal system tests.

### Safe Application Startup

```bash
./validate-and-start.sh
```

This will validate the schema before starting the application, preventing startup if validation fails.

## Validation Checks

The schema validator performs the following checks:

1. **Table Existence**
   - Tables defined in schema but missing in DB
   - Tables in DB but missing in schema

2. **Column Consistency**
   - Columns in DB but missing in schema
   - Columns in schema but missing in DB
   - Type mismatches between DB and schema
   - Nullability mismatches between DB and schema

3. **Code Consistency**
   - Type comparison issues (e.g., string vs. number)
   - Deprecated field usage
   - Missing field usage

## Addressing Validation Issues

When validation issues are detected, follow these steps:

1. **Schema Mismatches**
   - Update `shared/schema.ts` to match the database structure, or
   - Update the database structure to match the schema definition

2. **Code Mismatches**
   - Fix type comparisons in code (often requires `.toString()` conversions)
   - Update field references to use current names
   - Add proper type casting where needed

3. **Test Issues**
   - Ensure test data matches schema requirements
   - Update test assertions to handle correct types

## Integration with CI/CD

The schema validation is integrated into our CI/CD pipeline to ensure that all schema changes are validated before deployment:

1. **Pre-commit Hook**: Runs schema validation on changed schema files
2. **CI Pipeline**: Runs full validation as part of the test suite
3. **Deployment Check**: Validates schema before allowing production deployment

## Best Practices

1. Always run schema validation after making changes to the database schema
2. Run validation before running tests to catch issues early
3. Update both schema and database together to maintain consistency
4. Use the type definitions from `shared/schema.ts` in all code
5. Be especially careful with string vs. number types in ID fields

## Common Issues and Resolutions

### Type Mismatches

**Issue**: Database uses `TEXT` for ID but code compares as number

**Resolution**: Use `.toString()` when comparing client IDs

```typescript
// Incorrect
if (clientLedger.clientId === testClientId) { ... }

// Correct
if (clientLedger.clientId === testClientId.toString()) { ... }
```

### Missing Required Fields

**Issue**: Required fields missing when creating records

**Resolution**: Ensure all required fields are specified in test data

```typescript
// Incorrect
const testData = {
  accountName: 'Test Account',
  // Missing required fields
};

// Correct
const testData = {
  accountName: 'Test Account',
  merchantId: 1,
  status: 'active',
  // All required fields included
};
```

### Schema Evolution

As the PaySurity platform evolves, the schema validation system ensures that all components stay in sync, preventing the introduction of subtle bugs and maintaining data integrity throughout the system.