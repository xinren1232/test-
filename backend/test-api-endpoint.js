/**
 * 测试API端点是否正确工作
 */

import fetch from 'node-fetch';

const testData = {
  inventory: [
    {
      id: 'api-test-001',
      materialName: '测试物料',
      supplier: '测试供应商',
      factory: '测试工厂',
      storage_location: '测试工厂',
      status: '正常',
      quantity: 999
    }
  ],
  inspection: [],
  production: []
};

async function testAPIEndpoint() {
  console.log('🔍 测试API端点\n');
  
  console.log('📤 发送POST请求到 /api/assistant/update-data...');
  console.log('请求数据:', JSON.stringify(testData, null, 2));
  
  try {
    const response = await fetch('http://localhost:3001/api/assistant/update-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    console.log('\n📊 响应状态:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ 响应错误:', errorText);
      return;
    }

    const result = await response.json();
    console.log('✅ 响应结果:', JSON.stringify(result, null, 2));

    // 立即检查内存数据
    console.log('\n🔍 检查API调用后的内存数据:');
    const { getRealInMemoryData } = await import('./src/services/realDataAssistantService.js');
    const memoryData = getRealInMemoryData();
    console.log(`内存数据: 库存${memoryData.inventory.length}条, 检验${memoryData.inspection.length}条, 生产${memoryData.production.length}条`);

    if (memoryData.inventory.length > 0) {
      console.log('第一条库存数据:', memoryData.inventory[0]);
    }

    // 检查响应头
    console.log('\n📋 响应头:');
    for (const [key, value] of response.headers.entries()) {
      console.log(`${key}: ${value}`);
    }

  } catch (error) {
    console.error('❌ 请求失败:', error.message);
  }
}

testAPIEndpoint();
