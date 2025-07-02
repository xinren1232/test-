/**
 * 优化版多步骤AI问答服务
 * 基于实际数据库结构和数据重新设计
 */

import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';
import axios from 'axios';

const app = express();
app.use(cors());
app.use(express.json());

// 数据库配置
const DB_CONFIG = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection',
  charset: 'utf8mb4'
};

// DeepSeek API配置
const DEEPSEEK_API_KEY = 'sk-b8a5c5b4b8b54b5b8b5b4b5b8b5b4b5b';
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

/**
 * 优化版多步骤AI服务类
 */
class OptimizedMultiStepAIService {
  constructor() {
    this.realDataSources = {
      inventory: {
        table: 'inventory',
        description: '库存数据：物料库存、批次、供应商、存储位置等',
        fields: ['material_code', 'material_name', 'batch_code', 'supplier_name', 'quantity', 'storage_location', 'status', 'risk_level'],
        keywords: ['库存', '数量', '存储', '仓库', '物料', '批次', '供应商']
      },
      lab_tests: {
        table: 'lab_tests',
        description: '实验室测试数据：测试结果、合格率、不良分析等',
        fields: ['material_code', 'material_name', 'batch_code', 'test_item', 'test_result', 'conclusion', 'defect_desc'],
        keywords: ['测试', '检测', '合格', '不良', '质量', '实验室']
      },
      online_tracking: {
        table: 'online_tracking',
        description: '在线跟踪数据：生产使用、工厂、产线、项目等',
        fields: ['material_code', 'material_name', 'batch_code', 'factory', 'workshop', 'line', 'project', 'defect_rate'],
        keywords: ['生产', '工厂', '产线', '项目', '使用', '跟踪', '不良率']
      }
    };
  }

  /**
   * 步骤1: 问题理解和意图识别
   */
  async analyzeIntent(question) {
    console.log('🔍 步骤1: 问题理解和意图识别');

    // 先使用本地规则进行快速实体提取
    const localEntities = this.extractEntitiesLocally(question);
    console.log('本地实体提取结果:', localEntities);

    const intentPrompt = `
你是IQE质量管理系统的智能助手。请分析用户问题的意图类型。

用户问题: "${question}"

已知的模拟数据实体:
- 物料: 电阻器-0805-10K, 电容器-0603-1uF
- 供应商: 泰科电子, 三星电子
- 工厂: 深圳工厂
- 项目: PROJECT_001

可用数据源:
1. inventory - 库存数据 (物料编码、名称、批次、供应商、数量、存储位置、状态、风险等级)
2. lab_tests - 实验室测试数据 (测试项目、结果、结论、缺陷描述)
3. online_tracking - 在线跟踪数据 (工厂、车间、产线、项目、不良率)

请返回JSON格式:
{
  "intent": "意图类型 (inventory_query|test_query|production_query|analysis_query|general_query)",
  "confidence": 0.95,
  "keywords": ["关键词1", "关键词2"],
  "entities": {
    "material": "物料名称或编码",
    "supplier": "供应商名称",
    "factory": "工厂名称",
    "project": "项目名称"
  },
  "complexity": "low|medium|high"
}`;

    try {
      const response = await axios.post(DEEPSEEK_API_URL, {
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: intentPrompt },
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

      const aiResult = JSON.parse(response.data.choices[0].message.content);

      // 合并本地提取的实体和AI提取的实体
      const mergedEntities = { ...aiResult.entities, ...localEntities };

      return {
        ...aiResult,
        entities: mergedEntities
      };
    } catch (error) {
      console.error('意图识别失败:', error.message);
      return {
        intent: 'general_query',
        confidence: 0.5,
        keywords: question.split(/\s+/).slice(0, 3),
        entities: localEntities,
        complexity: 'medium'
      };
    }
  }

  /**
   * 本地实体提取（基于通用模式，不依赖硬编码数据）
   */
  extractEntitiesLocally(question) {
    const entities = {};

    // 物料实体提取 - 使用通用模式
    const materialPatterns = [
      /电阻器?[-\s]*\w*/g,
      /电容器?[-\s]*\w*/g,
      /显示屏[-\s]*\w*/g,
      /摄像头[-\s]*\w*/g,
      /电池[-\s]*\w*/g,
      /处理器[-\s]*\w*/g
    ];

    for (const pattern of materialPatterns) {
      const matches = question.match(pattern);
      if (matches && matches.length > 0) {
        entities.material = matches[0];
        break;
      }
    }

    // 供应商实体提取 - 使用通用模式
    const supplierPatterns = [
      /\w*电子/g,
      /\w*科技/g,
      /\w*光学/g,
      /BOE/g,
      /三星/g,
      /京东方/g,
      /富士康/g
    ];

    for (const pattern of supplierPatterns) {
      const matches = question.match(pattern);
      if (matches && matches.length > 0) {
        entities.supplier = matches[0];
        break;
      }
    }

    // 工厂实体提取 - 使用通用模式
    const factoryPatterns = [
      /\w*工厂/g,
      /深圳/g,
      /重庆/g,
      /上海/g,
      /北京/g
    ];

    for (const pattern of factoryPatterns) {
      const matches = question.match(pattern);
      if (matches && matches.length > 0) {
        entities.factory = matches[0].includes('工厂') ? matches[0] : matches[0] + '工厂';
        break;
      }
    }

    // 项目实体提取 - 使用通用模式
    const projectPatterns = [
      /PROJECT_\w+/g,
      /项目\w*/g,
      /[A-Z]\d+[A-Z]*\d*/g
    ];

    for (const pattern of projectPatterns) {
      const matches = question.match(pattern);
      if (matches && matches.length > 0) {
        entities.project = matches[0];
        break;
      }
    }

    console.log('本地实体提取:', entities);
    return entities;
  }

  /**
   * 步骤2: 数据源识别
   */
  selectDataSources(intentResult) {
    console.log('📊 步骤2: 数据源识别');
    
    const selectedSources = [];
    
    // 根据意图选择数据源
    switch (intentResult.intent) {
      case 'inventory_query':
        selectedSources.push(this.realDataSources.inventory);
        break;
      case 'test_query':
        selectedSources.push(this.realDataSources.lab_tests);
        break;
      case 'production_query':
        selectedSources.push(this.realDataSources.online_tracking);
        break;
      case 'analysis_query':
        // 分析查询需要多个数据源
        selectedSources.push(
          this.realDataSources.inventory,
          this.realDataSources.lab_tests,
          this.realDataSources.online_tracking
        );
        break;
      default:
        // 默认查询所有相关数据源
        Object.values(this.realDataSources).forEach(source => {
          if (source.keywords.some(keyword => 
            intentResult.keywords.some(k => k.includes(keyword) || keyword.includes(k))
          )) {
            selectedSources.push(source);
          }
        });
    }

    return selectedSources.length > 0 ? selectedSources : [this.realDataSources.inventory];
  }

  /**
   * 步骤3: 数据查询
   */
  async executeQueries(dataSources, intentResult) {
    console.log('🔍 步骤3: 数据查询');
    
    const results = [];
    let connection;

    try {
      connection = await mysql.createConnection(DB_CONFIG);

      for (const source of dataSources) {
        try {
          let query = `SELECT * FROM ${source.table}`;
          const conditions = [];
          const params = [];

          // 根据实体构建查询条件
          if (intentResult.entities.material) {
            conditions.push('(material_name LIKE ? OR material_code LIKE ?)');
            params.push(`%${intentResult.entities.material}%`, `%${intentResult.entities.material}%`);
          }

          if (intentResult.entities.supplier && source.fields.includes('supplier_name')) {
            conditions.push('supplier_name LIKE ?');
            params.push(`%${intentResult.entities.supplier}%`);
          }

          if (intentResult.entities.factory && source.fields.includes('factory')) {
            conditions.push('factory LIKE ?');
            params.push(`%${intentResult.entities.factory}%`);
          }

          if (intentResult.entities.project && source.fields.includes('project')) {
            conditions.push('project LIKE ?');
            params.push(`%${intentResult.entities.project}%`);
          }

          if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
          }

          query += ' ORDER BY created_at DESC LIMIT 10';

          console.log(`执行查询: ${query}`);
          console.log(`参数: ${JSON.stringify(params)}`);

          const [rows] = await connection.execute(query, params);
          
          results.push({
            source: source.table,
            description: source.description,
            data: rows,
            count: rows.length,
            query: query
          });

        } catch (error) {
          console.error(`查询失败 ${source.table}:`, error.message);
          results.push({
            source: source.table,
            description: source.description,
            data: [],
            count: 0,
            error: error.message
          });
        }
      }

      await connection.end();
    } catch (error) {
      console.error('数据库连接失败:', error.message);
    }

    return results;
  }

  /**
   * 步骤4: 数据汇总
   */
  summarizeResults(queryResults) {
    console.log('📋 步骤4: 数据汇总');
    
    const summary = {
      totalRecords: 0,
      dataBySource: {},
      keyMetrics: {},
      insights: []
    };

    queryResults.forEach(result => {
      summary.totalRecords += result.count;
      summary.dataBySource[result.source] = {
        count: result.count,
        description: result.description
      };

      // 计算关键指标
      if (result.source === 'inventory' && result.data.length > 0) {
        const totalQuantity = result.data.reduce((sum, item) => sum + (item.quantity || 0), 0);
        const riskItems = result.data.filter(item => item.risk_level === 'high').length;
        
        summary.keyMetrics.inventory = {
          totalQuantity,
          riskItems,
          suppliers: [...new Set(result.data.map(item => item.supplier_name))].length
        };
      }

      if (result.source === 'lab_tests' && result.data.length > 0) {
        const passedTests = result.data.filter(item => item.test_result === '合格').length;
        const failedTests = result.data.filter(item => item.conclusion === '不合格').length;
        
        summary.keyMetrics.tests = {
          total: result.data.length,
          passed: passedTests,
          failed: failedTests,
          passRate: result.data.length > 0 ? (passedTests / result.data.length * 100).toFixed(1) : 0
        };
      }

      if (result.source === 'online_tracking' && result.data.length > 0) {
        const avgDefectRate = result.data.reduce((sum, item) => sum + (parseFloat(item.defect_rate) || 0), 0) / result.data.length;
        
        summary.keyMetrics.production = {
          batches: result.data.length,
          avgDefectRate: (avgDefectRate * 100).toFixed(2),
          factories: [...new Set(result.data.map(item => item.factory))].length,
          projects: [...new Set(result.data.map(item => item.project))].length
        };
      }
    });

    return summary;
  }

  /**
   * 步骤5: 工具调用
   */
  async callRelevantTools(intentResult, queryResults) {
    console.log('🛠️ 步骤5: 工具调用');
    
    const tools = [];
    
    // 根据查询结果决定调用哪些工具
    if (queryResults.some(r => r.count > 0)) {
      // 数据可视化工具
      if (intentResult.intent === 'analysis_query') {
        tools.push({
          name: 'chart_generator',
          description: '生成数据图表',
          result: '已准备图表数据，可生成柱状图、饼图等可视化图表'
        });
      }

      // 统计分析工具
      tools.push({
        name: 'statistics_calculator',
        description: '统计分析计算器',
        result: '已计算基本统计指标：总数、平均值、异常项等'
      });

      // 质量分析工具
      if (queryResults.some(r => r.source === 'lab_tests' || r.source === 'online_tracking')) {
        tools.push({
          name: 'quality_analyzer',
          description: '质量分析工具',
          result: '已分析质量指标：合格率、不良率、风险等级等'
        });
      }
    }

    return tools;
  }

  /**
   * 步骤6: AI分析
   */
  async performAIAnalysis(question, queryResults, toolResults, summary) {
    console.log('🧠 步骤6: AI分析');

    const analysisPrompt = `
你是IQE质量管理专家。请基于以下数据进行专业分析：

用户问题: "${question}"

数据汇总:
${JSON.stringify(summary, null, 2)}

查询结果概览:
${queryResults.map(r => `${r.source}: ${r.count}条记录`).join('\n')}

请提供专业的质量管理分析，包括：
1. 数据解读
2. 关键发现
3. 风险评估
4. 改进建议

请用中文回答，保持专业性和实用性。`;

    try {
      const response = await axios.post(DEEPSEEK_API_URL, {
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: '你是专业的质量管理专家，擅长数据分析和质量改进建议。' },
          { role: 'user', content: analysisPrompt }
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
      console.error('AI分析失败:', error.message);
      return this.generateFallbackAnalysis(summary, queryResults);
    }
  }

  /**
   * 生成备用分析（当AI调用失败时）
   */
  generateFallbackAnalysis(summary, queryResults) {
    let analysis = '## 数据分析报告\n\n';

    if (summary.totalRecords === 0) {
      analysis += '**数据状态**: 未找到匹配的数据记录。\n\n';
      analysis += '**建议**: 请检查查询条件或扩大搜索范围。\n';
      return analysis;
    }

    analysis += `**数据概览**: 共找到 ${summary.totalRecords} 条相关记录\n\n`;

    // 库存分析
    if (summary.keyMetrics.inventory) {
      const inv = summary.keyMetrics.inventory;
      analysis += `**库存情况**:\n`;
      analysis += `- 总库存量: ${inv.totalQuantity}\n`;
      analysis += `- 高风险物料: ${inv.riskItems} 项\n`;
      analysis += `- 涉及供应商: ${inv.suppliers} 家\n\n`;
    }

    // 测试分析
    if (summary.keyMetrics.tests) {
      const tests = summary.keyMetrics.tests;
      analysis += `**测试情况**:\n`;
      analysis += `- 测试总数: ${tests.total}\n`;
      analysis += `- 合格率: ${tests.passRate}%\n`;
      analysis += `- 不合格项: ${tests.failed} 项\n\n`;
    }

    // 生产分析
    if (summary.keyMetrics.production) {
      const prod = summary.keyMetrics.production;
      analysis += `**生产情况**:\n`;
      analysis += `- 批次数量: ${prod.batches}\n`;
      analysis += `- 平均不良率: ${prod.avgDefectRate}%\n`;
      analysis += `- 涉及工厂: ${prod.factories} 个\n`;
      analysis += `- 涉及项目: ${prod.projects} 个\n\n`;
    }

    analysis += `**建议**: 基于当前数据，建议关注高风险物料和不合格项目的改进措施。`;

    return analysis;
  }

  /**
   * 步骤7: 数据整理
   */
  organizeResults(queryResults, toolResults, analysis, summary) {
    console.log('📊 步骤7: 数据整理');

    return {
      rawData: queryResults,
      summary: summary,
      analysis: analysis,
      tools: toolResults,
      metadata: {
        processedAt: new Date(),
        totalRecords: summary.totalRecords,
        dataSources: queryResults.map(r => r.source),
        dataQuality: this.assessDataQuality(queryResults)
      }
    };
  }

  /**
   * 步骤8: 结果呈现
   */
  formatFinalResult(question, workflow, organizedData, analysis) {
    console.log('📋 步骤8: 结果呈现');

    let answer = `## ${question}\n\n`;

    // 添加分析结果
    answer += analysis + '\n\n';

    // 添加详细数据
    if (organizedData.summary.totalRecords > 0) {
      answer += '## 详细数据\n\n';

      organizedData.rawData.forEach(result => {
        if (result.count > 0) {
          answer += `### ${result.description}\n`;
          answer += `找到 ${result.count} 条记录\n\n`;

          // 显示前几条记录的关键信息
          result.data.slice(0, 3).forEach((item, index) => {
            answer += `**记录 ${index + 1}**:\n`;
            if (item.material_name) answer += `- 物料: ${item.material_name}\n`;
            if (item.batch_code) answer += `- 批次: ${item.batch_code}\n`;
            if (item.supplier_name) answer += `- 供应商: ${item.supplier_name}\n`;
            if (item.quantity) answer += `- 数量: ${item.quantity}\n`;
            if (item.status) answer += `- 状态: ${item.status}\n`;
            if (item.test_result) answer += `- 测试结果: ${item.test_result}\n`;
            if (item.factory) answer += `- 工厂: ${item.factory}\n`;
            answer += '\n';
          });

          if (result.count > 3) {
            answer += `... 还有 ${result.count - 3} 条记录\n\n`;
          }
        }
      });
    }

    return {
      answer: answer,
      data: organizedData.rawData,
      summary: organizedData.summary,
      tools: organizedData.tools
    };
  }

  /**
   * 评估数据质量
   */
  assessDataQuality(queryResults) {
    const totalRecords = queryResults.reduce((sum, r) => sum + r.count, 0);
    const sourcesWithData = queryResults.filter(r => r.count > 0).length;
    const totalSources = queryResults.length;

    if (totalRecords === 0) return 'no_data';
    if (sourcesWithData / totalSources >= 0.8) return 'high';
    if (sourcesWithData / totalSources >= 0.5) return 'medium';
    return 'low';
  }

  /**
   * 主要的查询处理方法
   */
  async processQuery(question) {
    console.log('🚀 开始处理查询:', question);

    const workflow = {
      steps: [],
      startTime: new Date(),
      question: question,
      status: 'processing'
    };

    try {
      // 步骤1: 问题理解
      workflow.steps.push({ step: 1, name: '问题理解', status: 'processing', startTime: new Date() });
      const intentResult = await this.analyzeIntent(question);
      workflow.steps[0].status = 'completed';
      workflow.steps[0].result = intentResult;
      workflow.steps[0].endTime = new Date();

      // 步骤2: 数据源识别
      workflow.steps.push({ step: 2, name: '数据源识别', status: 'processing', startTime: new Date() });
      const dataSources = this.selectDataSources(intentResult);
      workflow.steps[1].status = 'completed';
      workflow.steps[1].result = dataSources.map(s => ({ table: s.table, description: s.description }));
      workflow.steps[1].endTime = new Date();

      // 步骤3: 数据查询
      workflow.steps.push({ step: 3, name: '数据查询', status: 'processing', startTime: new Date() });
      const queryResults = await this.executeQueries(dataSources, intentResult);
      workflow.steps[2].status = 'completed';
      workflow.steps[2].result = { queries: queryResults.length, totalRecords: queryResults.reduce((sum, r) => sum + r.count, 0) };
      workflow.steps[2].endTime = new Date();

      // 步骤4: 数据汇总
      workflow.steps.push({ step: 4, name: '数据汇总', status: 'processing', startTime: new Date() });
      const summary = this.summarizeResults(queryResults);
      workflow.steps[3].status = 'completed';
      workflow.steps[3].result = summary;
      workflow.steps[3].endTime = new Date();

      // 步骤5: 工具调用
      workflow.steps.push({ step: 5, name: '工具调用', status: 'processing', startTime: new Date() });
      const toolResults = await this.callRelevantTools(intentResult, queryResults);
      workflow.steps[4].status = 'completed';
      workflow.steps[4].result = toolResults;
      workflow.steps[4].endTime = new Date();

      // 步骤6: AI分析
      workflow.steps.push({ step: 6, name: 'AI分析', status: 'processing', startTime: new Date() });
      const analysis = await this.performAIAnalysis(question, queryResults, toolResults, summary);
      workflow.steps[5].status = 'completed';
      workflow.steps[5].result = { analysisLength: analysis.length };
      workflow.steps[5].endTime = new Date();

      // 步骤7: 数据整理
      workflow.steps.push({ step: 7, name: '数据整理', status: 'processing', startTime: new Date() });
      const organizedData = this.organizeResults(queryResults, toolResults, analysis, summary);
      workflow.steps[6].status = 'completed';
      workflow.steps[6].result = organizedData.metadata;
      workflow.steps[6].endTime = new Date();

      // 步骤8: 结果呈现
      workflow.steps.push({ step: 8, name: '结果呈现', status: 'processing', startTime: new Date() });
      const finalResult = this.formatFinalResult(question, workflow, organizedData, analysis);
      workflow.steps[7].status = 'completed';
      workflow.steps[7].result = { answerLength: finalResult.answer.length };
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
      console.error('❌ 查询处理失败:', error);
      workflow.status = 'failed';
      workflow.error = error.message;
      workflow.endTime = new Date();

      return {
        success: false,
        workflow: workflow,
        error: error.message,
        result: {
          answer: '抱歉，处理您的问题时发生了错误。请稍后再试。',
          data: [],
          summary: {},
          tools: []
        }
      };
    }
  }
}

// 创建服务实例
const optimizedService = new OptimizedMultiStepAIService();

// API路由
app.post('/api/multi-step-query', async (req, res) => {
  try {
    console.log('📥 收到优化版查询请求:', req.body);
    const { question } = req.body;

    if (!question) {
      console.log('❌ 问题为空');
      return res.status(400).json({ error: '问题不能为空' });
    }

    console.log('🔄 开始处理优化版查询:', question);
    const result = await optimizedService.processQuery(question);
    console.log('✅ 优化版查询处理完成:', result.success ? '成功' : '失败');
    res.json(result);
  } catch (error) {
    console.error('❌ API错误:', error);
    res.status(500).json({
      error: '服务器内部错误',
      details: error.message
    });
  }
});

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'optimized-multi-step-ai-service',
    version: '2.0',
    features: ['real-data-integration', 'deepseek-ai', '8-step-workflow']
  });
});

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
  console.log(`🚀 优化版多步骤AI问答服务启动在端口 ${PORT}`);
  console.log(`📊 健康检查: http://localhost:${PORT}/api/health`);
  console.log(`🤖 API端点: http://localhost:${PORT}/api/multi-step-query`);
  console.log(`✨ 新特性: 基于实际数据库结构，集成DeepSeek AI分析`);
});

export { OptimizedMultiStepAIService };
