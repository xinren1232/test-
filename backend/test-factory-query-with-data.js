/**
 * 测试工厂查询功能（有数据状态下）
 */

import { updateRealInMemoryData } from './src/services/realDataAssistantService.js';
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
    },
    {
      id: 'test-003',
      materialName: 'LCD显示屏',
      supplier: 'BOE',
      factory: '南昌工厂',
      batchNo: '345678',
      status: '正常',
      quantity: 150,
      storage_location: '南昌工厂'
    }
  ],
  inspection: [
    {
      id: 'test-004',
      materialName: '电池盖',
      supplier: '聚龙',
      batchNo: '123456',
      testResult: 'PASS',
      projectId: 'X6827'
    }
  ],
  production: [
    {
      id: 'test-005',
      materialName: '电池盖',
      supplier: '聚龙',
      factory: '深圳工厂',
      batchNo: '123456',
      projectId: 'X6827',
      defectRate: 2.5
    }
  ]
};

async function testFactoryQueryWithData() {
  console.log('🔍 测试工厂查询功能（有数据状态）\n');
  
  // 1. 推送测试数据
  console.log('📤 推送测试数据...');
  updateRealInMemoryData(testData);
  console.log('✅ 数据推送完成\n');
  
  // 2. 初始化智能意图服务
  console.log('🚀 初始化智能意图服务...');
  const intentService = new IntelligentIntentService();
  await intentService.initialize();
  console.log('✅ 智能意图服务初始化完成\n');
  
  // 3. 测试工厂查询
  const factoryQueries = [
    '查询深圳工厂库存',
    '重庆工厂的情况怎么样？',
    '南昌工厂有多少库存？',
    '宜宾工厂库存分析'
  ];
  
  for (const query of factoryQueries) {
    console.log(`🔍 测试查询: "${query}"`);
    try {
      const result = await intentService.processQuery(query);
      
      if (result.success) {
        console.log('✅ 查询成功');
        console.log('📊 数据来源:', result.source || '未知');
        console.log('🔢 返回记录数:', result.data?.length || 0);
        
        if (result.data && result.data.length > 0) {
          console.log('📋 示例记录:');
          const sample = result.data[0];
          console.log(`   - 物料: ${sample.materialName || sample.material_name || '未知'}`);
          console.log(`   - 工厂: ${sample.factory || sample.storage_location || '未知'}`);
          console.log(`   - 供应商: ${sample.supplier || '未知'}`);
        } else {
          console.log('⚠️ 返回数据为空');
        }
      } else {
        console.log('❌ 查询失败:', result.message || '未知错误');
      }
    } catch (error) {
      console.log('❌ 查询异常:', error.message);
    }
    console.log(''); // 空行分隔
  }
  
  console.log('🎯 工厂查询测试完成！');
}

testFactoryQueryWithData().catch(console.error);
