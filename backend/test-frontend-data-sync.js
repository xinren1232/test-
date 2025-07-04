/**
 * 测试前端数据同步问题
 * 模拟前端推送真实数据到后端
 */

import fetch from 'node-fetch';
import { getRealInMemoryData } from './src/services/realDataAssistantService.js';

// 模拟前端生成的真实数据（基于用户的数据生成逻辑）
const frontendGeneratedData = {
  inventory: [
    // 深圳工厂数据
    {
      id: "INV_SZ_001",
      materialName: "电池盖",
      materialCode: "CS-B001", 
      materialType: "结构件类",
      batchNo: "JL2024001",
      supplier: "聚龙",
      quantity: 150,
      status: "正常",
      warehouse: "深圳库存",
      factory: "深圳工厂",
      storage_location: "深圳工厂",
      inboundTime: "2024-01-15",
      expiryDate: "2025-01-15"
    },
    {
      id: "INV_SZ_002",
      materialName: "中框",
      materialCode: "CS-M001",
      materialType: "结构件类", 
      batchNo: "XG2024001",
      supplier: "欣冠",
      quantity: 200,
      status: "风险",
      warehouse: "深圳库存",
      factory: "深圳工厂",
      storage_location: "深圳工厂",
      inboundTime: "2024-01-20",
      expiryDate: "2025-01-20"
    },
    // 重庆工厂数据
    {
      id: "INV_CQ_001",
      materialName: "LCD显示屏",
      materialCode: "DS-L001",
      materialType: "光学类",
      batchNo: "BOE2024001", 
      supplier: "BOE",
      quantity: 100,
      status: "正常",
      warehouse: "重庆库存",
      factory: "重庆工厂",
      storage_location: "重庆工厂",
      inboundTime: "2024-01-25",
      expiryDate: "2024-07-25"
    },
    // 南昌工厂数据
    {
      id: "INV_NC_001",
      materialName: "摄像头模组",
      materialCode: "OP-C001",
      materialType: "光学类",
      batchNo: "SM2024001",
      supplier: "舜宇",
      quantity: 80,
      status: "正常", 
      warehouse: "南昌库存",
      factory: "南昌工厂",
      storage_location: "南昌工厂",
      inboundTime: "2024-02-01",
      expiryDate: "2024-08-01"
    }
  ],
  inspection: [
    {
      id: "TEST_001",
      materialName: "电池盖",
      batchNo: "JL2024001",
      supplier: "聚龙",
      testDate: "2024-01-16",
      testResult: "PASS",
      defectDescription: null,
      projectId: "X6827"
    },
    {
      id: "TEST_002", 
      materialName: "中框",
      batchNo: "XG2024001",
      supplier: "欣冠",
      testDate: "2024-01-21",
      testResult: "FAIL",
      defectDescription: "表面划伤超标",
      projectId: "S665LN"
    }
  ],
  production: [
    {
      id: "PROD_001",
      materialName: "电池盖",
      materialCode: "CS-B001",
      batchNo: "JL2024001",
      supplier: "聚龙",
      factory: "深圳工厂",
      line: "产线01",
      onlineTime: "2024-01-17",
      defectRate: 2.1,
      defect: "轻微变形",
      projectId: "X6827"
    }
  ]
};

async function testFrontendDataSync() {
  console.log('🔍 测试前端数据同步问题\n');
  
  // 1. 检查当前内存数据状态
  console.log('📊 检查当前内存数据状态:');
  let memoryData = getRealInMemoryData();
  console.log(`当前内存数据: 库存${memoryData.inventory.length}条, 检验${memoryData.inspection.length}条, 生产${memoryData.production.length}条`);
  
  // 2. 模拟前端数据推送
  console.log('\n📤 模拟前端数据推送...');
  console.log(`准备推送数据: 库存${frontendGeneratedData.inventory.length}条, 检验${frontendGeneratedData.inspection.length}条, 生产${frontendGeneratedData.production.length}条`);
  
  try {
    const response = await fetch('http://localhost:3001/api/assistant/update-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(frontendGeneratedData)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('✅ 数据推送成功:', result);

  } catch (error) {
    console.error('❌ 数据推送失败:', error.message);
    return;
  }
  
  // 3. 检查推送后的内存数据状态
  console.log('\n📊 检查推送后的内存数据状态:');
  memoryData = getRealInMemoryData();
  console.log(`推送后内存数据: 库存${memoryData.inventory.length}条, 检验${memoryData.inspection.length}条, 生产${memoryData.production.length}条`);
  
  if (memoryData.inventory.length > 0) {
    console.log('\n📦 库存数据示例:');
    memoryData.inventory.forEach((item, index) => {
      console.log(`${index + 1}. ${item.materialName} - ${item.factory || item.storage_location} (${item.supplier})`);
    });
  }
  
  // 4. 测试工厂查询
  console.log('\n🏭 测试工厂查询功能:');
  
  const testQueries = [
    { query: '查询深圳工厂库存', expectedFactory: '深圳工厂' },
    { query: '重庆工厂的情况', expectedFactory: '重庆工厂' },
    { query: '南昌工厂库存分析', expectedFactory: '南昌工厂' }
  ];
  
  for (const testCase of testQueries) {
    console.log(`\n🔍 测试: "${testCase.query}"`);
    
    try {
      const queryResponse = await fetch('http://localhost:3001/api/assistant/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: testCase.query,
          scenario: 'inventory_management',
          analysisMode: 'intelligent'
        })
      });

      if (!queryResponse.ok) {
        throw new Error(`HTTP ${queryResponse.status}: ${queryResponse.statusText}`);
      }

      const queryResult = await queryResponse.json();
      
      if (queryResult.success) {
        console.log('✅ 查询成功');
        console.log('📊 数据来源:', queryResult.source || '未知');
        
        // 检查是否包含预期工厂的数据
        const responseText = queryResult.response || '';
        if (responseText.includes(testCase.expectedFactory)) {
          console.log(`✅ 包含预期工厂数据: ${testCase.expectedFactory}`);
        } else {
          console.log(`❌ 未包含预期工厂数据: ${testCase.expectedFactory}`);
        }
        
        // 显示响应摘要
        const summary = responseText.split('\n')[0] || responseText.substring(0, 100);
        console.log('📋 响应摘要:', summary);
        
      } else {
        console.log('❌ 查询失败:', queryResult.message || '未知错误');
      }
      
    } catch (error) {
      console.log('❌ 查询异常:', error.message);
    }
  }
  
  console.log('\n🎯 前端数据同步测试完成！');
}

testFrontendDataSync().catch(console.error);
