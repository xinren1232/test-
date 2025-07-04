/**
 * 分析您生成的真实数据结构
 */

const analyzeRealData = async () => {
  console.log('🔍 分析生成的真实数据结构...');
  
  try {
    // 获取后端内存中的真实数据
    const response = await fetch('http://localhost:3001/api/assistant/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: '显示所有库存数据的详细信息',
        scenario: 'basic',
        analysisMode: 'rule'
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const result = await response.json();
    console.log('✅ 获取数据成功');
    
    // 解析返回的数据，提取实际的字段信息
    const lines = result.reply.split('\n');
    const dataLines = lines.filter(line => line.includes('**') && line.includes('|'));
    
    console.log('\n📊 数据样本分析:');
    console.log('='.repeat(80));
    
    const fieldSets = new Set();
    const factories = new Set();
    const suppliers = new Set();
    const materials = new Set();
    const statuses = new Set();
    
    dataLines.slice(0, 10).forEach((line, index) => {
      console.log(`样本 ${index + 1}: ${line}`);
      
      // 提取字段信息
      const fields = line.split('|').map(f => f.trim());
      fields.forEach(field => {
        if (field.includes(':')) {
          const [key, value] = field.split(':').map(s => s.trim());
          fieldSets.add(key);
          
          // 收集具体值
          if (key === 'factory') factories.add(value);
          if (key === 'supplier') suppliers.add(value);
          if (key === 'material_name') materials.add(value);
          if (key === 'status') statuses.add(value);
        }
      });
    });
    
    console.log('\n📋 数据结构分析:');
    console.log('字段列表:', Array.from(fieldSets));
    console.log('工厂列表:', Array.from(factories));
    console.log('供应商列表:', Array.from(suppliers));
    console.log('物料列表:', Array.from(materials));
    console.log('状态列表:', Array.from(statuses));
    
    // 测试特定查询
    console.log('\n🎯 测试特定数据查询:');
    
    const specificQueries = [
      { query: '查询重庆工厂库存', expect: '重庆工厂' },
      { query: '查询欣冠供应商的物料', expect: '欣冠' },
      { query: '查询电池盖库存', expect: '电池盖' },
      { query: '查询冻结状态库存', expect: '冻结' }
    ];
    
    for (const test of specificQueries) {
      console.log(`\n🔍 测试: ${test.query} (期望包含: ${test.expect})`);
      
      const testResponse = await fetch('http://localhost:3001/api/assistant/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: test.query,
          scenario: 'basic',
          analysisMode: 'rule'
        })
      });
      
      if (testResponse.ok) {
        const testResult = await testResponse.json();
        const hasExpected = testResult.reply.includes(test.expect);
        console.log(`${hasExpected ? '✅' : '❌'} 结果${hasExpected ? '包含' : '不包含'}期望值`);
        
        if (!hasExpected) {
          console.log('📋 实际返回:', testResult.reply.split('\n').slice(0, 3).join('\n'));
        }
      }
    }
    
  } catch (error) {
    console.error('❌ 分析失败:', error.message);
  }
};

// 运行分析
analyzeRealData();
