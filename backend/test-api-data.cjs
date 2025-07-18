// 测试API返回的数据
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
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        console.log('🌐 API返回的库存数据:\n');
        
        if (response.success && response.tableData) {
          console.log(`✅ 获取到 ${response.tableData.length} 条数据`);
          
          // 显示前3条数据
          response.tableData.slice(0, 3).forEach((item, index) => {
            console.log(`\n${index + 1}. API数据:`);
            Object.entries(item).forEach(([key, value]) => {
              console.log(`   ${key}: ${value}`);
            });
          });
          
          console.log('\n🔍 数据分析:');
          const firstItem = response.tableData[0];
          console.log(`工厂: ${firstItem.工厂}`);
          console.log(`仓库: ${firstItem.仓库}`);
          console.log(`物料编码: ${firstItem.物料编码}`);
          console.log(`物料名称: ${firstItem.物料名称}`);
          console.log(`供应商: ${firstItem.供应商}`);
          console.log(`批次号: ${firstItem.批次号}`);
          
          // 检查是否是真实数据
          const isRealData = firstItem.物料编码 === 'MAT_0001' && 
                            firstItem.物料名称 === 'LCD显示屏' &&
                            firstItem.供应商 === '盛泰' &&
                            firstItem.批次号 === 'BATCH_107318';
          
          console.log(`\n🎯 数据真实性: ${isRealData ? '✅ 真实数据' : '❌ 非真实数据'}`);
          
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

console.log('🔍 测试API数据...');
testAPI();
