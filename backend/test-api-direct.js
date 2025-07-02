/**
 * 直接测试API功能
 */
import express from 'express';
import cors from 'cors';
import { processQuery } from './src/services/assistantService.js';

const app = express();
app.use(cors());
app.use(express.json());

// 简单的查询端点
app.post('/api/assistant/query', async (req, res) => {
  const { query } = req.body;
  
  console.log(`收到查询: "${query}"`);
  
  try {
    const result = await processQuery(query);
    console.log(`返回结果: ${result.substring(0, 100)}...`);
    res.json({ reply: result });
  } catch (error) {
    console.error('处理查询失败:', error);
    res.status(500).json({ error: '处理查询失败' });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🚀 测试API服务器启动在端口 ${PORT}`);
  console.log(`📡 测试地址: http://localhost:${PORT}/api/assistant/query`);
});

// 测试查询
setTimeout(async () => {
  console.log('\n🧪 开始自动测试...');
  
  const testQueries = [
    '高风险库存',
    '查询物料 M12345 的库存',
    '目前有哪些异常情况？'
  ];
  
  for (const query of testQueries) {
    console.log(`\n🔍 测试: "${query}"`);
    try {
      const result = await processQuery(query);
      console.log(`✅ 结果: ${result.substring(0, 150)}...`);
    } catch (error) {
      console.log(`❌ 错误: ${error.message}`);
    }
  }
}, 2000);
