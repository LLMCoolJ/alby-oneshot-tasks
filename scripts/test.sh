#!/bin/bash
# test.sh - Manage test runner service

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

SERVICE_NAME="alby-demo-test.service"
LOG_FILE="$PROJECT_DIR/logs/test-stdout.log"
ERROR_LOG_FILE="$PROJECT_DIR/logs/test-stderr.log"

usage() {
    echo "Usage: $0 [start|stop|restart|status|logs|errors]"
    echo ""
    echo "Commands:"
    echo "  start    - Start the test runner (vitest watch)"
    echo "  stop     - Stop the test runner"
    echo "  restart  - Restart the test runner"
    echo "  status   - Show test runner status"
    echo "  logs     - Follow stdout logs"
    echo "  errors   - Follow stderr logs"
    exit 1
}

check_service_installed() {
    if ! systemctl --user list-unit-files | grep -q "$SERVICE_NAME"; then
        echo -e "${YELLOW}Service not installed. Installing services...${NC}"
        "$SCRIPT_DIR/install-services.sh"
    fi
}

start_server() {
    echo "Starting test runner..."
    check_service_installed

    if systemctl --user is-active --quiet "$SERVICE_NAME"; then
        echo -e "${YELLOW}Test runner is already running${NC}"
        show_status
    else
        systemctl --user start "$SERVICE_NAME"
        sleep 2
        if systemctl --user is-active --quiet "$SERVICE_NAME"; then
            echo -e "${GREEN}✓ Test runner started successfully${NC}"
            echo ""
            echo "To view logs: $0 logs"
            echo "To view errors: $0 errors"
        else
            echo -e "${RED}✗ Failed to start test runner${NC}"
            systemctl --user status "$SERVICE_NAME" --no-pager
            exit 1
        fi
    fi
}

stop_server() {
    echo "Stopping test runner..."

    if systemctl --user is-active --quiet "$SERVICE_NAME"; then
        systemctl --user stop "$SERVICE_NAME"
        echo -e "${GREEN}✓ Test runner stopped${NC}"
    else
        echo -e "${YELLOW}Test runner is not running${NC}"
    fi
}

restart_server() {
    echo "Restarting test runner..."
    check_service_installed
    systemctl --user restart "$SERVICE_NAME"
    sleep 2

    if systemctl --user is-active --quiet "$SERVICE_NAME"; then
        echo -e "${GREEN}✓ Test runner restarted successfully${NC}"
    else
        echo -e "${RED}✗ Failed to restart test runner${NC}"
        systemctl --user status "$SERVICE_NAME" --no-pager
        exit 1
    fi
}

show_status() {
    check_service_installed
    echo -e "${BLUE}=== Test Runner Status ===${NC}"
    echo ""

    # Service status
    local status
    status=$(systemctl --user is-active "$SERVICE_NAME" 2>/dev/null || echo "inactive")
    if [ "$status" = "active" ]; then
        echo -e "Service: ${GREEN}$status${NC}"
    else
        echo -e "Service: ${RED}$status${NC}"
    fi

    # Main PID
    local main_pid
    main_pid=$(systemctl --user show "$SERVICE_NAME" --property=MainPID --value 2>/dev/null || echo "N/A")
    echo "Main PID: $main_pid"

    # Child processes
    if [ "$main_pid" != "0" ] && [ "$main_pid" != "N/A" ]; then
        echo ""
        echo "Child processes:"
        ps --ppid "$main_pid" -o pid,cmd --no-headers 2>/dev/null | while read -r line; do
            echo "  $line"
        done || echo "  (none)"
    fi

    # Uptime
    if [ "$status" = "active" ]; then
        echo ""
        local uptime
        uptime=$(systemctl --user show "$SERVICE_NAME" --property=ActiveEnterTimestamp --value 2>/dev/null || echo "unknown")
        echo "Running since: $uptime"
    fi

    # Last 5 log lines
    if [ -f "$LOG_FILE" ]; then
        echo ""
        echo "Last 5 log lines:"
        tail -5 "$LOG_FILE" 2>/dev/null | while read -r line; do
            echo "  $line"
        done
    fi
}

show_logs() {
    if [ -f "$LOG_FILE" ]; then
        echo -e "${BLUE}Following stdout logs (press Ctrl+C to exit)...${NC}"
        tail -f "$LOG_FILE"
    else
        echo -e "${YELLOW}No log file found at $LOG_FILE${NC}"
        echo "Start the test runner first: $0 start"
    fi
}

show_errors() {
    if [ -f "$ERROR_LOG_FILE" ]; then
        echo -e "${BLUE}Following stderr logs (press Ctrl+C to exit)...${NC}"
        tail -f "$ERROR_LOG_FILE"
    else
        echo -e "${YELLOW}No error log file found at $ERROR_LOG_FILE${NC}"
        echo "Start the test runner first: $0 start"
    fi
}

# Main command handling
case "${1:-}" in
    start)
        start_server
        ;;
    stop)
        stop_server
        ;;
    restart)
        restart_server
        ;;
    status)
        show_status
        ;;
    logs)
        show_logs
        ;;
    errors)
        show_errors
        ;;
    *)
        usage
        ;;
esac
