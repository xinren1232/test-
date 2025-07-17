@echo off
echo 🔍 检查服务状态...
echo.
echo 📊 检查前端服务 (端口5173)...
netstat -an | findstr :5173
echo.
echo 📊 检查后端服务 (端口3001)...
netstat -an | findstr :3001
echo.
echo 📊 检查MySQL服务...
sc query mysql80
echo.
echo 🌐 测试前端访问...
echo 前端地址: http://localhost:5173/
echo.
echo 🌐 测试后端访问...
echo 后端健康检查: http://localhost:3001/health
echo 数据库测试: http://localhost:3001/api/db-test
echo.
pause
