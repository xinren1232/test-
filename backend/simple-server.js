/**
 * 简单的智能问答服务器
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
    console.log('🔧 初始化智能问答系统...');
    qaSystem = new IntelligentQASystem();
    console.log('✅ 智能问答系统初始化完成');
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
    
    console.log(`📊 处理结果:`, {
      success: result.success,
      template: result.template,
      hasCharts: result.charts && result.charts.length > 0,
      chartsCount: result.charts ? result.charts.length : 0
    });
    
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

// 健康检查
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'intelligent-qa-api'
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 智能问答服务器启动成功`);
  console.log(`📍 服务地址: http://localhost:${PORT}`);
  console.log(`🔗 健康检查: http://localhost:${PORT}/health`);
  console.log(`🤖 问答接口: http://localhost:${PORT}/api/intelligent-qa/ask`);
});
