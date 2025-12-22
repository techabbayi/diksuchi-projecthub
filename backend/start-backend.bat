@echo off
echo.
echo ========================================
echo   Starting ProjectHUB Backend Server
echo ========================================
echo.
echo Backend will run on http://localhost:5000
echo Press Ctrl+C to stop the server
echo.

cd /d "%~dp0"
npm run dev
