@echo off
chcp 65001 >nul
echo 🚀 开始部署IQE智能质检系统到GitHub Pages...

REM 检查是否在正确的目录
if not exist "ai-inspection-dashboard" (
    echo ❌ 错误: 请在项目根目录运行此脚本
    pause
    exit /b 1
)

REM 进入前端项目目录
cd ai-inspection-dashboard

echo 📦 安装依赖...
call npm install

echo 🔨 构建项目...
call npm run build

if errorlevel 1 (
    echo ❌ 构建失败
    pause
    exit /b 1
)

echo ✅ 构建完成

REM 检查是否有git仓库
cd ..
if not exist ".git" (
    echo ⚠️  警告: 未检测到Git仓库
    echo 请确保项目已经初始化为Git仓库并连接到GitHub
    echo.
    echo 初始化Git仓库的命令:
    echo git init
    echo git add .
    echo git commit -m "Initial commit"
    echo git branch -M main
    echo git remote add origin https://github.com/YOUR_USERNAME/IQE.git
    echo git push -u origin main
    pause
    exit /b 1
)

echo 📤 提交更改到Git...
git add .
git commit -m "Deploy: Update for GitHub Pages deployment %date% %time%"

echo 🔄 推送到GitHub...
git push origin main

echo.
echo 🎉 部署脚本执行完成!
echo.
echo 📋 接下来的步骤:
echo 1. 访问你的GitHub仓库设置页面
echo 2. 进入 Settings ^> Pages
echo 3. 在 Source 中选择 'GitHub Actions'
echo 4. 等待GitHub Actions自动部署完成
echo 5. 访问 https://YOUR_USERNAME.github.io/IQE/ 查看部署结果
echo.
echo 🔧 如果遇到问题:
echo - 检查GitHub Actions的运行日志
echo - 确保仓库的Pages权限已正确配置
echo - 确认.github/workflows/deploy.yml文件存在
echo.
echo 📱 部署完成后，你的IQE系统将可以通过以下方式访问:
echo - 🌐 Web访问: https://YOUR_USERNAME.github.io/IQE/
echo - 📱 移动端: 同样的URL，响应式设计
echo - 🔄 自动更新: 每次推送到main分支都会自动重新部署

pause
