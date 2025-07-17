/**
 * 测试字段映射修复
 */

const API_BASE_URL = 'http://localhost:3001';

// 模拟前端发送的数据格式（基于代码检索结果）
const testData = {
  inventory: [
    {
      id: 'INV-TEST-001',
      materialCode: 'MAT-001',  // 驼峰命名
      materialName: 'LCD显示屏',  // 驼峰命名
      supplier: 'BOE',          // 简单命名
      quantity: 100,
      status: '正常',
      batch_number: 'BATCH-001',
      storage_date: '2025-07-16',
      warehouse: '深圳库存',
      remarks: '测试数据1'
    },
    {
      id: 'INV-TEST-002',
      materialCode: 'MAT-002',  // 驼峰命名
      materialName: 'OLED显示屏', // 驼峰命名
      supplier: '天马',          // 简单命名
      quantity: 200,
      status: '风险',
      batch_number: 'BATCH-002',
      storage_date: '2025-07-16',
      warehouse: '中央库存',
      remarks: '测试数据2'
    }
  ],
  inspection: [],
  production: [],
  batches: []
};

async function testFieldMapping() {
  try {
    console.log('🧪 测试字段映射修复...\n');
    
    // 1. 清空现有数据并同步测试数据
    console.log('1️⃣ 同步测试数据...');
    const syncResponse = await fetch(`${API_BASE_URL}/api/assistant/update-data`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData)
    });
    
    const syncResult = await syncResponse.json();
    console.log('同步结果:', syncResult);
    
    // 2. 检查数据库中的实际数据
    console.log('\n2️⃣ 检查数据库中的实际数据...');
    const debugResponse = await fetch(`${API_BASE_URL}/api/debug/inventory`);
    const debugResult = await debugResponse.json();
    
    if (debugResult.success && debugResult.sampleData.length > 0) {
      console.log('前2条记录的字段内容:');
      debugResult.sampleData.slice(0, 2).forEach((record, index) => {
        console.log(`\n记录 ${index + 1}:`);
        console.log(`  material_code: "${record.material_code}"`);
        console.log(`  material_name: "${record.material_name}"`);
        console.log(`  supplier_name: "${record.supplier_name}"`);
        console.log(`  quantity: ${record.quantity}`);
        console.log(`  status: "${record.status}"`);
      });
      
      // 检查空值情况
      const stats = debugResult.nullStatistics;
      console.log('\n空值统计:');
      console.log(`  material_code空值: ${stats.material_code_null}/${stats.total_records}`);
      console.log(`  material_name空值: ${stats.material_name_null}/${stats.total_records}`);
      console.log(`  supplier_name空值: ${stats.supplier_name_null}/${stats.total_records}`);
    }
    
    // 3. 测试查询功能
    console.log('\n3️⃣ 测试查询功能...');
    const queryResponse = await fetch(`${API_BASE_URL}/api/assistant/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: '查询库存信息'
      })
    });
    
    const queryResult = await queryResponse.json();
    
    if (queryResult.success && queryResult.data && queryResult.data.tableData) {
      console.log('查询结果:');
      console.log(`  总记录数: ${queryResult.data.tableData.length}`);
      
      if (queryResult.data.tableData.length > 0) {
        const firstRecord = queryResult.data.tableData[0];
        console.log('  第一条记录:');
        console.log(`    物料编码: "${firstRecord.物料编码}"`);
        console.log(`    物料名称: "${firstRecord.物料名称}"`);
        console.log(`    供应商: "${firstRecord.供应商}"`);
        console.log(`    数量: ${firstRecord.数量}`);
        console.log(`    状态: "${firstRecord.状态}"`);
        
        // 检查是否还有空值
        const hasEmptyFields = 
          firstRecord.物料编码 === '' || 
          firstRecord.物料名称 === '' ||
          firstRecord.供应商 === '';
          
        if (hasEmptyFields) {
          console.log('  ❌ 仍然存在空值字段');
        } else {
          console.log('  ✅ 所有字段都有数据');
        }
      }
    } else {
      console.log('  ❌ 查询失败或无数据');
    }
    
  } catch (error) {
    console.error('❌ 测试过程中出现错误:', error);
  }
}

testFieldMapping();
