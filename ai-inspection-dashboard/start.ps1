# 启动脚本 for PowerShell
Write-Host "正在启动IQE动态检验系统..." -ForegroundColor Green

# 安装依赖
Write-Host "正在安装依赖..." -ForegroundColor Yellow
npm install

# 启动开发服务器
Write-Host "正在启动开发服务器..." -ForegroundColor Yellow
npm run dev

Write-Host "启动完成，请在浏览器中访问系统" -ForegroundColor Green
