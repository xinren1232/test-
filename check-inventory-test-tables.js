/**
 * 检查库存和测试查询的表映射问题
 */

const API_BASE_URL = 'http://localhost:3001';

async function checkInventoryTestTables() {
  try {
    console.log('🔍 检查库存和测试查询的表映射问题...\n');
    
    // 1. 检查库存相关表
    console.log('1️⃣ 检查库存相关表...');
    await checkInventoryTables();
    
    // 2. 检查测试相关表
    console.log('\n2️⃣ 检查测试相关表...');
    await checkTestTables();
    
    // 3. 测试库存和测试查询
    console.log('\n3️⃣ 测试库存和测试查询...');
    await testInventoryAndTestQueries();
    
  } catch (error) {
    console.error('❌ 检查过程中出现错误:', error);
  }
}

async function checkInventoryTables() {
  const tables = ['inventory'];
  
  for (const table of tables) {
    try {
      console.log(`\n📊 检查 ${table} 表:`);
      
      // 检查记录数
      const countResponse = await fetch(`${API_BASE_URL}/api/db-execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sql: `SELECT COUNT(*) as count FROM ${table}`
        })
      });
      
      if (countResponse.ok) {
        const countResult = await countResponse.json();
        const recordCount = countResult.result[0].count;
        console.log(`  记录数: ${recordCount}`);
        
        // 检查表结构
        const structureResponse = await fetch(`${API_BASE_URL}/api/db-execute`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sql: `
              SELECT COLUMN_NAME 
              FROM INFORMATION_SCHEMA.COLUMNS 
              WHERE TABLE_SCHEMA = 'iqe_inspection' AND TABLE_NAME = '${table}'
              ORDER BY ORDINAL_POSITION
            `
          })
        });
        
        if (structureResponse.ok) {
          const structureResult = await structureResponse.json();
          const columns = structureResult.result.map(row => row.COLUMN_NAME);
          console.log(`  字段: ${columns.join(', ')}`);
          
          // 检查库存关键字段
          const inventoryKeyFields = ['factory', 'warehouse', 'material_code', 'material_name', 'supplier_name', 'quantity', 'status', 'inbound_time', 'storage_location'];
          const existingFields = inventoryKeyFields.filter(field => columns.includes(field));
          const missingFields = inventoryKeyFields.filter(field => !columns.includes(field));
          
          if (existingFields.length > 0) {
            console.log(`  ✅ 存在关键字段: ${existingFields.join(', ')}`);
          }
          if (missingFields.length > 0) {
            console.log(`  ❌ 缺失关键字段: ${missingFields.join(', ')}`);
          }
          
          // 查看前3条数据
          const dataResponse = await fetch(`${API_BASE_URL}/api/db-execute`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sql: `SELECT * FROM ${table} LIMIT 3`
            })
          });
          
          if (dataResponse.ok) {
            const dataResult = await dataResponse.json();
            const records = dataResult.result;
            
            if (records.length > 0) {
              console.log(`  📋 第一条记录示例:`);
              const firstRecord = records[0];
              console.log(`    material_code: ${firstRecord.material_code || '[NULL]'}`);
              console.log(`    material_name: ${firstRecord.material_name || '[NULL]'}`);
              console.log(`    supplier_name: ${firstRecord.supplier_name || '[NULL]'}`);
              console.log(`    quantity: ${firstRecord.quantity || '[NULL]'}`);
              console.log(`    status: ${firstRecord.status || '[NULL]'}`);
              console.log(`    storage_location: ${firstRecord.storage_location || '[NULL]'}`);
              console.log(`    inbound_time: ${firstRecord.inbound_time || '[NULL]'}`);
            }
          }
        }
      }
    } catch (error) {
      console.log(`  ❌ 检查 ${table} 表时出错: ${error.message}`);
    }
  }
}

async function checkTestTables() {
  const tables = ['lab_tests', 'production_tracking'];
  
  for (const table of tables) {
    try {
      console.log(`\n📊 检查 ${table} 表:`);
      
      // 检查记录数
      const countResponse = await fetch(`${API_BASE_URL}/api/db-execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sql: `SELECT COUNT(*) as count FROM ${table}`
        })
      });
      
      if (countResponse.ok) {
        const countResult = await countResponse.json();
        const recordCount = countResult.result[0].count;
        console.log(`  记录数: ${recordCount}`);
        
        // 检查表结构
        const structureResponse = await fetch(`${API_BASE_URL}/api/db-execute`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sql: `
              SELECT COLUMN_NAME 
              FROM INFORMATION_SCHEMA.COLUMNS 
              WHERE TABLE_SCHEMA = 'iqe_inspection' AND TABLE_NAME = '${table}'
              ORDER BY ORDINAL_POSITION
            `
          })
        });
        
        if (structureResponse.ok) {
          const structureResult = await structureResponse.json();
          const columns = structureResult.result.map(row => row.COLUMN_NAME);
          console.log(`  字段: ${columns.join(', ')}`);
          
          // 检查测试关键字段
          const testKeyFields = ['test_id', 'test_date', 'project', 'baseline', 'material_code', 'material_name', 'supplier_name', 'test_result', 'defect_desc'];
          const existingFields = testKeyFields.filter(field => columns.includes(field));
          const missingFields = testKeyFields.filter(field => !columns.includes(field));
          
          if (existingFields.length > 0) {
            console.log(`  ✅ 存在关键字段: ${existingFields.join(', ')}`);
          }
          if (missingFields.length > 0) {
            console.log(`  ❌ 缺失关键字段: ${missingFields.join(', ')}`);
          }
          
          // 查看前3条数据
          const dataResponse = await fetch(`${API_BASE_URL}/api/db-execute`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sql: `SELECT * FROM ${table} LIMIT 3`
            })
          });
          
          if (dataResponse.ok) {
            const dataResult = await dataResponse.json();
            const records = dataResult.result;
            
            if (records.length > 0) {
              console.log(`  📋 第一条记录示例:`);
              const firstRecord = records[0];
              if (table === 'lab_tests') {
                console.log(`    test_id: ${firstRecord.test_id || '[NULL]'}`);
                console.log(`    test_date: ${firstRecord.test_date || '[NULL]'}`);
                console.log(`    project_id: ${firstRecord.project_id || '[NULL]'}`);
                console.log(`    baseline_id: ${firstRecord.baseline_id || '[NULL]'}`);
                console.log(`    material_code: ${firstRecord.material_code || '[NULL]'}`);
                console.log(`    material_name: ${firstRecord.material_name || '[NULL]'}`);
                console.log(`    supplier_name: ${firstRecord.supplier_name || '[NULL]'}`);
                console.log(`    test_result: ${firstRecord.test_result || '[NULL]'}`);
                console.log(`    defect_desc: ${firstRecord.defect_desc || '[NULL]'}`);
              } else {
                console.log(`    test_id: ${firstRecord.test_id || '[NULL]'}`);
                console.log(`    test_date: ${firstRecord.test_date || '[NULL]'}`);
                console.log(`    project: ${firstRecord.project || '[NULL]'}`);
                console.log(`    baseline: ${firstRecord.baseline || '[NULL]'}`);
                console.log(`    material_code: ${firstRecord.material_code || '[NULL]'}`);
                console.log(`    material_name: ${firstRecord.material_name || '[NULL]'}`);
                console.log(`    supplier_name: ${firstRecord.supplier_name || '[NULL]'}`);
                console.log(`    defect_desc: ${firstRecord.defect_desc || '[NULL]'}`);
              }
            }
          }
        }
      }
    } catch (error) {
      console.log(`  ❌ 检查 ${table} 表时出错: ${error.message}`);
    }
  }
}

async function testInventoryAndTestQueries() {
  const testQueries = [
    { query: '查询库存信息', type: '库存' },
    { query: '查询测试信息', type: '测试' },
    { query: '查询充电类库存', type: '库存' },
    { query: '查询光学类测试', type: '测试' }
  ];
  
  for (const testCase of testQueries) {
    console.log(`\n测试${testCase.type}查询: ${testCase.query}`);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/assistant/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: testCase.query })
      });
      
      const result = await response.json();
      
      if (result.success && result.data && result.data.tableData) {
        const data = result.data.tableData;
        console.log(`  ✅ 查询成功，返回 ${data.length} 条记录`);
        
        if (data.length > 0) {
          const firstRecord = data[0];
          console.log(`  📋 第一条记录:`);
          
          // 显示前几个字段
          Object.entries(firstRecord).slice(0, 6).forEach(([key, value]) => {
            console.log(`    ${key}: ${value || '[空值]'}`);
          });
          
          // 检查数据完整性
          const hasValidData = Object.values(firstRecord).some(value => 
            value && value !== '[空值]' && value !== '未知' && value !== ''
          );
          
          if (hasValidData) {
            console.log(`  ✅ 数据质量良好`);
          } else {
            console.log(`  ⚠️  数据可能存在问题，多数字段为空`);
          }
        }
      } else {
        console.log(`  ❌ 查询失败`);
        if (result.message) {
          console.log(`    错误信息: ${result.message}`);
        }
      }
    } catch (error) {
      console.log(`  ❌ 查询出错: ${error.message}`);
    }
  }
}

checkInventoryTestTables();
