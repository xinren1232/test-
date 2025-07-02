# IQE质量智能助手 - AI增强架构设计

## 🎯 设计理念

基于您的DeepSeek集成经验和MCP（Model Context Protocol）思路，设计一个**AI自主思考 + 数据查询代理**的增强架构：

- **基础层**：现有的问答规则体系（数据获取）
- **AI层**：DeepSeek驱动的复杂分析（智能思考）
- **代理层**：AI自主调用基础查询的桥梁（MCP机制）

## 🏗️ 系统架构

```
用户复杂问题
    ↓
AI思维链分析 (DeepSeek)
    ↓
自主分解子问题
    ↓
数据查询代理 (MCP-like)
    ↓
调用基础问答规则
    ↓
获取结构化数据
    ↓
AI综合分析 (流式输出)
    ↓
最终智能回答
```

## 📊 核心组件设计

### 1. AI思维链分析器 (AIReasoningEngine)

```javascript
class AIReasoningEngine {
  constructor(deepseekApiKey) {
    this.apiKey = deepseekApiKey;
    this.baseUrl = "https://api.deepseek.com/v1";
  }

  async analyzeQuery(userQuery) {
    // 1. AI分析用户问题
    const analysis = await this.getQueryAnalysis(userQuery);
    
    // 2. 分解为子查询
    const subQueries = await this.decomposeQuery(analysis);
    
    // 3. 生成查询计划
    const queryPlan = await this.generateQueryPlan(subQueries);
    
    return queryPlan;
  }

  async getQueryAnalysis(query) {
    const prompt = `
    作为IQE质量智能助手，分析以下用户问题：
    "${query}"
    
    请分析：
    1. 问题类型（基础查询/状态分析/复杂汇总/跨场景关联）
    2. 涉及的数据维度（库存/生产/测试）
    3. 需要的分析深度
    4. 预期输出格式
    
    以JSON格式返回分析结果。
    `;
    
    return await this.callDeepSeek(prompt);
  }
}
```

### 2. 数据查询代理 (DataQueryAgent)

```javascript
class DataQueryAgent {
  constructor(realDataService) {
    this.realDataService = realDataService;
    this.availableTools = this.initializeTools();
  }

  initializeTools() {
    return {
      // 基础查询工具
      queryInventory: {
        name: "查询库存数据",
        description: "根据条件查询库存信息",
        parameters: ["factory", "supplier", "materialName", "status", "batchNo"]
      },
      queryProduction: {
        name: "查询生产数据", 
        description: "根据条件查询生产记录",
        parameters: ["factory", "projectId", "baseline", "defectRate", "defect"]
      },
      queryInspection: {
        name: "查询测试数据",
        description: "根据条件查询测试记录", 
        parameters: ["testResult", "testDate", "projectId", "baseline"]
      },
      
      // 汇总分析工具
      summarizeByFactory: {
        name: "工厂数据汇总",
        description: "按工厂汇总统计数据"
      },
      summarizeBySupplier: {
        name: "供应商数据汇总", 
        description: "按供应商汇总统计数据"
      },
      
      // 追溯分析工具
      traceBatch: {
        name: "批次全链路追溯",
        description: "追溯批次在库存-生产-测试的完整链路",
        parameters: ["batchNo"]
      }
    };
  }

  async executeQuery(toolName, parameters) {
    switch(toolName) {
      case 'queryInventory':
        return await this.realDataService.queryInventory(parameters);
      case 'queryProduction':
        return await this.realDataService.queryProduction(parameters);
      case 'queryInspection':
        return await this.realDataService.queryInspection(parameters);
      case 'summarizeByFactory':
        return await this.realDataService.generateFactorySummary();
      case 'summarizeBySupplier':
        return await this.realDataService.generateSupplierSummary();
      case 'traceBatch':
        return await this.realDataService.traceBatch(parameters.batchNo);
      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
  }
}
```

### 3. AI增强服务 (AIEnhancedService)

```javascript
class AIEnhancedService {
  constructor(deepseekApiKey) {
    this.reasoningEngine = new AIReasoningEngine(deepseekApiKey);
    this.queryAgent = new DataQueryAgent(realDataAssistantService);
    this.streamingEnabled = true;
  }

  async processComplexQuery(userQuery) {
    try {
      // 1. AI分析问题
      const analysis = await this.reasoningEngine.analyzeQuery(userQuery);
      
      // 2. 生成查询计划
      const queryPlan = analysis.queryPlan;
      
      // 3. 执行数据查询
      const queryResults = await this.executeQueryPlan(queryPlan);
      
      // 4. AI综合分析（流式输出）
      return await this.generateStreamingAnalysis(userQuery, queryResults);
      
    } catch (error) {
      console.error('AI增强处理失败:', error);
      // 降级到基础规则处理
      return await this.fallbackToRules(userQuery);
    }
  }

  async executeQueryPlan(queryPlan) {
    const results = {};
    
    for (const step of queryPlan.steps) {
      const toolName = step.tool;
      const parameters = step.parameters;
      
      try {
        results[step.id] = await this.queryAgent.executeQuery(toolName, parameters);
      } catch (error) {
        console.error(`查询步骤失败: ${step.id}`, error);
        results[step.id] = { error: error.message };
      }
    }
    
    return results;
  }

  async generateStreamingAnalysis(userQuery, queryResults) {
    const prompt = this.buildAnalysisPrompt(userQuery, queryResults);
    
    return await this.reasoningEngine.getStreamingResponse(prompt);
  }
}
```

## 🔄 工作流程详解

### 阶段1: 问题理解与分解
```
用户问题: "分析深圳工厂OLED显示屏的整体质量状况，包括库存风险、生产质量和测试表现"

AI分析:
{
  "problemType": "复杂质量分析",
  "dimensions": ["inventory", "production", "inspection"],
  "scope": {
    "factory": "深圳工厂",
    "material": "OLED显示屏"
  },
  "analysisDepth": "comprehensive",
  "queryPlan": {
    "steps": [
      {
        "id": "step1",
        "tool": "queryInventory", 
        "parameters": {"factory": "深圳工厂", "materialName": "OLED显示屏"},
        "purpose": "获取库存状态"
      },
      {
        "id": "step2",
        "tool": "queryProduction",
        "parameters": {"factory": "深圳工厂", "materialName": "OLED显示屏"},
        "purpose": "获取生产质量数据"
      },
      {
        "id": "step3", 
        "tool": "queryInspection",
        "parameters": {"materialName": "OLED显示屏"},
        "purpose": "获取测试表现数据"
      }
    ]
  }
}
```

### 阶段2: 数据查询执行
```
执行查询计划:
step1 → 库存数据: [状态分布、数量统计、到期风险]
step2 → 生产数据: [不良率趋势、缺陷类型、产量统计]  
step3 → 测试数据: [通过率、失败原因、质量趋势]
```

### 阶段3: AI流式分析
```
基于查询结果，AI进行流式分析输出:

🔍 深圳工厂OLED显示屏质量状况分析

📊 **库存状况评估**
根据查询数据显示，深圳工厂OLED显示屏库存总量500件，其中...
[实时流式输出分析过程]

🏭 **生产质量分析** 
生产数据表明，该物料平均不良率为0.5%，处于优秀水平...
[继续流式分析]

🧪 **测试表现评估**
测试结果显示100%通过率，质量稳定性良好...
[继续流式分析]

💡 **综合评估与建议**
综合三个维度的数据分析，OLED显示屏整体质量状况为优秀级别...
[最终结论和建议]
```

## 🚀 技术实现要点

### 1. DeepSeek API集成
```javascript
async callDeepSeek(prompt, streaming = false) {
  const response = await fetch(`${this.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [{ role: "user", content: prompt }],
      stream: streaming,
      temperature: 0.7,
      max_tokens: 2048
    })
  });
  
  if (streaming) {
    return this.handleStreamingResponse(response);
  } else {
    return await response.json();
  }
}
```

### 2. 流式响应处理
```javascript
async handleStreamingResponse(response) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  
  return new ReadableStream({
    start(controller) {
      function pump() {
        return reader.read().then(({ done, value }) => {
          if (done) {
            controller.close();
            return;
          }
          
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data !== '[DONE]') {
                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices[0]?.delta?.content;
                  if (content) {
                    controller.enqueue(content);
                  }
                } catch (e) {
                  console.error('解析流式数据失败:', e);
                }
              }
            }
          }
          
          return pump();
        });
      }
      
      return pump();
    }
  });
}
```

## 🎯 优势与特点

### 1. 智能化程度高
- AI自主理解复杂问题
- 自动分解查询计划
- 智能数据关联分析

### 2. 保持系统稳定性
- 基础查询仍使用现有规则
- AI增强不影响基础功能
- 降级机制保证可用性

### 3. 用户体验优秀
- 流式输出提供实时反馈
- 思维过程透明可见
- 分析结果深入专业

### 4. 扩展性强
- 易于添加新的查询工具
- 支持更复杂的分析场景
- 可持续优化AI提示词

这个架构将您现有的稳定基础与AI的强大分析能力完美结合，实现了真正的智能化质量助手！
