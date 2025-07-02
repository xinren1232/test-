/**
 * 最终测试问答系统
 */
import { processQuery } from './src/services/assistantService.js';

async function testFinalQA() {
  console.log('🎯 最终测试问答系统（修复SQL参数问题后）...\n');
  
  const testQueries = [
    // 库存查询测试
    '查询物料 CS-B-第2236 的库存',
    '查询电容的库存情况',
    '查询批次 411013 的库存',
    
    // 测试结果查询
    '查询批次 411013 的测试结果',
    '查询电容的测试结果',
    
    // 生产情况查询
    '查询深圳工厂的生产情况',
    '查询批次 411013 的生产情况'
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

testFinalQA();
