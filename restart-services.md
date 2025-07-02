# IQE质量智能助手 - 服务重启指南

## 🚀 完整重启流程

### 1. 停止现有服务

#### 停止后端服务
```bash
# 如果后端正在运行，按 Ctrl+C 停止
# 或者查找并终止进程
netstat -ano | findstr :3002
# 记下PID，然后终止
taskkill /PID <PID> /F
```

#### 停止前端服务
```bash
# 如果前端正在运行，按 Ctrl+C 停止
# 或者查找并终止进程
netstat -ano | findstr :5173
# 记下PID，然后终止
taskkill /PID <PID> /F
```

### 2. 启动后端服务

```bash
# 进入后端目录
cd backend

# 安装依赖（如果需要）
npm install

# 启动后端服务
npm start
```

**预期输出**:
```
🚀 Server is running on port 3002
📊 Real data service initialized
🤖 AI Enhanced service initialized
✅ All services ready
```

### 3. 启动前端服务

```bash
# 新开一个终端窗口
# 进入前端目录
cd ai-inspection-dashboard

# 安装依赖（如果需要）
npm install

# 启动前端开发服务器
npm run dev
```

**预期输出**:
```
  VITE v4.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h to show help
```

### 4. 验证服务状态

#### 检查后端API
```bash
# 测试基础API
curl http://localhost:3002/api/assistant/query -X POST -H "Content-Type: application/json" -d "{\"query\":\"系统数据总览\"}"

# 测试AI健康检查
curl http://localhost:3002/api/assistant/ai-health
```

#### 检查前端访问
```bash
# 访问前端主页
http://localhost:5173/

# 访问AI增强助手页面
http://localhost:5173/assistant-ai
```

## 🔧 故障排除

### 后端启动问题

#### 问题1: 端口被占用
```bash
# 查找占用3002端口的进程
netstat -ano | findstr :3002

# 终止进程
taskkill /PID <PID> /F

# 重新启动后端
npm start
```

#### 问题2: 依赖缺失
```bash
# 清理并重新安装依赖
rm -rf node_modules package-lock.json
npm install
npm start
```

#### 问题3: AI服务连接失败
检查DeepSeek API密钥是否正确：
```javascript
// 在 backend/src/services/DeepSeekService.js 中确认
const apiKey = 'sk-cab797574abf4288bcfaca253191565d';
```

### 前端启动问题

#### 问题1: 端口被占用
```bash
# 查找占用5173端口的进程
netstat -ano | findstr :5173

# 终止进程
taskkill /PID <PID> /F

# 重新启动前端
npm run dev
```

#### 问题2: 依赖版本冲突
```bash
# 清理并重新安装依赖
rm -rf node_modules package-lock.json
npm install
npm run dev
```

#### 问题3: 构建错误
```bash
# 检查Vue组件语法
npm run build

# 如果有错误，修复后重新启动
npm run dev
```

## 📋 启动检查清单

### ✅ 后端服务检查
- [ ] 端口3002可用
- [ ] 依赖已安装
- [ ] 数据服务初始化成功
- [ ] AI服务连接正常
- [ ] API响应正常

### ✅ 前端服务检查
- [ ] 端口5173可用
- [ ] 依赖已安装
- [ ] Vite开发服务器启动
- [ ] 页面可正常访问
- [ ] API调用正常

### ✅ AI功能检查
- [ ] AI健康检查通过
- [ ] DeepSeek API连接正常
- [ ] 流式响应工作正常
- [ ] AI增强页面可访问

## 🎯 快速验证脚本

创建一个快速验证脚本：
