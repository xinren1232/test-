@echo off
echo 🚀 启动完整后端服务...
cd /d "d:\IQE动态检验\backend"
echo 📍 当前目录: %CD%
echo � 检查Node.js版本...
node --version
echo 📦 检查package.json...
if exist package.json (
    echo ✅ package.json 存在
) else (
    echo ❌ package.json 不存在
    pause
    exit /b 1
)
echo �🔧 启动完整后端服务器（包含数据库和规则系统）...
node start-full-backend.js
pause
