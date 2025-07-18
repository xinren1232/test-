// 测试导入的规则库
const http = require('http');

function makeRequest(url, data = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname,
      method: data ? 'POST' : 'GET',
      headers: data ? {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(JSON.stringify(data))
      } : {}
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(responseData);
          resolve(result);
        } catch (error) {
          reject(new Error('Invalid JSON response: ' + responseData));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function testImportedRules() {
  try {
    console.log('🧪 测试导入的规则库...\n');
    
    // 1. 测试规则列表API
    console.log('1. 测试规则列表API:');
    
    const rulesResponse = await makeRequest('http://localhost:3002/api/rules');
    
    if (rulesResponse.success) {
      console.log(`✅ 规则列表获取成功: ${rulesResponse.data.length} 条规则`);
      console.log(`总数: ${rulesResponse.total}`);
      
      // 显示前5条规则
      console.log('\n前5条规则:');
      for (let i = 0; i < Math.min(5, rulesResponse.data.length); i++) {
        const rule = rulesResponse.data[i];
        console.log(`  ${i+1}. 规则 ${rule.id}: ${rule.intent_name} (${rule.category})`);
      }
    } else {
      console.log(`❌ 规则列表获取失败: ${rulesResponse.message}`);
      return;
    }
    
    // 2. 测试查询API
    console.log('\n2. 测试查询API:');
    
    const testQueries = [
      '库存查询',
      '物料库存',
      '供应商查询',
      '检验结果',
      '测试结果',
      '生产情况',
      '上线情况'
    ];
    
    for (const query of testQueries) {
      console.log(`\n🔍 测试查询: "${query}"`);
      
      try {
        const queryResponse = await makeRequest('http://localhost:3002/api/assistant/query', { query });
        
        if (queryResponse.success) {
          console.log(`✅ 查询成功:`);
          console.log(`   匹配规则: ${queryResponse.matchedRule}`);
          
          const tableData = queryResponse.data?.tableData || queryResponse.tableData;
          const cards = queryResponse.data?.cards || queryResponse.cards;
          
          console.log(`   数据条数: ${tableData ? tableData.length : 0}`);
          console.log(`   统计卡片: ${cards ? cards.length : 0} 个`);
          
          if (tableData && tableData.length > 0) {
            console.log(`   数据字段: ${Object.keys(tableData[0]).join(', ')}`);
          }
          
          if (cards && cards.length > 0) {
            console.log(`   卡片信息:`);
            for (const card of cards) {
              console.log(`     ${card.icon} ${card.title}: ${card.value}`);
            }
          }
        } else {
          console.log(`❌ 查询失败: ${queryResponse.message}`);
        }
        
      } catch (error) {
        console.log(`❌ 请求失败: ${error.message}`);
      }
    }
    
    console.log('\n🎉 规则库测试完成！');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

testImportedRules();
