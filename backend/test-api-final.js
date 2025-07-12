import fetch from 'node-fetch';

async function testAPIFinal() {
  console.log('🔍 测试API最终响应格式...\n');
  
  const baseURL = 'http://localhost:3001';
  
  const testQueries = [
    '查询电池库存',
    '查询BOE供应商的物料'
  ];
  
  for (const testQuery of testQueries) {
    console.log(`\n📋 测试查询: "${testQuery}"`);
    
    try {
      const response = await fetch(`${baseURL}/api/assistant/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: testQuery,
          question: testQuery
        })
      });

      if (response.ok) {
        const result = await response.json();
        
        console.log('🔍 关键字段分析:');
        console.log(`  success: ${result.success}`);
        console.log(`  source: ${result.source}`);
        console.log(`  intent: ${result.intent || '未设置'}`);
        console.log(`  matchedRule: ${result.matchedRule || '未设置'}`);
        
        if (result.queryInfo) {
          console.log(`  queryInfo.intent: ${result.queryInfo.intent}`);
          console.log(`  queryInfo.matchedRule: ${result.queryInfo.matchedRule}`);
          console.log(`  queryInfo.parameters: ${JSON.stringify(result.queryInfo.parameters)}`);
        } else {
          console.log(`  ⚠️ queryInfo 字段缺失`);
        }
        
        console.log(`  data length: ${result.data ? result.data.length : 0}`);
        
        if (result.data && result.data.length > 0) {
          console.log(`  数据示例:`);
          result.data.slice(0, 2).forEach((item, index) => {
            const material = item.物料名称 || item.material_name || '未知';
            const supplier = item.供应商 || item.supplier_name || item.supplier || '未知';
            console.log(`    ${index + 1}. ${material} | ${supplier}`);
          });
        }
        
      } else {
        const errorText = await response.text();
        console.log(`❌ 请求失败 (${response.status}): ${errorText}`);
      }
    } catch (error) {
      console.log(`❌ 请求异常: ${error.message}`);
    }
  }
}

testAPIFinal();
