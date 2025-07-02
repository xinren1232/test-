/**
 * 测试问答系统查询真实业务数据
 */
import { processQuery } from './src/services/assistantService.js';

async function testRealDataQA() {
  console.log('🧪 测试问答系统查询真实业务数据...\n');
  
  const testQueries = [
    '查询物料 CS-B类2234 的库存',
    '查询紫光供应商的库存情况',
    '目前有哪些高风险库存？',
    '查询批次 CS-B类2234 的测试结果',
    '查询重庆工厂的生产情况',
    '查询电芯的库存情况'
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

testRealDataQA();
