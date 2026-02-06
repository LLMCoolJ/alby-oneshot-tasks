#!/bin/bash
# dev.sh - Manage development server

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

SERVICE_NAME="alby-demo-dev.service"
LOG_FILE="$PROJECT_DIR/logs/dev-stdout.log"
ERROR_LOG_FILE="$PROJECT_DIR/logs/dev-stderr.log"

usage() {
    echo "Usage: $0 [start|stop|restart|status|logs|errors]"
    echo ""
    echo "Commands:"
    echo "  start    - Start the development server"
    echo "  stop     - Stop the development server"
    echo "  restart  - Restart the development server"
    echo "  status   - Show detailed server status"
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
    echo "Starting development server..."
    check_service_installed

    if systemctl --user is-active --quiet "$SERVICE_NAME"; then
        echo -e "${YELLOW}Development server is already running${NC}"
        show_status
    else
        systemctl --user start "$SERVICE_NAME"
        sleep 2
        if systemctl --user is-active --quiet "$SERVICE_NAME"; then
            echo -e "${GREEN}✓ Development server started successfully${NC}"
            echo ""
            echo "Server is running at:"
            echo "  - Frontend: http://localhost:5173"
            echo "  - Backend:  http://localhost:3001"
            echo ""
            echo "To view logs: $0 logs"
            echo "To view errors: $0 errors"
        else
            echo -e "${RED}✗ Failed to start development server${NC}"
            systemctl --user status "$SERVICE_NAME" --no-pager
            exit 1
        fi
    fi
}

stop_server() {
    echo "Stopping development server..."

    if systemctl --user is-active --quiet "$SERVICE_NAME"; then
        systemctl --user stop "$SERVICE_NAME"
        echo -e "${GREEN}✓ Development server stopped${NC}"

        # Verify ports are released
        sleep 1
        local port_5173=$(lsof -ti:5173 2>/dev/null || true)
        local port_3001=$(lsof -ti:3001 2>/dev/null || true)
        if [ -n "$port_5173" ] || [ -n "$port_3001" ]; then
            echo -e "${YELLOW}⚠ Some ports still in use, running cleanup...${NC}"
            "$SCRIPT_DIR/cleanup.sh"
        fi
    else
        echo -e "${YELLOW}Development server is not running${NC}"
    fi
}

restart_server() {
    echo "Restarting development server..."
    check_service_installed
    systemctl --user restart "$SERVICE_NAME"
    sleep 2

    if systemctl --user is-active --quiet "$SERVICE_NAME"; then
        echo -e "${GREEN}✓ Development server restarted successfully${NC}"
    else
        echo -e "${RED}✗ Failed to restart development server${NC}"
        systemctl --user status "$SERVICE_NAME" --no-pager
        exit 1
    fi
}

show_status() {
    check_service_installed
    echo -e "${BLUE}=== Development Server Status ===${NC}"
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

    # Port bindings
    echo ""
    local port_5173=$(lsof -ti:5173 2>/dev/null || true)
    local port_3001=$(lsof -ti:3001 2>/dev/null || true)
    if [ -n "$port_5173" ]; then
        echo -e "Port 5173: ${GREEN}listening (PID: $port_5173)${NC}"
    else
        echo -e "Port 5173: ${RED}not listening${NC}"
    fi
    if [ -n "$port_3001" ]; then
        echo -e "Port 3001: ${GREEN}listening (PID: $port_3001)${NC}"
    else
        echo -e "Port 3001: ${RED}not listening${NC}"
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
        echo "Start the server first: $0 start"
    fi
}

show_errors() {
    if [ -f "$ERROR_LOG_FILE" ]; then
        echo -e "${BLUE}Following stderr logs (press Ctrl+C to exit)...${NC}"
        tail -f "$ERROR_LOG_FILE"
    else
        echo -e "${YELLOW}No error log file found at $ERROR_LOG_FILE${NC}"
        echo "Start the server first: $0 start"
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
