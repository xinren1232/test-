/**
 * 测试当前问答系统
 */
import { processQuery } from './src/services/assistantService.js';

async function testCurrentQA() {
  console.log('🧪 测试当前问答系统...\n');
  
  const testQueries = [
    '查询物料 M12345 的库存',
    '目前有哪些高风险库存？',
    '查询欣旺达的库存情况',
    '查询批次 BATCH001 的测试结果'
  ];
  
  for (const query of testQueries) {
    console.log(`🔍 测试查询: "${query}"`);
    console.log('-'.repeat(50));
    
    try {
      const result = await processQuery(query);
      console.log('✅ 返回结果:');
      console.log(result);
      console.log('\n' + '='.repeat(60) + '\n');
    } catch (error) {
      console.log('❌ 错误:', error.message);
      console.log('\n' + '='.repeat(60) + '\n');
    }
  }
}

testCurrentQA();
