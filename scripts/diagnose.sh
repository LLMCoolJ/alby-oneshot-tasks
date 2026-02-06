#!/bin/bash
# diagnose.sh - Generate comprehensive diagnostic report for LLM debugging

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
REPORT_FILE="$PROJECT_DIR/logs/diagnostic_${TIMESTAMP}.txt"

# Ensure logs directory exists
mkdir -p "$PROJECT_DIR/logs"

echo "Generating diagnostic report..."
echo "Report will be saved to: $REPORT_FILE"
echo ""

{
    echo "=========================================="
    echo "DIAGNOSTIC REPORT"
    echo "Generated: $(date)"
    echo "=========================================="
    echo ""

    # System Information
    echo "=========================================="
    echo "SYSTEM INFORMATION"
    echo "=========================================="
    echo "Hostname: $(hostname)"
    echo "OS: $(uname -s)"
    echo "Kernel: $(uname -r)"
    echo "Architecture: $(uname -m)"
    echo ""

    # Runtime Environment
    echo "=========================================="
    echo "RUNTIME ENVIRONMENT"
    echo "=========================================="
    if command -v node > /dev/null 2>&1; then
        echo "Node.js: $(node --version)"
    else
        echo "Node.js: NOT FOUND"
    fi

    if command -v npm > /dev/null 2>&1; then
        echo "npm: $(npm --version)"
    else
        echo "npm: NOT FOUND"
    fi

    if command -v tsx > /dev/null 2>&1; then
        echo "tsx: $(tsx --version 2>&1 | head -1)"
    else
        echo "tsx: NOT FOUND"
    fi
    echo ""

    # Project Structure
    echo "=========================================="
    echo "PROJECT STRUCTURE"
    echo "=========================================="
    echo "Project directory: $PROJECT_DIR"
    echo ""
    echo "Directory tree (top level):"
    ls -la "$PROJECT_DIR" 2>&1 | head -30
    echo ""

    # Dependencies
    echo "=========================================="
    echo "DEPENDENCIES"
    echo "=========================================="
    if [ -f "$PROJECT_DIR/package.json" ]; then
        echo "package.json exists: YES"
        echo ""
        echo "Installed packages:"
        if [ -d "$PROJECT_DIR/node_modules" ]; then
            echo "node_modules size: $(du -sh "$PROJECT_DIR/node_modules" 2>/dev/null | cut -f1)"
            echo "Package count: $(find "$PROJECT_DIR/node_modules" -maxdepth 1 -type d 2>/dev/null | wc -l)"
        else
            echo "node_modules: NOT FOUND"
        fi
    else
        echo "package.json: NOT FOUND"
    fi
    echo ""

    # Environment Configuration
    echo "=========================================="
    echo "ENVIRONMENT CONFIGURATION"
    echo "=========================================="
    if [ -f "$PROJECT_DIR/.env" ]; then
        echo ".env file exists: YES"
        echo "Environment variables (sanitized):"
        grep -v "^#" "$PROJECT_DIR/.env" | grep -v "^$" | sed 's/=.*/=***REDACTED***/' 2>/dev/null || echo "Could not read .env"
    else
        echo ".env file: NOT FOUND"
    fi
    echo ""

    # Running Processes
    echo "=========================================="
    echo "RUNNING PROCESSES"
    echo "=========================================="
    echo "tsx watch processes:"
    pgrep -fa "tsx watch" 2>/dev/null || echo "None found"
    echo ""
    echo "vite processes:"
    pgrep -fa "vite" 2>/dev/null || echo "None found"
    echo ""
    echo "vitest processes:"
    pgrep -fa "vitest" 2>/dev/null || echo "None found"
    echo ""
    echo "node processes:"
    pgrep -fa "node.*server" 2>/dev/null || echo "None found"
    echo ""

    # Systemd Services
    echo "=========================================="
    echo "SYSTEMD SERVICES"
    echo "=========================================="
    if command -v systemctl > /dev/null 2>&1; then
        echo "Dev service status:"
        systemctl --user status alby-demo-dev.service --no-pager 2>&1 || echo "Service not found or not installed"
        echo ""
        echo "Test service status:"
        systemctl --user status alby-demo-test.service --no-pager 2>&1 || echo "Service not found or not installed"
        echo ""
    else
        echo "systemctl: NOT AVAILABLE"
    fi

    # Port Usage
    echo "=========================================="
    echo "PORT USAGE"
    echo "=========================================="
    if command -v lsof > /dev/null 2>&1; then
        echo "Port 3001 (backend):"
        lsof -Pi :3001 -sTCP:LISTEN 2>&1 || echo "Not in use"
        echo ""
        echo "Port 5173 (frontend):"
        lsof -Pi :5173 -sTCP:LISTEN 2>&1 || echo "Not in use"
        echo ""
    elif command -v ss > /dev/null 2>&1; then
        echo "Listening ports (ss):"
        ss -ltn | grep -E ":(3001|5173)" 2>&1 || echo "Ports 3001 and 5173 not in use"
        echo ""
    else
        echo "Cannot check ports (lsof and ss not available)"
        echo ""
    fi

    # Recent Logs
    echo "=========================================="
    echo "RECENT LOGS"
    echo "=========================================="
    if [ -d "$PROJECT_DIR/logs" ]; then
        echo "Log files:"
        ls -lh "$PROJECT_DIR/logs"/*.log 2>/dev/null || echo "No log files found"
        echo ""

        # Show last 50 lines of most recent log
        LATEST_LOG=$(ls -t "$PROJECT_DIR/logs"/*.log 2>/dev/null | head -1)
        if [ -n "$LATEST_LOG" ]; then
            echo "Last 50 lines of most recent log ($LATEST_LOG):"
            tail -50 "$LATEST_LOG" 2>/dev/null || echo "Could not read log file"
        fi
    else
        echo "logs directory: NOT FOUND"
    fi
    echo ""

    # Systemd Journal Logs
    if command -v journalctl > /dev/null 2>&1; then
        echo "=========================================="
        echo "SYSTEMD JOURNAL LOGS (last 50 lines)"
        echo "=========================================="
        echo "Dev service:"
        journalctl --user -u alby-demo-dev.service -n 50 --no-pager 2>&1 || echo "No logs available"
        echo ""
        echo "Test service:"
        journalctl --user -u alby-demo-test.service -n 50 --no-pager 2>&1 || echo "No logs available"
        echo ""
    fi

    # Network Connectivity
    echo "=========================================="
    echo "NETWORK CONNECTIVITY"
    echo "=========================================="
    if command -v curl > /dev/null 2>&1; then
        echo "Backend health check:"
        curl -s -f http://localhost:3001/health 2>&1 || echo "Failed to connect"
        echo ""
        echo ""
        echo "Frontend check:"
        curl -s -f -I http://localhost:5173 2>&1 | head -5 || echo "Failed to connect"
        echo ""
    else
        echo "curl: NOT AVAILABLE"
    fi

    # Git Status
    echo "=========================================="
    echo "GIT STATUS"
    echo "=========================================="
    if [ -d "$PROJECT_DIR/.git" ]; then
        cd "$PROJECT_DIR"
        echo "Branch: $(git branch --show-current 2>&1)"
        echo ""
        echo "Status:"
        git status --short 2>&1 || echo "Could not get git status"
        echo ""
        echo "Recent commits:"
        git log --oneline -5 2>&1 || echo "Could not get git log"
    else
        echo ".git directory: NOT FOUND"
    fi
    echo ""

    # Disk Space
    echo "=========================================="
    echo "DISK SPACE"
    echo "=========================================="
    df -h "$PROJECT_DIR" 2>&1 || echo "Could not get disk space"
    echo ""

    # End of Report
    echo "=========================================="
    echo "END OF DIAGNOSTIC REPORT"
    echo "=========================================="

} > "$REPORT_FILE" 2>&1

echo -e "${GREEN}✓ Diagnostic report generated${NC}"
echo ""
echo "Report location: $REPORT_FILE"
echo ""
echo "You can view the report with:"
echo "  cat $REPORT_FILE"
echo ""
echo "Or copy it to share with an LLM for debugging assistance."
