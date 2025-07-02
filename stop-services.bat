@echo off
echo ========================================
echo IQE质量智能助手 - 停止服务脚本
echo ========================================
echo.

:: 停止后端服务
echo 🛑 停止后端服务 (端口3002)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3002') do (
    echo 终止进程 %%a
    taskkill /PID %%a /F >nul 2>&1
    if !errorlevel! equ 0 (
        echo ✅ 后端服务已停止
    ) else (
        echo ⚠️ 停止后端服务时出现问题
    )
)

:: 检查后端是否还在运行
netstat -ano | findstr :3002 >nul 2>&1
if %errorlevel% neq 0 (
    echo ✅ 后端服务已完全停止
) else (
    echo ⚠️ 后端服务可能仍在运行
)
echo.

:: 停止前端服务
echo 🛑 停止前端服务 (端口5173)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5173') do (
    echo 终止进程 %%a
    taskkill /PID %%a /F >nul 2>&1
    if !errorlevel! equ 0 (
        echo ✅ 前端服务已停止
    ) else (
        echo ⚠️ 停止前端服务时出现问题
    )
)

:: 检查前端是否还在运行
netstat -ano | findstr :5173 >nul 2>&1
if %errorlevel% neq 0 (
    echo ✅ 前端服务已完全停止
) else (
    echo ⚠️ 前端服务可能仍在运行
)
echo.

:: 清理可能的Node.js进程
echo 🧹 清理相关Node.js进程...
tasklist | findstr node.exe >nul 2>&1
if %errorlevel% equ 0 (
    echo 发现Node.js进程，是否全部终止? (y/n)
    set /p kill_node=
    if /i "!kill_node!"=="y" (
        taskkill /IM node.exe /F >nul 2>&1
        echo ✅ Node.js进程已清理
    )
) else (
    echo ✅ 没有发现相关Node.js进程
)
echo.

echo ========================================
echo 🎉 服务停止完成！
echo ========================================
echo.
echo 💡 提示:
echo - 所有IQE相关服务已停止
echo - 如需重新启动，请运行 start-services.bat
echo - 如需检查状态，请运行 check-services.bat
echo.

pause
