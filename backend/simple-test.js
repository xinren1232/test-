/**
 * 简单测试脚本 - 直接测试NLP功能
 */
import { processQuery } from './src/services/assistantService.js';

async function testQueries() {
  console.log('🧪 测试NLP查询功能...\n');
  
  const testQueries = [
    '目前有哪些高风险库存？',
    '查询物料 M12345 的库存',
    '查询批次 BATCH001 的库存',
    '查询欣旺达的库存',
    '查询批次 BATCH001 的测试结果',
    '查询深圳工厂的使用情况',
    '目前有哪些异常情况？'
  ];
  
  for (const query of testQueries) {
    console.log(`🔍 测试查询: "${query}"`);
    try {
      const result = await processQuery(query);
      console.log('✅ 结果:');
      console.log(result.substring(0, 300) + (result.length > 300 ? '...' : ''));
      console.log('─'.repeat(50));
    } catch (error) {
      console.log('❌ 错误:', error.message);
      console.log('─'.repeat(50));
    }
  }
  
  console.log('\n🎉 测试完成！');
  process.exit(0);
}

testQueries();
