# 🚀 IQE智能质检系统 GitHub Pages 快速部署

## ⚡ 5分钟快速部署

### 第一步：克隆或下载项目
```bash
git clone https://github.com/YOUR_USERNAME/IQE.git
cd IQE
```

### 第二步：一键部署脚本

**Windows用户：**
```bash
./deploy-github-pages.bat
```

**Linux/Mac用户：**
```bash
chmod +x deploy-github-pages.sh
./deploy-github-pages.sh
```

### 第三步：配置GitHub Pages
1. 访问你的GitHub仓库
2. 进入 `Settings` > `Pages`
3. 在 `Source` 中选择 `GitHub Actions`
4. 等待自动部署完成

### 第四步：访问你的网站
```
https://YOUR_USERNAME.github.io/IQE/
```

## 🔧 可选：部署后端API

如果需要完整功能，可以部署Vercel API：

```bash
# 1. 安装Vercel CLI
npm install -g vercel

# 2. 登录Vercel
vercel login

# 3. 部署API
cd vercel-api
vercel --prod
```

## 📱 功能特性

✅ **完全免费** - GitHub Pages + Vercel免费套餐  
✅ **自动部署** - 推送代码自动更新  
✅ **响应式设计** - 支持手机、平板、电脑  
✅ **AI智能助手** - 质量分析和数据查询  
✅ **8D报告分析** - 自动解析和分析  
✅ **数据可视化** - 图表和统计展示  

## 🎯 部署后的访问地址

- **主站**: `https://YOUR_USERNAME.github.io/IQE/`
- **API**: `https://your-vercel-app.vercel.app/api/`

## 🔄 更新网站

每次修改代码后，只需：
```bash
git add .
git commit -m "更新内容"
git push origin main
```

GitHub Actions会自动重新部署！

## 📞 需要帮助？

- 📖 查看完整部署指南：`GITHUB_PAGES_DEPLOYMENT_GUIDE.md`
- 🧪 运行测试脚本：`npm run test-deployment`
- 🐛 遇到问题？检查GitHub Actions日志

---

🎉 **恭喜！** 您的IQE智能质检系统现在可以在全世界访问了！
