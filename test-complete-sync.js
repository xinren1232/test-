// 测试完整的数据同步流程
import fetch from 'node-fetch';

async function testCompleteSyncFlow() {
  console.log('🧪 测试完整数据同步流程...\n');
  
  // 模拟前端发送的数据
  const syncData = {
    inventory: Array.from({length: 132}, (_, i) => ({
      id: i + 1,
      materialName: `测试物料${i + 1}`,
      materialCode: `MAT${String(i + 1).padStart(3, '0')}`,
      batchNo: `BATCH${String(i + 1).padStart(3, '0')}`,
      supplier: '聚龙',
      quantity: 100 + i,
      status: '正常',
      warehouse: '深圳仓库',
      factory: '深圳工厂'
    })),
    inspection: [],
    production: []
  };

  try {
    // 步骤1: 数据同步
    console.log('📤 步骤1: 执行数据同步...');
    console.log(`📊 数据量: 库存${syncData.inventory.length}, 检验${syncData.inspection.length}, 生产${syncData.production.length}`);
    
    const syncResponse = await fetch('http://localhost:3001/api/assistant/update-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(syncData)
    });
    
    if (!syncResponse.ok) {
      throw new Error(`同步失败: ${syncResponse.status} ${syncResponse.statusText}`);
    }
    
    const syncResult = await syncResponse.json();
    console.log('✅ 数据同步成功');
    console.log(`   响应: ${syncResult.message}`);
    
    // 步骤2: 数据验证
    console.log('\n🔍 步骤2: 执行数据验证...');
    
    const verifyRequest = {
      expectedCounts: {
        inventory: syncData.inventory.length,
        inspection: syncData.inspection.length,
        production: syncData.production.length
      }
    };
    
    const verifyResponse = await fetch('http://localhost:3001/api/assistant/verify-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(verifyRequest)
    });
    
    if (!verifyResponse.ok) {
      throw new Error(`验证失败: ${verifyResponse.status} ${verifyResponse.statusText}`);
    }
    
    const verifyResult = await verifyResponse.json();
    console.log(`${verifyResult.verified ? '✅' : '❌'} 数据验证${verifyResult.verified ? '通过' : '失败'}`);
    console.log(`   验证消息: ${verifyResult.message}`);
    
    // 步骤3: 完整性检查
    console.log('\n📋 步骤3: 完整性检查...');
    
    const allChecksPass = verifyResult.verified && syncResult.success;
    console.log(`${allChecksPass ? '✅' : '❌'} 完整性检查${allChecksPass ? '通过' : '失败'}`);
    
    if (allChecksPass) {
      console.log('\n🎉 完整数据同步流程测试成功！');
      console.log('📊 流程总结:');
      console.log('   1. ✅ 数据同步 - 成功');
      console.log('   2. ✅ 数据验证 - 通过');
      console.log('   3. ✅ 完整性检查 - 通过');
    } else {
      console.log('\n❌ 数据同步流程存在问题');
    }
    
  } catch (error) {
    console.error('❌ 数据同步流程失败:', error.message);
  }
}

testCompleteSyncFlow().catch(console.error);
