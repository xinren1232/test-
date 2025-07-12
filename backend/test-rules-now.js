/**
 * 测试修复后的规则
 */

async function testRulesNow() {
  console.log('🧪 测试修复后的规则...\n');
  
  const testQueries = [
    '查询电池库存',
    '查询聚龙供应商库存', 
    '查询在线跟踪',
    '查询测试结果'
  ];
  
  // 简单的HTTP请求函数
  async function makeRequest(query) {
    const { default: fetch } = await import('node-fetch');
    
    const response = await fetch('http://localhost:3001/api/assistant/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query })
    });
    
    return await response.json();
  }
  
  for (const query of testQueries) {
    console.log(`📋 测试查询: "${query}"`);
    
    try {
      const result = await makeRequest(query);
      
      if (result.success) {
        console.log(`  ✅ 成功: ${result.intent || '未知意图'}`);
        if (result.data && Array.isArray(result.data)) {
          console.log(`  📊 返回数据: ${result.data.length} 条记录`);
          if (result.data.length > 0) {
            const fields = Object.keys(result.data[0]);
            console.log(`  🏷️  字段: ${fields.join(', ')}`);
          }
        } else if (result.reply) {
          console.log(`  💬 回复: ${result.reply.substring(0, 100)}...`);
        }
      } else {
        console.log(`  ❌ 失败: ${result.error?.message || '未知错误'}`);
      }
      
    } catch (error) {
      console.log(`  ❌ 请求失败: ${error.message}`);
    }
    
    console.log('');
  }
}

// 执行测试
testRulesNow();
