/**
 * 简化的测试服务器 - 用于调试问答规则
 */
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;

// 基础中间件
app.use(cors());
app.use(express.json({ limit: '10mb' })); // 增加请求大小限制以支持大量数据

// 内存数据存储
let memoryData = {
  inventory: [],
  inspection: [],
  production: []
};

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: '简化服务器运行正常'
  });
});

// 数据更新接口
app.post('/api/assistant/update-data', (req, res) => {
  try {
    const { inventory, inspection, production } = req.body;

    if (inventory) memoryData.inventory = inventory;
    if (inspection) memoryData.inspection = inspection;
    if (production) memoryData.production = production;

    console.log('📊 数据更新成功:', {
      inventory: memoryData.inventory.length,
      inspection: memoryData.inspection.length,
      production: memoryData.production.length
    });

    res.json({
      success: true,
      message: '数据更新成功',
      counts: {
        inventory: memoryData.inventory.length,
        inspection: memoryData.inspection.length,
        production: memoryData.production.length
      }
    });
  } catch (error) {
    console.error('❌ 数据更新失败:', error);
    res.status(500).json({ error: '数据更新失败' });
  }
});

// 简化的查询接口
app.post('/api/assistant/query', (req, res) => {
  try {
    const { query, scenario, analysisMode, requireDataAnalysis } = req.body;
    
    console.log('🔍 收到查询:', query);
    console.log('📊 当前数据:', {
      inventory: memoryData.inventory.length,
      inspection: memoryData.inspection.length,
      production: memoryData.production.length
    });
    
    // 简单的规则匹配
    let response = '';
    let matchedRule = null;
    
    if (query.includes('深圳工厂') && query.includes('库存')) {
      const factoryInventory = memoryData.inventory.filter(item => 
        item.factory && item.factory.includes('深圳')
      );
      
      if (factoryInventory.length > 0) {
        response = `📦 找到 ${factoryInventory.length} 条深圳工厂库存记录：\n\n`;
        
        factoryInventory.forEach((item, index) => {
          response += `${index + 1}. ${item.materialName}\n`;
          response += `   📋 物料编码: ${item.materialCode}\n`;
          response += `   🏢 供应商: ${item.supplier}\n`;
          response += `   📊 数量: ${item.quantity}\n`;
          response += `   ⚡ 状态: ${item.status}\n`;
          response += `   🏭 工厂: ${item.factory}\n`;
          response += `   📍 仓库: ${item.warehouse}\n`;
          if (item.notes) response += `   📝 备注: ${item.notes}\n`;
          response += '\n';
        });
        
        matchedRule = 'query_factory_inventory';
      } else {
        response = '抱歉，没有找到深圳工厂的库存数据。';
      }
    } else if (query.includes('BOE') && query.includes('物料')) {
      const boeInventory = memoryData.inventory.filter(item => 
        item.supplier && item.supplier.includes('BOE')
      );
      
      if (boeInventory.length > 0) {
        response = `📦 找到 ${boeInventory.length} 条BOE供应商物料记录：\n\n`;
        
        boeInventory.forEach((item, index) => {
          response += `${index + 1}. ${item.materialName}\n`;
          response += `   📋 物料编码: ${item.materialCode}\n`;
          response += `   📊 数量: ${item.quantity}\n`;
          response += `   ⚡ 状态: ${item.status}\n`;
          response += `   🏭 工厂: ${item.factory}\n`;
          response += '\n';
        });
        
        matchedRule = 'query_supplier_inventory';
      } else {
        response = '抱歉，没有找到BOE供应商的物料数据。';
      }
    } else if (query.includes('OLED显示屏') && query.includes('库存')) {
      const oledInventory = memoryData.inventory.filter(item => 
        item.materialName && item.materialName.includes('OLED显示屏')
      );
      
      if (oledInventory.length > 0) {
        response = `📦 找到 ${oledInventory.length} 条OLED显示屏库存记录：\n\n`;
        
        oledInventory.forEach((item, index) => {
          response += `${index + 1}. ${item.materialName}\n`;
          response += `   📋 物料编码: ${item.materialCode}\n`;
          response += `   🏢 供应商: ${item.supplier}\n`;
          response += `   📊 数量: ${item.quantity}\n`;
          response += `   ⚡ 状态: ${item.status}\n`;
          response += `   🏭 工厂: ${item.factory}\n`;
          response += '\n';
        });
        
        matchedRule = 'query_material_inventory';
      } else {
        response = '抱歉，没有找到OLED显示屏的库存数据。';
      }
    } else {
      response = '抱歉，我没有找到相关信息。请提供更多详细信息。';
    }
    
    console.log('✅ 查询处理完成，回复长度:', response.length);
    
    res.json({
      reply: response,
      source: 'rule-based',
      aiEnhanced: false,
      matchedRule: matchedRule,
      scenario: scenario,
      analysisMode: 'rule-based'
    });
    
  } catch (error) {
    console.error('❌ 查询处理失败:', error);
    res.status(500).json({ error: '查询处理失败' });
  }
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 简化服务器已启动，端口: ${PORT}`);
  console.log(`📊 健康检查: http://localhost:${PORT}/api/health`);
});

// 错误处理
process.on('uncaughtException', (error) => {
  console.error('❌ 未捕获的异常:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ 未处理的Promise拒绝:', reason);
});

export default app;
