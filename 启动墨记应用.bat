@echo off

chcp 65001 > nul
echo 正在启动墨记应用 (Ink Diary) ...
echo.

:: 切换到项目目录
cd "%~dp0\ink-diary"

:: 检查项目文件是否存在
if not exist "package.json" (
    echo 错误：未找到项目文件。请确保批处理文件位于正确的位置。
    pause
    exit /b 1
)

:: 检查 Node.js 是否已安装
echo 正在检查 Node.js 是否已安装...
node -v > nul 2>&1
if %errorlevel% neq 0 (
    echo 未找到 Node.js。开始下载并安装...
    echo.
    
    :: 下载 Node.js 安装程序
    set "NODE_INSTALLER=node-v18.20.0-x64.msi"
    set "NODE_URL=https://nodejs.org/dist/v18.20.0/node-v18.20.0-x64.msi"
    
    echo 正在下载 Node.js 18.20.0 LTS...
    powershell -Command "Invoke-WebRequest -Uri '%NODE_URL%' -OutFile '%NODE_INSTALLER%'"
    
    if %errorlevel% neq 0 (
        echo 下载 Node.js 失败。请手动从 https://nodejs.org/ 下载并安装。
        pause
        exit /b 1
    )
    
    echo 正在安装 Node.js...
    msiexec /i "%NODE_INSTALLER%" /qn
    
    if %errorlevel% neq 0 (
        echo 安装 Node.js 失败。请手动安装。
        pause
        exit /b 1
    )
    
    echo Node.js 安装成功。
    echo 正在清理安装程序...
    del "%NODE_INSTALLER%"
    
    :: 刷新环境变量
    echo 正在刷新环境变量...
    set "PATH=%PATH%;C:\Program Files\nodejs"
    
    echo 请重新运行此批处理文件以继续。
    pause
    exit /b 0
) else (
    echo Node.js 已安装。
)

:: 检查 npm 是否可用
echo 正在检查 npm 是否可用...
npm -v > nul 2>&1
if %errorlevel% neq 0 (
    echo 未找到 npm。请重新安装 Node.js。
    pause
    exit /b 1
)

:: 检查依赖是否已安装
echo 正在检查依赖是否已安装...
if not exist "node_modules" (
    echo 未找到依赖。正在安装...
    npm install
    
    if %errorlevel% neq 0 (
        echo 安装依赖失败。请重试。
        pause
        exit /b 1
    )
    
    echo 依赖安装成功。
) else (
    echo 依赖已安装。
)

:: 在后台启动开发服务器
echo 正在启动开发服务器...
echo 应用将可在 http://localhost:5173/ 访问
echo.

:: 在新窗口中启动服务器
start "墨记服务器" cmd /c "npm run dev"

:: 等待服务器启动
echo 等待服务器启动...
timeout /t 3 /nobreak > nul

:: 检查服务器是否就绪
echo 检查服务器是否就绪...
:check_server
ping -n 1 -w 1000 127.0.0.1 > nul
timeout /t 1 /nobreak > nul

:: 尝试连接服务器
curl -s -o nul -w "%%{http_code}" http://localhost:5173/ > temp_status.txt 2>nul
set /p STATUS=<temp_status.txt
del temp_status.txt 2>nul

if "%STATUS%"=="200" (
    echo 服务器已就绪！
    echo 正在打开浏览器...
    start "" http://localhost:5173/
) else (
    echo 服务器仍在启动中...
    timeout /t 2 /nobreak > nul
    goto check_server
)

echo.
echo 墨记应用正在运行！
echo 按任意键停止服务器...
pause > nul

:: 停止服务器
taskkill /FI "WINDOWTITLE eq 墨记服务器" /F > nul 2>&1
echo 服务器已停止。
