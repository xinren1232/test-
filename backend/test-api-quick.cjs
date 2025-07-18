// 快速测试API
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

async function testAPI() {
  console.log('🔍 快速测试API...\n');
  
  try {
    // 1. 测试健康检查
    console.log('1. 测试健康检查:');
    const healthResponse = await makeRequest('http://localhost:3001/api/health');
    console.log(`状态码: ${healthResponse.status}`);
    console.log(`响应: ${JSON.stringify(healthResponse.data, null, 2)}\n`);
    
    // 2. 测试智能查询
    console.log('2. 测试智能查询:');
    const queryResponse = await makeRequest('http://localhost:3001/api/assistant/query', { query: '库存基础查询' });
    console.log(`状态码: ${queryResponse.status}`);
    
    if (queryResponse.data) {
      console.log(`成功: ${queryResponse.data.success}`);
      console.log(`消息: ${queryResponse.data.message}`);
      console.log(`数据条数: ${queryResponse.data.tableData ? queryResponse.data.tableData.length : 0}`);
      
      if (queryResponse.data.tableData && queryResponse.data.tableData.length > 0) {
        console.log(`字段: ${Object.keys(queryResponse.data.tableData[0]).join(', ')}`);
        console.log('第一条数据:');
        Object.entries(queryResponse.data.tableData[0]).slice(0, 3).forEach(([key, value]) => {
          console.log(`  ${key}: ${value}`);
        });
      }
    } else {
      console.log(`错误: ${queryResponse.error}`);
    }
    
    console.log('\n🎉 API测试完成！');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

testAPI();
