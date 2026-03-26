@echo off
echo ========================================
echo   Torquest Android - Build Script
echo ========================================
echo.

cd /d "%~dp0"

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js not found!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo [1/4] Installing dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo [2/4] Checking Cordova...
where cordova >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [INFO] Cordova not found. Installing...
    call npm install -g cordova
)

echo.
echo [3/4] Adding Android platform...
call cordova platform add android
if %ERRORLEVEL% NEQ 0 (
    echo [WARN] Platform may already be added
)

echo.
echo [4/4] Building APK...
call cordova build android
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Build failed!
    echo.
    echo Common issues:
    echo - Android SDK not installed
    echo - JAVA_HOME not set
    echo - ANDROID_HOME not set
    echo.
    echo For cloud build instructions, see QUICKSTART.md
    pause
    exit /b 1
)

echo.
echo ========================================
echo   Build Successful!
echo ========================================
echo.
echo APK location:
echo - Debug: platforms\android\app\build\outputs\apk\debug\app-debug.apk
echo - Release: platforms\android\app\build\outputs\apk\release\app-release.apk
echo.
echo To install on device:
echo   cordova run android
echo.
pause
