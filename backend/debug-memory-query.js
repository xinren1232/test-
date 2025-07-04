/**
 * 调试内存查询功能
 */

import { updateRealInMemoryData, getRealInMemoryData } from './src/services/realDataAssistantService.js';
import IntelligentIntentService from './src/services/intelligentIntentService.js';

// 推送测试数据
const testData = {
  inventory: [
    {
      id: 'test-001',
      materialName: '电池盖',
      supplier: '聚龙',
      factory: '深圳工厂',
      batchNo: '123456',
      status: '正常',
      quantity: 100,
      storage_location: '深圳工厂'
    },
    {
      id: 'test-002', 
      materialName: '中框',
      supplier: '欣冠',
      factory: '重庆工厂',
      batchNo: '234567',
      status: '风险',
      quantity: 200,
      storage_location: '重庆工厂'
    }
  ],
  inspection: [],
  production: []
};

async function debugMemoryQuery() {
  try {
    console.log('🔍 调试内存查询功能\n');

    // 1. 推送测试数据
    console.log('📤 推送测试数据...');
    updateRealInMemoryData(testData);

    // 2. 检查内存数据
    console.log('\n📊 检查内存数据:');
    const memoryData = getRealInMemoryData();
    console.log('库存数据条数:', memoryData.inventory.length);
    if (memoryData.inventory.length > 0) {
      console.log('第一条库存数据:', JSON.stringify(memoryData.inventory[0], null, 2));
    }

    // 3. 初始化智能意图服务
    console.log('\n🚀 初始化智能意图服务...');
    const intentService = new IntelligentIntentService();
    await intentService.initialize();
  
  // 4. 手动测试executeInMemoryQuery方法
  console.log('\n🧪 手动测试executeInMemoryQuery方法:');
  
  const sql = 'SELECT * FROM inventory WHERE storage_location LIKE CONCAT("%", ?, "%") ORDER BY inbound_time DESC';
  const params = { factory: '深圳工厂' };
  
  console.log('SQL:', sql);
  console.log('参数:', params);
  
  const results = intentService.executeInMemoryQuery(sql, params, memoryData);
  console.log('查询结果数量:', results.length);
  
  if (results.length > 0) {
    console.log('第一条结果:', JSON.stringify(results[0], null, 2));
  }
  
  // 5. 测试不同工厂的查询
  console.log('\n🏭 测试不同工厂查询:');
  
  const factories = ['深圳工厂', '重庆工厂', '南昌工厂'];
  
  for (const factory of factories) {
    const factoryParams = { factory };
    const factoryResults = intentService.executeInMemoryQuery(sql, factoryParams, memoryData);
    console.log(`${factory}: ${factoryResults.length} 条记录`);
    
    if (factoryResults.length > 0) {
      console.log(`  示例: ${factoryResults[0].material_name} - ${factoryResults[0].factory}`);
    }
  }
  
    console.log('\n✅ 调试完成');
  } catch (error) {
    console.error('❌ 调试过程中出错:', error);
  }
}

debugMemoryQuery().catch(console.error);
