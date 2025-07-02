@echo off
echo ========================================
echo IQE质量智能助手 - 服务状态检查
echo ========================================
echo.

:: 检查后端服务
echo 🔍 检查后端服务 (端口3002)...
netstat -ano | findstr :3002 >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ 后端服务正在运行
    
    :: 测试后端API
    echo 🧪 测试后端API...
    curl -s -o nul -w "%%{http_code}" http://localhost:3002/api/assistant/ai-health > temp_status.txt
    set /p http_status=<temp_status.txt
    del temp_status.txt
    
    if "!http_status!"=="200" (
        echo ✅ 后端API响应正常
    ) else (
        echo ⚠️ 后端API响应异常 (状态码: !http_status!)
    )
) else (
    echo ❌ 后端服务未运行
)
echo.

:: 检查前端服务
echo 🔍 检查前端服务 (端口5173)...
netstat -ano | findstr :5173 >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ 前端服务正在运行
    
    :: 测试前端访问
    echo 🧪 测试前端访问...
    curl -s -o nul -w "%%{http_code}" http://localhost:5173/ > temp_status.txt
    set /p http_status=<temp_status.txt
    del temp_status.txt
    
    if "!http_status!"=="200" (
        echo ✅ 前端页面访问正常
    ) else (
        echo ⚠️ 前端页面访问异常 (状态码: !http_status!)
    )
) else (
    echo ❌ 前端服务未运行
)
echo.

:: 检查AI服务状态
echo 🤖 检查AI服务状态...
curl -s http://localhost:3002/api/assistant/ai-health > ai_health.json 2>nul
if %errorlevel% equ 0 (
    echo ✅ AI健康检查API可访问
    echo 📄 AI服务状态详情:
    type ai_health.json
    del ai_health.json
) else (
    echo ❌ AI健康检查API不可访问
)
echo.

:: 显示端口占用情况
echo 📊 端口占用情况:
echo 后端端口 (3002):
netstat -ano | findstr :3002
echo.
echo 前端端口 (5173):
netstat -ano | findstr :5173
echo.

:: 显示服务访问链接
echo 🔗 服务访问链接:
echo 后端API: http://localhost:3002
echo 前端主页: http://localhost:5173
echo AI助手页面: http://localhost:5173/assistant-ai
echo 基础助手页面: http://localhost:5173/assistant
echo.

echo ========================================
echo 检查完成
echo ========================================
pause
