@echo off
title Study4 - Backend (Python FastAPI)
echo ================================================
echo   Study4 E-Learning - Starting Backend...
echo ================================================
echo.

:: Change to BE directory
cd /d "%~dp0"

:: Check if requirements are installed
echo [1/2] Checking/Installing Python dependencies...
python -m pip install -r requirements.txt

echo.
echo [2/2] Launching FastAPI server on port 8000...
python -m uvicorn main:app --reload --port 8000

pause
