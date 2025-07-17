@echo off
echo 🚀 启动MySQL服务...
echo 🔍 检查MySQL服务状态...
sc query mysql80
echo.
echo 🔧 尝试启动MySQL服务...
net start mysql80
echo.
echo ✅ MySQL服务启动完成
pause
