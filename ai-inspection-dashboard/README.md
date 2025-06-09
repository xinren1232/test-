# IQE智能质检系统

IQE智能质检系统是一个集成了质量检验、实验室测试和生产线监控的智能助手系统，提供直观的用户界面和强大的API接口供外部系统集成。

## 功能特点

- **统一助手界面**：集成质量检验、实验室测试和生产线监控三大领域
- **智能识别**：自动识别用户问题类型，选择合适的助手模式
- **上下文感知**：保持对话上下文，提供连贯的交互体验
- **API集成**：提供RESTful API接口，便于外部系统集成
- **数据可视化**：直观展示质量数据和异常信息

## 项目结构

```
ai-inspection-dashboard/
├── src/                      # 源代码
│   ├── components/           # Vue组件
│   │   ├── ai/               # AI助手相关组件
│   │   │   ├── LabAgent.vue  # 实验室助手组件
│   │   │   └── UnifiedAssistant.vue # 统一助手组件
│   │   └── chat/             # 聊天相关组件
│   ├── services/             # 服务层
│   │   ├── ai/               # AI服务
│   │   └── api/              # API服务
│   │       └── UnifiedAssistantAPI.js # 统一助手API服务
│   ├── examples/             # 示例代码
│   │   └── api-client.js     # API客户端示例
│   └── main.js               # 主入口文件
├── server.js                 # API服务器（独立运行）
└── package.json              # 项目配置
```

## 快速开始

### 前提条件

- Node.js 16+
- npm 或 pnpm

### 安装依赖

```bash
npm install
# 或
pnpm install
```

### 启动前端开发服务器

```bash
npm run dev
# 或
pnpm dev
```

前端应用将在 http://localhost:5173/IQE/ 上运行。

### 启动API服务器

```bash
npm run api-server
# 或
pnpm api-server
```

API服务器将在 http://localhost:3001 上运行，提供以下端点：

- `POST /api/assistant/query` - 处理查询请求
- `DELETE /api/assistant/session/:sessionId` - 清除会话上下文
- `GET /api/assistant/modes` - 获取支持的助手模式
- `GET /api/assistant/health` - 健康检查

## API集成指南

### API使用示例

```javascript
// 设置基础URL
const API_BASE_URL = 'http://localhost:3001/api/assistant';

// 发送查询
async function sendQuery() {
  const response = await fetch(`${API_BASE_URL}/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: '检查最近的不良记录',
      mode: 'auto',
      sessionId: 'test_session_123'
    })
  });
  
  const result = await response.json();
  console.log(result);
}
```

更多示例请参考 `src/examples/api-client.js`。

### 查询参数

| 参数 | 类型 | 描述 |
|------|------|------|
| query | string | 用户查询文本 |
| mode | string | 助手模式 (auto/quality/lab/production) |
| sessionId | string | 会话ID，用于保持上下文 |
| context | object | 附加上下文信息 |

### 响应格式

```json
{
  "success": true,
  "sessionId": "test_session_123",
  "mode": "lab",
  "response": {
    "content": "最近检测出的5条不良记录如下：",
    "data": {
      "type": "table",
      "headers": ["日期", "物料编码", "物料名称", "测试项", "供应商"],
      "rows": [...]
    }
  }
}
```

## 常见问题

### 如何切换到独立的API服务器模式？

1. 关闭前端开发服务器
2. 运行 `npm run api-server` 启动API服务器
3. 在你的应用中使用 `http://localhost:3001/api/assistant` 作为API基础URL

### 如何测试API连接？

访问 http://localhost:3001/api/assistant/health 进行健康检查。

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request
