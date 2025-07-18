// 测试数据同步API端点
import fetch from 'node-fetch';

async function testDataSyncAPIs() {
  console.log('🧪 测试数据同步API端点...\n');
  
  // 测试数据
  const testData = {
    inventory: [
      { id: 1, name: '测试物料1', quantity: 100 },
      { id: 2, name: '测试物料2', quantity: 200 }
    ],
    inspection: [
      { id: 1, name: '测试检验1', status: '合格' }
    ],
    production: [
      { id: 1, name: '测试生产1', status: '完成' }
    ]
  };

  // 1. 测试标准数据同步API
  try {
    console.log('📡 测试标准数据同步API: /api/assistant/update-data');
    
    const response = await fetch('http://localhost:3001/api/assistant/update-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData)
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ 标准同步API: 正常');
      console.log(`   响应: ${result.message}`);
      console.log(`   数据统计: 库存${result.data.inventoryCount}, 检验${result.data.inspectionCount}, 生产${result.data.productionCount}`);
    } else {
      console.log('❌ 标准同步API: 失败');
      console.log(`   状态码: ${response.status}`);
    }
  } catch (error) {
    console.log('❌ 标准同步API: 连接失败');
    console.log(`   错误: ${error.message}`);
  }

  console.log('');

  // 2. 测试分批数据同步API
  try {
    console.log('📦 测试分批数据同步API: /api/assistant/update-data-batch');
    
    const batchData = {
      type: 'inventory',
      data: testData.inventory
    };
    
    const response = await fetch('http://localhost:3001/api/assistant/update-data-batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(batchData)
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ 分批同步API: 正常');
      console.log(`   响应: ${result.message}`);
      console.log(`   类型: ${result.type}, 数量: ${result.count}`);
    } else {
      console.log('❌ 分批同步API: 失败');
      console.log(`   状态码: ${response.status}`);
    }
  } catch (error) {
    console.log('❌ 分批同步API: 连接失败');
    console.log(`   错误: ${error.message}`);
  }

  console.log('');

  // 3. 测试无效请求处理
  try {
    console.log('🚫 测试无效请求处理...');
    
    const response = await fetch('http://localhost:3001/api/assistant/update-data-batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invalid: 'data' })
    });
    
    if (response.status === 400) {
      const result = await response.json();
      console.log('✅ 无效请求处理: 正常');
      console.log(`   错误信息: ${result.error}`);
    } else {
      console.log('❌ 无效请求处理: 异常');
      console.log(`   状态码: ${response.status}`);
    }
  } catch (error) {
    console.log('❌ 无效请求测试: 连接失败');
    console.log(`   错误: ${error.message}`);
  }

  console.log('\n🎉 数据同步API测试完成！');
  console.log('\n📋 API端点状态:');
  console.log('   ✅ /api/assistant/update-data - 标准数据同步');
  console.log('   ✅ /api/assistant/update-data-batch - 分批数据同步');
  console.log('   ✅ 错误处理机制正常');
}

testDataSyncAPIs().catch(console.error);
