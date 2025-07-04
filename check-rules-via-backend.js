/**
 * 通过后端API检查规则和生成的数据
 */

const checkRulesAndData = async () => {
  console.log('🔍 检查当前规则和数据状态...');
  
  try {
    // 1. 检查后端内存中的数据
    console.log('\n📊 步骤1: 检查后端内存数据...');
    const dataResponse = await fetch('http://localhost:3001/api/assistant/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: '显示所有数据统计',
        scenario: 'basic',
        analysisMode: 'rule'
      })
    });
    
    if (dataResponse.ok) {
      const dataResult = await dataResponse.json();
      console.log('✅ 数据查询成功');
      console.log('📋 数据统计:', dataResult.reply.substring(0, 300));
    }
    
    // 2. 测试具体的查询规则
    console.log('\n🎯 步骤2: 测试具体查询规则...');
    
    const testQueries = [
      '查询深圳工厂库存',
      '查询聚龙供应商的物料', 
      '查询电池盖的库存',
      '查询风险状态的库存',
      '查询深圳工厂聚龙供应商的电池盖'
    ];
    
    for (const query of testQueries) {
      console.log(`\n🔍 测试查询: "${query}"`);
      
      try {
        const response = await fetch('http://localhost:3001/api/assistant/query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: query,
            scenario: 'basic',
            analysisMode: 'rule'
          })
        });
        
        if (response.ok) {
          const result = await response.json();
          
          // 检查是否返回了实际数据
          if (result.reply.includes('📊 **查询结果**')) {
            console.log('✅ 查询成功 - 返回了数据');
            const lines = result.reply.split('\n').slice(0, 5);
            console.log('📋 结果预览:', lines.join('\n'));
          } else if (result.reply.includes('????????')) {
            console.log('❌ 字符编码问题');
          } else {
            console.log('⚠️ 查询无数据或返回默认响应');
            console.log('📋 响应内容:', result.reply.substring(0, 200));
          }
        } else {
          console.log(`❌ 查询失败: HTTP ${response.status}`);
        }
        
      } catch (error) {
        console.log(`❌ 查询异常: ${error.message}`);
      }
    }
    
    // 3. 检查数据同步状态
    console.log('\n📡 步骤3: 检查数据同步状态...');
    
    try {
      const syncResponse = await fetch('http://localhost:3001/api/assistant/update-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inventory: [{ test: 'data' }],
          inspection: [],
          production: []
        })
      });
      
      if (syncResponse.ok) {
        const syncResult = await syncResponse.json();
        console.log('✅ 数据同步接口正常:', syncResult.message);
      }
    } catch (error) {
      console.log('❌ 数据同步测试失败:', error.message);
    }
    
  } catch (error) {
    console.error('❌ 检查过程失败:', error.message);
  }
};

// 运行检查
checkRulesAndData();
