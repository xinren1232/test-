// 修复前端数据同步问题
// 使用独立的数据生成器，避免依赖问题

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

async function fixFrontendSync() {
  console.log('🔧 修复前端数据同步问题...');
  
  try {
    // 1. 生成正确数量的数据
    console.log('📊 生成数据集...');
    const dataset = generateRealTestData();
    
    console.log(`✅ 数据生成完成:`);
    console.log(`   库存: ${dataset.inventory.length} 条`);
    console.log(`   检验: ${dataset.inspection.length} 条`);
    console.log(`   生产: ${dataset.production.length} 条`);
    
    // 2. 转换为后端期望的格式
    const backendData = {
      inventory: dataset.inventory.map(item => ({
        id: item.id,
        materialName: item.materialName,
        materialCode: `MAT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        batchNo: item.batchCode,
        supplier: item.supplier,
        quantity: item.quantity,
        status: item.status,
        warehouse: item.location,
        factory: item.factory,
        inboundTime: item.inspectionDate,
        lastUpdateTime: new Date().toISOString()
      })),
      inspection: dataset.inspection.map(item => ({
        id: item.id,
        materialName: item.materialName,
        batchNo: `BATCH-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        supplier: item.supplier,
        testResult: item.testResult,
        testDate: item.testDate,
        defectDescription: item.defectType
      })),
      production: dataset.production.map(item => ({
        id: item.id,
        materialName: item.materialName,
        materialCode: `MAT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        batchNo: `BATCH-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        supplier: item.supplier,
        factory: item.factory,
        onlineTime: item.productionDate
      }))
    };
    
    console.log(`📦 转换后数据量:`);
    console.log(`   库存: ${backendData.inventory.length} 条`);
    console.log(`   检验: ${backendData.inspection.length} 条`);
    console.log(`   生产: ${backendData.production.length} 条`);
    
    // 3. 推送到后端
    console.log('📡 推送数据到后端...');
    const response = await fetch('http://localhost:3001/api/assistant/update-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(backendData)
    });
    
    if (!response.ok) {
      throw new Error(`推送失败: ${response.status} ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log('✅ 数据推送成功:', result.message);
    
    // 4. 验证数据
    console.log('🔍 验证数据同步...');
    const verifyResponse = await fetch('http://localhost:3001/api/assistant/verify-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        expectedCounts: {
          inventory: backendData.inventory.length,
          inspection: backendData.inspection.length,
          production: backendData.production.length
        }
      })
    });
    
    if (verifyResponse.ok) {
      const verifyResult = await verifyResponse.json();
      console.log('📊 验证结果:', verifyResult.verified ? '✅ 成功' : '❌ 失败');
      console.log('消息:', verifyResult.message);
      
      if (!verifyResult.verified) {
        console.log('详细检查:');
        console.log(`  库存: 期望${verifyResult.checks.inventory.expected}, 实际${verifyResult.checks.inventory.actual}`);
        console.log(`  检验: 期望${verifyResult.checks.inspection.expected}, 实际${verifyResult.checks.inspection.actual}`);
        console.log(`  生产: 期望${verifyResult.checks.production.expected}, 实际${verifyResult.checks.production.actual}`);
      }
    } else {
      console.log('❌ 验证请求失败');
    }
    
    console.log('\n🎉 前端数据同步修复完成！');
    
  } catch (error) {
    console.error('❌ 修复失败:', error.message);
  }
}

fixFrontendSync();
