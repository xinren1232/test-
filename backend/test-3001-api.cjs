// 测试3001端口的API
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

async function test3001API() {
  try {
    console.log('🧪 测试3001端口API...\n');
    
    // 1. 测试健康检查
    console.log('1. 测试健康检查:');
    try {
      const healthResponse = await makeRequest('http://localhost:3001/api/health');
      console.log(`状态码: ${healthResponse.status}`);
      if (healthResponse.data) {
        console.log(`✅ 健康检查成功: ${healthResponse.data.message}`);
        console.log(`端口: ${healthResponse.data.port}`);
      } else {
        console.log(`❌ 健康检查失败: ${healthResponse.error}`);
      }
    } catch (error) {
      console.log(`❌ 健康检查连接失败: ${error.message}`);
    }
    
    // 2. 测试规则API
    console.log('\n2. 测试规则API:');
    try {
      const rulesResponse = await makeRequest('http://localhost:3001/api/rules');
      console.log(`状态码: ${rulesResponse.status}`);
      if (rulesResponse.data && rulesResponse.data.success) {
        console.log(`✅ 规则API成功: 获取到 ${rulesResponse.data.data?.length || 0} 条规则`);
        
        if (rulesResponse.data.data && rulesResponse.data.data.length > 0) {
          console.log('\n前3条规则:');
          for (let i = 0; i < Math.min(3, rulesResponse.data.data.length); i++) {
            const rule = rulesResponse.data.data[i];
            console.log(`  ${i+1}. 规则 ${rule.id}: ${rule.intent_name}`);
            console.log(`     分类: ${rule.category || '未分类'}`);
            console.log(`     状态: ${rule.status}`);
          }
        }
      } else {
        console.log(`❌ 规则API失败: ${rulesResponse.data?.message || rulesResponse.error}`);
      }
    } catch (error) {
      console.log(`❌ 规则API连接失败: ${error.message}`);
    }
    
    // 3. 测试智能查询API
    console.log('\n3. 测试智能查询API:');
    try {
      const queryResponse = await makeRequest('http://localhost:3001/api/assistant/query', { 
        query: '库存查询' 
      });
      console.log(`状态码: ${queryResponse.status}`);
      if (queryResponse.data && queryResponse.data.success) {
        console.log(`✅ 智能查询成功: 匹配规则 "${queryResponse.data.matchedRule}"`);
        
        const tableData = queryResponse.data.data?.tableData;
        const cards = queryResponse.data.data?.cards;
        
        console.log(`数据条数: ${tableData ? tableData.length : 0}`);
        console.log(`统计卡片: ${cards ? cards.length : 0} 个`);
        
        if (tableData && tableData.length > 0) {
          console.log(`数据字段: ${Object.keys(tableData[0]).join(', ')}`);
        }
      } else {
        console.log(`❌ 智能查询失败: ${queryResponse.data?.message || queryResponse.error}`);
      }
    } catch (error) {
      console.log(`❌ 智能查询连接失败: ${error.message}`);
    }
    
    console.log('\n🎉 API测试完成！');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

test3001API();
