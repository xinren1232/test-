/**
 * 检查后端内存中的实际数据
 */

const checkMemoryData = async () => {
  console.log('🔍 检查后端内存中的实际数据...');
  
  try {
    // 直接调用后端的数据获取API
    const response = await fetch('http://localhost:3001/api/assistant/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: '显示所有数据',
        scenario: 'basic',
        analysisMode: 'rule'
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const result = await response.json();
    console.log('✅ 获取数据响应成功');
    console.log('📋 完整响应:', result.reply);
    
    // 尝试获取原始数据统计
    console.log('\n🔍 尝试获取数据统计...');
    
    const statsResponse = await fetch('http://localhost:3001/api/assistant/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: '统计所有数据数量',
        scenario: 'basic',
        analysisMode: 'rule'
      })
    });
    
    if (statsResponse.ok) {
      const statsResult = await statsResponse.json();
      console.log('📊 数据统计:', statsResult.reply);
    }
    
    // 尝试不同的查询方式
    console.log('\n🎯 尝试不同查询方式:');
    
    const testQueries = [
      '显示库存',
      '查看所有库存',
      '库存列表',
      '显示inventory',
      '查询所有工厂',
      '显示所有供应商'
    ];
    
    for (const query of testQueries) {
      console.log(`\n🔍 测试查询: "${query}"`);
      
      const testResponse = await fetch('http://localhost:3001/api/assistant/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: query,
          scenario: 'basic',
          analysisMode: 'rule'
        })
      });
      
      if (testResponse.ok) {
        const testResult = await testResponse.json();
        const lines = testResult.reply.split('\n').slice(0, 5);
        console.log('📋 结果预览:', lines.join('\n'));
        
        // 检查是否有实际数据
        if (testResult.reply.includes('**查询结果**') && testResult.reply.includes('共')) {
          const match = testResult.reply.match(/共 (\d+) 条记录/);
          if (match) {
            console.log(`✅ 找到 ${match[1]} 条记录`);
          }
        } else if (testResult.reply.includes('没有找到')) {
          console.log('❌ 没有找到匹配记录');
        }
      }
    }
    
  } catch (error) {
    console.error('❌ 检查失败:', error.message);
  }
};

// 运行检查
checkMemoryData();
