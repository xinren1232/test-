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

async function testRulesAPI() {
  console.log('🧪 直接测试规则API...\n');
  
  try {
    console.log('测试: http://localhost:3001/api/rules');
    const response = await makeRequest('http://localhost:3001/api/rules');
    
    console.log(`状态码: ${response.status}`);
    
    if (response.status === 200) {
      if (Array.isArray(response.data)) {
        console.log(`✅ 成功获取规则: ${response.data.length} 条`);
        
        if (response.data.length > 0) {
          console.log('\n前5条规则:');
          response.data.slice(0, 5).forEach((rule, index) => {
            console.log(`${index + 1}. ${rule.intent_name || rule.name || 'Unknown'}`);
            console.log(`   描述: ${rule.description || 'No description'}`);
            console.log(`   优先级: ${rule.priority || 'No priority'}`);
            console.log(`   状态: ${rule.status || 'No status'}`);
            console.log('');
          });
        } else {
          console.log('❌ 规则列表为空');
        }
      } else {
        console.log('❌ 响应格式错误，不是数组');
        console.log('响应内容:', JSON.stringify(response.data, null, 2));
      }
    } else {
      console.log(`❌ API调用失败: ${response.status}`);
      console.log('错误信息:', response.error || response.raw);
    }
    
  } catch (error) {
    console.error('❌ 连接失败:', error.message);
  }
}

testRulesAPI();
