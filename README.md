# IQE智能质检系统

IQE智能质检系统是一个集成了质量检验、实验室测试和生产线监控的智能助手系统，提供直观的用户界面和强大的API接口供外部系统集成。

## 系统架构

系统采用前后端分离架构，由以下主要部分组成：

1. **前端应用**（`ai-inspection-dashboard/`）：基于Vue.js的单页面应用，提供用户界面
2. **后端API服务**（`backend/`）：基于Express的REST API服务，提供统一助手API
3. **AI服务**（`ai/`）：基于DeepSeek的AI服务，提供智能问答能力

## 功能特点

- **统一助手界面**：集成质量检验、实验室测试和生产线监控三大领域
- **智能识别**：自动识别用户问题类型，选择合适的助手模式
- **上下文感知**：保持对话上下文，提供连贯的交互体验
- **API集成**：提供RESTful API接口，便于外部系统集成
- **数据可视化**：直观展示质量数据和异常信息

### AI助手功能

- **支持DeepSeek模型**：集成DeepSeek R1和V3模型，提供高质量回复
- **Markdown格式回复**：支持表格、列表、代码块等富文本格式，提升阅读体验
- **流式输出**：实时显示AI回复，减少等待感
- **图片分析**：支持上传图片进行质量缺陷分析
- **离线模式**：当AI服务不可用时自动切换到离线模式

## 快速开始

### 前端应用

```bash
# 进入前端目录
cd ai-inspection-dashboard

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

前端应用将在 http://localhost:5173 启动。

### 后端API服务

```bash
# 进入后端目录
cd backend

# 安装依赖
npm install

# 配置环境变量
# 确保.env文件已配置正确

# 启动开发服务器
npm run dev
```

API服务将在 http://localhost:3001 启动。

### AI服务

```bash
# 进入AI服务目录
cd ai

# 安装依赖
pip install -r requirements.txt

# 配置环境变量
# 复制.env.example为.env并填写必要的API密钥

# 启动AI服务
python run.py
```

AI服务将在 http://localhost:5000 启动。

## API接口文档

API文档可通过访问 http://localhost:3001/api-docs 获取。

主要API端点：

- `POST /api/assistant/query` - 处理用户查询
- `DELETE /api/assistant/session/:sessionId` - 清除会话上下文
- `GET /api/assistant/modes` - 获取支持的助手模式
- `GET /health` - 服务健康检查

## 数据层优化

### 概述

为了提高系统的可维护性和可扩展性，我们对质量检验系统的数据层进行了全面优化，解决了前后端数据模型不一致、数据访问缺乏抽象和文件编码等关键问题。

### 主要优化成果

1. **创建了标准化的API客户端 (ApiClient.js)**
   - 统一处理HTTP请求
   - 支持开发环境的模拟数据
   - 内置错误处理和响应解析

2. **实现了集中式API端点定义 (endpoints.js)**
   - 按功能模块组织所有接口路径
   - 便于维护和更新

3. **开发了数据转换层 (DataTransformer.js)**
   - 负责前端模型与API响应数据的双向转换
   - 解决命名不一致问题
   - 处理数据类型转换和默认值

4. **创建了三个核心服务类**
   - **BatchService.js** - 处理批次管理相关功能
   - **InventoryService.js** - 处理库存管理相关功能
   - **QualityService.js** - 处理质量问题和测试相关功能

这些服务类提供了统一的数据验证、错误处理和格式转换，大大提高了系统的健壮性和可维护性。

### 架构图

请参考 [ARCHITECTURE.md](./ARCHITECTURE.md) 文件了解详细的架构设计。

## 目录结构

```
IQE智能质检系统/
├── ai-inspection-dashboard/  # 前端应用
│   ├── src/
│   │   ├── api/              # API层
│   │   │   ├── ApiClient.js  # API客户端
│   │   │   ├── endpoints.js  # API端点定义
│   │   │   └── DataTransformer.js # 数据转换器
│   │   ├── components/       # Vue组件
│   │   ├── services/         # 服务层
│   │   │   ├── BatchService.js    # 批次管理服务
│   │   │   ├── InventoryService.js # 库存管理服务
│   │   │   ├── QualityService.js  # 质量管理服务
│   │   │   └── ai/           # AI服务连接器
│   │   ├── stores/           # 状态管理
│   │   └── ...
│   └── ...
├── backend/                  # 后端API服务
│   ├── src/
│   │   ├── controllers/      # API控制器
│   │   ├── services/         # 业务逻辑
│   │   ├── middleware/       # 中间件
│   │   ├── utils/            # 工具类
│   │   └── ...
│   └── ...
├── ai/                       # AI服务
│   ├── ai_assistant/         # DeepSeek助手核心代码
│   ├── data/                 # 数据和知识库
│   └── ...
└── README.md
```

## AI模型配置

### 配置DeepSeek API密钥

1. 打开 `ai-inspection-dashboard/src/config/aiConfig.js`
2. 编辑以下配置：

```javascript
auth: {
  baseUrl: "https://api.deepseek.com",  // DeepSeek API地址
  apiKey: "your_api_key_here",          // 替换为您的API密钥
},
```

### 配置模型参数

可在同一配置文件中自定义模型设置：

```javascript
models: [
  {
    id: "deepseek-v3",
    name: "DeepSeek V3",
    default: true,
    maxTokens: 2048,
    temperature: 0.7,
    supportsImages: true
  },
  {
    id: "deepseek-r1",
    name: "DeepSeek R1",
    default: false,
    maxTokens: 4096,
    temperature: 0.5,
    supportsImages: true
  }
]
```

## 主要技术栈

### 前端
- Vue.js
- Element Plus
- Axios
- Echarts
- Marked (Markdown解析)

### 后端
- Node.js
- Express
- Winston (日志)
- Joi (数据验证)

### AI服务
- Python
- Flask
- DeepSeek API客户端

## 统一助手API使用示例

```javascript
// 使用fetch发送查询
const response = await fetch('http://localhost:3001/api/assistant/query', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    query: '最近一周的不良品率是多少？',
    mode: 'quality', // 可选：auto, quality, lab, production
    sessionId: '123456', // 可选，用于维护会话上下文
    context: {} // 可选，额外上下文信息
  })
});

const result = await response.json();
console.log(result);
```

## AI助手使用指南

### 基本使用

1. 在右下角找到AI助手图标
2. 点击展开助手面板
3. 输入您的问题并发送
4. 实时查看AI回复（支持流式输出）

### 图片分析

1. 点击输入框旁的图片按钮
2. 上传需要分析的产品图片
3. 可选：添加提示信息（如："分析这个零件的缺陷"）
4. 点击发送按钮

### 模型选择

1. 在助手面板顶部找到模型选择下拉框
2. 切换不同模型（如DeepSeek V3或R1）以获取不同特性的回复

### 流式输出切换

助手面板顶部提供了流式输出的开关，您可以：
- 开启流式输出：实时查看AI生成回复的过程
- 关闭流式输出：等待完整回复一次性显示

## 许可证

[内部使用] - 仅供授权用户使用 

## 数据层优化

### 概述

为了提高系统的可维护性和可扩展性，我们对质量检验系统的数据层进行了全面优化，解决了前后端数据模型不一致、数据访问缺乏抽象和文件编码等关键问题。

### 主要优化成果

1. **创建了标准化的API客户端 (ApiClient.js)**
   - 统一处理HTTP请求
   - 支持开发环境的模拟数据
   - 内置错误处理和响应解析

2. **实现了集中式API端点定义 (endpoints.js)**
   - 按功能模块组织所有接口路径
   - 便于维护和更新

3. **开发了数据转换层 (DataTransformer.js)**
   - 负责前端模型与API响应数据的双向转换
   - 解决命名不一致问题
   - 处理数据类型转换和默认值

4. **创建了三个核心服务类**
   - **BatchService.js** - 处理批次管理相关功能
   - **InventoryService.js** - 处理库存管理相关功能
   - **QualityService.js** - 处理质量问题和测试相关功能

这些服务类提供了统一的数据验证、错误处理和格式转换，大大提高了系统的健壮性和可维护性。

### 架构图

请参考 [ARCHITECTURE.md](./ARCHITECTURE.md) 文件了解详细的架构设计。 