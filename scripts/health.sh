#!/bin/bash
# health.sh - Comprehensive health check for the application

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

print_header() {
    echo -e "${BLUE}=== $1 ===${NC}"
}

print_ok() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
    ERRORS=$((ERRORS + 1))
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
    WARNINGS=$((WARNINGS + 1))
}

# Check Node.js and npm
print_header "Runtime Environment"
if command -v node > /dev/null 2>&1; then
    NODE_VERSION=$(node --version)
    print_ok "Node.js installed: $NODE_VERSION"
else
    print_error "Node.js not found"
fi

if command -v npm > /dev/null 2>&1; then
    NPM_VERSION=$(npm --version)
    print_ok "npm installed: $NPM_VERSION"
else
    print_error "npm not found"
fi

# Check dependencies
print_header "Dependencies"
if [ -d "$PROJECT_DIR/node_modules" ]; then
    print_ok "node_modules directory exists"
else
    print_error "node_modules directory not found. Run: npm install"
fi

if [ -f "$PROJECT_DIR/package-lock.json" ]; then
    print_ok "package-lock.json exists"
else
    print_warning "package-lock.json not found"
fi

# Check environment configuration
print_header "Environment Configuration"
if [ -f "$PROJECT_DIR/.env" ]; then
    print_ok ".env file exists"

    # Check for required environment variables
    if grep -q "VITE_NWC_URL=" "$PROJECT_DIR/.env"; then
        print_ok "VITE_NWC_URL configured"
    else
        print_warning "VITE_NWC_URL not set in .env"
    fi
else
    print_error ".env file not found"
fi

if [ -f "$PROJECT_DIR/.env.example" ]; then
    print_ok ".env.example exists"
else
    print_warning ".env.example not found"
fi

# Check systemd services
print_header "Systemd Services"
if command -v systemctl > /dev/null 2>&1; then
    USER_SYSTEMD_DIR="${XDG_CONFIG_HOME:-$HOME/.config}/systemd/user"

    if [ -f "$USER_SYSTEMD_DIR/alby-demo-dev.service" ]; then
        print_ok "Dev service installed"

        if systemctl --user is-active --quiet alby-demo-dev.service; then
            print_ok "Dev service is running"
        else
            print_warning "Dev service is not running"
        fi
    else
        print_warning "Dev service not installed. Run: scripts/install-services.sh"
    fi

    if [ -f "$USER_SYSTEMD_DIR/alby-demo-test.service" ]; then
        print_ok "Test service installed"

        if systemctl --user is-active --quiet alby-demo-test.service; then
            print_warning "Test service is running (should normally be stopped)"
        fi
    else
        print_warning "Test service not installed. Run: scripts/install-services.sh"
    fi
else
    print_warning "systemctl not available (not running on systemd)"
fi

# Check for running processes
print_header "Running Processes"
if pgrep -f "tsx watch server/index.ts" > /dev/null; then
    print_ok "Dev server process found"
else
    print_warning "Dev server process not running"
fi

if pgrep -f "vite" > /dev/null; then
    print_ok "Vite process found"
else
    print_warning "Vite process not running"
fi

if pgrep -f "vitest" > /dev/null; then
    print_warning "Test runner is active"
fi

# Check ports
print_header "Port Availability"
if command -v lsof > /dev/null 2>&1; then
    if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null 2>&1; then
        print_ok "Port 3001 (backend) is in use"
    else
        print_warning "Port 3001 (backend) is not in use"
    fi

    if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null 2>&1; then
        print_ok "Port 5173 (frontend) is in use"
    else
        print_warning "Port 5173 (frontend) is not in use"
    fi
elif command -v ss > /dev/null 2>&1; then
    if ss -ltn | grep -q :3001; then
        print_ok "Port 3001 (backend) is in use"
    else
        print_warning "Port 3001 (backend) is not in use"
    fi

    if ss -ltn | grep -q :5173; then
        print_ok "Port 5173 (frontend) is in use"
    else
        print_warning "Port 5173 (frontend) is not in use"
    fi
else
    print_warning "Cannot check ports (lsof and ss not available)"
fi

# Check HTTP endpoints
print_header "HTTP Endpoints"
if command -v curl > /dev/null 2>&1; then
    if curl -s -f http://localhost:3001/health > /dev/null 2>&1; then
        print_ok "Backend health endpoint responding"
    else
        print_warning "Backend health endpoint not responding"
    fi

    if curl -s -f http://localhost:5173 > /dev/null 2>&1; then
        print_ok "Frontend responding"
    else
        print_warning "Frontend not responding"
    fi
else
    print_warning "curl not available, cannot check HTTP endpoints"
fi

# Check logs directory
print_header "Logs"
if [ -d "$PROJECT_DIR/logs" ]; then
    print_ok "Logs directory exists"

    LOG_COUNT=$(find "$PROJECT_DIR/logs" -type f -name "*.log" 2>/dev/null | wc -l)
    if [ "$LOG_COUNT" -gt 0 ]; then
        print_ok "Found $LOG_COUNT log file(s)"
    else
        print_warning "No log files found in logs directory"
    fi
else
    print_error "Logs directory not found"
fi

# Check build artifacts
print_header "Build Artifacts"
if [ -d "$PROJECT_DIR/dist" ]; then
    print_ok "dist directory exists"
else
    print_warning "dist directory not found (run 'npm run build' to create)"
fi

# Summary
echo ""
print_header "Health Check Summary"
if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}All checks passed!${NC}"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}Passed with $WARNINGS warning(s)${NC}"
    exit 0
else
    echo -e "${RED}Failed with $ERRORS error(s) and $WARNINGS warning(s)${NC}"
    exit 1
fi
