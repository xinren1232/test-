/**
 * 直接测试updateRealInMemoryData函数
 */

import { updateRealInMemoryData, getRealInMemoryData } from './src/services/realDataAssistantService.js';

console.log('🔍 直接测试updateRealInMemoryData函数\n');

// 1. 检查初始状态
console.log('📊 初始内存数据状态:');
let memoryData = getRealInMemoryData();
console.log(`库存: ${memoryData.inventory.length}条`);
console.log(`检验: ${memoryData.inspection.length}条`);
console.log(`生产: ${memoryData.production.length}条`);

// 2. 准备测试数据
const testData = {
  inventory: [
    {
      id: 'test-001',
      materialName: '电池盖',
      supplier: '聚龙',
      factory: '深圳工厂',
      storage_location: '深圳工厂',
      status: '正常',
      quantity: 100
    }
  ],
  inspection: [
    {
      id: 'test-002',
      materialName: '电池盖',
      supplier: '聚龙',
      testResult: 'PASS'
    }
  ],
  production: [
    {
      id: 'test-003',
      materialName: '电池盖',
      supplier: '聚龙',
      factory: '深圳工厂'
    }
  ]
};

console.log('\n📤 调用updateRealInMemoryData函数...');
console.log(`准备更新数据: 库存${testData.inventory.length}条, 检验${testData.inspection.length}条, 生产${testData.production.length}条`);

// 3. 调用更新函数
try {
  updateRealInMemoryData(testData);
  console.log('✅ updateRealInMemoryData调用成功');
} catch (error) {
  console.error('❌ updateRealInMemoryData调用失败:', error);
}

// 4. 检查更新后状态
console.log('\n📊 更新后内存数据状态:');
memoryData = getRealInMemoryData();
console.log(`库存: ${memoryData.inventory.length}条`);
console.log(`检验: ${memoryData.inspection.length}条`);
console.log(`生产: ${memoryData.production.length}条`);

if (memoryData.inventory.length > 0) {
  console.log('\n📦 库存数据示例:');
  console.log(JSON.stringify(memoryData.inventory[0], null, 2));
}

console.log('\n✅ 测试完成');
