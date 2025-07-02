/**
 * 测试API连接和数据同步
 */

async function testAPIConnection() {
  console.log('🔍 测试API连接和数据同步...\n');
  
  try {
    // 1. 测试基本连接
    console.log('1️⃣ 测试基本API连接...');
    const healthResponse = await fetch('http://localhost:3001/api/health');
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('✅ API服务连接正常:', healthData);
    } else {
      console.log('❌ API服务连接失败:', healthResponse.status);
      return;
    }
    
    // 2. 测试数据推送
    console.log('\n2️⃣ 测试数据推送...');
    const testData = {
      inventory: [
        {
          factory: '深圳工厂',
          warehouse: '仓库A',
          materialCode: 'M001',
          materialName: '电池盖',
          supplier: '聚龙供应商',
          batchCode: 'B001',
          quantity: 100,
          status: '正常',
          inspectionDate: '2024-01-15',
          shelfLife: '2025-01-15'
        }
      ],
      inspection: [
        {
          testId: 'T001',
          testDate: '2024-01-15',
          baseline: 'BL001',
          project: 'P001',
          materialCode: 'M001',
          materialName: '电池盖',
          supplier: '聚龙供应商',
          batchNo: 'B001',
          testResult: 'PASS',
          defectPhenomena: ''
        }
      ],
      production: [
        {
          factory: '深圳工厂',
          baseline: 'BL001',
          project: 'P001',
          materialCode: 'M001',
          materialName: '电池盖',
          supplier: '聚龙供应商',
          batchCode: 'B001',
          defectRate: 0.02,
          defectPhenomena: '轻微划痕'
        }
      ]
    };
    
    const pushResponse = await fetch('http://localhost:3001/api/assistant/update-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });
    
    if (pushResponse.ok) {
      const pushResult = await pushResponse.json();
      console.log('✅ 数据推送成功:', pushResult);
    } else {
      const pushError = await pushResponse.text();
      console.log('❌ 数据推送失败:', pushResponse.status, pushError);
      return;
    }
    
    // 3. 测试查询功能
    console.log('\n3️⃣ 测试查询功能...');
    const testQueries = [
      '查询深圳工厂的库存',
      '查询电池盖',
      '查询聚龙供应商',
      '有哪些测试记录？'
    ];
    
    for (const query of testQueries) {
      console.log(`\n🎯 测试查询: "${query}"`);
      
      const queryResponse = await fetch('http://localhost:3001/api/assistant/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query })
      });
      
      if (queryResponse.ok) {
        const queryResult = await queryResponse.json();
        console.log('✅ 查询成功:', queryResult.reply.substring(0, 100) + '...');
      } else {
        const queryError = await queryResponse.text();
        console.log('❌ 查询失败:', queryResponse.status, queryError);
      }
    }
    
    console.log('\n🎉 API连接和数据同步测试完成！');
    
  } catch (error) {
    console.error('❌ 测试过程中出错:', error.message);
  }
}

// 运行测试
testAPIConnection();
