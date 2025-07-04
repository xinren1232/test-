/**
 * 检查内存数据状态
 */

import { getRealInMemoryData } from './src/services/realDataAssistantService.js';

console.log('🔍 检查内存数据状态...');

const data = getRealInMemoryData();

console.log('📊 当前内存数据状态:');
console.log('库存数据:', data.inventory.length, '条');
console.log('检验数据:', data.inspection.length, '条');
console.log('生产数据:', data.production.length, '条');

if (data.inventory.length > 0) {
  console.log('\n📦 库存数据示例:');
  console.log('- 物料名称:', data.inventory[0].materialName);
  console.log('- 供应商:', data.inventory[0].supplier);
  console.log('- 工厂:', data.inventory[0].factory);
  console.log('- 批次号:', data.inventory[0].batchNo);
  console.log('- 状态:', data.inventory[0].status);
} else {
  console.log('\n❌ 内存中没有库存数据');
}

if (data.inspection.length > 0) {
  console.log('\n🧪 检验数据示例:');
  console.log('- 物料名称:', data.inspection[0].materialName);
  console.log('- 测试结果:', data.inspection[0].testResult);
  console.log('- 批次号:', data.inspection[0].batchNo);
} else {
  console.log('\n❌ 内存中没有检验数据');
}

if (data.production.length > 0) {
  console.log('\n🏭 生产数据示例:');
  console.log('- 物料名称:', data.production[0].materialName);
  console.log('- 工厂:', data.production[0].factory);
  console.log('- 批次号:', data.production[0].batchNo);
} else {
  console.log('\n❌ 内存中没有生产数据');
}

console.log('\n✅ 内存数据检查完成');
