import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';

const app = express();
const port = 3002;

app.use(cors());
app.use(express.json());

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Flameaway3.',
  database: 'iQE_database'
};

console.log('🚀 启动增强智能问答API服务...');
console.log('📊 数据库配置:', { ...dbConfig, password: '***' });

// 测试数据库连接
async function testConnection() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功');
    await connection.end();
    return true;
  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message);
    return false;
  }
}

// 简单的健康检查接口
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'enhanced-intelligent-qa-api'
  });
});

// 简单的测试接口
app.post('/api/intelligent-qa/ask', async (req, res) => {
  try {
    const { question } = req.body;
    console.log(`🤖 收到问答请求: "${question}"`);
    
    // 返回测试响应
    res.json({
      success: true,
      data: {
        question: question,
        answer: `这是对问题"${question}"的测试回答。API服务正常运行。`,
        cards: [
          {
            type: 'inventory',
            icon: '📦',
            title: '测试卡片',
            value: '100',
            subtitle: '测试数据'
          }
        ],
        scenarioType: 'inventory',
        dataCount: 1,
        matchedRule: 'test-rule',
        queryData: [
          { 工厂: '测试工厂', 物料编码: 'TEST001', 物料名称: '测试物料', 数量: 100 }
        ],
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('❌ 智能问答API错误:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      data: {
        question: req.body.question || '',
        answer: '抱歉，系统暂时无法处理您的问题，请稍后再试。',
        cards: [],
        scenarioType: 'error'
      }
    });
  }
});

// 启动服务
async function startServer() {
  const dbConnected = await testConnection();
  
  app.listen(port, () => {
    console.log(`🌟 增强智能问答API服务已启动`);
    console.log(`📡 服务地址: http://localhost:${port}`);
    console.log(`🔗 健康检查: http://localhost:${port}/health`);
    console.log(`🤖 问答接口: http://localhost:${port}/api/intelligent-qa/ask`);
    console.log(`💾 数据库状态: ${dbConnected ? '✅ 已连接' : '❌ 连接失败'}`);
    console.log('');
    console.log('🎯 服务就绪，等待请求...');
  });
}

startServer().catch(console.error);
