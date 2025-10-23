#!/bin/bash

# Test script for Object Recognition Story Machine

set -e

echo "🧪 Running tests for Object Recognition Story Machine..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

# Parse command line arguments
RUN_UNIT_TESTS=false
RUN_INTEGRATION_TESTS=false
RUN_WORKER_TESTS=false
RUN_ALL=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --unit)
            RUN_UNIT_TESTS=true
            shift
            ;;
        --integration)
            RUN_INTEGRATION_TESTS=true
            shift
            ;;
        --worker)
            RUN_WORKER_TESTS=true
            shift
            ;;
        --all)
            RUN_ALL=true
            shift
            ;;
        *)
            print_error "Unknown option: $1"
            echo "Usage: $0 [--unit] [--integration] [--worker] [--all]"
            exit 1
            ;;
    esac
done

# If no specific test is specified, run all
if [ "$RUN_UNIT_TESTS" = false ] && [ "$RUN_INTEGRATION_TESTS" = false ] && [ "$RUN_WORKER_TESTS" = false ] && [ "$RUN_ALL" = false ]; then
    RUN_ALL=true
fi

# Run unit tests
if [ "$RUN_UNIT_TESTS" = true ] || [ "$RUN_ALL" = true ]; then
    print_status "Running unit tests..."
    
    if npm run test; then
        print_success "Unit tests passed"
    else
        print_error "Unit tests failed"
        exit 1
    fi
fi

# Run integration tests
if [ "$RUN_INTEGRATION_TESTS" = true ] || [ "$RUN_ALL" = true ]; then
    print_status "Running integration tests..."
    
    # Start mock server in background
    node mock-server.js > /dev/null 2>&1 &
    MOCK_SERVER_PID=$!
    
    # Give server time to start
    sleep 2
    
    # Run integration tests
    if npm test -- test/integration.test.ts; then
        print_success "Integration tests passed"
    else
        print_error "Integration tests failed"
        # Kill mock server
        kill $MOCK_SERVER_PID
        exit 1
    fi
    
    # Kill mock server
    kill $MOCK_SERVER_PID
fi

# Run worker tests
if [ "$RUN_WORKER_TESTS" = true ] || [ "$RUN_ALL" = true ]; then
    print_status "Running worker tests..."
    
    cd worker
    
    if npm test; then
        print_success "Worker tests passed"
    else
        print_error "Worker tests failed"
        exit 1
    fi
    
    cd ..
fi

print_success "All specified tests completed!"