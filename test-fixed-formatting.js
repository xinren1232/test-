/**
 * 测试修复后的格式化效果
 */

import { processRealQuery, updateRealInMemoryData } from './backend/src/services/realDataAssistantService.js';

// 模拟真实数据
const testData = {
  inventory: [
    {
      id: 'INV_001',
      materialName: 'OLED显示屏',
      materialCode: 'MAT_OLED_001',
      supplier: 'BOE',
      quantity: 500,
      status: '正常',
      factory: '深圳工厂',
      warehouse: 'A区',
      batchNo: 'TK240601',
      inboundTime: '2024-06-01 10:00:00'
    },
    {
      id: 'INV_002',
      materialName: '电池盖',
      materialCode: 'MAT_COVER_002',
      supplier: '聚龙',
      quantity: 1000,
      status: '风险',
      factory: '深圳工厂',
      warehouse: 'B区',
      batchNo: 'SS240602',
      inboundTime: '2024-06-02 14:30:00'
    },
    {
      id: 'INV_003',
      materialName: '散热片',
      materialCode: 'MAT_HEAT_003',
      supplier: '富士康',
      quantity: 800,
      status: '冻结',
      factory: '上海工厂',
      warehouse: 'C区',
      batchNo: 'TK240603',
      inboundTime: '2024-06-03 09:15:00'
    }
  ],
  inspection: [
    {
      id: 'TEST_001',
      materialName: 'OLED显示屏',
      supplier: 'BOE',
      batchNo: 'TK240601',
      testResult: 'PASS',
      testDate: '2024-06-01',
      defectDescription: null
    },
    {
      id: 'TEST_002',
      materialName: '电池盖',
      supplier: '聚龙',
      batchNo: 'SS240602',
      testResult: 'FAIL',
      testDate: '2024-06-02',
      defectDescription: '表面划痕'
    }
  ],
  production: [
    {
      id: 'PROD_001',
      materialName: 'OLED显示屏',
      materialCode: 'MAT_OLED_001',
      supplier: 'BOE',
      batchNo: 'TK240601',
      factory: '深圳工厂',
      line: '产线A',
      onlineTime: '2024-06-01 16:00:00',
      defectRate: 0.5,
      defect: null,
      projectId: 'PRJ_001'
    },
    {
      id: 'PROD_002',
      materialName: '电池盖',
      materialCode: 'MAT_COVER_002',
      supplier: '聚龙',
      batchNo: 'SS240602',
      factory: '深圳工厂',
      line: '产线B',
      onlineTime: '2024-06-02 18:30:00',
      defectRate: 2.8,
      defect: '装配不良',
      projectId: 'PRJ_002'
    }
  ]
};

async function testFormattedQueries() {
  console.log('🧪 测试修复后的格式化效果\n');
  
  // 更新内存数据
  updateRealInMemoryData(testData);
  
  const testQueries = [
    '目前有哪些风险库存？',
    '显示所有生产记录',
    '批次TK240601的全链路追溯',
    '工厂汇总统计',
    '供应商汇总统计',
    '系统数据总览'
  ];
  
  for (const query of testQueries) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🔍 查询: ${query}`);
    console.log(`${'='.repeat(60)}`);
    
    try {
      const result = await processRealQuery(query);
      console.log('📊 结果:');
      console.log(result);
    } catch (error) {
      console.error('❌ 查询失败:', error.message);
    }
    
    console.log('\n' + '-'.repeat(60));
  }
}

// 运行测试
testFormattedQueries().catch(console.error);
