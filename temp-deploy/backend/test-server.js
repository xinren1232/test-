import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: '测试服务器正常' });
});

app.post('/api/assistant/query', (req, res) => {
  const { query } = req.body;
  console.log(`收到查询: ${query}`);
  
  // 简单的响应，不包含风险等级字段
  res.json({
    reply: `✅ 修复测试成功！查询"${query}"已处理，不包含风险等级字段。`,
    success: true
  });
});

app.listen(PORT, () => {
  console.log(`🚀 测试服务器启动成功，端口: ${PORT}`);
  console.log(`📊 健康检查: http://localhost:${PORT}/api/health`);
});
