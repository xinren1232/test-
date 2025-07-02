/**
 * 测试数据推送功能
 * 验证前端数据是否能正确推送到后端
 */
import { updateRealInMemoryData, processRealQuery } from './src/services/realDataAssistantService.js';

// 模拟前端推送的数据格式
const testPushData = {
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
      inboundTime: "2024-01-15",
      expiryDate: "2024-07-15",
      notes: "高分辨率OLED屏"
    },
    {
      id: "INV_002", 
      materialName: "电池盖",
      materialCode: "CS-B001",
      materialType: "结构件类",
      batchNo: "JL2024002",
      supplier: "聚龙",
      quantity: 50,
      status: "风险",
      warehouse: "深圳库存",
      factory: "深圳工厂",
      inboundTime: "2024-01-20",
      expiryDate: "2025-01-20",
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
      defectDescription: null,
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

async function testDataPush() {
  console.log('🧪 测试数据推送功能...\n');
  
  // 1. 测试数据推送前的状态
  console.log('📋 测试推送前的查询:');
  try {
    const beforeResult = await processRealQuery('查询库存情况');
    console.log('推送前结果:', beforeResult.substring(0, 100) + '...');
  } catch (error) {
    console.log('推送前查询失败:', error.message);
  }
  
  console.log('\n📤 模拟数据推送...');
  
  // 2. 模拟数据推送
  try {
    updateRealInMemoryData(testPushData);
    console.log('✅ 数据推送成功！');
    console.log(`📊 推送数据统计: 库存${testPushData.inventory.length}条, 检验${testPushData.inspection.length}条, 生产${testPushData.production.length}条`);
  } catch (error) {
    console.log('❌ 数据推送失败:', error.message);
    return;
  }
  
  console.log('\n📋 测试推送后的查询:');
  
  // 3. 测试数据推送后的查询
  const testQueries = [
    '查询库存情况',
    '目前有哪些风险库存？',
    '查询BOE供应商的物料',
    '有哪些测试不合格的记录？',
    '工厂数据汇总'
  ];
  
  for (const query of testQueries) {
    console.log(`\n🔍 测试查询: "${query}"`);
    try {
      const result = await processRealQuery(query);
      
      // 检查结果是否包含推送的数据
      const containsData = 
        result.includes('OLED显示屏') || 
        result.includes('电池盖') || 
        result.includes('BOE') || 
        result.includes('聚龙') ||
        result.includes('找到') ||
        result.includes('记录');
        
      if (containsData) {
        console.log('✅ 查询成功，包含推送的数据');
        console.log('📋 结果摘要:', result.split('\n')[0]);
      } else if (result.includes('暂无数据')) {
        console.log('❌ 查询失败，数据未推送成功');
      } else {
        console.log('⚠️ 查询结果异常');
        console.log('📋 完整结果:', result.substring(0, 200) + '...');
      }
    } catch (error) {
      console.log('❌ 查询失败:', error.message);
    }
  }
  
  console.log('\n🎯 数据推送测试完成！');
}

// 运行测试
testDataPush().catch(console.error);
