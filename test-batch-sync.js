// 测试分批同步功能
import fetch from 'node-fetch';

async function testBatchSync() {
  console.log('🧪 测试分批同步功能...\n');
  
  // 测试库存数据分批同步
  const inventoryBatch = Array.from({length: 100}, (_, i) => ({
    id: i + 1,
    materialName: `批次物料${i + 1}`,
    materialCode: `BATCH_MAT${String(i + 1).padStart(3, '0')}`,
    batchNo: `BATCH_NO${String(i + 1).padStart(3, '0')}`,
    supplier: '聚龙供应商',
    quantity: 100 + i,
    status: '正常'
  }));

  try {
    console.log('📦 测试库存数据分批同步...');
    console.log(`   批次大小: ${inventoryBatch.length} 条`);
    
    const response = await fetch('http://localhost:3001/api/assistant/update-data-batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'inventory',
        data: inventoryBatch
      })
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ 库存数据分批同步成功');
      console.log(`   响应: ${result.message}`);
      console.log(`   类型: ${result.type}, 数量: ${result.count}`);
    } else {
      console.log('❌ 库存数据分批同步失败');
      console.log(`   状态码: ${response.status}`);
    }
    
    console.log('');
    
    // 测试检验数据分批同步
    const inspectionBatch = Array.from({length: 100}, (_, i) => ({
      id: i + 1,
      materialName: `批次物料${i + 1}`,
      batchNo: `BATCH_NO${String(i + 1).padStart(3, '0')}`,
      testResult: '合格',
      testDate: new Date().toISOString()
    }));
    
    console.log('📦 测试检验数据分批同步...');
    console.log(`   批次大小: ${inspectionBatch.length} 条`);
    
    const inspectionResponse = await fetch('http://localhost:3001/api/assistant/update-data-batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'inspection',
        data: inspectionBatch
      })
    });
    
    if (inspectionResponse.ok) {
      const result = await inspectionResponse.json();
      console.log('✅ 检验数据分批同步成功');
      console.log(`   响应: ${result.message}`);
      console.log(`   类型: ${result.type}, 数量: ${result.count}`);
    } else {
      console.log('❌ 检验数据分批同步失败');
      console.log(`   状态码: ${inspectionResponse.status}`);
    }
    
    console.log('');
    
    // 测试生产数据分批同步
    const productionBatch = Array.from({length: 100}, (_, i) => ({
      id: i + 1,
      materialName: `批次物料${i + 1}`,
      batchNo: `BATCH_NO${String(i + 1).padStart(3, '0')}`,
      factory: '深圳工厂',
      onlineTime: new Date().toISOString(),
      status: '已上线'
    }));
    
    console.log('📦 测试生产数据分批同步...');
    console.log(`   批次大小: ${productionBatch.length} 条`);
    
    const productionResponse = await fetch('http://localhost:3001/api/assistant/update-data-batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'production',
        data: productionBatch
      })
    });
    
    if (productionResponse.ok) {
      const result = await productionResponse.json();
      console.log('✅ 生产数据分批同步成功');
      console.log(`   响应: ${result.message}`);
      console.log(`   类型: ${result.type}, 数量: ${result.count}`);
    } else {
      console.log('❌ 生产数据分批同步失败');
      console.log(`   状态码: ${productionResponse.status}`);
    }
    
    console.log('\n🎉 分批同步功能测试完成！');
    
  } catch (error) {
    console.log('❌ 分批同步测试失败');
    console.log(`   错误: ${error.message}`);
  }
}

testBatchSync().catch(console.error);
