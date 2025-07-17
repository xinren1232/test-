/**
 * 测试库存查询API
 */

const API_BASE_URL = 'http://localhost:3001';

async function testInventoryQuery() {
  console.log('🧪 测试库存查询API...\n');

  try {
    // 1. 测试基础库存查询
    console.log('1️⃣ 测试基础库存查询...');
    const basicResponse = await fetch(`${API_BASE_URL}/api/assistant/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: '查询库存信息'
      })
    });
    
    const basicResult = await basicResponse.json();
    console.log('基础查询结果:');
    console.log('- 成功:', basicResult.success);
    console.log('- 完整响应结构:', JSON.stringify(basicResult, null, 2));
    console.log('- data字段:', basicResult.data);
    console.log('- tableData字段:', basicResult.data?.tableData);
    console.log('- 数据条数:', basicResult.data?.tableData?.length || basicResult.data?.length || 0);
    
    if (basicResult.data && basicResult.data.length > 0) {
      console.log('- 第一条数据:');
      const firstRecord = basicResult.data[0];
      Object.entries(firstRecord).forEach(([key, value]) => {
        const displayValue = value === null ? '[NULL]' : 
                           value === '' ? '[EMPTY]' : 
                           value === undefined ? '[UNDEFINED]' : value;
        console.log(`  ${key}: ${displayValue}`);
      });
      
      // 检查空值情况
      console.log('\n- 空值统计:');
      const fields = Object.keys(firstRecord);
      fields.forEach(field => {
        const emptyCount = basicResult.data.filter(record => 
          record[field] === null || 
          record[field] === '' || 
          record[field] === undefined ||
          record[field] === 'null'
        ).length;
        if (emptyCount > 0) {
          console.log(`  ${field}: ${emptyCount}/${basicResult.data.length} 条空值`);
        }
      });
    }

    // 2. 测试供应商查询
    console.log('\n2️⃣ 测试供应商查询...');
    const supplierResponse = await fetch(`${API_BASE_URL}/api/assistant/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: '查询聚龙供应商的库存'
      })
    });
    
    const supplierResult = await supplierResponse.json();
    console.log('供应商查询结果:');
    console.log('- 成功:', supplierResult.success);
    console.log('- 数据条数:', supplierResult.data?.length || 0);
    
    if (supplierResult.data && supplierResult.data.length > 0) {
      console.log('- 供应商字段值:');
      const suppliers = [...new Set(supplierResult.data.map(r => r.供应商 || r.supplier_name))];
      console.log('  ', suppliers);
    }

    // 3. 测试物料查询
    console.log('\n3️⃣ 测试物料查询...');
    const materialResponse = await fetch(`${API_BASE_URL}/api/assistant/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: '查询电池盖的库存'
      })
    });
    
    const materialResult = await materialResponse.json();
    console.log('物料查询结果:');
    console.log('- 成功:', materialResult.success);
    console.log('- 数据条数:', materialResult.data?.length || 0);
    
    if (materialResult.data && materialResult.data.length > 0) {
      console.log('- 物料名称字段值:');
      const materials = [...new Set(materialResult.data.map(r => r.物料名称 || r.material_name))];
      console.log('  ', materials);
    }

    // 4. 直接查询数据验证API
    console.log('\n4️⃣ 查询数据验证API...');
    const verifyResponse = await fetch(`${API_BASE_URL}/api/assistant/verify-data`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    
    const verifyResult = await verifyResponse.json();
    console.log('数据验证结果:');
    console.log('- 库存数据量:', verifyResult.data?.inventory || 0);
    console.log('- 检验数据量:', verifyResult.data?.inspection || 0);
    console.log('- 生产数据量:', verifyResult.data?.production || 0);

    // 5. 测试规则库API
    console.log('\n5️⃣ 测试规则库API...');
    const rulesResponse = await fetch(`${API_BASE_URL}/api/rules`, {
      method: 'GET'
    });
    
    const rulesResult = await rulesResponse.json();
    console.log('规则库结果:');
    console.log('- 成功:', rulesResult.success);
    console.log('- 规则数量:', rulesResult.data?.length || 0);
    
    if (rulesResult.data && rulesResult.data.length > 0) {
      const inventoryRules = rulesResult.data.filter(rule => 
        rule.intent_name && rule.intent_name.includes('库存')
      );
      console.log('- 库存相关规则:', inventoryRules.length);
      
      if (inventoryRules.length > 0) {
        console.log('- 第一个库存规则:');
        const firstRule = inventoryRules[0];
        console.log(`  名称: ${firstRule.intent_name}`);
        console.log(`  描述: ${firstRule.description}`);
        console.log(`  SQL: ${firstRule.action_target?.substring(0, 100)}...`);
      }
    }

  } catch (error) {
    console.error('❌ 测试过程中出现错误:', error);
  }
}

// 运行测试
testInventoryQuery();
