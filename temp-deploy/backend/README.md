# IQE统一助手API服务

IQE统一助手API服务是一个基于Express的RESTful API，为IQE智能质检系统提供统一的助手服务接口，支持质量检验、实验室测试和生产线相关的查询。

## 特点

- **模块化架构**：采用清晰的分层架构，包括控制器、服务和工具层
- **标准化响应**：所有API端点返回统一格式的JSON响应
- **完善的错误处理**：提供详细的错误信息和状态码
- **自动化文档**：集成Swagger UI提供交互式API文档
- **安全防护**：包含请求限流、安全头等保护措施
- **日志系统**：完整的请求和错误日志记录
- **会话管理**：支持会话上下文的维护和清理

## API端点

| 端点 | 方法 | 描述 |
| --- | --- | --- |
| `/api/assistant/query` | POST | 处理用户查询 |
| `/api/assistant/session/:sessionId` | DELETE | 清除会话上下文 |
| `/api/assistant/modes` | GET | 获取支持的助手模式 |
| `/health` 或 `/api/health` | GET | 服务健康检查 |
| `/api-docs` | GET | API文档 |

## 安装

```bash
# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑.env文件设置相关配置

# 启动开发服务器
npm run dev

# 启动生产服务器
npm start
```

## 使用示例

### 发送查询

```javascript
// 发送查询请求
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

### 清除会话

```javascript
// 清除会话上下文
const response = await fetch('http://localhost:3001/api/assistant/session/123456', {
  method: 'DELETE'
});

const result = await response.json();
console.log(result);
```

## 架构说明

```
src/
├── controllers/       # 控制器层 - 处理HTTP请求
├── services/          # 服务层 - 业务逻辑
├── middleware/        # 中间件 - 请求处理
├── utils/             # 工具类 - 通用功能
├── models/            # 数据模型 - 结构定义
├── config/            # 配置文件
├── routes.js          # 路由配置
└── index.js           # 主入口文件
```

## 环境变量

| 变量名 | 描述 | 默认值 |
| --- | --- | --- |
| `PORT` | 服务器端口 | 3001 |
| `NODE_ENV` | 环境模式 | development |
| `LOG_LEVEL` | 日志级别 | info |
| `OPENAI_API_KEY` | OpenAI API密钥 | - |
| `AI_MODEL` | AI模型名称 | gpt-4o |
| `AI_MAX_TOKENS` | 最大响应token数 | 2000 | 

IQE统一助手API服务是一个基于Express的RESTful API，为IQE智能质检系统提供统一的助手服务接口，支持质量检验、实验室测试和生产线相关的查询。

## 特点

- **模块化架构**：采用清晰的分层架构，包括控制器、服务和工具层
- **标准化响应**：所有API端点返回统一格式的JSON响应
- **完善的错误处理**：提供详细的错误信息和状态码
- **自动化文档**：集成Swagger UI提供交互式API文档
- **安全防护**：包含请求限流、安全头等保护措施
- **日志系统**：完整的请求和错误日志记录
- **会话管理**：支持会话上下文的维护和清理

## API端点

| 端点 | 方法 | 描述 |
| --- | --- | --- |
| `/api/assistant/query` | POST | 处理用户查询 |
| `/api/assistant/session/:sessionId` | DELETE | 清除会话上下文 |
| `/api/assistant/modes` | GET | 获取支持的助手模式 |
| `/health` 或 `/api/health` | GET | 服务健康检查 |
| `/api-docs` | GET | API文档 |

## 安装

```bash
# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑.env文件设置相关配置

# 启动开发服务器
npm run dev

# 启动生产服务器
npm start
```

## 使用示例

### 发送查询

```javascript
// 发送查询请求
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

### 清除会话

```javascript
// 清除会话上下文
const response = await fetch('http://localhost:3001/api/assistant/session/123456', {
  method: 'DELETE'
});

const result = await response.json();
console.log(result);
```

## 架构说明

```
src/
├── controllers/       # 控制器层 - 处理HTTP请求
├── services/          # 服务层 - 业务逻辑
├── middleware/        # 中间件 - 请求处理
├── utils/             # 工具类 - 通用功能
├── models/            # 数据模型 - 结构定义
├── config/            # 配置文件
├── routes.js          # 路由配置
└── index.js           # 主入口文件
```

## 环境变量

| 变量名 | 描述 | 默认值 |
| --- | --- | --- |
| `PORT` | 服务器端口 | 3001 |
| `NODE_ENV` | 环境模式 | development |
| `LOG_LEVEL` | 日志级别 | info |
| `OPENAI_API_KEY` | OpenAI API密钥 | - |
| `AI_MODEL` | AI模型名称 | gpt-4o |
| `AI_MAX_TOKENS` | 最大响应token数 | 2000 | 

IQE统一助手API服务是一个基于Express的RESTful API，为IQE智能质检系统提供统一的助手服务接口，支持质量检验、实验室测试和生产线相关的查询。

## 特点

- **模块化架构**：采用清晰的分层架构，包括控制器、服务和工具层
- **标准化响应**：所有API端点返回统一格式的JSON响应
- **完善的错误处理**：提供详细的错误信息和状态码
- **自动化文档**：集成Swagger UI提供交互式API文档
- **安全防护**：包含请求限流、安全头等保护措施
- **日志系统**：完整的请求和错误日志记录
- **会话管理**：支持会话上下文的维护和清理

## API端点

| 端点 | 方法 | 描述 |
| --- | --- | --- |
| `/api/assistant/query` | POST | 处理用户查询 |
| `/api/assistant/session/:sessionId` | DELETE | 清除会话上下文 |
| `/api/assistant/modes` | GET | 获取支持的助手模式 |
| `/health` 或 `/api/health` | GET | 服务健康检查 |
| `/api-docs` | GET | API文档 |

## 安装

```bash
# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑.env文件设置相关配置

# 启动开发服务器
npm run dev

# 启动生产服务器
npm start
```

## 使用示例

### 发送查询

```javascript
// 发送查询请求
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

### 清除会话

```javascript
// 清除会话上下文
const response = await fetch('http://localhost:3001/api/assistant/session/123456', {
  method: 'DELETE'
});

const result = await response.json();
console.log(result);
```

## 架构说明

```
src/
├── controllers/       # 控制器层 - 处理HTTP请求
├── services/          # 服务层 - 业务逻辑
├── middleware/        # 中间件 - 请求处理
├── utils/             # 工具类 - 通用功能
├── models/            # 数据模型 - 结构定义
├── config/            # 配置文件
├── routes.js          # 路由配置
└── index.js           # 主入口文件
```

## 环境变量

| 变量名 | 描述 | 默认值 |
| --- | --- | --- |
| `PORT` | 服务器端口 | 3001 |
| `NODE_ENV` | 环境模式 | development |
| `LOG_LEVEL` | 日志级别 | info |
| `OPENAI_API_KEY` | OpenAI API密钥 | - |
| `AI_MODEL` | AI模型名称 | gpt-4o |
| `AI_MAX_TOKENS` | 最大响应token数 | 2000 | 
 
 
 

IQE统一助手API服务是一个基于Express的RESTful API，为IQE智能质检系统提供统一的助手服务接口，支持质量检验、实验室测试和生产线相关的查询。

## 特点

- **模块化架构**：采用清晰的分层架构，包括控制器、服务和工具层
- **标准化响应**：所有API端点返回统一格式的JSON响应
- **完善的错误处理**：提供详细的错误信息和状态码
- **自动化文档**：集成Swagger UI提供交互式API文档
- **安全防护**：包含请求限流、安全头等保护措施
- **日志系统**：完整的请求和错误日志记录
- **会话管理**：支持会话上下文的维护和清理

## API端点

| 端点 | 方法 | 描述 |
| --- | --- | --- |
| `/api/assistant/query` | POST | 处理用户查询 |
| `/api/assistant/session/:sessionId` | DELETE | 清除会话上下文 |
| `/api/assistant/modes` | GET | 获取支持的助手模式 |
| `/health` 或 `/api/health` | GET | 服务健康检查 |
| `/api-docs` | GET | API文档 |

## 安装

```bash
# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑.env文件设置相关配置

# 启动开发服务器
npm run dev

# 启动生产服务器
npm start
```

## 使用示例

### 发送查询

```javascript
// 发送查询请求
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

### 清除会话

```javascript
// 清除会话上下文
const response = await fetch('http://localhost:3001/api/assistant/session/123456', {
  method: 'DELETE'
});

const result = await response.json();
console.log(result);
```

## 架构说明

```
src/
├── controllers/       # 控制器层 - 处理HTTP请求
├── services/          # 服务层 - 业务逻辑
├── middleware/        # 中间件 - 请求处理
├── utils/             # 工具类 - 通用功能
├── models/            # 数据模型 - 结构定义
├── config/            # 配置文件
├── routes.js          # 路由配置
└── index.js           # 主入口文件
```

## 环境变量

| 变量名 | 描述 | 默认值 |
| --- | --- | --- |
| `PORT` | 服务器端口 | 3001 |
| `NODE_ENV` | 环境模式 | development |
| `LOG_LEVEL` | 日志级别 | info |
| `OPENAI_API_KEY` | OpenAI API密钥 | - |
| `AI_MODEL` | AI模型名称 | gpt-4o |
| `AI_MAX_TOKENS` | 最大响应token数 | 2000 | 

IQE统一助手API服务是一个基于Express的RESTful API，为IQE智能质检系统提供统一的助手服务接口，支持质量检验、实验室测试和生产线相关的查询。

## 特点

- **模块化架构**：采用清晰的分层架构，包括控制器、服务和工具层
- **标准化响应**：所有API端点返回统一格式的JSON响应
- **完善的错误处理**：提供详细的错误信息和状态码
- **自动化文档**：集成Swagger UI提供交互式API文档
- **安全防护**：包含请求限流、安全头等保护措施
- **日志系统**：完整的请求和错误日志记录
- **会话管理**：支持会话上下文的维护和清理

## API端点

| 端点 | 方法 | 描述 |
| --- | --- | --- |
| `/api/assistant/query` | POST | 处理用户查询 |
| `/api/assistant/session/:sessionId` | DELETE | 清除会话上下文 |
| `/api/assistant/modes` | GET | 获取支持的助手模式 |
| `/health` 或 `/api/health` | GET | 服务健康检查 |
| `/api-docs` | GET | API文档 |

## 安装

```bash
# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑.env文件设置相关配置

# 启动开发服务器
npm run dev

# 启动生产服务器
npm start
```

## 使用示例

### 发送查询

```javascript
// 发送查询请求
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

### 清除会话

```javascript
// 清除会话上下文
const response = await fetch('http://localhost:3001/api/assistant/session/123456', {
  method: 'DELETE'
});

const result = await response.json();
console.log(result);
```

## 架构说明

```
src/
├── controllers/       # 控制器层 - 处理HTTP请求
├── services/          # 服务层 - 业务逻辑
├── middleware/        # 中间件 - 请求处理
├── utils/             # 工具类 - 通用功能
├── models/            # 数据模型 - 结构定义
├── config/            # 配置文件
├── routes.js          # 路由配置
└── index.js           # 主入口文件
```

## 环境变量

| 变量名 | 描述 | 默认值 |
| --- | --- | --- |
| `PORT` | 服务器端口 | 3001 |
| `NODE_ENV` | 环境模式 | development |
| `LOG_LEVEL` | 日志级别 | info |
| `OPENAI_API_KEY` | OpenAI API密钥 | - |
| `AI_MODEL` | AI模型名称 | gpt-4o |
| `AI_MAX_TOKENS` | 最大响应token数 | 2000 | 

IQE统一助手API服务是一个基于Express的RESTful API，为IQE智能质检系统提供统一的助手服务接口，支持质量检验、实验室测试和生产线相关的查询。

## 特点

- **模块化架构**：采用清晰的分层架构，包括控制器、服务和工具层
- **标准化响应**：所有API端点返回统一格式的JSON响应
- **完善的错误处理**：提供详细的错误信息和状态码
- **自动化文档**：集成Swagger UI提供交互式API文档
- **安全防护**：包含请求限流、安全头等保护措施
- **日志系统**：完整的请求和错误日志记录
- **会话管理**：支持会话上下文的维护和清理

## API端点

| 端点 | 方法 | 描述 |
| --- | --- | --- |
| `/api/assistant/query` | POST | 处理用户查询 |
| `/api/assistant/session/:sessionId` | DELETE | 清除会话上下文 |
| `/api/assistant/modes` | GET | 获取支持的助手模式 |
| `/health` 或 `/api/health` | GET | 服务健康检查 |
| `/api-docs` | GET | API文档 |

## 安装

```bash
# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑.env文件设置相关配置

# 启动开发服务器
npm run dev

# 启动生产服务器
npm start
```

## 使用示例

### 发送查询

```javascript
// 发送查询请求
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

### 清除会话

```javascript
// 清除会话上下文
const response = await fetch('http://localhost:3001/api/assistant/session/123456', {
  method: 'DELETE'
});

const result = await response.json();
console.log(result);
```

## 架构说明

```
src/
├── controllers/       # 控制器层 - 处理HTTP请求
├── services/          # 服务层 - 业务逻辑
├── middleware/        # 中间件 - 请求处理
├── utils/             # 工具类 - 通用功能
├── models/            # 数据模型 - 结构定义
├── config/            # 配置文件
├── routes.js          # 路由配置
└── index.js           # 主入口文件
```

## 环境变量

| 变量名 | 描述 | 默认值 |
| --- | --- | --- |
| `PORT` | 服务器端口 | 3001 |
| `NODE_ENV` | 环境模式 | development |
| `LOG_LEVEL` | 日志级别 | info |
| `OPENAI_API_KEY` | OpenAI API密钥 | - |
| `AI_MODEL` | AI模型名称 | gpt-4o |
| `AI_MAX_TOKENS` | 最大响应token数 | 2000 | 
 
 
 

IQE统一助手API服务是一个基于Express的RESTful API，为IQE智能质检系统提供统一的助手服务接口，支持质量检验、实验室测试和生产线相关的查询。

## 特点

- **模块化架构**：采用清晰的分层架构，包括控制器、服务和工具层
- **标准化响应**：所有API端点返回统一格式的JSON响应
- **完善的错误处理**：提供详细的错误信息和状态码
- **自动化文档**：集成Swagger UI提供交互式API文档
- **安全防护**：包含请求限流、安全头等保护措施
- **日志系统**：完整的请求和错误日志记录
- **会话管理**：支持会话上下文的维护和清理

## API端点

| 端点 | 方法 | 描述 |
| --- | --- | --- |
| `/api/assistant/query` | POST | 处理用户查询 |
| `/api/assistant/session/:sessionId` | DELETE | 清除会话上下文 |
| `/api/assistant/modes` | GET | 获取支持的助手模式 |
| `/health` 或 `/api/health` | GET | 服务健康检查 |
| `/api-docs` | GET | API文档 |

## 安装

```bash
# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑.env文件设置相关配置

# 启动开发服务器
npm run dev

# 启动生产服务器
npm start
```

## 使用示例

### 发送查询

```javascript
// 发送查询请求
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

### 清除会话

```javascript
// 清除会话上下文
const response = await fetch('http://localhost:3001/api/assistant/session/123456', {
  method: 'DELETE'
});

const result = await response.json();
console.log(result);
```

## 架构说明

```
src/
├── controllers/       # 控制器层 - 处理HTTP请求
├── services/          # 服务层 - 业务逻辑
├── middleware/        # 中间件 - 请求处理
├── utils/             # 工具类 - 通用功能
├── models/            # 数据模型 - 结构定义
├── config/            # 配置文件
├── routes.js          # 路由配置
└── index.js           # 主入口文件
```

## 环境变量

| 变量名 | 描述 | 默认值 |
| --- | --- | --- |
| `PORT` | 服务器端口 | 3001 |
| `NODE_ENV` | 环境模式 | development |
| `LOG_LEVEL` | 日志级别 | info |
| `OPENAI_API_KEY` | OpenAI API密钥 | - |
| `AI_MODEL` | AI模型名称 | gpt-4o |
| `AI_MAX_TOKENS` | 最大响应token数 | 2000 | 

IQE统一助手API服务是一个基于Express的RESTful API，为IQE智能质检系统提供统一的助手服务接口，支持质量检验、实验室测试和生产线相关的查询。

## 特点

- **模块化架构**：采用清晰的分层架构，包括控制器、服务和工具层
- **标准化响应**：所有API端点返回统一格式的JSON响应
- **完善的错误处理**：提供详细的错误信息和状态码
- **自动化文档**：集成Swagger UI提供交互式API文档
- **安全防护**：包含请求限流、安全头等保护措施
- **日志系统**：完整的请求和错误日志记录
- **会话管理**：支持会话上下文的维护和清理

## API端点

| 端点 | 方法 | 描述 |
| --- | --- | --- |
| `/api/assistant/query` | POST | 处理用户查询 |
| `/api/assistant/session/:sessionId` | DELETE | 清除会话上下文 |
| `/api/assistant/modes` | GET | 获取支持的助手模式 |
| `/health` 或 `/api/health` | GET | 服务健康检查 |
| `/api-docs` | GET | API文档 |

## 安装

```bash
# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑.env文件设置相关配置

# 启动开发服务器
npm run dev

# 启动生产服务器
npm start
```

## 使用示例

### 发送查询

```javascript
// 发送查询请求
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

### 清除会话

```javascript
// 清除会话上下文
const response = await fetch('http://localhost:3001/api/assistant/session/123456', {
  method: 'DELETE'
});

const result = await response.json();
console.log(result);
```

## 架构说明

```
src/
├── controllers/       # 控制器层 - 处理HTTP请求
├── services/          # 服务层 - 业务逻辑
├── middleware/        # 中间件 - 请求处理
├── utils/             # 工具类 - 通用功能
├── models/            # 数据模型 - 结构定义
├── config/            # 配置文件
├── routes.js          # 路由配置
└── index.js           # 主入口文件
```

## 环境变量

| 变量名 | 描述 | 默认值 |
| --- | --- | --- |
| `PORT` | 服务器端口 | 3001 |
| `NODE_ENV` | 环境模式 | development |
| `LOG_LEVEL` | 日志级别 | info |
| `OPENAI_API_KEY` | OpenAI API密钥 | - |
| `AI_MODEL` | AI模型名称 | gpt-4o |
| `AI_MAX_TOKENS` | 最大响应token数 | 2000 | 

IQE统一助手API服务是一个基于Express的RESTful API，为IQE智能质检系统提供统一的助手服务接口，支持质量检验、实验室测试和生产线相关的查询。

## 特点

- **模块化架构**：采用清晰的分层架构，包括控制器、服务和工具层
- **标准化响应**：所有API端点返回统一格式的JSON响应
- **完善的错误处理**：提供详细的错误信息和状态码
- **自动化文档**：集成Swagger UI提供交互式API文档
- **安全防护**：包含请求限流、安全头等保护措施
- **日志系统**：完整的请求和错误日志记录
- **会话管理**：支持会话上下文的维护和清理

## API端点

| 端点 | 方法 | 描述 |
| --- | --- | --- |
| `/api/assistant/query` | POST | 处理用户查询 |
| `/api/assistant/session/:sessionId` | DELETE | 清除会话上下文 |
| `/api/assistant/modes` | GET | 获取支持的助手模式 |
| `/health` 或 `/api/health` | GET | 服务健康检查 |
| `/api-docs` | GET | API文档 |

## 安装

```bash
# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑.env文件设置相关配置

# 启动开发服务器
npm run dev

# 启动生产服务器
npm start
```

## 使用示例

### 发送查询

```javascript
// 发送查询请求
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

### 清除会话

```javascript
// 清除会话上下文
const response = await fetch('http://localhost:3001/api/assistant/session/123456', {
  method: 'DELETE'
});

const result = await response.json();
console.log(result);
```

## 架构说明

```
src/
├── controllers/       # 控制器层 - 处理HTTP请求
├── services/          # 服务层 - 业务逻辑
├── middleware/        # 中间件 - 请求处理
├── utils/             # 工具类 - 通用功能
├── models/            # 数据模型 - 结构定义
├── config/            # 配置文件
├── routes.js          # 路由配置
└── index.js           # 主入口文件
```

## 环境变量

| 变量名 | 描述 | 默认值 |
| --- | --- | --- |
| `PORT` | 服务器端口 | 3001 |
| `NODE_ENV` | 环境模式 | development |
| `LOG_LEVEL` | 日志级别 | info |
| `OPENAI_API_KEY` | OpenAI API密钥 | - |
| `AI_MODEL` | AI模型名称 | gpt-4o |
| `AI_MAX_TOKENS` | 最大响应token数 | 2000 | 
 
 
 