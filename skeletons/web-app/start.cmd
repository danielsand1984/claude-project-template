@echo off
REM start.cmd — one-click launcher for the dev stack on Windows.
REM Double-click this file. It will:
REM   1. Check Docker Desktop is running
REM   2. Copy .env.example to .env if missing
REM   3. Build + start all containers (postgres, redis, api, web)
REM   4. Open http://localhost:3002 in your browser

setlocal EnableExtensions EnableDelayedExpansion
cd /d "%~dp0"

echo === {{PROJECT_TITLE}} starter ===
echo.

REM --- Docker check ---------------------------------------------------
docker info >nul 2>&1
if errorlevel 1 (
    echo X  Docker is not running.
    echo    Open Docker Desktop, wait until the whale icon stops animating, then try again.
    echo.
    pause
    exit /b 1
)

REM --- .env initialization --------------------------------------------
if not exist .env (
    echo .  Creating .env from .env.example ^(edit it later if you need to^)
    copy /Y .env.example .env >nul
)

REM --- Build + start --------------------------------------------------
echo .  Building containers ^(this can take 3-5 minutes on first run, ~10s afterward^)...
docker compose up -d --build
if errorlevel 1 (
    echo.
    echo X  Something went wrong. To see what:
    echo       docker compose logs
    echo.
    pause
    exit /b 1
)

echo.
echo .  Waiting a few seconds for services to be ready...
timeout /t 5 /nobreak >nul

echo.
echo ===============================================================
echo   Web app:  http://localhost:3002
echo   API:      http://localhost:3000/healthz
echo.
echo   Useful commands:
echo     docker compose logs -f         (see live logs)
echo     docker compose down            (stop everything)
echo     docker compose down -v         (stop + wipe database)
echo ===============================================================
echo.

start http://localhost:3002

echo Press any key to close this window.
pause >nul
