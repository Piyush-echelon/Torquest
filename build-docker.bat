@echo off
echo ========================================
echo   Torquest - Linux Build via Docker
echo ========================================
echo.

cd /d "%~dp0"

REM Check if Docker is installed
where docker >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Docker not found!
    echo Please install Docker Desktop from https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

echo [1/3] Building Docker image...
docker build -t torquest-builder .
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Docker build failed
    pause
    exit /b 1
)

echo.
echo [2/3] Running build in container...
docker run --rm -v "%cd%\dist:/app/dist" torquest-builder
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Docker run failed
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
echo   sudo dpkg -i torrhunt_*.deb
echo   sudo apt-get install -f
echo.
pause
