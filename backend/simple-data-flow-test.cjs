// 简单的数据流测试
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
          resolve({ error: 'Invalid JSON', raw: responseData });
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

async function testDataFlow() {
  try {
    console.log('🔍 测试数据流...\n');
    
    // 测试一个简单的查询
    const testQuery = '库存查询';
    console.log(`测试查询: "${testQuery}"`);
    
    const response = await makeRequest('http://localhost:3002/api/assistant/query', { query: testQuery });
    
    console.log('\n📋 完整API响应:');
    console.log(JSON.stringify(response, null, 2));
    
    // 分析响应
    if (response.success) {
      console.log('\n✅ 查询成功');
      console.log(`匹配规则: ${response.matchedRule}`);
      
      const tableData = response.data?.tableData || response.tableData;
      const cards = response.data?.cards || response.cards;
      
      console.log(`数据条数: ${tableData ? tableData.length : 0}`);
      console.log(`统计卡片: ${cards ? cards.length : 0}`);
      
      if (tableData && tableData.length > 0) {
        console.log('\n第一条数据:');
        console.log(JSON.stringify(tableData[0], null, 2));
      } else {
        console.log('\n❌ 没有返回数据！');
      }
      
      if (cards && cards.length > 0) {
        console.log('\n统计卡片:');
        for (const card of cards) {
          console.log(`${card.icon} ${card.title}: ${card.value}`);
        }
      }
    } else {
      console.log('\n❌ 查询失败');
      console.log(`错误信息: ${response.message}`);
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

testDataFlow();
