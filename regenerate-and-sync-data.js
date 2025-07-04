/**
 * 重新生成数据并确保正确同步到后端
 */

// 基于您的实际数据生成逻辑创建测试数据
const generateRealTestData = () => {
  const factories = ['深圳工厂', '重庆工厂', '南昌工厂', '宜宾工厂'];
  const suppliers = ['聚龙', '欣冠', '广正', 'BOE', '三星电子'];
  const materials = ['电池盖', 'OLED显示屏', '电容器', '电阻器', '芯片'];
  const statuses = ['正常', '风险', '冻结'];
  
  const inventory = [];
  const inspection = [];
  const production = [];
  
  // 生成132条库存数据
  for (let i = 0; i < 132; i++) {
    inventory.push({
      id: `INV_${String(i + 1).padStart(6, '0')}`,
      factory: factories[i % factories.length],
      materialName: materials[i % materials.length],
      supplier: suppliers[i % suppliers.length],
      status: statuses[i % statuses.length],
      quantity: Math.floor(Math.random() * 1000) + 50,
      batchCode: `${360000 + i}`,
      inspectionDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      location: `仓库${String.fromCharCode(65 + (i % 5))}-${String(i % 10 + 1).padStart(2, '0')}`,
      unitPrice: (Math.random() * 100 + 10).toFixed(2)
    });
  }
  
  // 生成396条检测数据
  for (let i = 0; i < 396; i++) {
    inspection.push({
      id: `TEST_${String(i + 1).padStart(6, '0')}`,
      materialName: materials[i % materials.length],
      supplier: suppliers[i % suppliers.length],
      testResult: i % 4 === 0 ? 'FAIL' : 'PASS',
      testDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      defectType: i % 4 === 0 ? ['外观缺陷', '性能不达标', '尺寸偏差'][i % 3] : null,
      testValue: (Math.random() * 100).toFixed(2),
      standardValue: '85.00'
    });
  }
  
  // 生成1056条生产数据
  for (let i = 0; i < 1056; i++) {
    production.push({
      id: `PROD_${String(i + 1).padStart(6, '0')}`,
      factory: factories[i % factories.length],
      materialName: materials[i % materials.length],
      supplier: suppliers[i % suppliers.length],
      productionDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      quantity: Math.floor(Math.random() * 500) + 100,
      status: i % 10 === 0 ? '异常' : '正常',
      lineNumber: `产线${(i % 8) + 1}`
    });
  }
  
  return { inventory, inspection, production };
};

const regenerateAndSyncData = async () => {
  console.log('🔄 重新生成数据并同步到后端...');
  
  try {
    // 1. 生成测试数据
    console.log('📊 生成测试数据...');
    const testData = generateRealTestData();
    
    console.log(`✅ 数据生成完成:`);
    console.log(`   📦 库存数据: ${testData.inventory.length} 条`);
    console.log(`   🧪 检测数据: ${testData.inspection.length} 条`);
    console.log(`   🏭 生产数据: ${testData.production.length} 条`);
    
    // 显示数据样本
    console.log('\n📋 库存数据样本:');
    testData.inventory.slice(0, 3).forEach((item, index) => {
      console.log(`${index + 1}. ${item.factory} | ${item.materialName} | ${item.supplier} | ${item.status} | 数量:${item.quantity}`);
    });
    
    // 2. 同步到后端
    console.log('\n📡 同步数据到后端...');
    const syncResponse = await fetch('http://localhost:3001/api/assistant/update-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData)
    });
    
    if (!syncResponse.ok) {
      throw new Error(`同步失败: HTTP ${syncResponse.status}`);
    }
    
    const syncResult = await syncResponse.json();
    console.log('✅ 数据同步成功:', syncResult.message);
    
    // 3. 验证同步结果
    console.log('\n🔍 验证同步结果...');
    
    await new Promise(resolve => setTimeout(resolve, 2000)); // 等待2秒
    
    const verifyResponse = await fetch('http://localhost:3001/api/assistant/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: '查看所有库存',
        scenario: 'basic',
        analysisMode: 'rule'
      })
    });
    
    if (verifyResponse.ok) {
      const verifyResult = await verifyResponse.json();
      console.log('📊 验证结果:', verifyResult.reply.substring(0, 300));
      
      // 检查是否包含真实数据
      const hasRealData = verifyResult.reply.includes('深圳工厂') || 
                         verifyResult.reply.includes('聚龙') || 
                         verifyResult.reply.includes('电池盖');
      
      console.log(`${hasRealData ? '✅' : '❌'} 数据同步${hasRealData ? '成功' : '失败'}`);
      
      if (hasRealData) {
        console.log('\n🎯 测试具体查询...');
        
        const testQueries = [
          '查询深圳工厂库存',
          '查询聚龙供应商的物料',
          '查询电池盖库存'
        ];
        
        for (const query of testQueries) {
          const testResponse = await fetch('http://localhost:3001/api/assistant/query', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              query: query,
              scenario: 'basic',
              analysisMode: 'rule'
            })
          });
          
          if (testResponse.ok) {
            const testResult = await testResponse.json();
            const recordCount = testResult.reply.match(/共 (\d+) 条记录/);
            console.log(`🔍 "${query}": ${recordCount ? recordCount[1] + '条记录' : '无匹配'}`);
          }
        }
      }
    }
    
  } catch (error) {
    console.error('❌ 操作失败:', error.message);
  }
};

// 运行重新生成和同步
regenerateAndSyncData();
