const express = require('express');
const cors = require('cors');
const app = express();
const port = 3001;

// 中间件
app.use(cors());
app.use(express.json());

// 存储数据
let dataStore = {
  inventory: [],
  inspection: [],
  production: []
};

// 健康检查
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    dataCount: {
      inventory: dataStore.inventory.length,
      inspection: dataStore.inspection.length,
      production: dataStore.production.length
    }
  });
});

// 更新数据接口
app.post('/api/assistant/update-data', (req, res) => {
  try {
    const { inventory, inspection, production } = req.body;
    
    if (inventory) dataStore.inventory = inventory;
    if (inspection) dataStore.inspection = inspection;
    if (production) dataStore.production = production;
    
    console.log('✅ 数据更新成功:', {
      inventory: dataStore.inventory.length,
      inspection: dataStore.inspection.length,
      production: dataStore.production.length
    });
    
    res.json({ 
      success: true, 
      message: '数据更新成功',
      dataCount: {
        inventory: dataStore.inventory.length,
        inspection: dataStore.inspection.length,
        production: dataStore.production.length
      }
    });
  } catch (error) {
    console.error('❌ 数据更新失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 查询接口
app.post('/api/assistant/query', (req, res) => {
  try {
    const { query, scenario } = req.body;
    console.log('🔍 收到查询请求:', query);
    console.log('🎯 分析场景:', scenario);
    
    // 简单的查询处理逻辑
    let result = processQuery(query, scenario);
    
    console.log('📊 查询结果:', result);
    
    res.json({
      success: true,
      reply: result,
      scenario: scenario,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ 查询处理失败:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      reply: `查询处理出错: ${error.message}`
    });
  }
});

// 查询处理函数
function processQuery(query, scenario) {
  const queryLower = query.toLowerCase();
  
  // 库存相关查询
  if (queryLower.includes('库存') || queryLower.includes('物料')) {
    const inventoryCount = dataStore.inventory.length;
    if (inventoryCount === 0) {
      return '📦 当前没有库存数据。请确保数据已正确同步。';
    }
    
    // 工厂查询
    if (queryLower.includes('深圳')) {
      const shenzhenItems = dataStore.inventory.filter(item => 
        item.factory && item.factory.includes('深圳')
      );
      return `📦 深圳工厂库存情况：\n\n共有 ${shenzhenItems.length} 条库存记录\n\n${formatInventoryList(shenzhenItems.slice(0, 5))}`;
    }
    
    if (queryLower.includes('宜宾')) {
      const yibinItems = dataStore.inventory.filter(item => 
        item.factory && item.factory.includes('宜宾')
      );
      return `📦 宜宾工厂库存情况：\n\n共有 ${yibinItems.length} 条库存记录\n\n${formatInventoryList(yibinItems.slice(0, 5))}`;
    }
    
    // 供应商查询
    if (queryLower.includes('boe')) {
      const boeItems = dataStore.inventory.filter(item => 
        item.supplier && item.supplier.includes('BOE')
      );
      return `📦 BOE供应商库存情况：\n\n共有 ${boeItems.length} 条库存记录\n\n${formatInventoryList(boeItems.slice(0, 5))}`;
    }
    
    // 状态查询
    if (queryLower.includes('正常')) {
      const normalItems = dataStore.inventory.filter(item => 
        item.status === '正常'
      );
      return `📦 正常状态库存：\n\n共有 ${normalItems.length} 条正常库存记录\n\n${formatInventoryList(normalItems.slice(0, 5))}`;
    }
    
    // 通用库存查询
    return `📦 库存总览：\n\n总库存记录：${inventoryCount} 条\n\n${formatInventoryList(dataStore.inventory.slice(0, 5))}`;
  }
  
  // 检测相关查询
  if (queryLower.includes('检测') || queryLower.includes('测试')) {
    const inspectionCount = dataStore.inspection.length;
    if (inspectionCount === 0) {
      return '🧪 当前没有检测数据。请确保数据已正确同步。';
    }
    
    return `🧪 检测数据总览：\n\n总检测记录：${inspectionCount} 条\n\n${formatInspectionList(dataStore.inspection.slice(0, 5))}`;
  }
  
  // 生产相关查询
  if (queryLower.includes('生产') || queryLower.includes('产线')) {
    const productionCount = dataStore.production.length;
    if (productionCount === 0) {
      return '⚙️ 当前没有生产数据。请确保数据已正确同步。';
    }
    
    return `⚙️ 生产数据总览：\n\n总生产记录：${productionCount} 条\n\n${formatProductionList(dataStore.production.slice(0, 5))}`;
  }
  
  // 统计查询
  if (queryLower.includes('统计') || queryLower.includes('总数')) {
    return `📊 数据统计总览：\n\n📦 库存记录：${dataStore.inventory.length} 条\n🧪 检测记录：${dataStore.inspection.length} 条\n⚙️ 生产记录：${dataStore.production.length} 条\n\n数据同步时间：${new Date().toLocaleString()}`;
  }
  
  // 默认回复
  return `🤖 收到您的查询："${query}"\n\n当前数据状态：\n📦 库存：${dataStore.inventory.length} 条\n🧪 检测：${dataStore.inspection.length} 条\n⚙️ 生产：${dataStore.production.length} 条\n\n请尝试更具体的查询，如"深圳工厂库存"、"BOE供应商"等。`;
}

// 格式化库存列表
function formatInventoryList(items) {
  if (!items || items.length === 0) return '暂无数据';
  
  return items.map((item, index) => 
    `${index + 1}. ${item.materialName || '未知物料'} - ${item.supplier || '未知供应商'} - ${item.status || '未知状态'}`
  ).join('\n');
}

// 格式化检测列表
function formatInspectionList(items) {
  if (!items || items.length === 0) return '暂无数据';
  
  return items.map((item, index) => 
    `${index + 1}. ${item.materialName || '未知物料'} - ${item.testResult || '未知结果'} - ${item.inspectionDate || '未知日期'}`
  ).join('\n');
}

// 格式化生产列表
function formatProductionList(items) {
  if (!items || items.length === 0) return '暂无数据';
  
  return items.map((item, index) => 
    `${index + 1}. ${item.materialName || '未知物料'} - 项目${item.project || '未知'} - 不良率${item.defectRate || '未知'}%`
  ).join('\n');
}

// 启动服务器
app.listen(port, () => {
  console.log(`🚀 IQE智能助手测试服务器运行在 http://localhost:${port}`);
  console.log(`📊 健康检查: http://localhost:${port}/health`);
  console.log(`🤖 查询接口: POST http://localhost:${port}/api/assistant/query`);
  console.log(`📝 数据更新: POST http://localhost:${port}/api/assistant/update-data`);
});
