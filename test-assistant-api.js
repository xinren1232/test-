/**
 * 测试AI助手API的脚本
 */

async function testAssistantAPI() {
  try {
    console.log('🧪 测试AI助手API...\n');
    
    // 1. 先获取规则数据，检查触发词格式
    console.log('📋 1. 检查规则数据格式:');
    const rulesResponse = await fetch('http://localhost:3001/api/rules');
    const rulesData = await rulesResponse.json();
    
    if (rulesData.success && rulesData.data.length > 0) {
      console.log(`找到 ${rulesData.data.length} 条规则`);
      
      // 检查前5条规则的触发词
      const sampleRules = rulesData.data.slice(0, 5);
      sampleRules.forEach(rule => {
        console.log(`\n规则: ${rule.intent_name}`);
        console.log(`描述: ${rule.description}`);
        console.log(`触发词: ${rule.trigger_words || '无'}`);
        console.log(`分类: ${rule.category || '无'}`);
      });
    }
    
    // 2. 测试不同的查询
    console.log('\n🔍 2. 测试查询匹配:');
    
    const testQueries = [
      '库存',
      '查询库存',
      '库存信息',
      '测试',
      '供应商',
      '物料',
      '工厂'
    ];
    
    for (const query of testQueries) {
      console.log(`\n测试查询: "${query}"`);
      
      try {
        const response = await fetch('http://localhost:3001/api/assistant/query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: query })
        });
        
        if (response.ok) {
          const result = await response.json();
          
          if (result.success && result.data.matchedRule) {
            console.log(`  ✅ 匹配到规则: ${result.data.matchedRule.name}`);
            console.log(`  📊 返回数据: ${result.data.resultCount} 条记录`);
          } else {
            console.log(`  ❌ 未匹配到规则`);
          }
        } else {
          console.log(`  ❌ HTTP错误: ${response.status}`);
        }
      } catch (error) {
        console.log(`  ❌ 请求失败: ${error.message}`);
      }
    }
    
    // 3. 测试规则测试API
    console.log('\n🧪 3. 测试规则测试API:');
    
    if (rulesData.success && rulesData.data.length > 0) {
      const firstRule = rulesData.data[0];
      console.log(`测试规则: ${firstRule.intent_name} (ID: ${firstRule.id})`);
      
      try {
        const testResponse = await fetch(`http://localhost:3001/api/rules/test/${firstRule.id}`, {
          method: 'POST'
        });
        
        if (testResponse.ok) {
          const testResult = await testResponse.json();
          
          if (testResult.success) {
            console.log(`  ✅ 规则测试成功`);
            console.log(`  📊 返回数据: ${testResult.data.resultCount} 条记录`);
            console.log(`  📋 字段: ${testResult.data.fields.join(', ')}`);
          } else {
            console.log(`  ❌ 规则测试失败: ${testResult.data.error}`);
          }
        } else {
          console.log(`  ❌ 规则测试HTTP错误: ${testResponse.status}`);
        }
      } catch (error) {
        console.log(`  ❌ 规则测试请求失败: ${error.message}`);
      }
    }
    
    console.log('\n🎉 测试完成！');
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

// 如果在Node.js环境中运行
if (typeof window === 'undefined') {
  // Node.js环境，需要导入fetch
  const { default: fetch } = await import('node-fetch');
  global.fetch = fetch;
  testAssistantAPI();
} else {
  // 浏览器环境
  testAssistantAPI();
}
