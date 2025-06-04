#!/usr/bin/env sh

# 发生错误时终止
set -e

# 构建
npm run build

# 进入构建文件夹
cd dist

# 如果你要部署到自定义域名
# echo 'www.example.com' > CNAME

# 创建.nojekyll文件（防止GitHub Pages忽略下划线开头的文件）
touch .nojekyll

# 初始化Git仓库
git init
git add -A
git commit -m 'deploy'

# 如果你要部署在 https://<USERNAME>.github.io/<REPO>
# 请将下面的<USERNAME>和<REPO>替换为你的GitHub用户名和仓库名
git push -f https://github.com/<USERNAME>/IQE动态检验.git master:gh-pages

cd - 