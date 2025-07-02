/**
 * 测试单个查询
 */
import { processRealQuery, updateRealInMemoryData } from './src/services/realDataAssistantService.js';

async function testSingleQuery() {
  console.log('🔧 测试单个查询...\n');
  
  try {
    // 推送测试数据
    const testData = {
      inventory: [
        {
          id: 'INV_003',
          materialName: '中框',
          materialCode: 'CS-S-Z001',
          materialType: '结构件类',
          batchNo: 'JL2024002',
          supplier: '聚龙',
          quantity: 500,
          status: '冻结',
          warehouse: '重庆库存',
          factory: '重庆工厂'
        }
      ],
      inspection: [],
      production: []
    };
    
    updateRealInMemoryData(testData);
    console.log(`✅ 推送数据: 库存${testData.inventory.length}条`);
    
    // 测试查询
    const query = '查询中框';
    console.log(`\n🎯 测试查询: "${query}"`);
    
    const result = await processRealQuery(query);
    
    if (result.includes('找到') && result.includes('中框')) {
      console.log('✅ 查询成功！');
      console.log('📋 结果:', result);
    } else {
      console.log('❌ 查询失败');
      console.log('📋 结果:', result.substring(0, 200) + '...');
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

testSingleQuery().catch(console.error);
