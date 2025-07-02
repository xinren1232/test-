/**
 * 多步骤AI问答服务
 * 参考AssistGen项目架构设计，实现8步工作流：
 * 1. 问题理解 → 2. 数据源识别 → 3. 数据查询 → 4. 数据汇总 → 5. 工具调用 → 6. AI分析 → 7. 数据整理 → 8. 结果呈现
 */

import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';
import axios from 'axios';

const app = express();
app.use(cors());
app.use(express.json());

// 数据库连接配置
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

// DeepSeek API配置
const DEEPSEEK_API_KEY = 'sk-cab797574abf4288bcfaca253191565d';
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

/**
 * 步骤1: 问题理解与意图识别
 */
class IntentRecognizer {
  constructor() {
    this.intentPrompt = `你是IQE质量管理系统的意图识别专家。请分析用户问题并识别意图类型。

用户问题类型分类：

## general-query (一般查询)
- 简单的问候、闲聊
- 不需要查询数据库的基础问题
- 系统功能介绍等

## data-query (数据查询)  
- 需要查询库存、物料、测试数据的问题
- 包括：库存查询、物料信息、供应商信息、测试结果等
- 需要具体数据支撑的分析问题

## analysis-query (分析查询)
- 需要深度分析的复杂问题
- 趋势分析、对比分析、异常分析
- 需要结合多个数据源的综合分析

## system-query (系统查询)
- 关于系统功能、操作指导的问题
- 流程说明、规范解释等

请返回JSON格式：
{
  "intent": "意图类型",
  "confidence": 0.95,
  "reasoning": "识别理由",
  "keywords": ["关键词1", "关键词2"],
  "complexity": "low|medium|high"
}`;
  }

  async recognizeIntent(question) {
    try {
      const response = await axios.post(DEEPSEEK_API_URL, {
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: this.intentPrompt },
          { role: 'user', content: question }
        ],
        temperature: 0.1,
        response_format: { type: 'json_object' }
      }, {
        headers: {
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      return JSON.parse(response.data.choices[0].message.content);
    } catch (error) {
      console.error('意图识别失败:', error);
      return {
        intent: 'general-query',
        confidence: 0.5,
        reasoning: '意图识别失败，默认为一般查询',
        keywords: [],
        complexity: 'low'
      };
    }
  }
}

/**
 * 步骤2: 数据源识别与选择
 */
class DataSourceSelector {
  constructor() {
    this.dataSources = {
      inventory: {
        table: 'inventory',
        description: '库存数据：物料库存、存储位置、数量等',
        fields: ['material_code', 'material_name', 'quantity', 'storage_location', 'supplier']
      },
      materials: {
        table: 'materials',
        description: '物料主数据：物料基本信息、规格等',
        fields: ['material_code', 'material_name', 'category', 'specification', 'supplier']
      },
      test_results: {
        table: 'test_results',
        description: '测试结果：检测数据、合格率等',
        fields: ['material_code', 'test_type', 'result', 'test_date', 'inspector']
      }
    };
  }

  selectDataSource(intent, keywords) {
    const sources = [];
    
    // 根据关键词匹配数据源
    keywords.forEach(keyword => {
      if (['库存', '数量', '存储', '仓库'].some(k => keyword.includes(k))) {
        sources.push('inventory');
      }
      if (['物料', '材料', '供应商', '规格'].some(k => keyword.includes(k))) {
        sources.push('materials');
      }
      if (['测试', '检测', '合格', '不良', '质量'].some(k => keyword.includes(k))) {
        sources.push('test_results');
      }
    });

    // 去重并返回
    return [...new Set(sources)].map(source => this.dataSources[source]);
  }
}

/**
 * 步骤3: 查询模板生成器
 */
class QueryTemplateGenerator {
  generateTemplate(intent, dataSources, keywords) {
    const templates = [];
    
    dataSources.forEach(source => {
      let query = `SELECT * FROM ${source.table}`;
      const conditions = [];
      
      // 根据关键词生成WHERE条件
      keywords.forEach(keyword => {
        if (source.fields.includes('material_name')) {
          conditions.push(`material_name LIKE '%${keyword}%'`);
        }
        if (source.fields.includes('supplier')) {
          conditions.push(`supplier LIKE '%${keyword}%'`);
        }
      });
      
      if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(' OR ')}`;
      }
      
      query += ' LIMIT 10';
      
      templates.push({
        source: source.table,
        query: query,
        description: source.description
      });
    });
    
    return templates;
  }
}

/**
 * 步骤4: 数据执行器
 */
class DataExecutor {
  async executeQueries(templates) {
    const results = [];
    const connection = await mysql.createConnection(dbConfig);
    
    try {
      for (const template of templates) {
        try {
          const [rows] = await connection.execute(template.query);
          results.push({
            source: template.source,
            description: template.description,
            data: rows,
            count: rows.length
          });
        } catch (error) {
          console.error(`查询失败 ${template.source}:`, error);
          results.push({
            source: template.source,
            description: template.description,
            data: [],
            count: 0,
            error: error.message
          });
        }
      }
    } finally {
      await connection.end();
    }
    
    return results;
  }
}

/**
 * 步骤5: 工具调用系统
 */
class ToolCaller {
  constructor() {
    this.availableTools = {
      generateChart: this.generateChart.bind(this),
      calculateStats: this.calculateStats.bind(this),
      webSearch: this.webSearch.bind(this)
    };
  }

  async generateChart(data, chartType = 'bar') {
    // 图表生成逻辑
    return {
      type: 'chart',
      chartType: chartType,
      data: data,
      config: {
        title: '数据分析图表',
        xAxis: 'category',
        yAxis: 'value'
      }
    };
  }

  async calculateStats(data) {
    // 统计计算逻辑
    const stats = {
      total: data.length,
      summary: '数据统计摘要'
    };
    return stats;
  }

  async webSearch(query) {
    // 网络搜索逻辑（后续实现）
    return {
      type: 'search',
      query: query,
      results: []
    };
  }

  async callTool(toolName, params) {
    if (this.availableTools[toolName]) {
      return await this.availableTools[toolName](params);
    }
    return null;
  }
}

/**
 * 步骤6: AI分析器
 */
class AIAnalyzer {
  constructor() {
    this.analysisPrompt = `你是IQE质量管理系统的资深AI分析专家。请基于查询数据提供专业分析。

分析要求：
1. 数据解读：解释数据的含义和趋势
2. 质量评估：从质量管理角度评估现状
3. 问题识别：识别潜在的质量风险或异常
4. 改进建议：提供具体的改进措施
5. 行动计划：给出可执行的下一步建议

请返回结构化的分析结果。`;
  }

  async analyzeData(question, queryResults, toolResults) {
    try {
      const analysisContext = {
        question: question,
        dataResults: queryResults,
        toolResults: toolResults
      };

      const response = await axios.post(DEEPSEEK_API_URL, {
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: this.analysisPrompt },
          { role: 'user', content: JSON.stringify(analysisContext) }
        ],
        temperature: 0.3
      }, {
        headers: {
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('AI分析失败:', error);
      return '分析过程中出现错误，请稍后重试。';
    }
  }
}

/**
 * 主要的多步骤AI服务类
 */
class MultiStepAIService {
  constructor() {
    this.intentRecognizer = new IntentRecognizer();
    this.dataSourceSelector = new DataSourceSelector();
    this.queryGenerator = new QueryTemplateGenerator();
    this.dataExecutor = new DataExecutor();
    this.toolCaller = new ToolCaller();
    this.aiAnalyzer = new AIAnalyzer();
  }

  async processQuery(question) {
    const workflow = {
      steps: [],
      startTime: new Date(),
      question: question
    };

    try {
      // 步骤1: 问题理解
      workflow.steps.push({ step: 1, name: '问题理解', status: 'processing', startTime: new Date() });
      const intentResult = await this.intentRecognizer.recognizeIntent(question);
      workflow.steps[0].status = 'completed';
      workflow.steps[0].result = intentResult;
      workflow.steps[0].endTime = new Date();

      // 步骤2: 数据源识别
      workflow.steps.push({ step: 2, name: '数据源识别', status: 'processing', startTime: new Date() });
      const dataSources = this.dataSourceSelector.selectDataSource(intentResult.intent, intentResult.keywords);
      workflow.steps[1].status = 'completed';
      workflow.steps[1].result = dataSources;
      workflow.steps[1].endTime = new Date();

      // 步骤3: 数据查询
      workflow.steps.push({ step: 3, name: '数据查询', status: 'processing', startTime: new Date() });
      const queryTemplates = this.queryGenerator.generateTemplate(intentResult.intent, dataSources, intentResult.keywords);
      const queryResults = await this.dataExecutor.executeQueries(queryTemplates);
      workflow.steps[2].status = 'completed';
      workflow.steps[2].result = { templates: queryTemplates, results: queryResults };
      workflow.steps[2].endTime = new Date();

      // 步骤4: 数据汇总
      workflow.steps.push({ step: 4, name: '数据汇总', status: 'processing', startTime: new Date() });
      const summaryData = this.summarizeResults(queryResults);
      workflow.steps[3].status = 'completed';
      workflow.steps[3].result = summaryData;
      workflow.steps[3].endTime = new Date();

      // 步骤5: 工具调用
      workflow.steps.push({ step: 5, name: '工具调用', status: 'processing', startTime: new Date() });
      const toolResults = await this.callRelevantTools(intentResult, queryResults);
      workflow.steps[4].status = 'completed';
      workflow.steps[4].result = toolResults;
      workflow.steps[4].endTime = new Date();

      // 步骤6: AI分析
      workflow.steps.push({ step: 6, name: 'AI分析', status: 'processing', startTime: new Date() });
      const analysis = await this.aiAnalyzer.analyzeData(question, queryResults, toolResults);
      workflow.steps[5].status = 'completed';
      workflow.steps[5].result = analysis;
      workflow.steps[5].endTime = new Date();

      // 步骤7: 数据整理
      workflow.steps.push({ step: 7, name: '数据整理', status: 'processing', startTime: new Date() });
      const organizedData = this.organizeResults(queryResults, toolResults, analysis);
      workflow.steps[6].status = 'completed';
      workflow.steps[6].result = organizedData;
      workflow.steps[6].endTime = new Date();

      // 步骤8: 结果呈现
      workflow.steps.push({ step: 8, name: '结果呈现', status: 'processing', startTime: new Date() });
      const finalResult = this.formatFinalResult(question, workflow, organizedData, analysis);
      workflow.steps[7].status = 'completed';
      workflow.steps[7].result = finalResult;
      workflow.steps[7].endTime = new Date();

      workflow.endTime = new Date();
      workflow.totalTime = workflow.endTime - workflow.startTime;
      workflow.status = 'completed';

      return {
        success: true,
        workflow: workflow,
        result: finalResult
      };

    } catch (error) {
      console.error('多步骤AI处理失败:', error);
      workflow.status = 'failed';
      workflow.error = error.message;
      workflow.endTime = new Date();

      return {
        success: false,
        workflow: workflow,
        error: error.message
      };
    }
  }

  summarizeResults(queryResults) {
    return {
      totalSources: queryResults.length,
      totalRecords: queryResults.reduce((sum, result) => sum + result.count, 0),
      sources: queryResults.map(result => ({
        name: result.source,
        count: result.count,
        hasData: result.count > 0
      }))
    };
  }

  async callRelevantTools(intentResult, queryResults) {
    const tools = [];
    
    // 根据意图和数据决定调用哪些工具
    if (intentResult.intent === 'analysis-query' && queryResults.some(r => r.count > 0)) {
      const chartTool = await this.toolCaller.callTool('generateChart', queryResults);
      if (chartTool) tools.push(chartTool);
      
      const statsTool = await this.toolCaller.callTool('calculateStats', queryResults);
      if (statsTool) tools.push(statsTool);
    }
    
    return tools;
  }

  organizeResults(queryResults, toolResults, analysis) {
    return {
      data: queryResults,
      tools: toolResults,
      analysis: analysis,
      metadata: {
        processedAt: new Date(),
        dataQuality: this.assessDataQuality(queryResults)
      }
    };
  }

  assessDataQuality(queryResults) {
    const totalSources = queryResults.length;
    const sourcesWithData = queryResults.filter(r => r.count > 0).length;
    const quality = sourcesWithData / totalSources;
    
    if (quality >= 0.8) return 'high';
    if (quality >= 0.5) return 'medium';
    return 'low';
  }

  formatFinalResult(question, workflow, organizedData, analysis) {
    return {
      question: question,
      answer: analysis,
      data: organizedData.data,
      tools: organizedData.tools,
      workflow: workflow,
      metadata: {
        processedAt: new Date(),
        totalTime: workflow.totalTime,
        dataQuality: organizedData.metadata.dataQuality,
        confidence: this.calculateConfidence(workflow)
      }
    };
  }

  calculateConfidence(workflow) {
    const completedSteps = workflow.steps.filter(s => s.status === 'completed').length;
    const totalSteps = workflow.steps.length;
    return completedSteps / totalSteps;
  }
}

// API路由
const multiStepService = new MultiStepAIService();

app.post('/api/multi-step-query', async (req, res) => {
  try {
    console.log('📥 收到查询请求:', req.body);
    const { question } = req.body;

    if (!question) {
      console.log('❌ 问题为空');
      return res.status(400).json({ error: '问题不能为空' });
    }

    console.log('🔄 开始处理查询:', question);
    const result = await multiStepService.processQuery(question);
    console.log('✅ 查询处理完成:', result.success ? '成功' : '失败');
    res.json(result);
  } catch (error) {
    console.error('❌ API错误:', error);
    res.status(500).json({
      error: '服务器内部错误',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'multi-step-ai-service' });
});

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
  console.log(`🚀 多步骤AI问答服务启动在端口 ${PORT}`);
  console.log(`📊 健康检查: http://localhost:${PORT}/api/health`);
  console.log(`🤖 API端点: http://localhost:${PORT}/api/multi-step-query`);
});

export { MultiStepAIService };
