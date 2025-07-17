/**
 * 测试数据同步功能
 */

const API_BASE_URL = 'http://localhost:3001';

// 模拟数据
const testData = {
  inventory: [
    {
      id: 'INV-TEST-001',
      batch_code: 'BATCH-TEST-001',
      material_code: 'TEST-001',
      material_name: '测试物料1',
      material_type: '结构件类',
      supplier_name: '测试供应商1',
      quantity: 100,
      status: '正常',
      inbound_time: '2025-07-16',
      storage_location: '仓库A',
      notes: '测试数据1'
    },
    {
      id: 'INV-TEST-002',
      batch_code: 'BATCH-TEST-002',
      material_code: 'TEST-002',
      material_name: '测试物料2',
      material_type: '光学类',
      supplier_name: '测试供应商2',
      quantity: 200,
      status: '正常',
      inbound_time: '2025-07-16',
      storage_location: '仓库B',
      notes: '测试数据2'
    }
  ],
  inspection: [
    {
      id: 'TEST-001',
      test_id: 'TEST-001',
      test_date: '2025-07-16',
      project: '测试项目1',
      baseline: '基线1',
      material_code: 'TEST-001',
      quantity: 10,
      material_name: '测试物料1',
      supplier: '测试供应商1',
      test_result: '合格',
      defect_description: '',
      remarks: '测试检验数据1',
      batch_code: 'BATCH-TEST-001'
    }
  ],
  production: [
    {
      id: 'PROD-TEST-001',
      test_id: 'PROD-TEST-001',
      test_date: '2025-07-16',
      project: '测试项目1',
      baseline: '基线1',
      material_code: 'TEST-001',
      quantity: 50,
      material_name: '测试物料1',
      supplier_name: '测试供应商1',
      defect_desc: '',
      notes: '测试生产数据1'
    }
  ],
  batches: []
};

async function testDataSync() {
  console.log('🧪 开始测试数据同步功能...\n');

  try {
    // 1. 验证初始状态（应该为空）
    console.log('1️⃣ 验证初始数据状态...');
    const initialResponse = await fetch(`${API_BASE_URL}/api/assistant/verify-data`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    const initialData = await initialResponse.json();
    console.log('   初始数据:', initialData.data);

    // 2. 同步测试数据
    console.log('\n2️⃣ 同步测试数据...');
    const syncResponse = await fetch(`${API_BASE_URL}/api/assistant/update-data`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData)
    });
    const syncResult = await syncResponse.json();
    console.log('   同步结果:', syncResult);

    // 3. 验证同步后的数据
    console.log('\n3️⃣ 验证同步后的数据...');
    const afterSyncResponse = await fetch(`${API_BASE_URL}/api/assistant/verify-data`, {
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
    const afterSyncData = await afterSyncResponse.json();
    console.log('   同步后数据:', afterSyncData.data);
    console.log('   验证结果:', afterSyncData.verified ? '✅ 通过' : '❌ 失败');

    // 4. 再次同步相同数据（测试替换而非累加）
    console.log('\n4️⃣ 再次同步相同数据（测试替换功能）...');
    const reSyncResponse = await fetch(`${API_BASE_URL}/api/assistant/update-data`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData)
    });
    const reSyncResult = await reSyncResponse.json();
    console.log('   再次同步结果:', reSyncResult);

    // 5. 验证数据没有重复
    console.log('\n5️⃣ 验证数据没有重复...');
    const finalResponse = await fetch(`${API_BASE_URL}/api/assistant/verify-data`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    const finalData = await finalResponse.json();
    console.log('   最终数据:', finalData.data);

    // 6. 检查结果
    const expected = {
      inventory: testData.inventory.length,
      inspection: testData.inspection.length,
      production: testData.production.length,
      batches: testData.batches.length
    };

    const actual = finalData.data;

    console.log('\n📊 测试结果对比:');
    console.log('   期望数据量:', expected);
    console.log('   实际数据量:', actual);

    const isSuccess = 
      actual.inventory === expected.inventory &&
      actual.inspection === expected.inspection &&
      actual.production === expected.production &&
      actual.batches === expected.batches;

    if (isSuccess) {
      console.log('\n🎉 数据同步测试通过！');
      console.log('✅ 数据替换功能正常');
      console.log('✅ 数据量准确');
      console.log('✅ 没有重复累加');
    } else {
      console.log('\n❌ 数据同步测试失败！');
      console.log('⚠️  数据量不匹配');
    }

  } catch (error) {
    console.error('❌ 测试过程中出现错误:', error);
  }
}

// 运行测试
testDataSync();
