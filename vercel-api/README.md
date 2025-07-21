# IQE Vercel API

IQE智能质检系统的Serverless API后端，部署在Vercel平台。

## 🚀 快速部署

### 1. 安装Vercel CLI
```bash
npm install -g vercel
```

### 2. 登录Vercel
```bash
vercel login
```

### 3. 部署到Vercel
```bash
cd vercel-api
vercel --prod
```

## 📡 API端点

### 统计数据
- `GET /api/statistics` - 获取质检统计数据

### 规则管理
- `GET /api/rules` - 获取规则列表
- `POST /api/rules` - 创建新规则

### 检验数据
- `GET /api/inspections` - 获取检验记录
- `POST /api/inspections` - 创建检验记录

### AI助手
- `POST /api/ai-assistant` - AI对话接口

## 🔧 本地开发

```bash
cd vercel-api
npm install
npm run dev
```

访问 http://localhost:3000 进行本地测试。

## 📝 使用示例

### 获取统计数据
```javascript
fetch('https://your-vercel-app.vercel.app/api/statistics')
  .then(response => response.json())
  .then(data => console.log(data));
```

### AI助手对话
```javascript
fetch('https://your-vercel-app.vercel.app/api/ai-assistant', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    message: '查询不良率数据',
    context: 'quality'
  })
})
.then(response => response.json())
.then(data => console.log(data));
```

## 🌐 CORS配置

所有API端点都已配置CORS，支持跨域访问。

## 📊 数据格式

所有API响应都遵循统一格式：
```json
{
  "success": true,
  "data": {},
  "message": "操作成功",
  "timestamp": "2024-01-20T10:00:00Z"
}
```

## 🔒 安全性

- 所有API都支持HTTPS
- 实现了基本的输入验证
- 支持CORS安全策略

## 📈 扩展性

可以轻松添加新的API端点：
1. 在 `api/` 目录下创建新的 `.js` 文件
2. 导出默认的处理函数
3. 重新部署即可

## 💡 注意事项

- Vercel免费版有请求限制
- 建议生产环境使用付费版本
- 可以配置自定义域名
