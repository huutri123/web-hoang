@echo off
title Study4 - All-in-One Starter
echo ================================================
echo   Study4 E-Learning - Project Starter
echo ================================================
echo.

:: Get current directory
set ROOT_DIR=%~dp0

echo [1/2] Starting Backend in a new window...
start cmd /k "cd /d %ROOT_DIR%BE && start_be.bat"

echo [2/2] Starting Frontend in a new window...
start cmd /k "cd /d %ROOT_DIR%FE && start.bat"

echo.
echo ================================================
echo   Both servers are starting! 
echo   - Backend: http://127.0.0.1:8000
echo   - Frontend: http://localhost:3000 (usually)
echo ================================================
echo.
echo You can close THIS window now.
timeout /t 10
exit
