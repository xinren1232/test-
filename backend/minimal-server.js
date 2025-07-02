/**
 * 最小化测试服务器
 */
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;

console.log('🚀 启动最小化服务器...');

// 中间件
app.use(cors());
app.use(express.json());

// 内存数据
let data = {
  inventory: [],
  inspection: [],
  production: []
};

// 健康检查
app.get('/api/health', (req, res) => {
  console.log('📊 健康检查请求');
  res.json({
    status: 'ok',
    message: '最小化服务器运行正常'
  });
});

// 数据更新
app.post('/api/assistant/update-data', (req, res) => {
  console.log('📊 数据更新请求');
  const { inventory, inspection, production } = req.body;
  
  if (inventory) data.inventory = inventory;
  if (inspection) data.inspection = inspection;
  if (production) data.production = production;
  
  console.log('✅ 数据更新成功:', {
    inventory: data.inventory.length,
    inspection: data.inspection.length,
    production: data.production.length
  });
  
  res.json({ success: true });
});

// 查询接口
app.post('/api/assistant/query', (req, res) => {
  console.log('🔍 查询请求:', req.body.query);
  
  const { query } = req.body;
  let response = '';
  
  if (query.includes('深圳工厂') && query.includes('库存')) {
    const items = data.inventory.filter(item => 
      item.factory && item.factory.includes('深圳')
    );
    
    if (items.length > 0) {
      response = `📦 找到 ${items.length} 条深圳工厂库存记录：\n\n`;
      items.forEach((item, index) => {
        response += `${index + 1}. ${item.materialName}\n`;
        response += `   📋 编码: ${item.materialCode}\n`;
        response += `   🏢 供应商: ${item.supplier}\n`;
        response += `   📊 数量: ${item.quantity}\n`;
        response += `   ⚡ 状态: ${item.status}\n\n`;
      });
    } else {
      response = '抱歉，没有找到深圳工厂的库存数据。';
    }
  } else {
    response = '抱歉，我没有找到相关信息。请提供更多详细信息。';
  }
  
  console.log('✅ 查询完成，回复长度:', response.length);
  
  res.json({
    reply: response,
    source: 'rule-based',
    aiEnhanced: false,
    matchedRule: 'auto-detected'
  });
});

// 启动服务器
console.log('🚀 正在启动最小化服务器...');
app.listen(PORT, () => {
  console.log(`🚀 最小化服务器已启动，端口: ${PORT}`);
  console.log(`📊 健康检查: http://localhost:${PORT}/api/health`);
});

// 错误处理
process.on('uncaughtException', (error) => {
  console.error('❌ 未捕获的异常:', error);
});

process.on('unhandledRejection', (reason) => {
  console.error('❌ 未处理的Promise拒绝:', reason);
});
