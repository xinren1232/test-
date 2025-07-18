// 测试大数据量同步
import fetch from 'node-fetch';

async function testLargeDataSync() {
  console.log('🧪 测试大数据量同步...\n');
  
  // 生成大量测试数据
  const largeData = {
    inventory: Array.from({length: 132}, (_, i) => ({
      id: i + 1,
      materialName: `测试物料${i + 1}`,
      materialCode: `MAT${String(i + 1).padStart(3, '0')}`,
      batchNo: `BATCH${String(i + 1).padStart(3, '0')}`,
      supplier: '聚龙供应商',
      quantity: 100 + i,
      status: '正常',
      warehouse: '深圳仓库',
      factory: '深圳工厂',
      projectId: `PRJ${String((i % 10) + 1).padStart(3, '0')}`,
      baselineId: `BL${String((i % 5) + 1).padStart(3, '0')}`,
      inboundTime: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      lastUpdateTime: new Date().toISOString()
    })),
    inspection: Array.from({length: 405}, (_, i) => ({
      id: i + 1,
      materialName: `测试物料${(i % 132) + 1}`,
      batchNo: `BATCH${String((i % 132) + 1).padStart(3, '0')}`,
      supplier: '聚龙供应商',
      testResult: ['合格', '不合格'][i % 10 === 0 ? 1 : 0],
      testDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      projectId: `PRJ${String((i % 10) + 1).padStart(3, '0')}`,
      defectDescription: i % 10 === 0 ? '外观缺陷' : '',
      inspector: `检验员${(i % 5) + 1}`,
      testMethod: '标准检验',
      testStandard: 'GB/T 1234-2020'
    })),
    production: Array.from({length: 1080}, (_, i) => ({
      id: i + 1,
      materialName: `测试物料${(i % 132) + 1}`,
      materialCode: `MAT${String((i % 132) + 1).padStart(3, '0')}`,
      batchNo: `BATCH${String((i % 132) + 1).padStart(3, '0')}`,
      supplier: '聚龙供应商',
      factory: '深圳工厂',
      onlineTime: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: '已上线',
      projectId: `PRJ${String((i % 10) + 1).padStart(3, '0')}`,
      baselineId: `BL${String((i % 5) + 1).padStart(3, '0')}`,
      defectRate: (Math.random() * 5).toFixed(2),
      inspector: `检验员${(i % 5) + 1}`,
      productionLine: `产线${(i % 3) + 1}`
    }))
  };

  // 计算数据大小
  const dataSize = JSON.stringify(largeData).length;
  const dataSizeMB = (dataSize / 1024 / 1024).toFixed(2);
  
  console.log(`📊 测试数据统计:`);
  console.log(`   库存数据: ${largeData.inventory.length} 条`);
  console.log(`   检验数据: ${largeData.inspection.length} 条`);
  console.log(`   生产数据: ${largeData.production.length} 条`);
  console.log(`   总数据大小: ${dataSizeMB} MB`);
  console.log('');

  try {
    // 测试数据同步
    console.log('📤 开始测试大数据量同步...');
    
    const startTime = Date.now();
    const response = await fetch('http://localhost:3001/api/assistant/update-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(largeData)
    });
    const endTime = Date.now();
    
    const responseTime = endTime - startTime;
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ 大数据量同步成功！');
      console.log(`   响应时间: ${responseTime}ms`);
      console.log(`   响应消息: ${result.message}`);
      console.log(`   数据统计: 库存${result.data.inventoryCount}, 检验${result.data.inspectionCount}, 生产${result.data.productionCount}`);
      
      // 测试数据验证
      console.log('\n🔍 测试数据验证...');
      const verifyRequest = {
        expectedCounts: {
          inventory: largeData.inventory.length,
          inspection: largeData.inspection.length,
          production: largeData.production.length
        }
      };
      
      const verifyResponse = await fetch('http://localhost:3001/api/assistant/verify-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(verifyRequest)
      });
      
      if (verifyResponse.ok) {
        const verifyResult = await verifyResponse.json();
        console.log(`${verifyResult.verified ? '✅' : '❌'} 数据验证${verifyResult.verified ? '通过' : '失败'}`);
        console.log(`   验证消息: ${verifyResult.message}`);
      }
      
    } else {
      const errorText = await response.text();
      console.log('❌ 大数据量同步失败');
      console.log(`   状态码: ${response.status} ${response.statusText}`);
      console.log(`   错误信息: ${errorText}`);
      
      if (response.status === 413) {
        console.log('\n💡 建议: 数据包仍然太大，需要进一步减小批次大小或启用分批同步');
      }
    }
    
  } catch (error) {
    console.log('❌ 大数据量同步测试失败');
    console.log(`   错误: ${error.message}`);
  }
}

testLargeDataSync().catch(console.error);
