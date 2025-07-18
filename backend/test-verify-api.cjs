// 测试数据验证API
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

async function testVerifyAPI() {
  try {
    console.log('🧪 测试数据验证API...\n');
    
    // 测试数据验证API
    console.log('测试数据验证API:');
    try {
      const verifyData = {
        expectedCounts: {
          inventory: 132,
          inspection: 0,
          production: 0
        }
      };
      
      const response = await makeRequest('http://localhost:3001/api/assistant/verify-data', verifyData);
      console.log(`状态码: ${response.status}`);
      
      if (response.data && (response.data.success || response.data.verified)) {
        console.log(`✅ 验证成功: ${response.data.message}`);
        console.log(`验证状态: verified=${response.data.verified}, success=${response.data.success}`);

        if (response.data.details) {
          console.log('验证详情:');
          const details = response.data.details;
          
          console.log(`  库存数据: 总计 ${details.inventory.total} 条, 有效 ${details.inventory.valid} 条, 无效 ${details.inventory.invalid} 条`);
          if (details.inventory.issues.length > 0) {
            console.log(`    问题: ${details.inventory.issues.join(', ')}`);
          }
          
          console.log(`  检验数据: 总计 ${details.inspection.total} 条, 有效 ${details.inspection.valid} 条, 无效 ${details.inspection.invalid} 条`);
          if (details.inspection.issues.length > 0) {
            console.log(`    问题: ${details.inspection.issues.join(', ')}`);
          }
          
          console.log(`  生产数据: 总计 ${details.production.total} 条, 有效 ${details.production.valid} 条, 无效 ${details.production.invalid} 条`);
          if (details.production.issues.length > 0) {
            console.log(`    问题: ${details.production.issues.join(', ')}`);
          }
        }
      } else {
        console.log(`❌ 验证失败: ${response.data?.message || response.error}`);
      }
    } catch (error) {
      console.log(`❌ 验证连接失败: ${error.message}`);
    }
    
    console.log('\n🎉 数据验证API测试完成！');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

testVerifyAPI();
