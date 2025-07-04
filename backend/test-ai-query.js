/**
 * 测试AI查询功能
 */

async function testAIQuery() {
  console.log('🤖 测试AI查询功能...\n');

  const testQueries = [
    '聚龙供应商有多少条库存记录？',
    '欣冠供应商的物料有哪些？',
    '广正供应商的库存状态分布如何？',
    '电池盖物料有多少条记录？',
    '中框物料的供应商都有谁？'
  ];

  for (const query of testQueries) {
    try {
      console.log(`📋 查询: ${query}`);
      
      const response = await fetch('http://localhost:3001/api/assistant/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log(`✅ 回答: ${result.answer}\n`);
      
    } catch (error) {
      console.error(`❌ 查询失败: ${error.message}\n`);
    }
  }
}

testAIQuery();
