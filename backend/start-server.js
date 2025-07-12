/**
 * 简单的服务器启动脚本
 */
import express from 'express';
import cors from 'cors';
import IntelligentQASystem from './src/services/intelligentQASystem.js';

const app = express();
const PORT = 3001;

// 中间件
app.use(cors());
app.use(express.json());

// 创建智能问答系统实例
let qaSystem = null;

async function getQASystem() {
  if (!qaSystem) {
    qaSystem = new IntelligentQASystem();
  }
  return qaSystem;
}

// 智能问答API路由
app.post('/api/intelligent-qa/ask', async (req, res) => {
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
    
    const qaSystemInstance = await getQASystem();
    const result = await qaSystemInstance.processQuestion(question);
    
    if (result.success) {
      console.log(`✅ 问答处理成功: ${result.template}`);
      
      res.json({
        success: true,
        data: {
          question: result.question,
          answer: result.response,
          analysis: {
            type: result.analysis.type,
            entities: result.analysis.entities,
            intent: result.analysis.intent,
            confidence: result.analysis.confidence
          },
          template: result.template,
          charts: result.charts || [],
          tableData: result.tableData || null,
          keyMetrics: result.keyMetrics || null,
          summary: result.summary || null,
          metadata: {
            dataSource: 'real_database',
            timestamp: new Date().toISOString()
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

// 系统能力接口
app.get('/api/intelligent-qa/capabilities', async (req, res) => {
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

// 查询建议接口
app.get('/api/intelligent-qa/suggestions', async (req, res) => {
  try {
    const { query } = req.query;
    
    const qaSystemInstance = await getQASystem();
    const suggestions = [];
    
    if (query && query.length > 0) {
      const queryLower = query.toLowerCase();
      
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
        suggestions: suggestions.slice(0, 8),
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

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 智能问答API服务器已启动`);
  console.log(`📍 服务地址: http://localhost:${PORT}`);
  console.log(`🔗 API端点:`);
  console.log(`   - POST /api/intelligent-qa/ask`);
  console.log(`   - GET  /api/intelligent-qa/capabilities`);
  console.log(`   - GET  /api/intelligent-qa/suggestions`);
  console.log(`   - GET  /health`);
});

// 优雅关闭
process.on('SIGTERM', async () => {
  if (qaSystem) {
    await qaSystem.close();
  }
  process.exit(0);
});

process.on('SIGINT', async () => {
  if (qaSystem) {
    await qaSystem.close();
  }
  process.exit(0);
});
