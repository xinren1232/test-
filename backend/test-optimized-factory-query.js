/**
 * 测试优化后的工厂查询功能
 */
import { processQuery } from './src/services/assistantService.js';

async function testOptimizedFactoryQuery() {
  console.log('🧪 测试优化后的工厂查询功能...\n');
  
  const testQueries = [
    // 详细物料信息查询
    '查询重庆工厂的库存情况',
    '查询深圳工厂的物料',
    '重庆工厂有哪些库存？',
    
    // 统计汇总信息查询
    '查询重庆工厂的统计概况',
    '重庆工厂总览',
    
    // 供应商详细信息查询
    '查询黑龙供应商的库存情况',
    '紫光供应商有哪些物料？',
    
    // 供应商统计信息查询
    '查询紫光供应商的统计概况',
    '黑龙供应商总览'
  ];
  
  for (const query of testQueries) {
    console.log(`🔍 测试查询: "${query}"`);
    console.log('-'.repeat(50));
    
    try {
      const result = await processQuery(query);
      console.log('✅ 返回结果:');
      
      // 格式化输出，只显示前几行关键信息
      const lines = result.split('\n');
      if (lines.length > 15) {
        console.log(lines.slice(0, 15).join('\n'));
        console.log('...(更多记录)');
      } else {
        console.log(result);
      }
      
      console.log('\n' + '='.repeat(60) + '\n');
    } catch (error) {
      console.log('❌ 错误:', error.message);
      console.log('\n' + '='.repeat(60) + '\n');
    }
  }
}

testOptimizedFactoryQuery();
