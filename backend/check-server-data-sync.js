/**
 * 检查服务器端数据同步状态
 * 通过API调用检查服务器内存中的实际数据
 */

import fetch from 'node-fetch';

async function checkServerDataSync() {
  console.log('🔍 检查服务器端数据同步状态\n');
  
  // 1. 先推送测试数据
  const testData = {
    inventory: [
      {
        id: 'sync-test-001',
        materialName: '电池盖',
        supplier: '聚龙',
        factory: '深圳工厂',
        storage_location: '深圳工厂',
        status: '正常',
        quantity: 100,
        batchNo: 'JL2024001'
      },
      {
        id: 'sync-test-002',
        materialName: '中框',
        supplier: '欣冠',
        factory: '重庆工厂',
        storage_location: '重庆工厂',
        status: '风险',
        quantity: 200,
        batchNo: 'XG2024001'
      }
    ],
    inspection: [
      {
        id: 'sync-test-003',
        materialName: '电池盖',
        supplier: '聚龙',
        batchNo: 'JL2024001',
        testResult: 'PASS',
        projectId: 'X6827'
      }
    ],
    production: [
      {
        id: 'sync-test-004',
        materialName: '电池盖',
        supplier: '聚龙',
        factory: '深圳工厂',
        batchNo: 'JL2024001',
        projectId: 'X6827'
      }
    ]
  };
  
  console.log('📤 推送测试数据到服务器...');
  console.log(`数据统计: 库存${testData.inventory.length}条, 检验${testData.inspection.length}条, 生产${testData.production.length}条`);
  
  try {
    const updateResponse = await fetch('http://localhost:3001/api/assistant/update-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    if (!updateResponse.ok) {
      throw new Error(`数据推送失败: ${updateResponse.status} ${updateResponse.statusText}`);
    }

    const updateResult = await updateResponse.json();
    console.log('✅ 数据推送成功:', updateResult.message);

  } catch (error) {
    console.error('❌ 数据推送失败:', error.message);
    return;
  }
  
  // 2. 测试简单查询来验证数据是否在服务器内存中
  console.log('\n🔍 测试服务器内存数据访问...');
  
  const testQueries = [
    {
      query: '查询库存情况',
      description: '基础库存查询，应该返回所有库存数据'
    },
    {
      query: '查询深圳工厂库存',
      description: '工厂筛选查询，应该只返回深圳工厂的数据'
    },
    {
      query: '查询聚龙供应商的物料',
      description: '供应商筛选查询，应该只返回聚龙供应商的数据'
    }
  ];
  
  for (const testCase of testQueries) {
    console.log(`\n🧪 测试查询: "${testCase.query}"`);
    console.log(`   期望: ${testCase.description}`);
    
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
        const errorText = await queryResponse.text();
        console.log(`❌ 查询失败: ${queryResponse.status} ${queryResponse.statusText}`);
        console.log(`错误详情: ${errorText}`);
        continue;
      }

      const queryResult = await queryResponse.json();
      
      if (queryResult.success) {
        console.log('✅ 查询成功');
        
        // 检查是否使用了真实数据
        if (queryResult.source === 'memory_data') {
          console.log('✅ 使用了内存中的真实数据');
        } else if (queryResult.source === 'mock_data') {
          console.log('⚠️ 使用了模拟数据，说明内存数据为空');
        } else {
          console.log('❓ 数据来源未知:', queryResult.source);
        }
        
        // 检查响应内容
        const response = queryResult.response || '';
        if (response.includes('电池盖') || response.includes('聚龙') || response.includes('深圳工厂')) {
          console.log('✅ 响应包含推送的测试数据');
        } else if (response.includes('暂无数据')) {
          console.log('❌ 响应显示暂无数据');
        } else {
          console.log('⚠️ 响应内容异常');
        }
        
        // 显示响应摘要
        const summary = response.split('\n')[0] || response.substring(0, 100);
        console.log(`📋 响应摘要: ${summary}`);
        
      } else {
        console.log('❌ 查询失败:', queryResult.message || '未知错误');
        console.log('完整响应:', JSON.stringify(queryResult, null, 2));
      }
      
    } catch (error) {
      console.log('❌ 查询异常:', error.message);
    }
  }
  
  console.log('\n🎯 服务器端数据同步检查完成');
}

checkServerDataSync().catch(console.error);
