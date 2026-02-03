@echo off

chcp 65001 > nul
echo Starting Ink Diary application...
echo.

:: Navigate to project directory
cd "%~dp0\ink-diary"

:: Check if project files exist
if not exist "package.json" (
    echo Error: Project files not found. Please ensure the batch file is in the correct location.
    pause
    exit /b 1
)

:: Check if Node.js is installed
echo Checking if Node.js is installed...
node -v > nul 2>&1
if %errorlevel% neq 0 (
    echo Node.js not found. Starting download and installation...
    echo.
    
    :: Download Node.js installer
    set "NODE_INSTALLER=node-v18.20.0-x64.msi"
    set "NODE_URL=https://nodejs.org/dist/v18.20.0/node-v18.20.0-x64.msi"
    
    echo Downloading Node.js 18.20.0 LTS...
    powershell -Command "Invoke-WebRequest -Uri '%NODE_URL%' -OutFile '%NODE_INSTALLER%'"
    
    if %errorlevel% neq 0 (
        echo Failed to download Node.js. Please download and install it manually from https://nodejs.org/
        pause
        exit /b 1
    )
    
    echo Installing Node.js...
    msiexec /i "%NODE_INSTALLER%" /qn
    
    if %errorlevel% neq 0 (
        echo Failed to install Node.js. Please install it manually.
        pause
        exit /b 1
    )
    
    echo Node.js installed successfully.
    echo Cleaning up installer...
    del "%NODE_INSTALLER%"
    
    :: Refresh environment variables
    echo Refreshing environment variables...
    set "PATH=%PATH%;C:\Program Files\nodejs"
    
    echo Please restart this batch file to continue.
    pause
    exit /b 0
) else (
    echo Node.js is already installed.
)

:: Check if npm is available
echo Checking if npm is available...
npm -v > nul 2>&1
if %errorlevel% neq 0 (
    echo npm not found. Please reinstall Node.js.
    pause
    exit /b 1
)

:: Check if dependencies are installed
echo Checking if dependencies are installed...
if not exist "node_modules" (
    echo Dependencies not found. Installing...
    npm install
    
    if %errorlevel% neq 0 (
        echo Failed to install dependencies. Please try again.
        pause
        exit /b 1
    )
    
echo Dependencies installed successfully.
) else (
    echo Dependencies are already installed.
)

:: Start development server in background
echo Starting development server...
echo Application will be available at: http://localhost:5173/
echo.

:: Start server in a new window
start "Ink Diary Server" cmd /c "npm run dev"

:: Wait for server to start
echo Waiting for server to start...
timeout /t 3 /nobreak > nul

:: Check if server is ready
echo Checking if server is ready...
:check_server
ping -n 1 -w 1000 127.0.0.1 > nul
timeout /t 1 /nobreak > nul

:: Try to connect to server
curl -s -o nul -w "%%{http_code}" http://localhost:5173/ > temp_status.txt 2>nul
set /p STATUS=<temp_status.txt
del temp_status.txt 2>nul

if "%STATUS%"=="200" (
    echo Server is ready!
    echo Opening browser...
    start "" http://localhost:5173/
) else (
    echo Server is still starting...
    timeout /t 2 /nobreak > nul
    goto check_server
)

echo.
echo Ink Diary is now running!
echo Press any key to stop the server...
pause > nul

:: Stop the server
taskkill /FI "WINDOWTITLE eq Ink Diary Server" /F > nul 2>&1
echo Server stopped.
