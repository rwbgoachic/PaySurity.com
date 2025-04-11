#!/bin/bash

# Legal Practice Management System Test Runner
# This script runs tests for the Legal Practice Management System

# Color definitions
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print a header
function print_header() {
  echo -e "\n${MAGENTA}==============================================${NC}"
  echo -e "${MAGENTA}$1${NC}"
  echo -e "${MAGENTA}==============================================${NC}\n"
}

# Function to print a section
function print_section() {
  echo -e "\n${BLUE}----------------------------------------------${NC}"
  echo -e "${BLUE}$1${NC}"
  echo -e "${BLUE}----------------------------------------------${NC}\n"
}

# Function to print success message
function print_success() {
  echo -e "${GREEN}✓ $1${NC}"
}

# Function to print error message
function print_error() {
  echo -e "${RED}✗ $1${NC}"
}

# Function to print info message
function print_info() {
  echo -e "${CYAN}$1${NC}"
}

# Function to print warning message
function print_warning() {
  echo -e "${YELLOW}$1${NC}"
}

# Display help message
function show_help() {
  print_header "Legal Practice Management System Test Runner"
  echo "Usage: $0 [options]"
  echo ""
  echo "Options:"
  echo "  -h, --help            Show this help message"
  echo "  -s, --service SERVICE Run a specific test service"
  echo "  -l, --list            List available test services"
  echo ""
  echo "Available services: Users, Clients, Matters, Documents, TimeTracking,"
  echo "                   ExpenseTracking, IOLTA, Reconciliation, Billing,"
  echo "                   PaymentPlans, ClientPortal, Reporting"
  exit 0
}

# List available test services
function list_services() {
  print_header "Available Test Services"
  echo "Users - User management and authentication tests"
  echo "Clients - Client management tests"
  echo "Matters - Legal matter management tests"
  echo "Documents - Document management tests"
  echo "TimeTracking - Time entry and tracking tests"
  echo "ExpenseTracking - Expense tracking tests"
  echo "IOLTA - Trust accounting tests"
  echo "Reconciliation - Account reconciliation tests"
  echo "Billing - Billing and invoicing tests"
  echo "PaymentPlans - Payment plan tests"
  echo "ClientPortal - Client portal tests"
  echo "Reporting - Reporting system tests"
  exit 0
}

# Parse command line arguments
SERVICE=""

while [[ $# -gt 0 ]]; do
  case $1 in
    -h|--help)
      show_help
      ;;
    -l|--list)
      list_services
      ;;
    -s|--service)
      SERVICE="$2"
      shift
      shift
      ;;
    *)
      print_error "Unknown option: $1"
      echo "Use -h or --help to see available options"
      exit 1
      ;;
  esac
done

# Run the tests
print_header "Running Legal Practice Management System Tests"

if [ -n "$SERVICE" ]; then
  print_info "Running specific test service: $SERVICE"
  npx tsx scripts/test-legal-system.ts --service=$SERVICE
else
  print_info "Running all test services"
  npx tsx scripts/test-legal-system.ts
fi

# Check the exit code
EXIT_CODE=$?
if [ $EXIT_CODE -eq 0 ]; then
  print_header "All Tests Passed Successfully"
  exit 0
else
  print_header "Tests Failed"
  exit 1
fi