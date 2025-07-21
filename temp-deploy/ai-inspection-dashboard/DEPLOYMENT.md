# IQE动态检验系统部署指南

## GitHub Pages部署流程

### 方案1：本地构建+手动部署（当前方案）
1. 本地开发完成后构建项目：
   ``n   npm run build
   ``n   或使用提供的脚本：
   ``n   powershell -ExecutionPolicy Bypass -File build-only.ps1
   ``n
2. 手动部署到GitHub Pages：
   - 将\dist\目录中的所有文件下载到本地
   - 登录GitHub网页界面
   - 上传这些文件到仓库（可以是主分支或gh-pages分支）
   - 在仓库设置中启用GitHub Pages
