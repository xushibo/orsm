#!/bin/bash

# Deployment script for Story Machine
# This script handles both frontend and backend deployment

set -e

echo "🚀 Starting deployment process..."

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
DEPLOY_FRONTEND=false
DEPLOY_BACKEND=false
USE_PRODUCTION=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --frontend)
            DEPLOY_FRONTEND=true
            shift
            ;;
        --backend)
            DEPLOY_BACKEND=true
            shift
            ;;
        --production)
            USE_PRODUCTION=true
            shift
            ;;
        --all)
            DEPLOY_FRONTEND=true
            DEPLOY_BACKEND=true
            shift
            ;;
        *)
            print_error "Unknown option: $1"
            echo "Usage: $0 [--frontend] [--backend] [--production] [--all]"
            exit 1
            ;;
    esac
done

# If no specific deployment is specified, deploy all
if [ "$DEPLOY_FRONTEND" = false ] && [ "$DEPLOY_BACKEND" = false ]; then
    DEPLOY_FRONTEND=true
    DEPLOY_BACKEND=true
fi

# Deploy Frontend (Cloudflare Pages)
if [ "$DEPLOY_FRONTEND" = true ]; then
    print_status "Deploying frontend to Cloudflare Pages..."
    
    # Build the project
    print_status "Building Next.js application..."
    npm run build
    
    if [ $? -eq 0 ]; then
        print_success "Frontend build completed successfully"
        
        # Deploy to Cloudflare Pages using wrangler
        print_status "Deploying to Cloudflare Pages..."
        wrangler pages deploy out --project-name=orsm
        
        if [ $? -eq 0 ]; then
            print_success "Frontend deployed successfully to Cloudflare Pages"
        else
            print_error "Frontend deployment failed"
            exit 1
        fi
    else
        print_error "Frontend build failed"
        exit 1
    fi
fi

# Deploy Backend (Cloudflare Worker)
if [ "$DEPLOY_BACKEND" = true ]; then
    print_status "Deploying backend to Cloudflare Worker..."
    
    # Check if worker directory exists
    if [ ! -d "worker" ]; then
        print_error "Worker directory not found"
        exit 1
    fi
    
    # Navigate to worker directory
    cd worker
    
    # Deploy worker
    print_status "Deploying Cloudflare Worker..."
    wrangler deploy
    
    if [ $? -eq 0 ]; then
        print_success "Backend deployed successfully to Cloudflare Worker"
    else
        print_error "Backend deployment failed"
        exit 1
    fi
    
    # Return to project root
    cd ..
fi

# Update environment configuration
if [ "$USE_PRODUCTION" = true ]; then
    print_status "Updating configuration for production..."
    
    # Update API configuration to use production endpoints
    if [ -f "src/config/api.ts" ]; then
        print_status "API configuration will use production endpoints"
    fi
fi

print_success "Deployment process completed!"
print_status "Frontend: https://orsm.xushibo.cn"
print_status "Backend: https://orsm-ai.xushibo.cn"

echo ""
print_status "Next steps:"
echo "1. Test the deployed application"
echo "2. Configure environment variables if needed"
echo "3. Monitor logs for any issues"
echo "4. Update DNS settings if using custom domain"
