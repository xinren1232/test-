import http from 'http';

async function debugQueryFlow() {
  console.log('🔍 调试查询流程...');
  
  const testQueries = [
    '查询结构件类库存',
    '对比BOE和东声供应商表现', 
    '查询光学类库存',
    '查询Top缺陷排行'
  ];
  
  for (const query of testQueries) {
    console.log(`\n📋 测试查询: "${query}"`);
    
    const postData = JSON.stringify({ 
      question: query,
      scenario: 'basic' 
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
    
    try {
      const result = await new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
          let data = '';
          
          res.on('data', (chunk) => {
            data += chunk;
          });
          
          res.on('end', () => {
            try {
              const result = JSON.parse(data);
              resolve(result);
            } catch (error) {
              reject(new Error('解析响应失败: ' + error.message));
            }
          });
        });
        
        req.on('error', (error) => {
          reject(error);
        });
        
        req.write(postData);
        req.end();
      });
      
      console.log('✅ API响应成功');
      console.log('📊 成功状态:', result.success);
      console.log('📝 回答长度:', result.data?.answer ? result.data.answer.length : 0);
      console.log('📈 表格数据:', result.data?.tableData ? result.data.tableData.length + ' 条记录' : '无表格数据');
      console.log('🎴 卡片数据:', result.data?.cards ? result.data.cards.length + ' 个卡片' : '无卡片数据');
      
      // 检查数据是否是固定的测试数据
      if (result.data?.tableData && result.data.tableData.length > 0) {
        const firstRecord = result.data.tableData[0];
        console.log('📦 首条记录字段:', Object.keys(firstRecord));
        console.log('📦 首条记录内容:', JSON.stringify(firstRecord).substring(0, 150) + '...');
        
        // 检查是否包含固定测试数据的特征
        const recordStr = JSON.stringify(firstRecord);
        if (recordStr.includes('SPN-M86001') || recordStr.includes('测试工厂') || recordStr.includes('TEST001')) {
          console.log('⚠️ 检测到固定测试数据！');
        } else {
          console.log('✅ 返回的是真实数据');
        }
        
        // 检查数据的多样性
        if (result.data.tableData.length > 1) {
          const secondRecord = result.data.tableData[1];
          if (JSON.stringify(firstRecord) === JSON.stringify(secondRecord)) {
            console.log('⚠️ 检测到重复数据！');
          } else {
            console.log('✅ 数据具有多样性');
          }
        }
      }
      
    } catch (error) {
      console.error('❌ 测试失败:', error.message);
    }
  }
  
  console.log('\n🎉 查询流程调试完成！');
}

debugQueryFlow();
