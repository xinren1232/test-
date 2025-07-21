// 最终测试API数据
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
        console.log('🌐 最终API测试结果:\n');
        
        if (response.success && response.tableData) {
          console.log(`✅ 获取到 ${response.tableData.length} 条数据`);
          
          // 显示第一条数据的所有字段
          const firstItem = response.tableData[0];
          console.log('\n第一条数据的所有字段:');
          Object.entries(firstItem).forEach(([key, value]) => {
            console.log(`   ${key}: ${value}`);
          });
          
          console.log(`\n字段总数: ${Object.keys(firstItem).length}`);
          console.log(`字段列表: ${Object.keys(firstItem).join(', ')}`);
          
          // 检查关键字段是否存在
          const expectedFields = ['工厂', '仓库', '物料编码', '物料名称', '供应商', '批次号'];
          const missingFields = expectedFields.filter(field => !firstItem.hasOwnProperty(field));
          
          if (missingFields.length === 0) {
            console.log('\n✅ 所有关键字段都存在！');
            
            // 检查数据真实性
            const isRealData = firstItem.物料编码 && firstItem.物料编码.startsWith('MAT_') &&
                              firstItem.批次号 && firstItem.批次号.startsWith('BATCH_') &&
                              firstItem.工厂 && firstItem.工厂 !== '未知工厂';
            
            console.log(`🎯 数据真实性: ${isRealData ? '✅ 真实数据' : '❌ 非真实数据'}`);
            
          } else {
            console.log(`\n❌ 缺少关键字段: ${missingFields.join(', ')}`);
          }
          
        } else {
          console.log('❌ API返回失败:', response);
        }
      } catch (error) {
        console.error('❌ 解析响应失败:', error);
        console.log('原始响应:', data.substring(0, 500));
      }
    });
  });

  req.on('error', (e) => {
    console.error(`请求失败: ${e.message}`);
  });

  req.write(postData);
  req.end();
}

console.log('🔍 最终API测试...');
testAPI();
