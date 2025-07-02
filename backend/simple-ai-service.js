/**
 * 简化版多步骤AI问答服务
 */

import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';

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

// 增强的多步骤AI服务类
class SimpleMultiStepAIService {
  constructor() {
    this.dataSources = {
      inventory: {
        table: 'inventory',
        description: '库存数据：物料库存、存储位置、数量等',
        fields: ['material_code', 'material_name', 'quantity', 'storage_location', 'supplier'],
        keywords: ['库存', '数量', '存储', '仓库', '物料']
      },
      materials: {
        table: 'materials',
        description: '物料主数据：物料基本信息、规格等',
        fields: ['material_code', 'material_name', 'category', 'specification', 'supplier'],
        keywords: ['物料', '材料', '供应商', '规格', '类别']
      },
      test_results: {
        table: 'test_results',
        description: '测试结果：检测数据、合格率等',
        fields: ['material_code', 'test_type', 'result', 'test_date', 'inspector'],
        keywords: ['测试', '检测', '合格', '不良', '质量']
      }
    };
  }

  // 智能意图识别
  analyzeIntent(question) {
    const lowerQuestion = question.toLowerCase();

    // 检查是否包含数据查询关键词
    const dataKeywords = ['查询', '分析', '统计', '报告', '数据', '情况', '状态'];
    const hasDataKeywords = dataKeywords.some(keyword => lowerQuestion.includes(keyword));

    // 检查复杂度
    const complexKeywords = ['趋势', '对比', '分析', '预测', '优化'];
    const isComplex = complexKeywords.some(keyword => lowerQuestion.includes(keyword));

    let intent = 'general-query';
    let complexity = 'low';

    if (hasDataKeywords) {
      intent = isComplex ? 'analysis-query' : 'data-query';
      complexity = isComplex ? 'high' : 'medium';
    }

    // 提取关键词
    const keywords = question.split(/\s+/).filter(word => word.length > 1);

    return {
      intent: intent,
      confidence: hasDataKeywords ? 0.9 : 0.7,
      reasoning: `基于关键词分析，识别为${intent}类型查询`,
      keywords: keywords,
      complexity: complexity
    };
  }

  // 智能数据源选择
  selectDataSources(keywords) {
    const selectedSources = [];

    Object.entries(this.dataSources).forEach(([key, source]) => {
      const matchScore = keywords.reduce((score, keyword) => {
        return score + source.keywords.filter(sk =>
          keyword.includes(sk) || sk.includes(keyword)
        ).length;
      }, 0);

      if (matchScore > 0) {
        selectedSources.push({
          ...source,
          matchScore: matchScore
        });
      }
    });

    // 如果没有匹配的数据源，默认选择库存数据
    if (selectedSources.length === 0) {
      selectedSources.push(this.dataSources.inventory);
    }

    // 按匹配分数排序
    return selectedSources.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
  }

  // 执行数据库查询
  async executeQueries(dataSources, keywords) {
    const results = [];

    try {
      const connection = await mysql.createConnection(dbConfig);

      for (const source of dataSources) {
        try {
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
            if (source.fields.includes('category')) {
              conditions.push(`category LIKE '%${keyword}%'`);
            }
          });

          if (conditions.length > 0) {
            query += ` WHERE ${conditions.join(' OR ')}`;
          }

          query += ' LIMIT 10';

          console.log(`🔍 执行查询: ${query}`);
          const [rows] = await connection.execute(query);

          results.push({
            source: source.table,
            description: source.description,
            data: rows,
            count: rows.length,
            query: query
          });

        } catch (error) {
          console.error(`❌ 查询失败 ${source.table}:`, error.message);
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
      console.error('❌ 数据库连接失败:', error.message);
    }

    return results;
  }

  async processQuery(question) {
    console.log('🔄 开始处理查询:', question);

    const workflow = {
      steps: [],
      startTime: new Date(),
      question: question,
      status: 'processing'
    };

    try {
      // 步骤1: 问题理解
      console.log('📝 步骤1: 问题理解');
      const intentResult = this.analyzeIntent(question);
      workflow.steps.push({
        step: 1,
        name: '问题理解',
        status: 'completed',
        startTime: new Date(),
        endTime: new Date(),
        result: intentResult
      });

      // 步骤2: 数据源识别
      console.log('🗃️ 步骤2: 数据源识别');
      const selectedSources = this.selectDataSources(intentResult.keywords);
      workflow.steps.push({
        step: 2,
        name: '数据源识别',
        status: 'completed',
        startTime: new Date(),
        endTime: new Date(),
        result: selectedSources
      });

      // 步骤3: 数据查询
      console.log('🔍 步骤3: 数据查询');
      const queryResults = await this.executeQueries(selectedSources, intentResult.keywords);
      workflow.steps.push({
        step: 3,
        name: '数据查询',
        status: 'completed',
        startTime: new Date(),
        endTime: new Date(),
        result: {
          templates: selectedSources.map(s => s.table),
          results: queryResults
        }
      });

      // 步骤4: 数据汇总
      console.log('📊 步骤4: 数据汇总');
      const summaryData = {
        totalSources: queryResults.length,
        totalRecords: queryResults.reduce((sum, result) => sum + result.count, 0),
        sources: queryResults.map(result => ({
          name: result.source,
          count: result.count,
          hasData: result.count > 0
        }))
      };
      workflow.steps.push({
        step: 4,
        name: '数据汇总',
        status: 'completed',
        startTime: new Date(),
        endTime: new Date(),
        result: summaryData
      });

      // 步骤5: 工具调用
      console.log('🛠️ 步骤5: 工具调用');
      const toolResults = [];
      if (intentResult.intent === 'analysis-query' && summaryData.totalRecords > 0) {
        toolResults.push({
          type: 'chart',
          name: '数据图表',
          description: '生成数据可视化图表'
        });
      }
      workflow.steps.push({
        step: 5,
        name: '工具调用',
        status: 'completed',
        startTime: new Date(),
        endTime: new Date(),
        result: toolResults
      });

      // 步骤6: AI分析
      console.log('🤖 步骤6: AI分析');
      const analysis = this.generateAnalysis(question, intentResult, queryResults, summaryData);
      workflow.steps.push({
        step: 6,
        name: 'AI分析',
        status: 'completed',
        startTime: new Date(),
        endTime: new Date(),
        result: analysis
      });

      // 步骤7: 数据整理
      console.log('📋 步骤7: 数据整理');
      const organizedData = {
        data: queryResults,
        tools: toolResults,
        analysis: analysis,
        metadata: {
          processedAt: new Date(),
          dataQuality: this.assessDataQuality(queryResults)
        }
      };
      workflow.steps.push({
        step: 7,
        name: '数据整理',
        status: 'completed',
        startTime: new Date(),
        endTime: new Date(),
        result: organizedData
      });

      // 步骤8: 结果呈现
      console.log('✨ 步骤8: 结果呈现');
      const finalResult = {
        question: question,
        answer: analysis,
        data: queryResults,
        tools: toolResults,
        metadata: {
          processedAt: new Date(),
          totalTime: 0, // 将在后面计算
          dataQuality: organizedData.metadata.dataQuality,
          confidence: this.calculateConfidence(intentResult, summaryData)
        }
      };
      workflow.steps.push({
        step: 8,
        name: '结果呈现',
        status: 'completed',
        startTime: new Date(),
        endTime: new Date(),
        result: finalResult
      });

      workflow.endTime = new Date();
      workflow.totalTime = workflow.endTime - workflow.startTime;
      workflow.status = 'completed';

      // 更新最终结果的总时间
      finalResult.metadata.totalTime = workflow.totalTime;

      console.log('✅ 查询处理完成');

      return {
        success: true,
        workflow: workflow,
        result: finalResult
      };

    } catch (error) {
      console.error('❌ 处理失败:', error);
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

  // 生成AI分析
  generateAnalysis(question, intentResult, queryResults, summaryData) {
    const hasData = summaryData.totalRecords > 0;

    if (!hasData) {
      return `针对您的问题"${question}"，系统进行了全面的数据检索，但未找到相关数据。建议：
1. 检查查询条件是否正确
2. 确认相关数据是否已录入系统
3. 尝试使用更通用的关键词进行查询`;
    }

    let analysis = `针对您的问题"${question}"，系统完成了智能分析：

📊 **数据概览**
- 查询了 ${summaryData.totalSources} 个数据源
- 找到 ${summaryData.totalRecords} 条相关记录
- 数据质量：${this.getDataQualityText(this.assessDataQuality(queryResults))}

📈 **详细分析**`;

    queryResults.forEach(result => {
      if (result.count > 0) {
        analysis += `\n\n**${result.description}**
- 记录数量：${result.count} 条
- 数据来源：${result.source} 表`;

        if (result.data && result.data.length > 0) {
          const sample = result.data[0];
          const keys = Object.keys(sample).slice(0, 3);
          analysis += `\n- 主要字段：${keys.join(', ')}`;
        }
      }
    });

    analysis += `\n\n🎯 **结论与建议**
基于当前数据分析，建议进一步关注数据的完整性和准确性。如需更详细的分析，请提供更具体的查询条件。`;

    return analysis;
  }

  // 评估数据质量
  assessDataQuality(queryResults) {
    if (queryResults.length === 0) return 'low';

    const totalSources = queryResults.length;
    const sourcesWithData = queryResults.filter(r => r.count > 0).length;
    const quality = sourcesWithData / totalSources;

    if (quality >= 0.8) return 'high';
    if (quality >= 0.5) return 'medium';
    return 'low';
  }

  // 获取数据质量文本
  getDataQualityText(quality) {
    const texts = {
      'high': '高质量',
      'medium': '中等质量',
      'low': '低质量'
    };
    return texts[quality] || quality;
  }

  // 计算置信度
  calculateConfidence(intentResult, summaryData) {
    let confidence = intentResult.confidence;

    // 根据数据可用性调整置信度
    if (summaryData.totalRecords > 0) {
      confidence = Math.min(confidence + 0.1, 1.0);
    } else {
      confidence = Math.max(confidence - 0.2, 0.3);
    }

    return confidence;
  }
}

// 创建服务实例
const multiStepService = new SimpleMultiStepAIService();

// API路由
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
      details: error.message
    });
  }
});

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'simple-multi-step-ai-service' });
});

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
  console.log(`🚀 简化版多步骤AI问答服务启动在端口 ${PORT}`);
  console.log(`📊 健康检查: http://localhost:${PORT}/api/health`);
  console.log(`🤖 API端点: http://localhost:${PORT}/api/multi-step-query`);
});

export { SimpleMultiStepAIService };
