// 简单测试API
const http = require('http');

function testAPI() {
  const postData = JSON.stringify({
    query: '查询库存信息'
  });

  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/assistant/query',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = http.request(options, (res) => {
    console.log(`状态码: ${res.statusCode}`);
    console.log(`响应头: ${JSON.stringify(res.headers)}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        console.log('✅ API响应成功');
        
        if (response.success && response.tableData) {
          console.log(`📦 获取到 ${response.tableData.length} 条数据`);
          
          if (response.tableData.length > 0) {
            const firstItem = response.tableData[0];
            console.log('字段列表:', Object.keys(firstItem).join(', '));
            console.log('第一条数据:');
            Object.entries(firstItem).forEach(([key, value]) => {
              console.log(`  ${key}: ${value}`);
            });
          }
        } else {
          console.log('❌ API返回失败:', response);
        }
      } catch (error) {
        console.error('❌ 解析响应失败:', error);
        console.log('原始响应:', data);
      }
    });
  });

  req.on('error', (e) => {
    console.error(`请求失败: ${e.message}`);
  });

  req.write(postData);
  req.end();
}

console.log('🔍 测试API...');
testAPI();
