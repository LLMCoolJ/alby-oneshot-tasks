#!/bin/bash
# install-services.sh - Install systemd user services for development and testing

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
SYSTEMD_DIR="$PROJECT_DIR/systemd"
USER_SYSTEMD_DIR="${XDG_CONFIG_HOME:-$HOME/.config}/systemd/user"
NVM_DIR="${NVM_DIR:-$HOME/.nvm}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "Installing systemd services..."

# Check if systemd directory exists
if [ ! -d "$SYSTEMD_DIR" ]; then
    echo -e "${RED}Error: systemd directory not found at $SYSTEMD_DIR${NC}"
    exit 1
fi

# Create user systemd directory if it doesn't exist
mkdir -p "$USER_SYSTEMD_DIR"

# Create logs directory if it doesn't exist
mkdir -p "$PROJECT_DIR/logs"

# Process each service template
for template in "$SYSTEMD_DIR"/*.template; do
    if [ ! -f "$template" ]; then
        echo -e "${YELLOW}No service templates found in $SYSTEMD_DIR${NC}"
        exit 0
    fi

    service_name=$(basename "$template" .template)
    service_file="$USER_SYSTEMD_DIR/$service_name"

    echo "Processing $service_name..."

    # Replace all template variables
    sed -e "s|{{PROJECT_ROOT}}|$PROJECT_DIR|g" \
        -e "s|{{USER}}|$USER|g" \
        -e "s|{{NVM_DIR}}|$NVM_DIR|g" \
        "$template" > "$service_file"

    echo -e "${GREEN}✓ Installed $service_name${NC}"
done

# Reload systemd daemon
echo "Reloading systemd daemon..."
systemctl --user daemon-reload

echo -e "${GREEN}✓ Successfully installed all services${NC}"
echo ""
echo "Available services:"
for template in "$SYSTEMD_DIR"/*.template; do
    service_name=$(basename "$template" .template)
    echo "  - $service_name"
done
echo ""
echo "Next steps:"
echo "  Start dev server:  ./scripts/dev.sh start"
echo "  Start test runner: ./scripts/test.sh start"
echo "  Check health:      ./scripts/health.sh"
