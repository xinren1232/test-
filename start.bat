@echo off
REM IQE智能质检系统启动脚本

echo ===================================
echo IQE智能质检系统启动脚本
echo ===================================
echo.

REM 启动API服务
echo [1/2] 启动API服务...
start cmd /k "cd api-service && npm run dev"
echo API服务启动中...
echo.

REM 等待API服务启动
echo 等待API服务启动...
timeout /t 5 /nobreak > nul

REM 启动前端
echo [2/2] 启动前端...
start cmd /k "cd ai-inspection-dashboard && npm run dev"
echo 前端启动中...
echo.

echo ===================================
echo 系统启动完成!
echo.
echo API服务运行在: http://localhost:3000
echo 前端运行在: http://localhost:5173
echo.
echo 请在浏览器中访问前端地址
echo =================================== 