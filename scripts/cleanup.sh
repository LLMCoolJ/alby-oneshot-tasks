#!/bin/bash
# cleanup.sh - Emergency cleanup for orphaned processes

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "Searching for orphaned processes..."

FOUND_PROCESSES=false

# Check ports first
port_5173=$(lsof -ti:5173 2>/dev/null || true)
port_3001=$(lsof -ti:3001 2>/dev/null || true)

if [ -n "$port_5173" ]; then
    FOUND_PROCESSES=true
    echo -e "${YELLOW}Port 5173 in use by PID(s): $port_5173${NC}"
fi
if [ -n "$port_3001" ]; then
    FOUND_PROCESSES=true
    echo -e "${YELLOW}Port 3001 in use by PID(s): $port_3001${NC}"
fi

# Check process patterns
PATTERNS=(
    "tsx watch server/index.ts"
    "vite"
    "vitest"
    "node.*server/index"
)

for pattern in "${PATTERNS[@]}"; do
    PIDS=$(pgrep -u "$USER" -f "$pattern" 2>/dev/null | grep -v $$ || true)
    if [ -n "$PIDS" ]; then
        FOUND_PROCESSES=true
        echo -e "${YELLOW}Found processes matching '$pattern':${NC}"
        for pid in $PIDS; do
            if ps -p "$pid" > /dev/null 2>&1; then
                cmd=$(ps -p "$pid" -o cmd= 2>/dev/null || echo "unknown")
                echo "  PID $pid: $cmd"
            fi
        done
    fi
done

if [ "$FOUND_PROCESSES" = false ]; then
    echo -e "${GREEN}No orphaned processes found${NC}"
    exit 0
fi

echo ""
read -p "Kill these processes? [y/N] " -n 1 -r
echo

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelled"
    exit 0
fi

# Step 1: Kill by port (SIGTERM)
echo "Sending SIGTERM to port processes..."
lsof -ti:5173 2>/dev/null | xargs -r kill -TERM 2>/dev/null || true
lsof -ti:3001 2>/dev/null | xargs -r kill -TERM 2>/dev/null || true

# Step 2: Kill by process name pattern (SIGTERM)
pkill -u "$USER" -f 'vite|tsx.*server|vitest' 2>/dev/null || true

# Wait for graceful shutdown
sleep 2

# Step 3: Force kill any remaining
REMAINING_5173=$(lsof -ti:5173 2>/dev/null || true)
REMAINING_3001=$(lsof -ti:3001 2>/dev/null || true)

if [ -n "$REMAINING_5173" ] || [ -n "$REMAINING_3001" ]; then
    echo -e "${YELLOW}Some processes survived SIGTERM, sending SIGKILL...${NC}"
    lsof -ti:5173 2>/dev/null | xargs -r kill -9 2>/dev/null || true
    lsof -ti:3001 2>/dev/null | xargs -r kill -9 2>/dev/null || true
    pkill -9 -u "$USER" -f 'vite|tsx.*server|vitest' 2>/dev/null || true
    sleep 1
fi

# Verify cleanup
echo ""
echo "Checking for remaining processes..."
port_5173=$(lsof -ti:5173 2>/dev/null || true)
port_3001=$(lsof -ti:3001 2>/dev/null || true)

if [ -z "$port_5173" ]; then
    echo -e "${GREEN}✓ Port 5173 clear${NC}"
else
    echo -e "${RED}⚠ Port 5173 still in use (PID: $port_5173)${NC}"
fi

if [ -z "$port_3001" ]; then
    echo -e "${GREEN}✓ Port 3001 clear${NC}"
else
    echo -e "${RED}⚠ Port 3001 still in use (PID: $port_3001)${NC}"
fi
