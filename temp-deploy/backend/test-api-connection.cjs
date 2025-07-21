// 测试API连接
const http = require('http');

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname,
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
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

    req.end();
  });
}

async function testAPIConnection() {
  try {
    console.log('🧪 测试API连接...\n');
    
    // 1. 测试健康检查
    console.log('1. 测试健康检查:');
    try {
      const healthResponse = await makeRequest('http://localhost:3002/api/health');
      console.log(`状态码: ${healthResponse.status}`);
      if (healthResponse.data) {
        console.log(`响应: ${JSON.stringify(healthResponse.data)}`);
      } else {
        console.log(`错误: ${healthResponse.error}`);
        console.log(`原始响应: ${healthResponse.raw}`);
      }
    } catch (error) {
      console.log(`❌ 健康检查失败: ${error.message}`);
    }
    
    // 2. 测试规则API
    console.log('\n2. 测试规则API:');
    try {
      const rulesResponse = await makeRequest('http://localhost:3002/api/rules');
      console.log(`状态码: ${rulesResponse.status}`);
      if (rulesResponse.data) {
        console.log(`成功: ${rulesResponse.data.success}`);
        console.log(`数据长度: ${rulesResponse.data.data ? rulesResponse.data.data.length : 0}`);
        console.log(`总数: ${rulesResponse.data.total}`);
        
        if (rulesResponse.data.data && rulesResponse.data.data.length > 0) {
          console.log('\n前3条规则:');
          for (let i = 0; i < Math.min(3, rulesResponse.data.data.length); i++) {
            const rule = rulesResponse.data.data[i];
            console.log(`  ${i+1}. 规则 ${rule.id}: ${rule.intent_name}`);
            console.log(`     分类: ${rule.category}`);
            console.log(`     状态: ${rule.status}`);
          }
        } else {
          console.log('❌ 没有规则数据');
        }
      } else {
        console.log(`❌ 规则API错误: ${rulesResponse.error}`);
        console.log(`原始响应: ${rulesResponse.raw}`);
      }
    } catch (error) {
      console.log(`❌ 规则API失败: ${error.message}`);
    }
    
    // 3. 测试前端代理
    console.log('\n3. 测试前端代理:');
    try {
      const proxyResponse = await makeRequest('http://localhost:5174/api/rules');
      console.log(`状态码: ${proxyResponse.status}`);
      if (proxyResponse.data) {
        console.log(`成功: ${proxyResponse.data.success}`);
        console.log(`数据长度: ${proxyResponse.data.data ? proxyResponse.data.data.length : 0}`);
      } else {
        console.log(`❌ 前端代理错误: ${proxyResponse.error}`);
        console.log(`原始响应: ${proxyResponse.raw}`);
      }
    } catch (error) {
      console.log(`❌ 前端代理失败: ${error.message}`);
    }
    
    console.log('\n🎉 API连接测试完成！');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

testAPIConnection();
