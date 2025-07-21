# GitHub Pages 部署指南

## 🚀 快速部署

### 方法一：使用自动化脚本（推荐）

```bash
# 给脚本执行权限
chmod +x deploy-to-github.sh

# 运行部署脚本
./deploy-to-github.sh
```

### 方法二：手动部署

```bash
# 1. 初始化Git仓库（如果还没有）
git init
git branch -M main

# 2. 添加远程仓库
git remote add origin https://github.com/xinren1232/test-.git

# 3. 构建项目
cd ai-inspection-dashboard
npm install
npm run build
cd ..

# 4. 提交并推送
git add .
git commit -m "Initial commit"
git push -u origin main
```

## ⚙️ GitHub仓库设置

部署完成后，需要在GitHub仓库中启用GitHub Pages：

1. 访问 https://github.com/xinren1232/test-/settings/pages
2. 在 "Source" 部分选择 "Deploy from a branch"
3. 选择 "gh-pages" 分支
4. 选择 "/ (root)" 文件夹
5. 点击 "Save"

## 🌐 访问地址

部署成功后，您的网站将可以通过以下地址访问：
https://xinren1232.github.io/test-/

## 🔄 自动部署

项目已配置GitHub Actions，每次推送到main分支时会自动构建和部署。

## 📁 项目结构

```
├── ai-inspection-dashboard/     # 前端项目
│   ├── src/                    # 源代码
│   ├── dist/                   # 构建输出（自动生成）
│   ├── package.json            # 依赖配置
│   └── vite.config.js          # Vite配置
├── .github/workflows/          # GitHub Actions
│   └── deploy.yml              # 自动部署配置
└── deploy-to-github.sh         # 部署脚本
```

## 🛠️ 本地开发

```bash
cd ai-inspection-dashboard
npm install
npm run dev
```

## 📝 注意事项

1. 确保您有GitHub仓库的推送权限
2. 首次部署可能需要几分钟才能生效
3. 每次推送到main分支都会触发自动部署
4. 如果遇到权限问题，请检查GitHub token设置
