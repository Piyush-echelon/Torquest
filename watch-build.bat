@echo off
setlocal enabledelayedexpansion

echo ========================================
echo   Torquest - Docker Build Watcher
echo ========================================
echo.
echo Watching for Docker build to complete...
echo.

set max_attempts=30
set attempt=1

:watch_loop
if %attempt% gtr %max_attempts% (
    echo.
    echo Build timed out after %max_attempts% attempts.
    echo Check Docker Desktop for build status.
    goto :end
)

docker images --format "{{.Repository}}" | findstr torquest-builder >nul 2>&1
if !errorlevel! equ 0 (
    echo.
    echo ========================================
    echo   Docker Image Ready!
    echo ========================================
    echo.
    goto :extract
)

echo Attempt %attempt%/%max_attempts% - Still building... (waiting 30 seconds)
timeout /t 30 /nobreak >nul
set /a attempt+=1
goto :watch_loop

:extract
echo Creating dist folder...
if not exist "dist" mkdir dist

echo.
echo Extracting .deb file from container...
docker run --rm -v "%cd%\dist:/output" torquest-builder cp /app/dist/*.deb /output/ 2>nul
docker run --rm -v "%cd%\dist:/output" torquest-builder cp /app/dist/*.AppImage /output/ 2>nul

echo.
echo ========================================
echo   Build Complete!
echo ========================================
echo.
echo Files created:
dir /b dist\*.* 2>nul
echo.
echo File sizes:
for %%A in (dist\*.*) do echo   %%~nxA - %%~zA bytes
echo.
echo To install on Ubuntu/Debian:
echo   sudo dpkg -i dist\torquest_*.deb
echo   sudo apt-get install -f
echo.
echo Or for AppImage:
echo   chmod +x dist\*.AppImage
echo   ./dist/*.AppImage
echo.
:end
pause
