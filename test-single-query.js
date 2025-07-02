/**
 * 测试单个查询的调试信息
 */

async function testSingleQuery() {
  console.log('🔍 测试单个查询的调试信息...\n');
  
  try {
    const testQuery = '查询深圳工厂的库存';
    console.log(`🎯 测试查询: "${testQuery}"`);
    
    const response = await fetch('http://localhost:3001/api/assistant/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        query: testQuery
      })
    });
    
    if (!response.ok) {
      console.log('❌ 查询失败:', response.status);
      return;
    }
    
    const result = await response.json();
    
    console.log('\n📊 响应分析:');
    console.log('- 响应长度:', result.reply?.length || 0, '字符');
    console.log('- 是否包含HTML:', result.reply?.includes('<div') ? '是' : '否');
    console.log('- 是否结构化:', result.reply?.includes('query-results') ? '是' : '否');
    console.log('- 是否专业响应:', result.reply?.includes('professional-response') ? '是' : '否');
    
    // 检查前100个字符
    console.log('\n📝 响应开头:');
    console.log(result.reply?.substring(0, 200) + '...');
    
    // 分析为什么没有使用优化规则
    console.log('\n🔍 分析问题:');
    if (result.reply?.includes('📦 找到')) {
      console.log('❌ 使用了原始的查询处理器，而不是优化规则处理器');
      console.log('💡 可能原因:');
      console.log('   1. 意图检测没有匹配到优化规则');
      console.log('   2. 优化规则处理器没有被正确调用');
      console.log('   3. 数据同步问题');
    } else if (result.reply?.includes('query-results')) {
      console.log('✅ 使用了优化规则处理器');
    } else {
      console.log('❓ 使用了未知的处理器');
    }
    
  } catch (error) {
    console.error('❌ 测试过程中出错:', error.message);
  }
}

// 运行测试
testSingleQuery();
