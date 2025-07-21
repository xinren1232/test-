# 🚀 IQE智能质检系统 GitHub Pages 部署指南

## 📋 概述

本指南将帮助您将IQE智能质检系统部署到GitHub Pages，实现免费的静态网站托管。

## 🎯 部署架构

```
GitHub Pages (前端) + Vercel Functions (后端API)
```

- **前端**: Vue.js应用部署到GitHub Pages
- **后端**: Serverless API部署到Vercel
- **自动化**: GitHub Actions自动构建和部署

## 📝 部署步骤

### 第一步：准备GitHub仓库

1. **创建GitHub仓库**
   ```bash
   # 如果还没有仓库，创建一个新的
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/IQE.git
   git push -u origin main
   ```

2. **配置仓库设置**
   - 进入GitHub仓库设置页面
   - 找到 `Settings` > `Pages`
   - 在 `Source` 中选择 `GitHub Actions`

### 第二步：部署后端API到Vercel

1. **安装Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **登录Vercel**
   ```bash
   vercel login
   ```

3. **部署API**
   ```bash
   cd vercel-api
   vercel --prod
   ```

4. **记录API URL**
   - 部署完成后，Vercel会提供一个URL，如：`https://iqe-api-xxx.vercel.app`
   - 记录这个URL，稍后需要配置到前端

### 第三步：配置前端API地址

1. **更新API配置**
   编辑 `ai-inspection-dashboard/src/config/github-pages.js`：
   ```javascript
   getApiBaseUrl() {
     if (this.isGitHubPages) {
       // 替换为你的Vercel API URL
       return 'https://your-vercel-app.vercel.app/api'
     }
     return 'http://localhost:3001/api'
   }
   ```

### 第四步：执行部署

#### 方法一：使用部署脚本（推荐）

**Windows用户：**
```bash
./deploy-github-pages.bat
```

**Linux/Mac用户：**
```bash
chmod +x deploy-github-pages.sh
./deploy-github-pages.sh
```

#### 方法二：手动部署

```bash
# 1. 构建前端
cd ai-inspection-dashboard
npm install
npm run build

# 2. 提交代码
cd ..
git add .
git commit -m "Deploy to GitHub Pages"
git push origin main
```

### 第五步：验证部署

1. **检查GitHub Actions**
   - 访问仓库的 `Actions` 标签页
   - 确认部署工作流正在运行或已完成

2. **访问网站**
   - 部署完成后，访问：`https://YOUR_USERNAME.github.io/IQE/`
   - 检查功能是否正常

## 🔧 配置说明

### GitHub Actions配置

文件位置：`.github/workflows/deploy.yml`

关键配置：
- Node.js版本：18
- 构建目录：`ai-inspection-dashboard/dist`
- 自动触发：推送到main分支

### Vite配置

文件位置：`ai-inspection-dashboard/vite.config.js`

关键配置：
```javascript
base: process.env.NODE_ENV === 'production' ? '/IQE/' : '/'
```

### 路由配置

- 使用Hash路由模式以支持GitHub Pages
- 404页面自动重定向到主页

## 🌐 访问地址

部署完成后，您的系统将可以通过以下地址访问：

- **主站**: `https://YOUR_USERNAME.github.io/IQE/`
- **API**: `https://your-vercel-app.vercel.app/api/`

## 🔄 自动更新

每次推送代码到main分支时，GitHub Actions会自动：
1. 构建前端应用
2. 部署到GitHub Pages
3. 更新网站内容

## 🐛 常见问题

### 1. 部署失败
- 检查GitHub Actions日志
- 确认package.json中的依赖是否正确
- 验证构建命令是否成功

### 2. API无法访问
- 检查Vercel部署状态
- 确认CORS配置是否正确
- 验证API URL是否正确配置

### 3. 路由问题
- 确认使用Hash路由模式
- 检查404.html配置
- 验证base路径设置

### 4. 权限问题
- 确认仓库的Pages权限已启用
- 检查GitHub Actions权限设置
- 验证workflow文件权限配置

## 📊 性能优化

### 1. 构建优化
- 启用代码分割
- 压缩静态资源
- 使用CDN加速

### 2. 缓存策略
- 配置浏览器缓存
- 使用Service Worker
- 优化资源加载

## 🔒 安全考虑

### 1. API安全
- 使用HTTPS
- 实现请求限制
- 添加输入验证

### 2. 前端安全
- 避免敏感信息暴露
- 使用CSP策略
- 定期更新依赖

## 📈 监控和维护

### 1. 监控指标
- 页面加载速度
- API响应时间
- 错误率统计

### 2. 定期维护
- 更新依赖包
- 检查安全漏洞
- 优化性能

## 💡 扩展功能

### 1. 自定义域名
- 在GitHub Pages设置中配置
- 添加CNAME文件
- 配置DNS解析

### 2. 多环境部署
- 开发环境：本地开发
- 测试环境：GitHub Pages
- 生产环境：自定义服务器

## 📞 技术支持

如果遇到问题，请：
1. 查看GitHub Actions日志
2. 检查浏览器控制台错误
3. 参考Vercel部署文档
4. 提交Issue到项目仓库

---

🎉 **恭喜！** 您的IQE智能质检系统现在已经成功部署到GitHub Pages！
