# IQE智能质检系统

IQE智能质检系统是一个集成了质量检验、实验室测试和生产线监控的智能助手系统，提供直观的用户界面和强大的API接口供外部系统集成。

## 系统架构

系统采用前后端分离架构，由以下主要部分组成：

1. **前端应用**（`ai-inspection-dashboard/`）：基于Vue.js的单页面应用，提供用户界面
2. **后端API服务**（`backend/`）：基于Express的REST API服务，提供统一助手API

## 功能特点

- **统一助手界面**：集成质量检验、实验室测试和生产线监控三大领域
- **智能识别**：自动识别用户问题类型，选择合适的助手模式
- **上下文感知**：保持对话上下文，提供连贯的交互体验
- **API集成**：提供RESTful API接口，便于外部系统集成
- **数据可视化**：直观展示质量数据和异常信息

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

## API接口文档

API文档可通过访问 http://localhost:3001/api-docs 获取。

主要API端点：

- `POST /api/assistant/query` - 处理用户查询
- `DELETE /api/assistant/session/:sessionId` - 清除会话上下文
- `GET /api/assistant/modes` - 获取支持的助手模式
- `GET /health` - 服务健康检查

## 目录结构

```
IQE智能质检系统/
├── ai-inspection-dashboard/  # 前端应用
│   ├── src/
│   │   ├── components/       # Vue组件
│   │   ├── services/         # 服务层
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
└── README.md
```

## 主要技术栈

### 前端
- Vue.js
- Element Plus
- Axios
- Echarts

### 后端
- Node.js
- Express
- Winston (日志)
- Joi (数据验证)

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

## 许可证

[内部使用] - 仅供授权用户使用 
1. 克隆仓库：
   ```
   git clone https://github.com/your-username/iqe-inspection-system.git
   cd iqe-inspection-system
   ```

2. 运行部署脚本：
   ```
   deploy.bat
   ```
   此脚本将：
   - 创建MySQL数据库和用户
   - 导入数据库结构
   - 安装API服务依赖
   - 安装前端依赖
   - 创建环境变量文件

3. 启动系统：
   ```
   start.bat
   ```
   此脚本将：
   - 启动API服务
   - 启动前端应用

4. 打开浏览器访问：
   ```
   http://localhost:5173
   ```

### 手动部署

如果部署脚本不适用于您的环境，您也可以按照以下步骤手动部署：

#### 1. 创建数据库

```sql
CREATE DATABASE iqe_inspection CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'iqe_user'@'localhost' IDENTIFIED BY 'iqe_password';
GRANT ALL PRIVILEGES ON iqe_inspection.* TO 'iqe_user'@'localhost';
FLUSH PRIVILEGES;
```

然后导入数据库结构：

```
mysql -u root -p iqe_inspection < db-schema.sql
```

#### 2. 配置API服务

```
cd api-service
npm install
```

创建`.env`文件：

```
DB_HOST=localhost
DB_USER=iqe_user
DB_PASS=iqe_password
DB_NAME=iqe_inspection
PORT=3000
NODE_ENV=development
```

#### 3. 配置前端

```
cd ai-inspection-dashboard
npm install
```

创建`.env.local`文件：

```
VITE_API_BASE_URL=http://localhost:3000/api
```

#### 4. 启动服务

启动API服务：

```
cd api-service
npm run dev
```

启动前端：

```
cd ai-inspection-dashboard
npm run dev
```

## 使用指南

### 登录系统

系统默认用户：
- 用户名：admin
- 密码：admin

### 主要功能

1. **库存管理**：查看和管理物料库存，包括库存预警、过期预警等
2. **实验室**：管理和分析实验室测试数据，包括测试结果分析、批次质量评分等
3. **质量管理**：监控生产线状态，处理质量问题，进行根本原因分析等
4. **AI助手**：通过自然语言与系统交互，执行命令或获取信息

### AI助手命令示例

- 冻结批次：`冻结物料M1001批次B2023001，原因是外观不良`
- 释放批次：`释放物料M1001批次B2023001，原因是复检合格`
- 查询库存：`查询物料M1001的库存情况`
- 查询测试结果：`查看物料M1001批次B2023001的测试结果`
- 创建质量问题：`创建物料M1001批次B2023001的质量问题，类型是外观不良，严重程度为中等`

## 开发指南

### 目录结构

```
iqe-inspection-system/
├── api-service/              # 后端API服务
│   ├── src/
│   │   ├── config/           # 配置文件
│   │   ├── controllers/      # 控制器
│   │   ├── models/           # 数据模型
│   │   ├── routes/           # 路由
│   │   ├── services/         # 服务
│   │   ├── middleware/       # 中间件
│   │   ├── utils/            # 工具函数
│   │   └── server.js         # 服务器入口
│   └── package.json          # 依赖配置
├── ai-inspection-dashboard/  # 前端应用
│   ├── src/
│   │   ├── assets/           # 静态资源
│   │   ├── components/       # 组件
│   │   ├── config/           # 配置
│   │   ├── pages/            # 页面
│   │   ├── plugins/          # 插件
│   │   ├── router.js         # 路由
│   │   ├── services/         # 服务
│   │   ├── stores/           # 状态管理
│   │   └── main.js           # 入口文件
│   └── package.json          # 依赖配置
├── db-schema.sql             # 数据库结构
├── deploy.bat                # 部署脚本
├── start.bat                 # 启动脚本
└── README.md                 # 说明文档
```

### 扩展开发

#### 添加新页面

1. 在`ai-inspection-dashboard/src/pages`中创建新的Vue组件
2. 在`ai-inspection-dashboard/src/router.js`中添加路由
3. 如果需要，在`ai-inspection-dashboard/src/stores`中添加状态管理

#### 添加新API端点

1. 在`api-service/src/models`中添加数据模型
2. 在`api-service/src/controllers`中添加控制器
3. 在`api-service/src/routes`中添加路由
4. 在`api-service/src/services`中添加服务逻辑

#### 添加新AI功能

1. 在`ai-inspection-dashboard/src/services/ai`中添加新的AI服务类
2. 在`ai-inspection-dashboard/src/plugins/ai.js`中注册新服务
3. 如果需要，在`ai-inspection-dashboard/src/services/ai/AICommandProcessor.js`中添加新命令处理逻辑

## 贡献指南

欢迎贡献代码、报告问题或提出改进建议。请遵循以下步骤：

1. Fork仓库
2. 创建功能分支：`git checkout -b feature/your-feature-name`
3. 提交更改：`git commit -m 'Add some feature'`
4. 推送到分支：`git push origin feature/your-feature-name`
5. 提交Pull Request

## 许可证

本项目采用MIT许可证。详见[LICENSE](LICENSE)文件。 
1. 克隆仓库：
   ```
   git clone https://github.com/your-username/iqe-inspection-system.git
   cd iqe-inspection-system
   ```

2. 运行部署脚本：
   ```
   deploy.bat
   ```
   此脚本将：
   - 创建MySQL数据库和用户
   - 导入数据库结构
   - 安装API服务依赖
   - 安装前端依赖
   - 创建环境变量文件

3. 启动系统：
   ```
   start.bat
   ```
   此脚本将：
   - 启动API服务
   - 启动前端应用

4. 打开浏览器访问：
   ```
   http://localhost:5173
   ```

### 手动部署

如果部署脚本不适用于您的环境，您也可以按照以下步骤手动部署：

#### 1. 创建数据库

```sql
CREATE DATABASE iqe_inspection CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'iqe_user'@'localhost' IDENTIFIED BY 'iqe_password';
GRANT ALL PRIVILEGES ON iqe_inspection.* TO 'iqe_user'@'localhost';
FLUSH PRIVILEGES;
```

然后导入数据库结构：

```
mysql -u root -p iqe_inspection < db-schema.sql
```

#### 2. 配置API服务

```
cd api-service
npm install
```

创建`.env`文件：

```
DB_HOST=localhost
DB_USER=iqe_user
DB_PASS=iqe_password
DB_NAME=iqe_inspection
PORT=3000
NODE_ENV=development
```

#### 3. 配置前端

```
cd ai-inspection-dashboard
npm install
```

创建`.env.local`文件：

```
VITE_API_BASE_URL=http://localhost:3000/api
```

#### 4. 启动服务

启动API服务：

```
cd api-service
npm run dev
```

启动前端：

```
cd ai-inspection-dashboard
npm run dev
```

## 使用指南

### 登录系统

系统默认用户：
- 用户名：admin
- 密码：admin

### 主要功能

1. **库存管理**：查看和管理物料库存，包括库存预警、过期预警等
2. **实验室**：管理和分析实验室测试数据，包括测试结果分析、批次质量评分等
3. **质量管理**：监控生产线状态，处理质量问题，进行根本原因分析等
4. **AI助手**：通过自然语言与系统交互，执行命令或获取信息

### AI助手命令示例

- 冻结批次：`冻结物料M1001批次B2023001，原因是外观不良`
- 释放批次：`释放物料M1001批次B2023001，原因是复检合格`
- 查询库存：`查询物料M1001的库存情况`
- 查询测试结果：`查看物料M1001批次B2023001的测试结果`
- 创建质量问题：`创建物料M1001批次B2023001的质量问题，类型是外观不良，严重程度为中等`

## 开发指南

### 目录结构

```
iqe-inspection-system/
├── api-service/              # 后端API服务
│   ├── src/
│   │   ├── config/           # 配置文件
│   │   ├── controllers/      # 控制器
│   │   ├── models/           # 数据模型
│   │   ├── routes/           # 路由
│   │   ├── services/         # 服务
│   │   ├── middleware/       # 中间件
│   │   ├── utils/            # 工具函数
│   │   └── server.js         # 服务器入口
│   └── package.json          # 依赖配置
├── ai-inspection-dashboard/  # 前端应用
│   ├── src/
│   │   ├── assets/           # 静态资源
│   │   ├── components/       # 组件
│   │   ├── config/           # 配置
│   │   ├── pages/            # 页面
│   │   ├── plugins/          # 插件
│   │   ├── router.js         # 路由
│   │   ├── services/         # 服务
│   │   ├── stores/           # 状态管理
│   │   └── main.js           # 入口文件
│   └── package.json          # 依赖配置
├── db-schema.sql             # 数据库结构
├── deploy.bat                # 部署脚本
├── start.bat                 # 启动脚本
└── README.md                 # 说明文档
```

### 扩展开发

#### 添加新页面

1. 在`ai-inspection-dashboard/src/pages`中创建新的Vue组件
2. 在`ai-inspection-dashboard/src/router.js`中添加路由
3. 如果需要，在`ai-inspection-dashboard/src/stores`中添加状态管理

#### 添加新API端点

1. 在`api-service/src/models`中添加数据模型
2. 在`api-service/src/controllers`中添加控制器
3. 在`api-service/src/routes`中添加路由
4. 在`api-service/src/services`中添加服务逻辑

#### 添加新AI功能

1. 在`ai-inspection-dashboard/src/services/ai`中添加新的AI服务类
2. 在`ai-inspection-dashboard/src/plugins/ai.js`中注册新服务
3. 如果需要，在`ai-inspection-dashboard/src/services/ai/AICommandProcessor.js`中添加新命令处理逻辑

## 贡献指南

欢迎贡献代码、报告问题或提出改进建议。请遵循以下步骤：

1. Fork仓库
2. 创建功能分支：`git checkout -b feature/your-feature-name`
3. 提交更改：`git commit -m 'Add some feature'`
4. 推送到分支：`git push origin feature/your-feature-name`
5. 提交Pull Request

## 许可证

本项目采用MIT许可证。详见[LICENSE](LICENSE)文件。 