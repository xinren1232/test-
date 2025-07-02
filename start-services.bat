@echo off
echo ========================================
echo IQE质量智能助手 - 服务启动脚本
echo ========================================
echo.

:: 检查Node.js是否安装
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 错误: Node.js未安装或不在PATH中
    echo 请先安装Node.js: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js已安装
node --version
echo.

:: 检查并终止现有服务
echo 🔍 检查现有服务...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3002') do (
    echo 终止后端服务进程 %%a
    taskkill /PID %%a /F >nul 2>&1
)

for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5173') do (
    echo 终止前端服务进程 %%a
    taskkill /PID %%a /F >nul 2>&1
)

echo.

:: 启动后端服务
echo 🚀 启动后端服务...
cd /d "%~dp0backend"

if not exist "node_modules" (
    echo 📦 安装后端依赖...
    call npm install
    if %errorlevel% neq 0 (
        echo ❌ 后端依赖安装失败
        pause
        exit /b 1
    )
)

echo 🔧 启动后端服务器...
start "IQE Backend" cmd /k "npm start"

:: 等待后端启动
echo ⏳ 等待后端服务启动...
timeout /t 5 /nobreak >nul

:: 检查后端是否启动成功
:check_backend
curl -s http://localhost:3002/api/assistant/ai-health >nul 2>&1
if %errorlevel% neq 0 (
    echo ⏳ 后端服务启动中...
    timeout /t 2 /nobreak >nul
    goto check_backend
)

echo ✅ 后端服务启动成功 (http://localhost:3002)
echo.

:: 启动前端服务
echo 🎨 启动前端服务...
cd /d "%~dp0ai-inspection-dashboard"

if not exist "node_modules" (
    echo 📦 安装前端依赖...
    call npm install
    if %errorlevel% neq 0 (
        echo ❌ 前端依赖安装失败
        pause
        exit /b 1
    )
)

echo 🔧 启动前端开发服务器...
start "IQE Frontend" cmd /k "npm run dev"

:: 等待前端启动
echo ⏳ 等待前端服务启动...
timeout /t 8 /nobreak >nul

echo.
echo ========================================
echo 🎉 服务启动完成！
echo ========================================
echo.
echo 📊 后端服务: http://localhost:3002
echo 🎨 前端服务: http://localhost:5173
echo 🤖 AI助手页面: http://localhost:5173/assistant-ai
echo.
echo 💡 提示:
echo - 后端和前端服务在独立的命令窗口中运行
echo - 关闭对应的命令窗口可停止服务
echo - 如遇问题请查看各自窗口的日志信息
echo.

:: 询问是否打开浏览器
set /p open_browser="是否打开浏览器访问AI助手页面? (y/n): "
if /i "%open_browser%"=="y" (
    echo 🌐 正在打开浏览器...
    start http://localhost:5173/assistant-ai
)

echo.
echo 按任意键退出启动脚本...
pause >nul
