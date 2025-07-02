/**
 * 简单测试服务器 - 用于验证三栏布局数据同步功能
 */
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;

// 中间件
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// 内存数据存储
let inMemoryData = {
  inventory: [],
  inspection: [],
  production: []
};

console.log('🚀 启动IQE测试服务器...');

// 健康检查
app.get('/health', (req, res) => {
  console.log('📊 健康检查请求');
  res.json({ 
    status: 'ok', 
    message: 'IQE测试服务器运行正常',
    timestamp: new Date().toISOString(),
    dataStats: {
      inventory: inMemoryData.inventory.length,
      inspection: inMemoryData.inspection.length,
      production: inMemoryData.production.length
    }
  });
});

// 数据更新接口
app.post('/api/assistant/update-data', (req, res) => {
  try {
    const { inventory, inspection, production } = req.body;
    
    console.log('📊 收到数据更新请求:');
    console.log(`  - 库存数据: ${inventory?.length || 0} 条`);
    console.log(`  - 检测数据: ${inspection?.length || 0} 条`);
    console.log(`  - 生产数据: ${production?.length || 0} 条`);
    
    // 更新内存数据
    if (inventory) inMemoryData.inventory = inventory;
    if (inspection) inMemoryData.inspection = inspection;
    if (production) inMemoryData.production = production;
    
    console.log('✅ 数据更新成功');
    
    res.json({ 
      success: true, 
      message: '数据更新成功',
      dataStats: {
        inventory: inMemoryData.inventory.length,
        inspection: inMemoryData.inspection.length,
        production: inMemoryData.production.length
      }
    });
  } catch (error) {
    console.error('❌ 数据更新失败:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// 查询接口
app.post('/api/assistant/query', (req, res) => {
  try {
    const { query, scenario, analysisMode, requireDataAnalysis } = req.body;
    
    console.log('🔍 收到查询请求:', query);
    console.log('📊 当前数据统计:');
    console.log(`  - 库存数据: ${inMemoryData.inventory.length} 条`);
    console.log(`  - 检测数据: ${inMemoryData.inspection.length} 条`);
    console.log(`  - 生产数据: ${inMemoryData.production.length} 条`);
    
    // 简单的查询处理逻辑
    let reply = '';
    let matchedData = [];
    
    const queryLower = query.toLowerCase();
    
    // 库存查询
    if (queryLower.includes('库存') || queryLower.includes('inventory')) {
      matchedData = inMemoryData.inventory;
      
      if (queryLower.includes('深圳工厂')) {
        matchedData = matchedData.filter(item => 
          item.factory && item.factory.includes('深圳')
        );
      }
      
      if (queryLower.includes('风险')) {
        matchedData = matchedData.filter(item => 
          item.status === '风险' || item.status === '异常'
        );
      }
      
      if (queryLower.includes('boe')) {
        matchedData = matchedData.filter(item => 
          item.supplier && item.supplier.toLowerCase().includes('boe')
        );
      }
      
      reply = `📦 库存查询结果：找到 ${matchedData.length} 条记录`;
      if (matchedData.length > 0) {
        reply += `\n\n前5条记录：\n`;
        matchedData.slice(0, 5).forEach((item, index) => {
          reply += `${index + 1}. ${item.materialName || item.material_name || '未知物料'} - ${item.supplier || '未知供应商'} - 状态: ${item.status || '未知'}\n`;
        });
      }
    }
    
    // 测试查询
    else if (queryLower.includes('测试') || queryLower.includes('检测') || queryLower.includes('inspection')) {
      matchedData = inMemoryData.inspection;
      
      if (queryLower.includes('fail') || queryLower.includes('ng')) {
        matchedData = matchedData.filter(item => 
          item.testResult === 'FAIL' || item.result === 'FAIL'
        );
      }
      
      reply = `🧪 测试查询结果：找到 ${matchedData.length} 条记录`;
      if (matchedData.length > 0) {
        reply += `\n\n前5条记录：\n`;
        matchedData.slice(0, 5).forEach((item, index) => {
          reply += `${index + 1}. ${item.materialName || item.material_name || '未知物料'} - 结果: ${item.testResult || item.result || '未知'}\n`;
        });
      }
    }
    
    // 生产查询
    else if (queryLower.includes('生产') || queryLower.includes('production')) {
      matchedData = inMemoryData.production;
      
      if (queryLower.includes('深圳工厂')) {
        matchedData = matchedData.filter(item => 
          item.factory && item.factory.includes('深圳')
        );
      }
      
      reply = `⚙️ 生产查询结果：找到 ${matchedData.length} 条记录`;
      if (matchedData.length > 0) {
        reply += `\n\n前5条记录：\n`;
        matchedData.slice(0, 5).forEach((item, index) => {
          reply += `${index + 1}. ${item.materialName || item.material_name || '未知物料'} - 不良率: ${item.defectRate || '未知'}%\n`;
        });
      }
    }
    
    // 默认回复
    else {
      reply = `🤖 IQE智能助手为您服务！\n\n当前数据概览：\n- 库存记录：${inMemoryData.inventory.length} 条\n- 检测记录：${inMemoryData.inspection.length} 条\n- 生产记录：${inMemoryData.production.length} 条\n\n您可以询问关于库存、测试、生产的相关问题。`;
    }
    
    console.log('✅ 查询处理完成，返回结果');
    
    res.json({
      reply: reply,
      source: 'test-server',
      scenario: scenario || 'general',
      analysisMode: analysisMode || 'basic',
      aiEnhanced: false,
      matchedData: matchedData.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ 查询处理失败:', error);
    res.status(500).json({ 
      error: error.message,
      reply: '抱歉，查询处理出现错误，请稍后重试。'
    });
  }
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 IQE测试服务器启动成功！`);
  console.log(`📡 服务地址: http://localhost:${PORT}`);
  console.log(`🏥 健康检查: http://localhost:${PORT}/health`);
  console.log(`📊 数据更新: POST http://localhost:${PORT}/api/assistant/update-data`);
  console.log(`🔍 查询接口: POST http://localhost:${PORT}/api/assistant/query`);
  console.log('');
  console.log('等待前端数据同步...');
});
