import http from 'http';

async function testQueryAPI() {
  console.log('🔍 测试查询API调用...');
  
  // 模拟前端的确切请求
  const testQuery = '查询结构件类库存';
  
  console.log(`📋 测试查询: "${testQuery}"`);
  
  const postData = JSON.stringify({ 
    question: testQuery,
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
    console.log('📊 响应结构:', Object.keys(result));
    
    if (result.data) {
      console.log('📊 data结构:', Object.keys(result.data));
      console.log('📝 回答内容:', result.data.answer);
      console.log('📈 表格数据条数:', result.data.tableData ? result.data.tableData.length : 0);
      console.log('🎴 卡片数据条数:', result.data.cards ? result.data.cards.length : 0);
      
      if (result.data.tableData && result.data.tableData.length > 0) {
        console.log('\n📦 表格数据样本:');
        result.data.tableData.slice(0, 3).forEach((record, i) => {
          console.log(`  ${i+1}. 工厂: ${record.工厂}, 物料: ${record.物料名称}, 供应商: ${record.供应商}, 数量: ${record.数量}`);
        });
      }
      
      if (result.data.cards && result.data.cards.length > 0) {
        console.log('\n🎴 卡片数据样本:');
        result.data.cards.forEach((card, i) => {
          console.log(`  ${i+1}. ${card.title}: ${card.value} (${card.subtitle || ''})`);
        });
      }
    }
    
    // 检查是否是固定数据
    const responseStr = JSON.stringify(result);
    if (responseStr.includes('深圳工厂') && responseStr.includes('SPN-M86001')) {
      console.log('\n⚠️ 检测到固定测试数据特征！');
    } else {
      console.log('\n✅ 数据看起来是真实的');
    }
    
    // 输出完整响应用于调试
    console.log('\n📄 完整响应 (前1000字符):');
    console.log(JSON.stringify(result, null, 2).substring(0, 1000) + '...');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

testQueryAPI();
