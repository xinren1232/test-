// 通过API测试规则系统
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
          resolve({ status: res.statusCode, data: result });
        } catch (error) {
          resolve({ status: res.statusCode, error: 'Invalid JSON', raw: responseData });
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

async function testRulesAPI() {
  console.log('🧪 通过API测试规则系统...\n');
  
  try {
    // 1. 测试获取规则列表
    console.log('1. 测试获取规则列表:');
    const rulesResponse = await makeRequest('http://localhost:3001/api/rules');
    console.log(`   状态码: ${rulesResponse.status}`);
    
    if (rulesResponse.data && Array.isArray(rulesResponse.data)) {
      console.log(`   ✅ 获取成功: ${rulesResponse.data.length} 条规则`);
      
      // 显示前5条规则
      console.log('   前5条规则:');
      rulesResponse.data.slice(0, 5).forEach((rule, index) => {
        console.log(`     ${index + 1}. ${rule.intent_name} (优先级: ${rule.priority})`);
      });
    } else {
      console.log(`   ❌ 获取失败: ${rulesResponse.data?.message || rulesResponse.error}`);
    }
    
    // 2. 测试智能查询
    console.log('\n2. 测试智能查询:');
    
    const testQueries = [
      '查询库存信息',
      '系统里有哪些供应商？',
      '查询检验数据',
      '查询聚龙供应商的库存',
      '查询电池盖的库存'
    ];
    
    for (const query of testQueries) {
      try {
        console.log(`\n   测试查询: "${query}"`);
        
        const queryResponse = await makeRequest('http://localhost:3001/api/assistant/query', { query });
        console.log(`   状态码: ${queryResponse.status}`);
        
        if (queryResponse.data && queryResponse.data.success) {
          console.log(`   ✅ 查询成功: ${queryResponse.data.message}`);
          
          if (queryResponse.data.data && Array.isArray(queryResponse.data.data)) {
            console.log(`   返回数据: ${queryResponse.data.data.length} 条记录`);
            
            if (queryResponse.data.data.length > 0) {
              const firstRecord = queryResponse.data.data[0];
              console.log(`   字段: ${Object.keys(firstRecord).join(', ')}`);
              
              // 显示第一条记录的前3个字段
              const displayFields = Object.keys(firstRecord).slice(0, 3);
              console.log('   第一条记录:');
              displayFields.forEach(field => {
                const value = firstRecord[field];
                const displayValue = typeof value === 'string' && value.length > 20 
                  ? value.substring(0, 20) + '...' 
                  : value;
                console.log(`     ${field}: ${displayValue}`);
              });
            }
          }
        } else {
          console.log(`   ❌ 查询失败: ${queryResponse.data?.message || queryResponse.error}`);
        }
        
      } catch (error) {
        console.log(`   ❌ 查询连接失败: ${error.message}`);
      }
    }
    
    console.log('\n🎉 API规则系统测试完成！');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

testRulesAPI();
