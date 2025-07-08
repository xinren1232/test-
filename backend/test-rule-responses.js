/**
 * 测试规则响应格式和测试功能
 */

const testRuleResponses = async () => {
  console.log('🧪 测试规则响应格式...\n');
  
  // 获取规则列表
  console.log('📋 获取规则列表...');
  try {
    const rulesResponse = await fetch('http://localhost:3001/api/assistant/rules');
    const rulesData = await rulesResponse.json();
    
    if (!rulesData.success || !rulesData.rules) {
      console.log('❌ 无法获取规则列表');
      return;
    }
    
    console.log(`✅ 获取到 ${rulesData.rules.length} 条规则\n`);
    
    // 测试前5条规则
    const testRules = rulesData.rules.slice(0, 5);
    
    for (const rule of testRules) {
      console.log(`🔍 测试规则: ${rule.intent_name}`);
      console.log(`📝 示例查询: ${rule.example_query}`);
      
      try {
        const response = await fetch('http://localhost:3001/api/assistant/query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: rule.example_query || rule.intent_name
          })
        });
        
        if (response.ok) {
          const result = await response.json();
          
          console.log(`📊 响应结构:`);
          console.log(`  - response.ok: ${response.ok}`);
          console.log(`  - result.success: ${result.success || 'undefined'}`);
          console.log(`  - result.reply: ${result.reply ? '有内容' : '无内容'}`);
          console.log(`  - result.error: ${result.error || '无错误'}`);
          
          // 模拟前端测试逻辑
          const testSuccess = response.ok && (result.success || result.reply);
          console.log(`🎯 测试判断结果: ${testSuccess ? '✅ 成功' : '❌ 失败'}`);
          
          if (testSuccess && result.reply) {
            console.log(`💬 回复内容: ${result.reply.substring(0, 100)}...`);
          }
          
        } else {
          console.log(`❌ HTTP错误: ${response.status}`);
        }
        
      } catch (error) {
        console.log(`❌ 请求异常: ${error.message}`);
      }
      
      console.log(''); // 空行分隔
    }
    
  } catch (error) {
    console.log(`❌ 获取规则失败: ${error.message}`);
  }
};

// 测试特定的问题查询
const testProblematicQueries = async () => {
  console.log('🔧 测试可能有问题的查询...\n');
  
  const problematicQueries = [
    '失败测试查询',
    '供应商质量排名',
    '供应商多样性分析',
    '全链路质量追溯',
    '异常物料识别'
  ];
  
  for (const query of problematicQueries) {
    console.log(`🔍 测试查询: "${query}"`);
    
    try {
      const response = await fetch('http://localhost:3001/api/assistant/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      
      if (response.ok) {
        const result = await response.json();
        
        const hasReply = result.reply && result.reply.length > 0;
        const hasError = result.error;
        
        if (hasReply) {
          console.log(`✅ 有回复 (${result.reply.length} 字符)`);
          console.log(`📄 内容预览: ${result.reply.substring(0, 80)}...`);
        } else if (hasError) {
          console.log(`❌ 有错误: ${result.error}`);
        } else {
          console.log(`⚠️ 无回复无错误`);
        }
        
      } else {
        console.log(`❌ HTTP ${response.status}`);
      }
      
    } catch (error) {
      console.log(`❌ 异常: ${error.message}`);
    }
    
    console.log('');
  }
};

// 运行测试
const runTests = async () => {
  await testRuleResponses();
  await testProblematicQueries();
  
  console.log('🎉 响应格式测试完成！');
  console.log('\n💡 修复建议:');
  console.log('1. 前端测试逻辑已修复为: response.ok && (result.success || result.reply)');
  console.log('2. 如果规则仍然失败，可能是具体的查询逻辑问题');
  console.log('3. 建议在浏览器中手动测试几个规则');
};

runTests().catch(console.error);
