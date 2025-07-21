// 直接测试规则API
const http = require('http');

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname,
      method: 'GET'
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
          resolve({ error: 'Invalid JSON', raw: responseData, status: res.statusCode });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

async function testRulesAPI() {
  try {
    console.log('🧪 直接测试规则API...\n');
    
    console.log('测试URL: http://localhost:3002/api/rules');
    
    const response = await makeRequest('http://localhost:3002/api/rules');
    
    console.log('📋 API响应:');
    console.log('状态:', response.status || 'unknown');
    console.log('成功:', response.success);
    console.log('消息:', response.message);
    
    if (response.success && response.data) {
      console.log(`\n✅ 规则数据获取成功: ${response.data.length} 条规则`);
      console.log(`总数: ${response.total}`);
      
      console.log('\n前3条规则:');
      for (let i = 0; i < Math.min(3, response.data.length); i++) {
        const rule = response.data[i];
        console.log(`${i+1}. 规则 ${rule.id}: ${rule.intent_name}`);
        console.log(`   分类: ${rule.category}`);
        console.log(`   状态: ${rule.status}`);
        console.log(`   优先级: ${rule.priority}`);
        console.log(`   描述: ${rule.description}`);
        console.log('');
      }
    } else {
      console.log('❌ 规则数据获取失败');
      if (response.error) {
        console.log('错误:', response.error);
      }
      if (response.raw) {
        console.log('原始响应:', response.raw.substring(0, 200));
      }
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

testRulesAPI();
