@echo off
chcp 1251 > nul
echo ===== Ozon Bot Enhanced Stealth Mode =====
echo This script will run the Ozon bot with advanced anti-detection features
echo.
echo The enhanced version includes:
echo - Hardware-based fingerprinting protection
echo - Canvas and audio fingerprint modification
echo - Advanced mouse movement physics
echo - Human-like behavior simulation
echo - Temporary Firefox profile
echo.

REM Create screenshots directory if it doesn't exist
if not exist "screenshots" mkdir screenshots

REM Check if Firefox is installed
where firefox >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Firefox is not installed! Please install Firefox browser first.
    echo.
    pause
    exit /b 1
)

REM Check if config file exists
if not exist "config.json" (
    echo [ERROR] config.json not found!
    echo Creating a template config file, please edit it with your Ozon credentials.
    copy config-updated.json config.json
    echo Config file created. Please edit config.json with your credentials and run this script again.
    echo.
    pause
    exit /b 1
)

REM Check if required packages are installed
echo Installing required packages...
pip install selenium webdriver-manager python-telegram-bot schedule

REM Run the bot with enhanced stealth mode
echo.
echo Starting the Ozon bot in enhanced stealth mode...
python ozon_bot_demo_stealth.py

echo.
echo Bot execution completed. Check the log file and screenshots folder for results.
echo Log file: ozon_bot_demo.log
echo Screenshots: screenshots/
echo.
echo ===== Execution completed =====
pause