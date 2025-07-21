#!/bin/bash

# 部署到GitHub Pages的脚本
# 使用方法: ./deploy-to-github.sh

set -e

echo "🚀 开始部署到GitHub Pages..."

# 检查是否在正确的目录
if [ ! -d "ai-inspection-dashboard" ]; then
    echo "❌ 错误: 请在项目根目录运行此脚本"
    exit 1
fi

# 检查Git状态
if [ ! -d ".git" ]; then
    echo "📦 初始化Git仓库..."
    git init
    git branch -M main
fi

# 添加远程仓库（如果不存在）
if ! git remote get-url origin > /dev/null 2>&1; then
    echo "🔗 添加远程仓库..."
    git remote add origin https://github.com/xinren1232/test-.git
else
    echo "🔗 更新远程仓库URL..."
    git remote set-url origin https://github.com/xinren1232/test-.git
fi

# 构建项目
echo "🔨 构建前端项目..."
cd ai-inspection-dashboard
npm install
npm run build
cd ..

# 提交所有更改
echo "📝 提交更改..."
git add .
git commit -m "Deploy: $(date '+%Y-%m-%d %H:%M:%S')" || echo "没有新的更改需要提交"

# 推送到GitHub
echo "⬆️ 推送到GitHub..."
git push -u origin main

echo "✅ 部署完成！"
echo "🌐 您的网站将在几分钟后可以通过以下地址访问:"
echo "   https://xinren1232.github.io/test-/"
echo ""
echo "📋 请确保在GitHub仓库设置中启用GitHub Pages:"
echo "   1. 进入 https://github.com/xinren1232/test-/settings/pages"
echo "   2. 在 'Source' 中选择 'Deploy from a branch'"
echo "   3. 选择 'gh-pages' 分支和 '/ (root)' 文件夹"
echo "   4. 点击 'Save'"
