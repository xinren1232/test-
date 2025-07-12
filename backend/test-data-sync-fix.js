/**
 * 测试修复后的数据同步功能
 */

import fetch from 'node-fetch';

// 生成测试数据
function generateTestData() {
  return {
    inventory: [
      {
        id: 1,
        materialName: "LCD显示屏",
        materialCode: "DS-L-B9172",
        batchNo: "669033",
        supplier: "BOE",
        quantity: 100,
        status: "正常",
        warehouse: "深圳仓库",
        inboundTime: "2024-12-01",
        notes: "测试数据"
      }
    ],
    inspection: [
      {
        id: 1,
        materialName: "LCD显示屏",
        batchNo: "669033",
        supplier: "BOE",
        testResult: "PASS",
        testDate: "2024-12-01",
        defectDescription: "",
        notes: "测试通过"
      }
    ],
    production: [
      {
        id: 1,
        materialName: "LCD显示屏",
        materialCode: "DS-L-B9172",
        batchNo: "669033",
        supplier: "BOE",
        factory: "深圳工厂",
        onlineTime: "2024-12-01",
        defectRate: 0.02,
        defect: 1
      }
    ]
  };
}

async function testDataSyncFix() {
  console.log('🧪 测试修复后的数据同步功能...\n');
  
  try {
    // 1. 生成测试数据
    const testData = generateTestData();
    console.log('📊 生成测试数据:');
    console.log(`  库存数据: ${testData.inventory.length} 条`);
    console.log(`  检验数据: ${testData.inspection.length} 条`);
    console.log(`  生产数据: ${testData.production.length} 条`);
    
    // 2. 验证数据格式
    console.log('\n🔍 验证数据格式:');
    
    // 检查必要字段
    const inventorySample = testData.inventory[0];
    const requiredInventoryFields = ['materialName', 'batchNo', 'supplier'];
    const hasRequiredFields = requiredInventoryFields.every(field => inventorySample[field]);
    
    console.log(`  库存数据必要字段: ${hasRequiredFields ? '✅' : '❌'}`);
    console.log(`  字段检查: ${requiredInventoryFields.map(f => `${f}=${inventorySample[f]}`).join(', ')}`);
    
    // 3. 发送同步请求
    console.log('\n📤 发送数据同步请求...');
    
    const response = await fetch('http://localhost:3001/api/assistant/update-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Sync-Timestamp': new Date().toISOString()
      },
      body: JSON.stringify(testData)
    });
    
    console.log(`📊 响应状态: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ 数据同步成功!');
      console.log('📋 同步结果:', result);
      
      // 4. 验证后端数据
      console.log('\n🔍 验证后端数据...');
      const verifyResponse = await fetch('http://localhost:3001/api/assistant/verify-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          expectedCounts: {
            inventory: testData.inventory.length,
            inspection: testData.inspection.length,
            production: testData.production.length
          }
        })
      });
      
      if (verifyResponse.ok) {
        const verifyResult = await verifyResponse.json();
        console.log('📊 数据验证结果:', verifyResult);
        
        if (verifyResult.verified) {
          console.log('✅ 数据验证通过！');
        } else {
          console.log('❌ 数据验证失败:', verifyResult.message);
        }
      }
      
    } else {
      const errorText = await response.text();
      console.log('❌ 数据同步失败:');
      console.log(`  状态码: ${response.status}`);
      console.log(`  错误信息: ${errorText}`);
      
      // 尝试解析错误详情
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.details) {
          console.log('  详细错误:');
          errorData.details.forEach(detail => {
            console.log(`    - ${detail}`);
          });
        }
      } catch (e) {
        // 忽略JSON解析错误
      }
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

// 运行测试
testDataSyncFix();
