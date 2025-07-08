/**
 * 测试单个规则的执行情况
 */

const testSingleRule = async () => {
  console.log('🧪 测试单个规则执行...\n');
  
  // 测试最简单的查询
  const testQuery = '库存总量查询';
  
  try {
    console.log(`🔍 测试查询: "${testQuery}"`);
    
    const response = await fetch('http://localhost:3001/api/assistant/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: testQuery
      })
    });
    
    console.log(`📡 HTTP状态: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log(`❌ HTTP错误: ${response.status}`);
      console.log(`📄 错误内容: ${errorText}`);
      return;
    }
    
    const result = await response.json();
    console.log(`✅ 响应成功`);
    console.log(`📊 响应数据:`, JSON.stringify(result, null, 2));
    
    // 检查响应结构
    if (result.success !== undefined) {
      console.log(`🎯 成功状态: ${result.success}`);
    }
    
    if (result.reply) {
      console.log(`💬 回复内容: ${result.reply.substring(0, 200)}...`);
    }
    
    if (result.error) {
      console.log(`❌ 错误信息: ${result.error}`);
    }
    
    if (result.data) {
      console.log(`📋 数据内容:`, result.data);
    }
    
  } catch (error) {
    console.log(`❌ 请求异常: ${error.message}`);
  }
};

// 测试多个基础查询
const testMultipleQueries = async () => {
  console.log('\n🔄 测试多个基础查询...\n');
  
  const queries = [
    '库存总量查询',
    '查询库存总数',
    '有多少库存',
    '库存数量统计',
    '总共有多少物料'
  ];
  
  for (const query of queries) {
    console.log(`\n🔍 测试: "${query}"`);
    
    try {
      const response = await fetch('http://localhost:3001/api/assistant/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      
      if (response.ok) {
        const result = await response.json();
        
        if (result.success) {
          console.log(`✅ 成功`);
        } else if (result.reply) {
          console.log(`📝 有回复: ${result.reply.length} 字符`);
        } else {
          console.log(`⚠️ 响应异常:`, result);
        }
      } else {
        console.log(`❌ HTTP ${response.status}`);
      }
      
    } catch (error) {
      console.log(`❌ 异常: ${error.message}`);
    }
  }
};

// 测试规则API
const testRulesAPI = async () => {
  console.log('\n📋 测试规则API...\n');
  
  try {
    const response = await fetch('http://localhost:3001/api/assistant/rules');
    
    if (response.ok) {
      const result = await response.json();
      console.log(`✅ 规则API响应成功`);
      console.log(`📊 规则数量: ${result.count || result.rules?.length || '未知'}`);
      
      if (result.rules && result.rules.length > 0) {
        console.log(`📝 前3条规则:`);
        result.rules.slice(0, 3).forEach((rule, index) => {
          console.log(`  ${index + 1}. ${rule.intent_name} - ${rule.description}`);
        });
      }
    } else {
      console.log(`❌ 规则API失败: ${response.status}`);
    }
    
  } catch (error) {
    console.log(`❌ 规则API异常: ${error.message}`);
  }
};

// 运行所有测试
const runAllTests = async () => {
  await testSingleRule();
  await testMultipleQueries();
  await testRulesAPI();
  
  console.log('\n🎉 测试完成！');
};

runAllTests().catch(console.error);
