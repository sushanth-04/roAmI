@echo off
set PROJECT_DIR=%~dp0

echo Starting applications in sequence...
echo =====================================

:: Start Backend first
echo [1/6] Starting Backend...
start "Backend" cmd /k "cd /d %PROJECT_DIR%backend && nodemon server"
timeout /t 5 /nobreak >nul

:: Start Admin Module
echo [2/6] Starting Admin Module...
start "Admin Module" cmd /k "cd /d %PROJECT_DIR%admin && npm run dev"
timeout /t 3 /nobreak >nul

:: Start User Module
echo [3/6] Starting User Module...
start "User Module" cmd /k "cd /d %PROJECT_DIR%user && npm run dev"
timeout /t 3 /nobreak >nul

:: Start Car Module
echo [4/6] Starting Car Module...
start "Car Module" cmd /k "cd /d %PROJECT_DIR%car && npm run dev"
timeout /t 3 /nobreak >nul

:: Start Hotel Module
echo [5/6] Starting Hotel Module...
start "Hotel Module" cmd /k "cd /d %PROJECT_DIR%hotel && npm run dev"
timeout /t 3 /nobreak >nul

:: Start Python Application last
echo [6/6] Starting Python Application...
start "Python App" cmd /k "cd /d %PROJECT_DIR% && python app.py"

echo.
echo All applications started successfully!
echo Check individual windows for startup status.
pause