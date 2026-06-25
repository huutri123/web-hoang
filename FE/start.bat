@echo off
echo ================================================
echo   Study4 E-Learning - Setup Script
echo ================================================
echo.

:: Check node
node --version >nul 2>&1
IF ERRORLEVEL 1 (
    echo [ERROR] Node.js NOT found!
    echo Please install Node.js from: https://nodejs.org/
    echo Recommended version: 18.x or 20.x LTS
    pause
    exit /b 1
)

echo [OK] Node.js found: 
node --version

echo.
echo Installing dependencies...
npm install

echo.
echo Starting development server...
npm start
