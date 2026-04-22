@echo off
REM CyberShield AI - Quick Setup Script for Windows

echo 🛡️ CyberShield AI - Automated Setup
echo =====================================

REM Check Python
echo Checking Python...
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed
    exit /b 1
)
echo ✓ Python found

REM Check Node.js
echo Checking Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed
    exit /b 1
)
echo ✓ Node.js found

REM Setup Backend
echo.
echo Setting up Backend...
cd backend

REM Create virtual environment
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Install dependencies
echo Installing dependencies...
pip install -r requirements.txt > nul 2>&1

REM Create .env file
if not exist ".env" (
    echo Creating .env file...
    copy .env.example .env
    echo ⚠️  Please edit .env and set your MongoDB URI
)

echo ✓ Backend setup complete
cd ..

REM Setup Frontend
echo.
echo Setting up Frontend...
cd frontend

REM Install dependencies
echo Installing npm packages...
npm install > nul 2>&1

REM Create .env.local
if not exist ".env.local" (
    echo Creating .env.local file...
    copy .env.example .env.local
)

echo ✓ Frontend setup complete
cd ..

REM Summary
echo.
echo =====================================
echo 🎉 Setup Complete!
echo =====================================
echo.
echo Next steps:
echo 1. Start MongoDB (if not already running)
echo 2. Run backend: cd backend ^&^& python app.py
echo 3. In another terminal, run frontend: cd frontend ^&^& npm start
echo.
echo Frontend: http://localhost:3000
echo Backend: http://localhost:5000/api
echo.
echo Visit SETUP_GUIDE.md for detailed instructions!
pause
