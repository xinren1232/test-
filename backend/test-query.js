/**
 * 测试问答功能
 */
import { processQuery } from './src/services/assistantService.js';

async function testQueries() {
  console.log('🔍 测试问答功能...');
  
  const queries = [
    '查询高风险库存',
    '查询不良品',
    '查询BATCH001的测试结果',
    '查询M12345的库存',
    '欣旺达的库存有哪些',
    'BATCH001在哪条产线用了'
  ];

  for (const query of queries) {
    console.log(`\n🤖 测试查询: "${query}"`);
    
    try {
      const result = await processQuery(query);
      console.log('✅ 查询结果:', result);
    } catch (error) {
      console.error('❌ 查询失败:', error.message);
    }
  }
}

testQueries();
