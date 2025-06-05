# 发生错误时终止
$ErrorActionPreference = "Stop"

# 构建
npm run build

# 进入构建文件夹
cd dist

# 创建.nojekyll文件（防止GitHub Pages忽略下划线开头的文件）
New-Item -Path ".nojekyll" -ItemType "file" -Force

# 初始化Git仓库
git init
git add -A
git commit -m 'deploy'

# 推送到GitHub Pages
git push -f https://github.com/xinren1232/IQE.git master:gh-pages

# 返回上层目录
cd .. 