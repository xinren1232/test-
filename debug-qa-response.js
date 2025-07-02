/**
 * 调试问答响应格式
 */

async function debugQAResponse() {
  console.log('🔍 调试问答响应格式...\n');
  
  try {
    // 测试具体查询
    const testQuery = '查询深圳工厂的库存';
    console.log(`🎯 测试查询: "${testQuery}"`);
    
    const response = await fetch('http://localhost:3001/api/assistant/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        query: testQuery,
        debug: true  // 启用调试模式
      })
    });
    
    if (!response.ok) {
      console.log('❌ 查询失败:', response.status);
      return;
    }
    
    const result = await response.json();
    console.log('\n📊 响应结果分析:');
    console.log('- 响应长度:', result.reply?.length || 0, '字符');
    console.log('- 是否包含HTML:', result.reply?.includes('<div') ? '是' : '否');
    console.log('- 是否结构化:', result.reply?.includes('query-results') ? '是' : '否');
    
    console.log('\n📝 完整响应内容:');
    console.log('=' .repeat(80));
    console.log(result.reply);
    console.log('=' .repeat(80));
    
    // 分析响应类型
    if (result.reply?.includes('<div class="query-results')) {
      console.log('\n✅ 响应类型: 结构化HTML (优秀)');
    } else if (result.reply?.includes('<div')) {
      console.log('\n⚠️ 响应类型: 部分HTML (良好)');
    } else if (result.reply?.length > 100) {
      console.log('\n📄 响应类型: 纯文本 (需优化)');
    } else {
      console.log('\n❌ 响应类型: 简单文本 (需改进)');
    }
    
    // 测试其他查询
    const additionalTests = [
      '查询风险状态的库存',
      '多少种物料？',
      '查询BOE供应商的物料'
    ];
    
    for (const query of additionalTests) {
      console.log(`\n🔍 测试: "${query}"`);
      
      const testResponse = await fetch('http://localhost:3001/api/assistant/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query })
      });
      
      if (testResponse.ok) {
        const testResult = await testResponse.json();
        const isStructured = testResult.reply?.includes('query-results') || testResult.reply?.includes('<div');
        console.log(`  - 长度: ${testResult.reply?.length || 0}字符`);
        console.log(`  - 结构化: ${isStructured ? '是' : '否'}`);
        
        if (testResult.reply?.length < 200) {
          console.log(`  - 内容预览: ${testResult.reply?.substring(0, 100)}...`);
        }
      } else {
        console.log('  - 查询失败');
      }
      
      // 添加延迟
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
  } catch (error) {
    console.error('❌ 调试过程中出错:', error.message);
  }
}

// 运行调试
debugQAResponse();
