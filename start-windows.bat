@echo off
echo ========================================
echo TravelMate AI - Quick Start (Windows)
echo ========================================
echo.

echo Checking prerequisites...

REM Check Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python not found. Please install Python 3.10+
    exit /b 1
)
echo [OK] Python found

REM Check Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js not found. Please install Node.js 18+
    exit /b 1
)
echo [OK] Node.js found

REM Check Ollama
ollama --version >nul 2>&1
if %errorlevel% neq 0 (
    echo WARNING: Ollama not found. AI features will use demo mode.
    echo          Install from https://ollama.ai/ for full AI features.
) else (
    echo [OK] Ollama found
)

echo.
echo Setting up backend...
cd backend

if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
)

echo Activating virtual environment...
call venv\Scripts\activate

echo Installing dependencies...
pip install -r requirements.txt

if not exist .env (
    echo Creating .env from template...
    copy .env.example .env
    echo Please edit backend\.env with your configuration
)

echo.
echo Starting backend server...
start "TravelMate Backend" cmd /k "cd /d %cd% && call venv\Scripts\activate && python -m app.main"

cd ..

echo.
echo Setting up frontend...
cd frontend

if not exist node_modules (
    echo Installing dependencies...
    npm install
)

if not exist .env (
    echo Creating .env from template...
    copy .env.example .env
)

echo.
echo Starting frontend dev server...
start "TravelMate Frontend" cmd /k "cd /d %cd% && npm run dev"

cd ..

echo.
echo ========================================
echo TravelMate AI is starting!
echo ========================================
echo.
echo Backend:  http://localhost:8000
echo API Docs: http://localhost:8000/docs
echo Frontend: http://localhost:5173
echo.
echo Press any key to exit this launcher...
pause >nul