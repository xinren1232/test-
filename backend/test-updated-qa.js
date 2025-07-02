/**
 * 测试更新后的问答系统
 */
import { processQuery } from './src/services/assistantService.js';

async function testUpdatedQA() {
  console.log('🧪 测试更新后的问答系统（基于真实数据字段）...\n');
  
  const testQueries = [
    // 库存查询测试
    '查询物料 CS-B-第2236 的库存',
    '查询电容的库存情况',
    '查询批次 411013 的库存',
    
    // 供应商查询测试
    '查询紫光供应商的库存情况',
    '查询黑龙供应商的物料',
    
    // 工厂查询测试
    '查询重庆工厂的库存情况',
    '查询深圳工厂的物料',
    
    // 风险库存测试
    '目前有哪些风险库存？',
    '有哪些异常库存？',
    
    // 测试结果查询
    '查询批次 411013 的测试结果',
    '查询电容的测试结果',
    
    // 生产情况查询
    '查询深圳工厂的生产情况',
    '查询批次 411013 的生产情况',
    
    // 不良率查询
    '最近有哪些高不良率的生产记录？',
    '有哪些测试不良的记录？'
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

testUpdatedQA();
