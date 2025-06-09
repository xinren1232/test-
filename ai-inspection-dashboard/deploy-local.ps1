# 发生错误时终止
$ErrorActionPreference = "Stop"

# 构建
npm run build

# 进入构建文件夹
cd dist

# 创建.nojekyll文件（防止GitHub Pages忽略下划线开头的文件）
New-Item -Path ".nojekyll" -ItemType "file" -Force

# 显示部署信息
Write-Host "-------------------------------------------------"
Write-Host "构建完成！您可以通过以下方式部署:" -ForegroundColor Green
Write-Host "1. 手动上传 dist 文件夹内容到 GitHub 仓库" -ForegroundColor Cyan
Write-Host "2. 或者使用命令: git push -f <您的仓库URL> master:gh-pages" -ForegroundColor Cyan
Write-Host "-------------------------------------------------"

# 返回上层目录
cd ..
