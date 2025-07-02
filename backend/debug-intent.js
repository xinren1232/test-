/**
 * 调试意图匹配
 */
import { processQuery } from './src/services/assistantService.js';

async function debugIntent() {
  console.log('🔍 调试意图匹配...');
  
  const queries = [
    '查询BATCH001的测试结果',
    '查询M12345的库存',
    '欣旺达的库存有哪些',
    'BATCH001在哪条产线用了'
  ];

  for (const query of queries) {
    console.log(`\n🤖 调试查询: "${query}"`);
    
    try {
      // 这里我们需要直接调用匹配逻辑来调试
      console.log('  - 查询文本:', query.toLowerCase());
      
      const result = await processQuery(query);
      console.log('✅ 查询结果:', result.substring(0, 100) + '...');
    } catch (error) {
      console.error('❌ 查询失败:', error.message);
    }
  }
}

debugIntent();
