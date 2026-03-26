@echo off
echo ========================================
echo   Torquest - Docker Build Monitor
echo ========================================
echo.
echo Waiting for Docker build to complete...
echo This typically takes 5-10 minutes.
echo.

:wait_loop
timeout /t 30 /nobreak >nul
docker images --format "{{.Repository}}" | findstr torquest-builder >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    goto build_complete
)
goto wait_loop

:build_complete
echo.
echo ========================================
echo   Docker Image Built Successfully!
echo ========================================
echo.
echo Running container to extract .deb file...
echo.

REM Create dist folder if it doesn't exist
if not exist "dist" mkdir dist

REM Run container and copy .deb file
docker run --rm -v "%cd%\dist:/output" torquest-builder cp /app/dist/torquest_*.deb /output/

echo.
echo ========================================
echo   Build Complete!
echo ========================================
echo.
echo Debian package location:
dir /b dist\*.deb 2>nul
echo.
echo File size:
for %%A in (dist\*.deb) do echo %%~zA bytes
echo.
echo To install on Ubuntu/Debian:
echo   sudo dpkg -i dist\torquest_*.deb
echo   sudo apt-get install -f
echo.
pause
