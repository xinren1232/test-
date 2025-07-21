// 测试新的前端数据API
const https = require('https');
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
          reject(new Error('Invalid JSON response'));
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

async function testNewAPI() {
  console.log('🧪 测试新的前端数据API...\n');
  
  const testQueries = [
    '全测试',
    '库存查询', 
    '聚龙供应商',
    '测试结果',
    '上线情况'
  ];
  
  for (const query of testQueries) {
    console.log(`🔍 测试查询: "${query}"`);
    
    try {
      const result = await makeRequest('http://localhost:3002/api/assistant/query', { query });
      
      if (result.success) {
        console.log(`✅ 查询成功:`);
        console.log(`   匹配规则: ${result.matchedRule}`);

        const tableData = result.data?.tableData || result.tableData;
        const cards = result.data?.cards || result.cards;

        console.log(`   数据条数: ${tableData ? tableData.length : 0}`);
        console.log(`   统计卡片: ${cards ? cards.length : 0} 个`);

        if (tableData && tableData.length > 0) {
          console.log(`   第一条数据:`, Object.keys(tableData[0]).join(', '));
          console.log(`   示例数据:`, tableData[0]);
        }

        if (cards && cards.length > 0) {
          console.log(`   统计卡片:`);
          for (const card of cards) {
            console.log(`     ${card.icon} ${card.title}: ${card.value}`);
          }
        }
      } else {
        console.log(`❌ 查询失败: ${result.message}`);
      }
      
    } catch (error) {
      console.log(`❌ 请求失败: ${error.message}`);
    }
    
    console.log(''); // 空行分隔
  }
  
  console.log('🎉 API测试完成！');
}

testNewAPI();
