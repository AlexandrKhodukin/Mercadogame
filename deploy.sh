#!/bin/bash

# Deployment script for Mercadogame with Google OAuth
# Usage: bash deploy.sh

set -e  # Exit on error

echo "=================================="
echo "   Mercadogame Deployment Script   "
echo "=================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "manage.py" ]; then
    echo -e "${RED}Error: manage.py not found. Please run this script from the project root.${NC}"
    exit 1
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}Warning: .env file not found!${NC}"
    echo -e "${YELLOW}Please create .env file first with: bash setup_env.sh${NC}"
    exit 1
fi

echo -e "${BLUE}Step 1: Pulling latest code from GitHub...${NC}"
git pull origin main
echo -e "${GREEN}✓ Code updated${NC}"
echo ""

echo -e "${BLUE}Step 2: Activating virtual environment...${NC}"
if [ -d "venv" ]; then
    source venv/bin/activate
elif [ -d ".venv" ]; then
    source .venv/bin/activate
else
    echo -e "${RED}Error: Virtual environment not found${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Virtual environment activated${NC}"
echo ""

echo -e "${BLUE}Step 3: Installing/updating dependencies...${NC}"
pip install -r requirements.txt
echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

echo -e "${BLUE}Step 4: Running database migrations...${NC}"
python manage.py migrate
echo -e "${GREEN}✓ Migrations applied${NC}"
echo ""

echo -e "${BLUE}Step 5: Updating site to mercadogame.ru...${NC}"
python manage.py update_site
echo -e "${GREEN}✓ Site updated${NC}"
echo ""

echo -e "${BLUE}Step 6: Configuring Google OAuth...${NC}"
python manage.py setup_google_oauth
echo -e "${GREEN}✓ Google OAuth configured${NC}"
echo ""

echo -e "${BLUE}Step 7: Collecting static files...${NC}"
python manage.py collectstatic --noinput
echo -e "${GREEN}✓ Static files collected${NC}"
echo ""

echo -e "${BLUE}Step 8: Restarting web server...${NC}"

# Try different restart methods
if [ -d "tmp" ] || mkdir -p tmp 2>/dev/null; then
    # Passenger (cPanel, Plesk, etc.)
    touch tmp/restart.txt
    echo -e "${GREEN}✓ Passenger restart triggered (tmp/restart.txt created)${NC}"
fi

if command -v systemctl &> /dev/null; then
    # Check for various systemd services
    if systemctl list-units --full -all | grep -Fq 'mercadogame.service'; then
        sudo systemctl restart mercadogame
        echo -e "${GREEN}✓ mercadogame service restarted${NC}"
    elif systemctl list-units --full -all | grep -Fq 'gunicorn.service'; then
        sudo systemctl restart gunicorn
        echo -e "${GREEN}✓ Gunicorn restarted${NC}"
    fi

    # Restart nginx if it's running
    if systemctl is-active --quiet nginx; then
        sudo systemctl reload nginx
        echo -e "${GREEN}✓ Nginx reloaded${NC}"
    fi
fi

if command -v supervisorctl &> /dev/null; then
    # Supervisor
    if supervisorctl status mercadogame &> /dev/null; then
        sudo supervisorctl restart mercadogame
        echo -e "${GREEN}✓ Supervisor service restarted${NC}"
    fi
fi

echo ""
echo "=================================="
echo -e "${GREEN}   Deployment completed!${NC}"
echo "=================================="
echo ""
echo -e "${YELLOW}IMPORTANT: Complete these final steps:${NC}"
echo ""
echo "1. Configure Google Cloud Console:"
echo "   https://console.cloud.google.com/apis/credentials"
echo ""
echo "   Add these Authorized redirect URIs:"
echo "   • https://mercadogame.ru/accounts/google/login/callback/"
echo "   • http://mercadogame.ru/accounts/google/login/callback/"
echo "   • https://www.mercadogame.ru/accounts/google/login/callback/"
echo "   • http://www.mercadogame.ru/accounts/google/login/callback/"
echo ""
echo "2. Test Google OAuth login:"
echo "   https://mercadogame.ru"
echo ""
echo -e "${GREEN}Done!${NC}"
echo ""
