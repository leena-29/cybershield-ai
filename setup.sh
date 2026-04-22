#!/bin/bash
# CyberShield AI - Quick Setup Script

echo "🛡️ CyberShield AI - Automated Setup"
echo "======================================"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Python
echo -e "${YELLOW}Checking Python...${NC}"
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python 3 is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Python found${NC}"

# Check Node.js
echo -e "${YELLOW}Checking Node.js...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js found${NC}"

# Check MongoDB
echo -e "${YELLOW}Checking MongoDB...${NC}"
if ! command -v mongosh &> /dev/null; then
    echo -e "${YELLOW}⚠️  MongoDB client not found, but may still be running${NC}"
else
    echo -e "${GREEN}✓ MongoDB found${NC}"
fi

# Setup Backend
echo -e "\n${YELLOW}Setting up Backend...${NC}"
cd backend

# Create virtual environment
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate 2>/dev/null || . venv/Scripts/activate

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt > /dev/null 2>&1

# Create .env file
if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cp .env.example .env
    echo -e "${YELLOW}⚠️  Please edit .env and set your MongoDB URI${NC}"
fi

echo -e "${GREEN}✓ Backend setup complete${NC}"
cd ..

# Setup Frontend
echo -e "\n${YELLOW}Setting up Frontend...${NC}"
cd frontend

# Install dependencies
echo "Installing npm packages..."
npm install > /dev/null 2>&1

# Create .env.local
if [ ! -f ".env.local" ]; then
    echo "Creating .env.local file..."
    cp .env.example .env.local
fi

echo -e "${GREEN}✓ Frontend setup complete${NC}"
cd ..

# Summary
echo -e "\n${GREEN}======================================"
echo "🎉 Setup Complete!"
echo "======================================${NC}"
echo ""
echo "Next steps:"
echo "1. Start MongoDB (if not already running)"
echo "2. Run backend: cd backend && python app.py"
echo "3. In another terminal, run frontend: cd frontend && npm start"
echo ""
echo "Frontend: http://localhost:3000"
echo "Backend: http://localhost:5000/api"
echo ""
echo -e "${GREEN}Visit ${YELLOW}SETUP_GUIDE.md${GREEN} for detailed instructions!${NC}"
