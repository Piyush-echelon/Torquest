@echo off
echo ========================================
echo   Torquest - Debian Package Builder
echo ========================================
echo.

cd /d "%~dp0.."

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js not found!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo [1/3] Installing dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo [2/3] Building Debian package...
echo.
echo NOTE: Cross-compiling from Windows to Linux
echo For best results, build on Ubuntu/Debian Linux
echo.

call npm run build:linux
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Build failed!
    echo.
    echo To build .deb packages, you need to:
    echo 1. Build on Linux (Ubuntu/Debian)
    echo 2. Or use WSL2 (Windows Subsystem for Linux)
    echo 3. Or use a Linux VM
    echo.
    pause
    exit /b 1
)

echo.
echo [3/3] Build complete!
echo.
echo ========================================
echo   Build Successful!
echo ========================================
echo.
echo Debian package location:
dir /b dist\*.deb 2>nul
echo.
echo To install on Ubuntu/Debian:
echo   sudo dpkg -i torquest_*.deb
echo   sudo apt-get install -f
echo.
echo AppImage location:
dir /b dist\*.AppImage 2>nul
echo.
pause
