/**
 * 简化的真实数据问答系统测试
 */
import { processRealQuery, updateRealInMemoryData } from './src/services/realDataAssistantService.js';

// 简单的测试数据
const testData = {
  inventory: [
    {
      id: "INV_001",
      materialName: "OLED显示屏",
      materialCode: "DS-O001",
      materialType: "光学类",
      batchNo: "BOE2024001",
      supplier: "BOE",
      quantity: 500,
      status: "正常",
      warehouse: "中央库存",
      factory: "深圳工厂",
      notes: "高分辨率OLED屏"
    },
    {
      id: "INV_002", 
      materialName: "电池盖",
      materialCode: "CS-B001",
      materialType: "结构件类",
      batchNo: "JL2024002",
      supplier: "聚龙",
      quantity: 1000,
      status: "风险",
      warehouse: "深圳库存",
      factory: "深圳工厂",
      notes: "表面有轻微划痕"
    }
  ],
  inspection: [
    {
      id: "TEST_001",
      materialName: "OLED显示屏",
      batchNo: "BOE2024001",
      supplier: "BOE",
      testDate: "2024-01-16",
      testResult: "PASS",
      projectId: "X6827"
    },
    {
      id: "TEST_002",
      materialName: "电池盖", 
      batchNo: "JL2024002",
      supplier: "聚龙",
      testDate: "2024-01-21",
      testResult: "FAIL",
      defectDescription: "表面划伤超标",
      projectId: "S665LN"
    }
  ],
  production: [
    {
      id: "PROD_001",
      materialName: "OLED显示屏",
      materialCode: "DS-O001",
      batchNo: "BOE2024001",
      supplier: "BOE",
      factory: "深圳工厂",
      line: "产线01",
      onlineTime: "2024-01-17",
      defectRate: 2.1,
      defect: "轻微mura现象",
      projectId: "X6827"
    }
  ]
};

async function simpleTest() {
  console.log('🧪 简化测试开始...');
  
  // 推送数据
  console.log('📤 推送测试数据...');
  updateRealInMemoryData(testData);
  
  // 测试查询
  const queries = [
    '查询BOE供应商的物料',
    '查询OLED显示屏的库存',
    '目前有哪些风险库存？',
    '查询深圳工厂的库存情况',
    '有哪些测试不合格的记录？'
  ];
  
  for (const query of queries) {
    console.log(`\n🔍 测试: "${query}"`);
    try {
      const result = await processRealQuery(query);
      console.log('✅ 结果:', result.substring(0, 200) + (result.length > 200 ? '...' : ''));
    } catch (error) {
      console.log('❌ 错误:', error.message);
    }
  }
  
  console.log('\n🎉 测试完成！');
}

simpleTest();
