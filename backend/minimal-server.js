/**
 * 最简单的测试服务器 - ES模块版本
 */
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;

console.log('🚀 开始启动最简单的测试服务器...');

// 中间件
app.use(cors());
app.use(express.json());

console.log('📦 中间件配置完成');

// 健康检查
app.get('/health', (req, res) => {
  console.log('📊 健康检查请求');
  res.json({ status: 'ok', message: '服务器运行正常' });
});

// 测试API
app.get('/api/test', (req, res) => {
  console.log('🔍 测试API请求');
  res.json({
    success: true,
    message: '后端服务正常运行',
    timestamp: new Date().toISOString()
  });
});

// 模拟智能问答API
app.post('/api/intelligent-qa/ask', (req, res) => {
  console.log('🤖 智能问答请求:', req.body);
  const { question } = req.body;
  res.json({
    success: true,
    reply: `您问的是: "${question}"。这是一个测试回复。`,
    timestamp: new Date().toISOString()
  });
});

// 模拟助手查询API
app.post('/api/assistant/query', (req, res) => {
  console.log('🔍 助手查询请求:', req.body);
  const { query } = req.body;
  res.json({
    success: true,
    reply: `查询 "${query}" 的结果：这是一个测试回复。`,
    timestamp: new Date().toISOString()
  });
});

// 启动服务器
console.log('🔄 正在启动服务器...');
app.listen(PORT, () => {
  console.log(`✅ 测试服务器已启动，端口: ${PORT}`);
  console.log(`🔗 健康检查: http://localhost:${PORT}/health`);
  console.log(`🔗 测试API: http://localhost:${PORT}/api/test`);
});
