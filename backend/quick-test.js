/**
 * 快速测试增强问答系统
 */
import { processRealQuery, updateRealInMemoryData } from './src/services/realDataAssistantService.js';

const testData = {
  inventory: [
    {
      id: 'INV_001',
      materialName: 'OLED显示屏',
      supplier: 'BOE',
      quantity: 500,
      status: '正常',
      factory: '深圳工厂'
    },
    {
      id: 'INV_002',
      materialName: '电池盖',
      supplier: '聚龙',
      quantity: 1000,
      status: '风险',
      factory: '深圳工厂'
    }
  ],
  inspection: [],
  production: []
};

async function quickTest() {
  console.log('🧪 快速测试开始...');
  
  updateRealInMemoryData(testData);
  
  const queries = [
    '目前有哪些风险库存？',
    '查询深圳工厂的库存情况',
    '工厂数据汇总'
  ];
  
  for (const query of queries) {
    console.log(`\n🔍 测试: "${query}"`);
    try {
      const result = await processRealQuery(query);
      console.log('✅ 结果:', result.substring(0, 200) + '...');
    } catch (error) {
      console.log('❌ 错误:', error.message);
    }
  }
}

quickTest();
