// 调试API响应
const http = require('http');

function makeRequest(url, data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    const urlObj = new URL(url);
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
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
          resolve(result);
        } catch (error) {
          reject(new Error('Invalid JSON response: ' + responseData));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

async function debugAPIResponse() {
  console.log('🔍 调试API响应...\n');
  
  try {
    const result = await makeRequest('http://localhost:3002/api/assistant/query', { query: '全测试' });
    
    console.log('📋 完整API响应:');
    console.log(JSON.stringify(result, null, 2));
    
    console.log('\n📊 响应分析:');
    console.log(`- success: ${result.success}`);
    console.log(`- message: ${result.message}`);
    console.log(`- query: ${result.query}`);
    console.log(`- matchedRule: ${result.matchedRule}`);
    console.log(`- tableData 类型: ${typeof result.tableData}`);
    console.log(`- tableData 长度: ${result.tableData ? result.tableData.length : 'undefined'}`);
    console.log(`- cards 类型: ${typeof result.cards}`);
    console.log(`- cards 长度: ${result.cards ? result.cards.length : 'undefined'}`);
    
    if (result.tableData && result.tableData.length > 0) {
      console.log('\n📦 第一条数据:');
      console.log(JSON.stringify(result.tableData[0], null, 2));
    }
    
    if (result.cards && result.cards.length > 0) {
      console.log('\n📈 统计卡片:');
      for (const card of result.cards) {
        console.log(`  ${card.icon} ${card.title}: ${card.value} (${card.type})`);
      }
    }
    
  } catch (error) {
    console.error('❌ 请求失败:', error.message);
  }
}

debugAPIResponse();
