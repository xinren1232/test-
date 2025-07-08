# IQE AI智能问答系统文档

## 📋 系统概述

IQE AI智能问答系统是基于多步骤AI工作流的智能质量管理助手，集成了DeepSeek AI、自然语言处理、数据分析和可视化功能，为质量管理提供智能化的问答和分析服务。

## 🏗️ 系统架构

### 核心组件架构
```
前端界面层 (Vue.js)
    ↓
API网关层 (Express.js)
    ↓
多步骤AI服务层 (OptimizedMultiStepAIService)
    ↓
数据处理层 (MySQL + 内存缓存)
    ↓
外部AI服务 (DeepSeek API)
```

### 8步AI工作流
1. **问题理解** - 自然语言解析和意图识别
2. **数据源识别** - 确定查询的数据表和字段
3. **数据查询** - 执行SQL查询获取相关数据
4. **数据汇总** - 聚合和预处理查询结果
5. **工具调用** - 调用图表生成等专业工具
6. **AI分析** - DeepSeek AI深度分析和洞察
7. **数据整理** - 格式化和结构化输出
8. **结果呈现** - 生成最终的用户友好响应

## 🤖 AI功能特性

### 智能问答能力
- **自然语言理解**: 支持中文问答，理解复杂查询意图
- **多维度分析**: 支持库存、测试、生产等多场景查询
- **实时数据**: 基于真实业务数据进行分析和回答
- **上下文记忆**: 支持多轮对话和上下文理解

### 数据分析功能
- **趋势分析**: 物料不良趋势、库存变化趋势
- **统计汇总**: 工厂统计、供应商分析、批次追踪
- **异常检测**: 识别数据异常和质量问题
- **可视化**: 自动生成图表和可视化报告

### 规则引擎
- **意图识别规则**: 基于关键词和模式匹配
- **参数提取规则**: 自动提取查询参数（工厂、物料、时间等）
- **数据映射规则**: 将自然语言映射到数据库查询
- **响应格式规则**: 标准化输出格式

## 🔧 技术实现

### 前端技术栈
- **Vue.js 3**: 响应式用户界面
- **Element Plus**: UI组件库
- **Chart.js/D3.js**: 数据可视化
- **Axios**: HTTP客户端

### 后端技术栈
- **Node.js + Express**: 服务器框架
- **MySQL**: 主数据库
- **Sequelize**: ORM框架
- **Winston**: 日志管理
- **DeepSeek API**: 外部AI服务

### AI服务集成
```javascript
// DeepSeek AI配置
const AI_CONFIG = {
  baseURL: 'https://api.deepseek.com',
  model: 'deepseek-chat',
  temperature: 0.7,
  max_tokens: 2000
}

// 多步骤AI服务核心类
class OptimizedMultiStepAIService {
  async processQuery(question) {
    const intent = await this.analyzeIntent(question);
    const dataSources = await this.identifyDataSources(intent);
    const queryResults = await this.executeQueries(dataSources);
    const summary = await this.summarizeData(queryResults);
    const tools = await this.callTools(summary);
    const analysis = await this.performAIAnalysis(summary, tools);
    const formatted = await this.formatResponse(analysis);
    return this.presentResults(formatted);
  }
}
```

## 📊 数据模型

### 核心数据表
1. **inventory** - 物料库存管理
   - 物料编号、名称、规格
   - 供应商信息、批次号
   - 库存数量、状态

2. **lab_tests** - 实验室测试数据
   - 测试项目、测试结果
   - 测试时间、测试人员
   - 合格状态、备注信息

3. **online_tracking** - 在线跟踪数据
   - 生产批次、工序信息
   - 质量参数、检测结果
   - 时间戳、操作员

4. **intent_rules** - 意图识别规则
   - 触发词、意图类型
   - 参数提取模式
   - 优先级、状态

## 🎯 功能模块

### 1. 智能问答模块
- **问题类型**: 支持查询、统计、分析、预测等多种问题类型
- **响应格式**: 文本回答 + 数据表格 + 图表可视化
- **交互方式**: 支持语音输入、文本输入、快捷问题

### 2. 数据分析模块
- **实时查询**: 基于最新数据进行分析
- **历史趋势**: 支持时间序列分析
- **对比分析**: 多维度数据对比
- **异常报告**: 自动识别和报告异常

### 3. 可视化模块
- **图表类型**: 柱状图、折线图、饼图、散点图
- **交互功能**: 缩放、筛选、钻取
- **导出功能**: 支持图片、PDF导出
- **自适应**: 响应式图表设计

### 4. 规则管理模块
- **规则配置**: 可视化规则编辑器
- **规则测试**: 实时规则验证
- **规则优化**: 基于使用情况优化规则
- **规则监控**: 规则执行效果监控

## 🚀 部署和运维

### 环境要求
- Node.js 16+
- MySQL 8.0+
- Redis (可选，用于缓存)
- DeepSeek API密钥

### 启动步骤
```bash
# 1. 安装依赖
npm install

# 2. 配置环境变量
cp .env.example .env

# 3. 初始化数据库
npm run setup-db

# 4. 启动后端服务
npm run start:backend

# 5. 启动前端服务
npm run start:frontend
```

### 配置说明
```javascript
// 主要配置项
const config = {
  database: {
    host: 'localhost',
    port: 3306,
    database: 'iqe_db',
    username: 'root',
    password: 'password'
  },
  ai: {
    provider: 'deepseek',
    apiKey: 'your-api-key',
    baseURL: 'https://api.deepseek.com'
  },
  server: {
    port: 3000,
    cors: true,
    rateLimit: 100
  }
}
```

## 📈 性能优化

### 查询优化
- **索引优化**: 为常用查询字段建立索引
- **查询缓存**: 缓存频繁查询结果
- **分页查询**: 大数据集分页处理
- **连接池**: 数据库连接池管理

### AI服务优化
- **请求缓存**: 缓存AI分析结果
- **批量处理**: 批量AI请求处理
- **超时控制**: 设置合理的超时时间
- **错误重试**: 智能重试机制

### 前端优化
- **懒加载**: 组件和数据懒加载
- **虚拟滚动**: 大列表虚拟滚动
- **图片优化**: 图片压缩和CDN
- **缓存策略**: 浏览器缓存优化

## 🔍 监控和日志

### 日志系统
- **访问日志**: 记录所有API访问
- **错误日志**: 详细错误信息和堆栈
- **性能日志**: 响应时间和资源使用
- **AI日志**: AI服务调用和响应

### 监控指标
- **响应时间**: API响应时间监控
- **成功率**: 请求成功率统计
- **并发数**: 同时在线用户数
- **资源使用**: CPU、内存、磁盘使用率

## 🛡️ 安全措施

### 数据安全
- **SQL注入防护**: 参数化查询
- **XSS防护**: 输入输出过滤
- **CSRF防护**: CSRF令牌验证
- **数据加密**: 敏感数据加密存储

### 访问控制
- **身份认证**: JWT令牌认证
- **权限控制**: 基于角色的访问控制
- **API限流**: 防止API滥用
- **审计日志**: 操作审计追踪

## 📚 使用指南

### 常用问题示例
1. **库存查询**: "深圳工厂有多少电阻器库存？"
2. **质量分析**: "最近一个月的不良品趋势如何？"
3. **供应商分析**: "哪个供应商的物料质量最好？"
4. **批次追踪**: "批次TK2024001的测试结果怎么样？"

### 高级功能
- **自定义查询**: 支持复杂的自定义查询语句
- **报告生成**: 自动生成质量分析报告
- **预警设置**: 设置质量预警阈值
- **数据导出**: 支持多种格式数据导出

## 🔄 版本更新

### v2.0 (当前版本)
- ✅ 多步骤AI工作流
- ✅ DeepSeek AI集成
- ✅ 真实数据支持
- ✅ 可视化图表
- ✅ 规则引擎优化

### v2.1 (计划中)
- 🔄 语音交互功能
- 🔄 移动端适配
- 🔄 更多AI模型支持
- 🔄 高级分析算法

## 📞 技术支持

如需技术支持或功能建议，请联系开发团队或查看项目文档。

---

*本文档最后更新时间: 2025年1月*
