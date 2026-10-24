#!/bin/bash

# TravelMate AI - Quick Start (Linux/macOS)

set -e

echo "========================================"
echo "TravelMate AI - Quick Start (Linux/macOS)"
echo "========================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

check_command() {
    if command -v "$1" &> /dev/null; then
        echo -e "${GREEN}[OK]${NC} $1 found"
        return 0
    else
        echo -e "${RED}[ERROR]${NC} $1 not found"
        return 1
    fi
}

check_optional() {
    if command -v "$1" &> /dev/null; then
        echo -e "${GREEN}[OK]${NC} $1 found"
        return 0
    else
        echo -e "${YELLOW}[WARNING]${NC} $1 not found - $2"
        return 1
    fi
}

echo "Checking prerequisites..."

# Required
check_command python3 || exit 1
check_command node || exit 1
check_command npm || exit 1

# Optional
check_optional ollama "AI features will use demo mode. Install from https://ollama.ai/" || true

echo ""
echo "Setting up backend..."
cd backend

if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

echo "Activating virtual environment..."
source venv/bin/activate

echo "Installing dependencies..."
pip install -r requirements.txt

if [ ! -f ".env" ]; then
    echo "Creating .env from template..."
    cp .env.example .env
    echo "Please edit backend/.env with your configuration"
fi

echo ""
echo "Starting backend server..."
# Run in background
python -m app.main &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

cd ..

echo ""
echo "Setting up frontend..."
cd frontend

if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

if [ ! -f ".env" ]; then
    echo "Creating .env from template..."
    cp .env.example .env
fi

echo ""
echo "Starting frontend dev server..."
npm run dev &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"

cd ..

echo ""
echo "========================================"
echo "TravelMate AI is starting!"
echo "========================================"
echo ""
echo "Backend:  http://localhost:8000"
echo "API Docs: http://localhost:8000/docs"
echo "Frontend: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop all services"

# Trap Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT

# Wait for background processes
wait