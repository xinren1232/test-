import http from 'http';

async function testAPIResponse() {
  console.log('🔍 测试智能问答API响应...');
  
  const testQueries = [
    '查询BOE供应商库存',
    '查询结构件类库存',
    '查询光学类测试情况',
    '查询风险状态的物料'
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
      console.log('📝 回答内容:', result.data?.answer ? result.data.answer.substring(0, 100) + '...' : '无回答');
      console.log('📈 表格数据:', result.data?.tableData ? result.data.tableData.length + ' 条记录' : '无表格数据');
      console.log('🎴 卡片数据:', result.data?.cards ? result.data.cards.length + ' 个卡片' : '无卡片数据');
      
      // 检查是否返回固定数据
      if (result.data?.tableData && result.data.tableData.length > 0) {
        const firstRecord = result.data.tableData[0];
        console.log('📦 首条记录:', JSON.stringify(firstRecord));
        
        // 检查是否是固定的测试数据
        if (firstRecord.工厂 === '深圳工厂' && firstRecord.物料编码 === 'SPN-M86001') {
          console.log('⚠️ 检测到固定测试数据！');
        } else {
          console.log('✅ 返回的是真实数据');
        }
      }
      
    } catch (error) {
      console.error('❌ 测试失败:', error.message);
    }
  }
  
  console.log('\n🎉 API测试完成！');
}

testAPIResponse();
