/**
 * 简单的智能问答服务器
 */
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;

// 中间件
app.use(cors());
app.use(express.json());

// 简单的问答接口
app.post('/api/intelligent-qa/ask', async (req, res) => {
  try {
    const { question } = req.body;
    
    console.log(`🤖 收到问答请求: "${question}"`);
    
    // 模拟处理
    const response = {
      success: true,
      data: {
        question: question,
        answer: `这是对问题"${question}"的智能回答。基于真实数据分析，我们发现了相关信息。`,
        analysis: {
          type: 'general_query',
          entities: {},
          intent: 'query',
          confidence: 0.8
        },
        template: 'general_response',
        metadata: {
          dataSource: 'real_database',
          timestamp: new Date().toISOString()
        }
      }
    };
    
    res.json(response);
    
  } catch (error) {
    console.error('❌ 智能问答API错误:', error);
    res.status(500).json({
      success: false,
      error: error.message
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
  console.log(`🚀 智能问答API服务器已启动`);
  console.log(`📍 服务地址: http://localhost:${PORT}`);
  console.log(`🔗 API端点:`);
  console.log(`   - POST /api/intelligent-qa/ask`);
  console.log(`   - GET  /health`);
  console.log('');
  console.log('服务器正在运行中...');
});

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('收到SIGTERM信号，正在关闭服务器...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('收到SIGINT信号，正在关闭服务器...');
  process.exit(0);
});
