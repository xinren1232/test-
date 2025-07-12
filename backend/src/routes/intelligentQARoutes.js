import express from 'express';
import IntelligentQASystem from '../services/intelligentQASystem.js';
import SimpleRuleBasedQA from '../services/SimpleRuleBasedQA.js';

const router = express.Router();

// 创建智能问答系统实例
let qaSystem = null;
let simpleQASystem = null;

async function getQASystem() {
  if (!qaSystem) {
    qaSystem = new IntelligentQASystem();
  }
  return qaSystem;
}

async function getSimpleQASystem() {
  if (!simpleQASystem) {
    simpleQASystem = new SimpleRuleBasedQA();
  }
  return simpleQASystem;
}

/**
 * POST /api/intelligent-qa/ask
 * 智能问答接口
 */
router.post('/ask', async (req, res) => {
  try {
    const { question } = req.body;
    
    if (!question || typeof question !== 'string') {
      return res.status(400).json({
        success: false,
        error: '问题不能为空',
        message: '请提供有效的问题'
      });
    }
    
    console.log(`🤖 收到问答请求: "${question}"`);

    // 优先使用简化的规则问答系统
    const simpleQAInstance = await getSimpleQASystem();
    const result = await simpleQAInstance.processQuestion(question);
    
    if (result.success) {
      console.log(`✅ 问答处理成功: ${result.template}`);
      
      // 返回结构化的响应
      res.json({
        success: true,
        data: {
          question: result.data?.question || result.question || question,
          answer: result.data?.answer || result.data?.response || result.response || result.answer,
          analysis: result.data?.analysis || result.analysis || {
            type: 'general',
            entities: {},
            intent: 'query',
            confidence: 0.5
          },
          template: result.data?.template || result.template || 'general_response',
          data: result.data?.data || result.data?.tableData || [], // 前端期望的表格数据字段
          tableData: result.data?.tableData || result.data?.data || [], // 保持兼容性
          keyMetrics: result.data?.keyMetrics || null,
          summary: result.data?.summary || null,
          metadata: result.data?.metadata || {
            dataSource: 'real_database',
            timestamp: new Date().toISOString(),
            processingTime: Date.now() - (req.startTime || Date.now())
          }
        }
      });
    } else {
      console.log(`❌ 问答处理失败: ${result.error}`);
      
      res.status(500).json({
        success: false,
        error: result.error,
        data: {
          question: question,
          answer: result.response,
          fallback: true
        }
      });
    }
    
  } catch (error) {
    console.error('❌ 智能问答API错误:', error);
    
    res.status(500).json({
      success: false,
      error: error.message,
      data: {
        question: req.body.question || '',
        answer: '抱歉，系统暂时无法处理您的问题，请稍后再试。',
        fallback: true
      }
    });
  }
});

/**
 * GET /api/intelligent-qa/capabilities
 * 获取系统能力信息
 */
router.get('/capabilities', async (req, res) => {
  try {
    const qaSystemInstance = await getQASystem();
    
    res.json({
      success: true,
      data: {
        supportedEntities: {
          suppliers: qaSystemInstance.dataDict.suppliers,
          materials: qaSystemInstance.dataDict.materials,
          factories: qaSystemInstance.dataDict.factories,
          statuses: qaSystemInstance.dataDict.statuses
        },
        totalRecords: qaSystemInstance.dataDict.totalRecords,
        questionTypes: [
          {
            type: 'supplier_query',
            description: '供应商相关查询',
            examples: ['BOE供应商有哪些物料', '聚龙的库存情况']
          },
          {
            type: 'material_query', 
            description: '物料相关查询',
            examples: ['LCD显示屏有哪些供应商', '电池盖的库存情况']
          },
          {
            type: 'factory_query',
            description: '工厂相关查询', 
            examples: ['深圳工厂的情况', '重庆工厂有哪些物料']
          },
          {
            type: 'status_query',
            description: '状态相关查询',
            examples: ['风险状态的物料', '正常库存情况']
          },
          {
            type: 'analysis_query',
            description: '分析统计查询',
            examples: ['供应商排行分析', '物料库存统计']
          }
        ]
      }
    });
    
  } catch (error) {
    console.error('❌ 获取系统能力失败:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/intelligent-qa/suggestions
 * 获取查询建议
 */
router.get('/suggestions', async (req, res) => {
  try {
    const { query } = req.query;
    
    const qaSystemInstance = await getQASystem();
    const suggestions = [];
    
    if (query && query.length > 0) {
      const queryLower = query.toLowerCase();
      
      // 基于输入内容提供建议
      if (queryLower.includes('供应商')) {
        qaSystemInstance.dataDict.suppliers.slice(0, 5).forEach(supplier => {
          suggestions.push(`${supplier}供应商的物料情况`);
          suggestions.push(`${supplier}的库存状态`);
        });
      } else if (queryLower.includes('物料')) {
        qaSystemInstance.dataDict.materials.slice(0, 5).forEach(material => {
          suggestions.push(`${material}有哪些供应商`);
          suggestions.push(`${material}的库存分布`);
        });
      } else if (queryLower.includes('工厂')) {
        qaSystemInstance.dataDict.factories.forEach(factory => {
          suggestions.push(`${factory}的库存情况`);
          suggestions.push(`${factory}有哪些物料`);
        });
      }
    } else {
      // 默认建议
      suggestions.push(
        'BOE供应商有哪些物料',
        'LCD显示屏有哪些供应商',
        '深圳工厂的库存情况',
        '风险状态的物料',
        '供应商排行分析'
      );
    }
    
    res.json({
      success: true,
      data: {
        suggestions: suggestions.slice(0, 8), // 最多返回8个建议
        query: query || ''
      }
    });
    
  } catch (error) {
    console.error('❌ 获取查询建议失败:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 添加请求时间中间件
router.use((req, res, next) => {
  req.startTime = Date.now();
  next();
});

// 优雅关闭
process.on('SIGTERM', async () => {
  if (qaSystem) {
    await qaSystem.close();
  }
});

process.on('SIGINT', async () => {
  if (qaSystem) {
    await qaSystem.close();
  }
});

export default router;
